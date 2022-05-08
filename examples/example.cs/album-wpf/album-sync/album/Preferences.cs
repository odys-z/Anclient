using io.oz.album.tier;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml;

namespace io.oz.album
{
    public class Preferences
    {
        private static string execPath;

        static public string device;
        static public string jserv;
        static public string port;
        static public string logid;

        public static void save(string device, string jserv, string port, string logid)
        {
            // string execPath = AppDomain.CurrentDomain.BaseDirectory;

            string[] xml = {
            "<?xml version = \"1.0\" encoding = \"UTF-8\" ?>",
            "<!DOCTYPE xml>",
            "<configs>",
            "  <t id=\"preferences\" pk=\"k\" columns=\"k,v\">",
            string.Format("\t<c><k>{0}</k><v>{1}</v></c>", PrefKeys.device, device),
            string.Format("\t<c><k>{0}</k><v>{1}</v></c>", PrefKeys.jserv, jserv),
            string.Format("\t<c><k>{0}</k><v>{1}</v></c>", PrefKeys.port, port),
            string.Format("\t<c><k>{0}</k><v>{1}</v></c>", PrefKeys.logid, logid),
            "  </t>",
            "</configs>",
            };

            StreamWriter file = new StreamWriter(Path.Combine(execPath, "device.xml"));
            try
            {
                foreach (string line in xml)
                {
                    file.WriteLineAsync(line);
                }
            } finally
            {
                file.Close();
            }
        }

        /// <summary>
        /// Init with preferences. Not login yet.
        /// </summary>
        public static void load()
        {
            try
            {
                Preferences.execPath = execPath;
                if (File.Exists(Path.Combine(execPath, "device.xml")))
                {
                    XmlDocument doc = new XmlDocument();
                    doc.Load(Path.Combine(execPath, "device.xml"));
                    XmlNodeList xnodes = doc.DocumentElement.SelectNodes("/configs/t[@id='preferences']/c");
                    foreach (XmlNode n in xnodes)
                    {
                        XmlNode k = n.ChildNodes[0];
                        XmlNode v = n.ChildNodes[1];
                        if (PrefKeys.device.Equals(k.InnerText))
                            device = v.InnerText;
                        else if (PrefKeys.jserv.Equals(k.InnerText))
                            jserv = v.InnerText;
                        else if (PrefKeys.port.Equals(k.InnerText))
                            port = v.InnerText.Trim();
                        else if (PrefKeys.logid.Equals(k.InnerText))
                            logid = v.InnerText.Trim();
                    }
                    // turnOnDevice(true);
                }
                // else turnOnDevice(false);
            }
            catch (Exception) { }
        }


    }
}
