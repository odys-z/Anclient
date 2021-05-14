using Autodesk.Revit.DB;
using Autodesk.Revit.DB.ExtensibleStorage;
using Autodesk.Revit.UI;
using Autodesk.Revit.UI.Events;
using glTFRevitExport;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;

namespace io.odysz.anclient.example.revit {
    public partial class XvForm : System.Windows.Forms.Form {
        private readonly UIDocument uidoc; // = commandData.Application.ActiveUIDocument;
        private readonly Document dbdoc;
        private readonly View view;
        private readonly UIApplication uiApp;

        public XvForm(Document dbdoc, UIDocument uidoc, View uiview) {
            InitializeComponent();
            this.dbdoc = dbdoc;
            this.uidoc = uidoc;
            view = uiview;
            uiApp = uidoc.Application;
            txtJson.Text = uidoc.Document.Title;
        }

        private Schema deviceSchema;
        private static Guid guid = new Guid("17760704-1971-1911-1010-197101234567");

        private void onLogin(object sender, EventArgs e) {
            if (client == null)
            {
                string serv = txtUrl.Text + "/login.serv11";
                string uid = txtUser.Text;
                postConn(serv, uid, pswd.Text);
            }
        }

        private AnsonClient client;

        public async void postConn(string url, string uid, string pswd) {
            await Clients.Login(uid, pswd,
                (code, resp) =>
                {
                    client = new AnsonClient(resp.ssInf);
                    txtRegistry.Text = string.Format("Token: {0}", client.ssInf.ssid);
                },
                (code, resp) => {
                    TaskDialog.Show("xv BIM Importer", resp.Msg());
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
        /// Find a selected element.
        /// https://knowledge.autodesk.com/search-result/caas/CloudHelp/cloudhelp/2016/ENU/Revit-API/files/GUID-C67BE1BC-50D6-403C-8458-61BEBADFC6CE-htm.html
        /// </summary>
        //private void onExportClick(object sender, EventArgs e) {
        //    ICollection<ElementId> selectedIds = uidoc.Selection.GetElementIds();
        //    if (0 == selectedIds.Count) {
        //        // If no elements selected.
        //        TaskDialog.Show("X-visual BIM Import", "You haven't selected any elements.");
        //    } else {
        //        string info = "Ids of selected elements in the document are: ";
        //        foreach (ElementId id in selectedIds) {
        //            info += "\n\t" + id.IntegerValue;
        //        }

        //        txtJson.Text = info;

        //        Command cmd = new Command();
        //        cmd.Execute(uidoc);
        //    }
        //}

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

        }
    }
}
