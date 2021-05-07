using Autodesk.Revit.UI;
using System;
using System.Reflection;
using System.IO;
using System.Windows.Media.Imaging;

namespace io.odysz.anclient.example.revit
{
    /// <summary>
    /// This exporter application's main class. The class must be Public.
    ///
    /// </summary>
    public class ExApp : IExternalApplication {
        private static string icoPath = @"xvExporter/assets/xv.png";

        public Result OnStartup(UIControlledApplication application) {
            // Add a new ribbon panel
            RibbonPanel ribbonPanel = application.CreateRibbonPanel("GLTF Export");

            // Create a push button to trigger a command add it to the ribbon panel.
            string thisAssemblyPath = Assembly.GetExecutingAssembly().Location;
            PushButtonData buttonData = new PushButtonData("cmdXp",
               "x-visual...", thisAssemblyPath, "io.odysz.anclient.example.revit.ExCmds");

            PushButton pushButton = ribbonPanel.AddItem(buttonData) as PushButton;

            // Optionally, other properties may be assigned to the button
            // a) tool-tip
            pushButton.ToolTip = "Test Connection.";

            // b) large bitmap
            Uri uriImage = new Uri(Path.GetDirectoryName(thisAssemblyPath) + @"\" + icoPath);

            BitmapImage largeImage = new BitmapImage(uriImage);
            pushButton.LargeImage = largeImage;

            return Result.Succeeded;
        }

        public Result OnShutdown(UIControlledApplication application) {
            // nothing to clean up in this simple case
            return Result.Succeeded;
        }
    }
}
