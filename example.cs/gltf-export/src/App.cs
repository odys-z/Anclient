using Autodesk.Revit.UI;
using System;
using System.Reflection;
using System.IO;
using System.Windows.Media.Imaging;
using Autodesk.Revit.DB;
using Autodesk.Revit.Attributes;
using Autodesk.Revit.UI.Events;
using glTFRevitExport;
using Newtonsoft.Json;
using System.Collections.Generic;

namespace io.odysz.anclient.example.revit
{
    /// <summary>
    /// This exporter application's main class. The class must be Public.
    ///
    /// </summary>
    public class ExApp : IExternalApplication {
        private static string icoPath = @"assets\ir.png";
        public static bool commandSwitch = false;
        public static UIDocument uidoc = null;
        public static System.Windows.Forms.TextBox txtGltf = null;
        public static List<string> currentFiles;

        private UIControlledApplication app;

        public Result OnStartup(UIControlledApplication application) {
            this.app = application;
            // Add a new ribbon panel
            RibbonPanel ribbonPanel = application.CreateRibbonPanel("Import x-visual");

            // Create a push button to trigger a command add it to the ribbon panel.
            string thisAssemblyPath = Assembly.GetExecutingAssembly().Location;
            PushButtonData buttonData = new PushButtonData("cmdXp",
               "x-visual...", thisAssemblyPath, "io.odysz.anclient.example.revit.ShowForm");

            PushButton pushButton = ribbonPanel.AddItem(buttonData) as PushButton;

            // Optionally, other properties may be assigned to the button
            // a) tool-tip
            pushButton.ToolTip = "Check settings & import.";

            // b) large bitmap
            Uri uriImage = new Uri(Path.GetDirectoryName(thisAssemblyPath) + @"\" + icoPath);
            BitmapImage largeImage = new BitmapImage(uriImage);
            pushButton.LargeImage = largeImage;


            // correct way: https://www.revitapidocs.com/2015/e233027b-ba8c-0bd1-37b7-93a066efa5a3.htm
            application.Idling += new EventHandler<IdlingEventArgs>(idleExport);

            return Result.Succeeded;
        }

        /// <summary>
        /// Export (using CustomerExport) in idel events.
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void idleExport(object sender, IdlingEventArgs e)
        {
            if (commandSwitch)
            {
                commandSwitch = false;
                Command cmd = new Command();
                cmd.Execute(uidoc);
                glTF glTF = cmd.resultGltf;
                txtGltf.Text += "nodes...\n";
                txtGltf.Text += JsonConvert.SerializeObject(glTF, new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore });
                currentFiles = Core.Gltfilenames(cmd.filename);
            }
        }

        public Result OnShutdown(UIControlledApplication application) {
            // nothing to clean up in this simple case
            return Result.Succeeded;
        }
    }

    /// <remarks>
    /// The "HelloWorld" external command. The class must be Public.
    /// </remarks>
    [Transaction(TransactionMode.Manual)]
    public class ShowForm : IExternalCommand
    {
        // The main Execute method (inherited from IExternalCommand) must be public
        public Result Execute(ExternalCommandData revit,
                ref string message, ElementSet elements)
        {
            // TaskDialog.Show("Revit", "Hello World");
            Document doc = revit.Application.ActiveUIDocument.Document;

            UIDocument uidoc = revit.Application.ActiveUIDocument;

            XvForm f = new XvForm(doc, uidoc, doc.ActiveView);
            f.Show();
            return Result.Succeeded;
        }

    }


}
