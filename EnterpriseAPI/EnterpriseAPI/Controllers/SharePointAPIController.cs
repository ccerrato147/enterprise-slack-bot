using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using Microsoft.SharePoint.Client;
using System.Security;

namespace EnterpriseAPI.Controllers
{
    public class SharePointAPIController : ApiController
    {
        const string pwd = "Ingace504";
        const string username = "acerrato@xoursecr.onmicrosoft.com";
        ClientContext context;
        Web web;

        public SharePointAPIController()
        {
            context = new ClientContext("https://xoursecr.sharepoint.com/sites/cognitiva");
            web = context.Web;
            SecureString passWord = new SecureString();
            foreach (char c in pwd.ToCharArray()) passWord.AppendChar(c);
            context.Credentials = new SharePointOnlineCredentials(username, passWord);
        }

        public List<string> GetSubSites()
        {
            List<string> sites = new List<string>();
            Web oWebsite = context.Web;
            context.Load(oWebsite,
                website => website.Webs,
                website => website.Title
            );
            context.ExecuteQuery();
            
            for (int i = 0; i < oWebsite.Webs.Count; i++)
            {
                sites.Add(oWebsite.Webs[i].Title + " - " + oWebsite.Webs[i].Url);
            }

            return sites;
        }

        [HttpPost]
        public string PostCreateSubSites([FromBody]NewSite Site)
        {
            try
            {
                if(Site != null && !string.IsNullOrEmpty(Site.Name))
                {
                    WebCreationInformation wci = new WebCreationInformation();
                    wci.Url = Site.Name;

                    wci.Title = Site.Name;
                    wci.Description = Site.Name;
                    wci.UseSamePermissionsAsParentSite = true;
                    wci.WebTemplate = "STS#0";
                    wci.Language = 1033;
                    Web w = context.Site.RootWeb.Webs.Add(wci);
                    context.Load(w,
                        website => website.Url
                    );
                    context.ExecuteQuery();
                    return "El sitio " + Site.Name + " fue creado con exito. La URL es " + w.Url;
                }
                return "El nombre del sitio no puede ser vacio";
            }
            catch(Exception e)
            {
                return Site.Name + " no pudo ser creado, ya le envie la informacion del error al administrador";
            }
        }

        public class NewSite
        {
            public string Name { get; set; }
        }
    }
}
