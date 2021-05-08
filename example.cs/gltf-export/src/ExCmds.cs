using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Autodesk.Revit.ApplicationServices;
using Autodesk.Revit.Attributes;
using Autodesk.Revit.DB;
using Autodesk.Revit.UI;
using Autodesk.Revit.UI.Selection;
using Autodesk.Revit.DB.Architecture;

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
            /*
            GLTFExporter x = new();
            return x.Excute(commandData, message, elements);
            */
            return new Result();
        }
        /*
        public Result Execute(ExternalCommandData commandData, ref string message, ElementSet elements)
        {
            //Get application and documnet objects
            UIApplication uiapp = commandData.Application;
            Document doc = uiapp.ActiveUIDocument.Document;
            GLTFExporter x = new GLTFExporter(doc);
            // return x.ExportView();// .ExportView(commandData, message, elements);
            return new Result();
        }
        */

    }

}
