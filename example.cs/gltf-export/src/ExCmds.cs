using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using Autodesk.Revit.ApplicationServices;
using Autodesk.Revit.Attributes;
using Autodesk.Revit.DB;
using Autodesk.Revit.UI;
using Autodesk.Revit.UI.Selection;
using Autodesk.Revit.DB.Architecture;
using Application = Autodesk.Revit.ApplicationServices.Application;
using System.IO;
using glTFRevitExport;

namespace io.odysz.anclient.example.revit
{
    /// <remarks>
    /// The exporter external command. The class must be Public.
    /// </remarks>
    [Transaction(TransactionMode.Manual)]
    [Regeneration(RegenerationOption.Manual)]
    public class XvCmds : IExternalCommand
    {
        public Result Execute(ExternalCommandData commandData, ref string message, ElementSet elements)
        {
            UIApplication uiapp = commandData.Application;
            UIDocument uidoc = uiapp.ActiveUIDocument;
            Application app = uiapp.Application;
            Document doc = uidoc.Document;

            View3D view = doc.ActiveView as View3D;
            if (view == null)
            {
                TaskDialog.Show("glTFRevitExport", "You must be in a 3D view to export.");
                return Result.Failed;
            }

            SaveFileDialog fileDialog = new SaveFileDialog();
            fileDialog.FileName = "NewProject"; // default file name
            fileDialog.DefaultExt = ".gltf"; // default file extension
            DialogResult dialogResult = fileDialog.ShowDialog();
            if (dialogResult == DialogResult.OK)
            {
                string filename = fileDialog.FileName;
                string directory = Path.GetDirectoryName(filename) + "\\";

                ExportViewCmd(view, filename, directory);
            }

            return Result.Succeeded;
        }
        public void ExportViewCmd(View3D view3d, string filename, string directory)
        {
            Document doc = view3d.Document;

            // Use our custom implementation of IExportContext as the exporter context.
            glTFExportContext ctx = new glTFExportContext(doc, filename, directory);
            // Create a new custom exporter with the context.
            CustomExporter exporter = new CustomExporter(doc, ctx);

            exporter.ShouldStopOnError = true;
            exporter.Export(view3d);
        }

    }

}
