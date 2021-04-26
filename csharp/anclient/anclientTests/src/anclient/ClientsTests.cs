using io.odysz.common;
using io.odysz.semantic.ext;
using io.odysz.semantic.jprotocol;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Collections.Generic;
using static io.odysz.semantic.jprotocol.AnsonMsg;

namespace io.odysz.anclient
{
    [TestClass()]
    public class ClientsTests
    {
        private const string jserv = "https://192.168.0.201:8080/jsample";
        private const string pswd = "123456bbbbbbbbbb";
        private const string uid = "admin";
        private static AnsonClient client;

        static ClientsTests()
        {
            Clients.init(jserv);
            // client = Clients.login(uid, pswd); 
        }

        [TestMethod()]
        public void TestLogin()
        {
            client = Clients.login(uid, pswd); 
        }

        public void TestMenu(string s, string roleId)
        {
            AnDatasetReq req = new AnDatasetReq(null, "sys-sqlite");

            string t = "menu";
            AnsonHeader header = client.Header()
                    .UsrAct("SemanticClientTest", "init", t,
                        "test jclient.java loading menu from menu.sample");

            AnsonMsg jmsg = client.UserReq(new Port(Port.echo), null, req);
            jmsg.Header(header);

            client.Console(jmsg);
            
            client.Commit(jmsg, (code, data) => {
                    List<object> rses = (List<object>)((AnDatasetResp)data).Forest();
                    Utils.logi(rses);;
                });
        }
    }
}
