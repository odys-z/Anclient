using anclient.net.jserv.tier;
using io.odysz.common;
using io.odysz.semantic.ext;
using io.odysz.semantic.jprotocol;
using io.odysz.semantic.jserv.U;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.Collections;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using static io.odysz.semantic.jprotocol.AnsonMsg;
using static io.odysz.semantic.jprotocol.JProtocol;

namespace io.odysz.anclient
{
    [TestClass()]
    public class ClientsTests
    {
        const string uri = "test.cs";

        private const string jserv = "http://localhost:8080/jserv-sample";
        private const string pswd = "----------123456"; // TODO needing 16/32 padding
        private const string uid =  "admin";
        static SessionClient client;

        static ClientsTests()
        {
            AnClient.Init(jserv);
        }

        [TestMethod()]
        public async Task TestLogin()
        {
            await Login();
        }

        static bool succeed = false;
        class OnTestLogin : OnLogin
        {
            public void ok(SessionClient client)
            {
                succeed = true;
                ClientsTests.client = client;
                Assert.AreEqual(uid, client.ssInf.uid);
                Assert.IsNotNull(client.ssInf.ssid);
            }
        }

        internal async Task Login(OnLogin login = null) {
            await AnClient.Login(uid, pswd, "device.c#", login == null ? new OnTestLogin() : login);
            if (!succeed)
                Assert.Fail("Failed: onOk not called.");
            Assert.IsNotNull(client);
        }

        class OnTestOk : OnOk
        {
            public void ok(AnsonResp resp)
            {
                IList rses = (IList)((AnDatasetResp)resp).Forest();
                Utils.Logi(rses);;
            }
        }
        // [TestMethod()]
        public void TestMenu(string s, string roleId)
        {
            AnDatasetReq req = new AnDatasetReq(uri, null);

            string t = "menu";
            AnsonHeader header = client.Header()
                    .UsrAct("SemanticClientTest", "init", t,
                        "test jclient.java loading menu from menu.sample");

            AnsonMsg jmsg = client.UserReq(uri, new Port(Port.echo), null, req);
            jmsg.Header(header);

            client.Console(jmsg);

            client.CommitAsync(jmsg, new OnTestOk());
                //(code, data) => {
                //    IList rses = (IList)((AnDatasetResp)data.Body()?[0]).Forest();
                //    Utils.Logi(rses);;
                //});
        }

        static CancellationTokenSource waker;
        class OnloginUpload : OnLogin
        {
            public void ok(SessionClient client)
            {
                UploadTransaction(waker, client, "Sun Yet-sen.jpg");
            }
        }

        [TestMethod()]
        public async Task TestUpload()
        {
            waker = new CancellationTokenSource();
            await Login(new OnloginUpload());
                //(client, resp) =>
                //{
                //    UploadTransaction(waker, client, "Sun Yet-sen.jpg");
                //});
            try
            {   // should waken by SessionCleint.Commit()
                Task.Delay(60 * 1000, waker.Token).Wait();
                Assert.Fail("Uploading timeout...");
            }
            catch (AggregateException ex)
            {
                // waked up
                // we can access the file now
                // Debug.WriteLine("waken");
            }
            finally { waker.Dispose(); }
        }

        class OnUploadError : ErrorCtx
        {
            public override void onError(MsgCode code, string msg, string[] args = null)
            {
                Assert.Fail(string.Format(@"code: {0}, error: {1}", code.Name(), msg));
            }
        }
        static void UploadTransaction(CancellationTokenSource waker, SessionClient client, string p)
        {
            // string p = Path.get(filename);
            byte[] f = File.ReadAllBytes(p);
            string b64 = AESHelper.Encode64(f);

            AnsonMsg jmsg = client.Update(uri, "a_users");
            AnUpdateReq upd = (AnUpdateReq)jmsg.Body(0);
            upd.Nv("nationId", "CN")
                .WhereEq("userId", "admin")
                // .post(((UpdateReq) new UpdateReq(null, "a_attach")
                .Post(AnUpdateReq.formatDelReq(uri, null, "a_attaches")
                        .WhereEq("busiTbl", "a_users")
                        .WhereEq("busiId", "admin")
                        .Post((AnInsertReq.formatInsertReq(null, null, "a_attaches")
                                .Cols("attName", "busiId", "busiTbl", "uri")
                                .Nv("attName", "-Anclient.cs Test")
                                // The parent pk can't be resulved, we must provide the value.
                                // See https://odys-z.github.io/notes/semantics/best-practices.html#fk-ins-cate
                                .Nv("busiId", "admin")
                                .Nv("busiTbl", "a_users")
                                .Nv("uri", b64))));

            jmsg.Header(client.Header());

            client.Console(jmsg);
            
            client.Commit(jmsg,
                //(code, data) => {
                //    if (MsgCode.ok == code.code)
                //        Utils.Logi(code.ToString());
                //    else Utils.Warn(data.ToString());
                //},
                // onErr: (c, err) => { Assert.Fail(string.Format(@"code: {0}, error: {1}", c, err.Msg())); },
                // waker );
                new OnUploadError() );

            waker.Cancel();
        }
    }
}
