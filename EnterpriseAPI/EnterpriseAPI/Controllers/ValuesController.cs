using Microsoft.SharePoint.Client;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Security;
using System.Web.Http;

namespace EnterpriseAPI.Controllers
{
    public class ValuesController : ApiController
    {
        // GET api/values
        public IEnumerable<string> Get()
        {
            string response = GetSharePointItems();
                return new string[] { "value1", "value2", response };
        }

        private string GetSharePointItems()
        {
            const string pwd = "Ingace504";
            const string username = "acerrato@xoursecr.onmicrosoft.com";
            ClientContext context = new ClientContext("https://xoursecr.sharepoint.com/sites/cognitiva");
            Web web = context.Web;
            SecureString passWord = new SecureString();
            foreach (char c in pwd.ToCharArray()) passWord.AppendChar(c);
            context.Credentials = new SharePointOnlineCredentials(username, passWord);
            try
            {
                context.Load(web);
                context.ExecuteQuery();
                return "Olla! from " + web.Title + " site";
            }
            catch (Exception e)
            {
                return "Something went wrong in Auth Module: " + e.Message;
            }
        }

        // GET api/values/5
        public string Get(int id)
        {
            return "value";
        }

        // POST api/values
        public void Post([FromBody]string value)
        {
        }

        // PUT api/values/5
        public void Put(int id, [FromBody]string value)
        {
        }

        // DELETE api/values/5
        public void Delete(int id)
        {
        }
    }
}
