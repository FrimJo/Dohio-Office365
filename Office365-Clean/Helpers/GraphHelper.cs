using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Web;

namespace Office365_Clean.Helpers {
	public class GraphHelper {
		public static async void GetMembersInGroup(Guid GUID) {
			var client = new HttpClient();
			var queryString = HttpUtility.ParseQueryString(string.Empty);

			/* OAuth2 is required to access this API. For more information visit:
			   https://msdn.microsoft.com/en-us/office/office365/howto/common-app-authentication-tasks */



			// Specify values for the following required parameters
			queryString["api-version"] = "1.5";
			// Specify values for path parameters (shown as {...})
			var uri = "https://graph.windows.net/myorganization/groups/"+GUID+"/$links/members?" + queryString;


			var response = await client.GetAsync(uri);

			if ( response.Content != null ) {
				var responseString = await response.Content.ReadAsStringAsync();
			}
		}

		public static async void GetGroups() {
			var client = new HttpClient();
			var queryString = HttpUtility.ParseQueryString(string.Empty);

			/* OAuth2 is required to access this API. For more information visit:
				https://msdn.microsoft.com/en-us/office/office365/howto/common-app-authentication-tasks */



			// Specify values for the following required parameters
			queryString["api-version"] = "1.5";
			// Specify values for path parameters (shown as {...})
			var uri = "https://graph.windows.net/dbtdeveloper/groups?" + queryString;


			var response = await client.GetAsync(uri);

			if ( response.Content != null ) {
				var responseString = await response.Content.ReadAsStringAsync();
			}
		}
	}
}