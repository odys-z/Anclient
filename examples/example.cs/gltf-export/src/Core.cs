using io.odysz.anclient;
using io.odysz.semantic.jprotocol;
using io.odysz.semantics;
using System;
using System.Collections.Generic;
using System.IO;
using System.Windows.Forms;

namespace io.odysz.anclient.example.revit
{
    class Core
    {
        /// <summary>
        /// f.gltf : [f.gltf, f.bin]
        /// </summary>
        /// <param name="gltf"></param>
        /// <param name="uiwedget"></param>
        /// <returns></returns>
        public static List<string> Gltfilenames(string filename, System.Windows.Forms.Control winFormText = null)
        {
            List<string> currentFiles = new List<string>();
            if (".gltf" == Path.GetExtension(filename))
            {
                string directory = Path.GetDirectoryName(filename) + "\\";
                string gltf = Path.GetFileName(filename);
                string glb = Path.GetFileNameWithoutExtension(gltf) + ".bin";
                if (winFormText != null)
                    winFormText.Text = filename + " -> " + glb;
                currentFiles = new List<string> { filename, Path.Combine(directory, glb) };
            }
            else
            {
                if (winFormText != null)
                    winFormText.Text = filename;
                currentFiles = new List<string>() { filename };
            }
            return currentFiles;
        }

       public static string ConvertGlb(string pgltf)
        {
            string ngltf = Path.GetFileNameWithoutExtension(pgltf);
            string nglb = ngltf + ".glb";
            string pglb = Path.GetDirectoryName(pgltf);
            string fullpath = Path.Combine(pglb, nglb);

            var mglb = SharpGLTF.Schema2.ModelRoot.Load(pgltf);
            mglb.SaveGLB(fullpath);
            return fullpath;
        }

        public static void UploadUi(SessionClient client, string busic, string uid, List<string> fullpaths, Action<SemanticObject> onOk = null)
        {
            // upload to a_attaches
            if (client == null)
                MessageBox.Show("Please connect first.", "Upload With UI");
            else
            {
                client.AttachFiles(fullpaths, busic??"a_users", uid, (c, d) => {
                    SemanticObject resulved = (SemanticObject)((AnsonResp)d).Map("resulved");
                    if (onOk != null)
                        onOk(resulved);
                });
            }
        }
 
    }
}
