﻿using io.odysz.common;
using io.odysz.semantic.ext;
using io.odysz.semantic.jprotocol;
using io.odysz.semantic.jserv.U;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.Collections;
using System.Diagnostics;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using static io.odysz.semantic.jprotocol.AnsonMsg;

namespace io.odysz.anclient
{
    [TestClass()]
    public class ClientsTests
    {
        private const string jserv = "http://192.168.0.201:8080/jserv-sample";
        private const string pswd = "----------123456"; // TODO needing 16/32 padding
        private const string uid =  "admin";
        private static AnsonClient client;

        static ClientsTests()
        {
            Clients.Init(jserv);
        }

        [TestMethod()]
        public async Task TestLogin()
        {
            await Login();
        }

        internal async Task Login(Action<AnsonClient, AnsonResp> onLogin = null) {
            bool succeed = false;
            await Clients.Login(uid, pswd,
                (code, resp) =>
                {
                    succeed = true;
                    client = new AnsonClient(resp.ssInf);
                    Assert.AreEqual(uid, resp.ssInf.uid);
                    Assert.IsNotNull(resp.ssInf.ssid);
                    if (onLogin != null)
                        onLogin(client, resp);
                });
            if (!succeed)
                Assert.Fail("onOk not called.");
            Assert.IsNotNull(client);
        }

        // [TestMethod()]
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
                    IList rses = (IList)((AnDatasetResp)data.Body()?[0]).Forest();
                    Utils.Logi(rses);;
                });
        }

        [TestMethod()]
        public async Task TestUpload()
        {
            CancellationTokenSource waker = new CancellationTokenSource();
            await Login(
                (client, resp) =>
                {
                    UploadTransaction(waker, client, "Sun Yet-sen.jpg");
                });
            try
            {   // should waken by SessionCleint.Commit()
                Task.Delay(60 * 1000, waker.Token).Wait();
                Assert.Fail("Uploading timeout...");
            }
            catch (AggregateException ex)
            {
                // waked up
                // we can access the file now
                Debug.WriteLine("waken");
            }
            finally { waker.Dispose(); }
        }
        static void UploadTransaction(CancellationTokenSource waker, AnsonClient client, string p)
        {
            // string p = Path.get(filename);
            byte[] f = File.ReadAllBytes(p);
            string b64 = AESHelper.Encode64(f);

            AnsonMsg jmsg = client.Update(null, "a_users");
            AnUpdateReq upd = (AnUpdateReq)jmsg.Body(0);
            upd.Nv("nationId", "CN")
                .WhereEq("userId", "admin")
                // .post(((UpdateReq) new UpdateReq(null, "a_attach")
                .Post(AnUpdateReq.formatDelReq(null, null, "a_attaches")
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
                (code, data) => {
                    if (MsgCode.ok == code.code)
                        Utils.Logi(code.ToString());
                    else Utils.Warn(data.ToString());
                },
                onErr: (c, err) => {
                    Assert.Fail(string.Format(@"code: {0}, error: {1}", c, err.Msg()));
                },
                waker);
        }
    }
}
