using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.Office365.OutlookServices;
using Office365_Clean.Helpers;


using System.Threading.Tasks;
using System.Web.Mvc;
using model = Office365_Clean.Models;
using Microsoft.Owin.Security;
using Microsoft.Owin.Security.OpenIdConnect;

using Microsoft.IdentityModel.Clients.ActiveDirectory;
using Microsoft.Azure.ActiveDirectory.GraphClient;
using System.Configuration;


namespace Office365_Clean.Models
{

	public class GetEventsViewModel {
		public string eventId { get; set; }
		public string start { get; set; }
		public string end { get; set; }
		public string name { get; set; }
	}

    public class DAL
    {
        
        
        private CalendarOperations _calenderOperations = new CalendarOperations();
        //List<model.CalendarEvent> events = new List<model.CalendarEvent>();


		public async Task<List<Microsoft.Azure.ActiveDirectory.GraphClient.IUser>> GetAllUsers()
        {
			ActiveDirectoryClient ADC = AuthenticationHelper.GetActiveDirectoryClient();
			
			var usersList = (await ADC.Users.ExecuteAsync()).CurrentPage.ToList();
		
			List<Microsoft.Azure.ActiveDirectory.GraphClient.IUser> returnUsers = new List<Microsoft.Azure.ActiveDirectory.GraphClient.IUser>();

			foreach ( var user in usersList ) {
				var userId = user.ObjectId;
				bool? isMember = await ADC.IsMemberOfAsync(ConfigurationManager.AppSettings["ida:GroupID"], userId);

				if ( isMember.HasValue && (bool) isMember ) {
					returnUsers.Add(user);
				}
			}
			
			return returnUsers;
        }

		public async Task<string> GetNameFromMail(string mail) {
			ActiveDirectoryClient ADC = AuthenticationHelper.GetActiveDirectoryClient();
			var name = await ( from x in ADC.Users where x.Mail.Equals(mail) select x.DisplayName ).ExecuteSingleAsync();

			return name;
		}

		public async Task<string> CreateMeeting(DateTime startTime, DateTime endTime, Attendee attendee, string resurs)
        {
            //Lägger in namnet på bokaren
			//String[] AtendeeString = { organizer.EmailAddress.Address }; //["stina@gmail.com"]
			return await _calenderOperations.AddCalendarEventAsync(attendee, resurs, "description: meeting", "Meeting", startTime, endTime);
        }

        //Hämtar ut alla möten för dagens datum
        //Vill kunna få fram: starttid(HH:mm), sluttid(HH:mm), namn på bokare & telefonnr för varje event.
        public async Task<List<model.CalendarEvent>> getEventsToday(){

			var outlookServicesClient = await AuthenticationHelper.EnsureOutlookServicesClientCreatedAsync("Calendar");
			
            List<model.CalendarEvent> returnResults = new List<model.CalendarEvent>();

			var cetZone = TimeZoneInfo.FindSystemTimeZoneById("Central Europe Standard Time");
			var cetTime = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, cetZone);

			var TimeSapn = new TimeSpan(cetTime.Hour, cetTime.Minute, cetTime.Second);
			var Time = cetTime.Subtract(TimeSapn);
            var startMorning = Time.AddHours(7);
            var startEvening = Time.AddHours(19);
            
            //Hämtar ut alla dagens möten från startTime och numberOfHours framåt. Dessa variabler sätts längts upp.

            var eventsResults = await (from i in outlookServicesClient.Me.Calendar.Events
                                 where (i.Start >= startMorning &&
                                 i.Start <= startEvening)
                                 orderby i.Start
                                 select i).Select(x => new model.CalendarEvent(x)).ExecuteAsync();

            List<model.CalendarEvent> resultList = eventsResults.CurrentPage.ToList();
			while ( eventsResults.MorePagesAvailable ) {
				eventsResults = await eventsResults.GetNextPageAsync();
				resultList.AddRange(eventsResults.CurrentPage.ToList());
			}
            
            return resultList;
        }

		public async Task DeleteMeeting(string eventId) {
			IEvent deletedEvent = await _calenderOperations.DeleteCalendarEventAsync(eventId);
		}
    }
}