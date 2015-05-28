
using Microsoft.IdentityModel.Clients.ActiveDirectory;
using Microsoft.Office365.OutlookServices;
using Office365_Clean.Helpers;
using Office365_Clean.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using model = Office365_Clean.Models;
using System.Web.Script.Serialization;
using System.Net.Http;
using Microsoft.Azure.ActiveDirectory.GraphClient;

namespace Office365_Clean.Controllers
{
    public class BookingController : Controller
    {
        private ContactOperations _contactOperations = new ContactOperations();

        //
        // GET: /Booking/
        public ActionResult Index()
        {
            return View();
        }
        public async Task<JsonResult> getUsers()
        {
			//GraphHelper.GetGroups();

			DAL dal = new DAL();
			List<Microsoft.Azure.ActiveDirectory.GraphClient.IUser> users = await dal.GetAllUsers();
			
			var objectType = users.Select(x => x.ObjectType).ToList();
			var userType = users.Select(x => x.UserType).ToList();

            var jsonSerialiser = new JavaScriptSerializer();
			var test = users.Select(x => new { name = x.DisplayName, mail = (String.IsNullOrEmpty(x.Mail)?x.UserPrincipalName:x.Mail) });
			var json = jsonSerialiser.Serialize(test);

            return Json(json, JsonRequestBehavior.AllowGet);
        }
        [HttpPost]
		/* 
		 * participant: "stina@gmail.com" 
		 * resurs: " konferensrum1@dbt15.onmicrosoft.com"
		 */
		public async Task<JsonResult> CreateMeetings(DateTime start, DateTime end, String attendeeName, String attendeeMail)
        {
            DAL dal = new DAL();
			var eventId = await dal.CreateMeeting(
				start,
				end,
				new Attendee { EmailAddress = new EmailAddress { Address = attendeeMail, Name = attendeeName }, Type = AttendeeType.Required },
				User.Identity.Name);

            return Json(eventId, JsonRequestBehavior.AllowGet);
        }

		/* Removes a meeting from the loged in users calendar. */
		public async Task DeleteMeeting(string eventId) {
			DAL DAL = new DAL();
			await DAL.DeleteMeeting(eventId);
		}
		
        public async Task<JsonResult> getEvents()
        {
            DAL dal = new DAL();
            List<model.CalendarEvent> resultList = await dal.getEventsToday();

            var jsonSerialiser = new JavaScriptSerializer();
			var user = User.Identity.Name;

			List<string> orgAddressList = resultList.Select(x => x.Organizer.EmailAddress.Address).ToList();
			List<IList<Attendee>> attendeeList = resultList.Select(x => x.Attendees).ToList();

			List<string> attenAddressList = resultList.Select(
					x => ( x.Attendees.FirstOrDefault(
						a => !a.EmailAddress.Address.Equals(user)
					) ?? new Attendee { EmailAddress = new EmailAddress { Name = "Error" } } ).EmailAddress.Name
				).ToList();

			var jsonEvents = jsonSerialiser.Serialize(resultList.Select(x => new model.GetEventsViewModel {
				eventId = x.ID,
				start = "" + x.StartDate.Hour + ":"+x.StartDate.Minute,
				end = "" + x.EndDate.Hour + ":" + x.EndDate.Minute,
				name = (x.Organizer.EmailAddress.Address.Equals(User.Identity.Name)?
					( x.Attendees.FirstOrDefault(
						a => !a.EmailAddress.Address.Equals(user)
					) ?? new Attendee { EmailAddress = new EmailAddress { Name = "Error" } } ).EmailAddress.Name : x.Organizer.EmailAddress.Name ),
			}));

			return Json(jsonEvents, JsonRequestBehavior.AllowGet);
        }

        public async Task<ActionResult> SelectUser()
        {
            IEnumerable<model.ContactItem> users = await _contactOperations.GetAllContactsAsync();
            IEnumerable<SelectListItem> userList = users.Select(x => new SelectListItem { Text = x.GivenName, Value = x.ID });
            //IEnumerable<SelectListItem> userList = _contactOperations.GetAllContactsAsync().Result.Select(x => new SelectListItem { Text = x.GivenName, Value = x.ID });
                //IEnumerable<model.ContactItem> userList = await _contactOperations.GetAllContactsAsync();  
           return View(userList);

        }


      
	}
}