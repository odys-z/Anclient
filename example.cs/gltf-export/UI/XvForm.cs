using Autodesk.Revit.DB;
using Autodesk.Revit.UI;
using io.odysz.semantics;
using System;
using System.Collections.Generic;
using System.IO;
using System.Net.Http;
using System.Text;
using System.Windows.Forms;

namespace io.odysz.anclient.example.revit {
    public partial class XvForm : System.Windows.Forms.Form {
        private readonly UIDocument uidoc; // = commandData.Application.ActiveUIDocument;
        private readonly Document dbdoc;
        private readonly Autodesk.Revit.DB.View view;
        private readonly UIApplication uiApp;
        private AnsonClient client;

        public XvForm(Document dbdoc, UIDocument uidoc, Autodesk.Revit.DB.View uiview) {
            InitializeComponent();
            this.dbdoc = dbdoc;
            this.uidoc = uidoc;
            view = uiview;
            uiApp = uidoc.Application;
            txtJson.Text = uidoc.Document.Title;
        }

        private static Guid guid = new Guid("17760704-1971-1911-1010-197101234567");

        private async void onLogin(object sender, EventArgs e) {
            string uid = txtUser.Text;
            string pwd = pswd.Text;
            if (string.IsNullOrEmpty(uid) || string.IsNullOrEmpty(pwd) || uid.Length != 5 || pwd.Length != 6)
            {
                MessageBox.Show("user/password invalid!", "login");
                return;
            }

            Clients.Init(txtUrl.Text);// + "/login.serv11");
            await Clients.Login(uid, "----------" + pwd,
                (code, resp) =>
                {
                    client = new AnsonClient(resp.ssInf);
                    txtRegistry.Text = client.ssInf.ssid;
                });
        }

        public static StringContent getPostPayload() {
            var values = new Dictionary<string, string> {
                    { "thing1", "hello" },
                    { "thing2", "world" } };

            // var content = new FormUrlEncodedContent(values);
            // return new StringContent(values.ToString(), Encoding.UTF8);
            return new StringContent("{}", Encoding.UTF8, "application/json");
        }

        /// <summary>
        /// Handling issue:
        /// Autodesk.Revit.Exceptions.InternalException: Failed to register a managed object for the currently
        /// active external application. 
        /// A possible cause may be an inactive external application(not being invoked by Revit at present)
        /// attempting to assess the Revit API from a modeless dialog or another outside thread.
        /// See disscussion at
        /// https://forums.autodesk.com/t5/revit-api-forum/revit-2015-exception-with-autodesk-revit-db-customexporter/td-p/4978936
        /// So, when a form started in another thread, it can't execute export command like that in addin command.
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void onExportClick2(object sender, EventArgs e)
        {
            ICollection<ElementId> selectedIds = uidoc.Selection.GetElementIds();
            if (0 == selectedIds.Count)
            {
                // If no elements selected.
                TaskDialog.Show("X-visual BIM Import", "You haven't selected any elements.");
            }
            else
            {
                string info = "Json nodes: ";
                foreach (ElementId id in selectedIds)
                {
                    info += "\n\t" + id.IntegerValue;
                }

                txtJson.Text = info;

                // Command can not executed here
                // correct way: https://www.revitapidocs.com/2015/e233027b-ba8c-0bd1-37b7-93a066efa5a3.htm
                ExApp.uidoc = uidoc;
                ExApp.txtGltf = txtJson;
                ExApp.commandSwitch = true;
            }
        }

        private void btnUpload_Click(object sender, EventArgs e)
        {
            foreach (string fn in ExApp.currentFiles)
                if (string.IsNullOrEmpty(fn) || !File.Exists(fn))
                {
                    MessageBox.Show("File not found: " + fn, "Upload");
                    return;
                }

            string uid = client.ssInf.uid;
            Core.uploadUi(client, uid, ExApp.currentFiles,
                (resulved) =>
                {
                    SemanticObject attId0 = (SemanticObject)resulved.Get("a_attaches"); // some Id losted when resulving
                    lbAttachId.Invoke((MethodInvoker)delegate
                    {
                        lbAttachId.Text = "last file recId: " + attId0.Get("attId");
                    });
                });
        }
    }
}
