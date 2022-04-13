using io.odysz.anson.common;
using System;
using System.IO;
using System.Text.RegularExpressions;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using System.Xml;

namespace TreeViewFileExplorer
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class Login : Window
    {
        MainWindow main;
        string execPath;
        const string kserv = "jserv";
        const string kport = "port";
        const string klogid = "logid";

        public Login()
        {
            InitializeComponent();

            execPath = AppDomain.CurrentDomain.BaseDirectory;
        }
        private void onSetDevice(object sender, RoutedEventArgs e)
        {
            if (LangExt.isblank(device.Text.Trim()))
            {
                MessageBox.Show("Device name can not be empty!", "Information", MessageBoxButton.OK, MessageBoxImage.Exclamation);
                return;
            }
            else
            {
                savePrefs();
                turnOnDevice(true);
            }
        }

        private void onLogin(object sender, RoutedEventArgs e)
        {
            main = new MainWindow();
            //main.WindowStartupLocation = WindowStartupLocation.CenterScreen;
            //main.SourceInitialized += (s, a) => main.WindowState = WindowState.Maximized;
            main.ShowDialog();
        }

        private void portPreview(object sender, TextCompositionEventArgs e)
        {
            Regex regex = new Regex("[^0-9]+");
            e.Handled = regex.IsMatch(e.Text);
        }

        private void pswdChanged(object sender, RoutedEventArgs e)
        {
            pswd = (PasswordBox)sender;
            if (pswd.Password != "")
                pswdPlaceholder.Visibility = Visibility.Collapsed;
            else
                pswdPlaceholder.Visibility = Visibility.Visible;
        }

        #region Handlers
        private void turnOnDevice(bool on)
        {
            if (on)
            {
                ico.Opacity = 1.0;
                device.IsEnabled = false;
                btDevice.Visibility = Visibility.Collapsed;
                btLogin.IsEnabled = true;
                device_tip.Visibility = Visibility.Collapsed;
            }
            else
            {
                ico.Opacity = 0.2;
                device.IsEnabled = true;
                btDevice.Visibility = Visibility.Visible;
                btLogin.IsEnabled = false;
                device_tip.Visibility = Visibility.Visible;
            }
        }

        private void loadDeviceInfo()
        {
            try
            {
                if (File.Exists(Path.Combine(execPath, "device.xml")))
                {
                    XmlDocument doc = new XmlDocument();
                    doc.Load(Path.Combine(execPath, "device.xml"));
                    XmlNodeList xnodes = doc.DocumentElement.SelectNodes("/configs/t[@id='device']/c");
                    foreach (XmlNode n in xnodes)
                    {
                        XmlNode k = n.ChildNodes[0];
                        XmlNode v = n.ChildNodes[1];
                        if (kserv.Equals(k.InnerText))
                            jserv.Text = v.InnerText.Trim();
                        else if (kport.Equals(k.InnerText))
                            port.Text = v.InnerText.Trim();
                        else if (klogid.Equals(k.InnerText))
                            logid.Text = v.InnerText.Trim();
                    }

                    turnOnDevice(true);
                }
                else turnOnDevice(false);
            }
            catch (Exception) { }

        }

        private void savePrefs()
        {
            string[] xml = {
            "<?xml version = \"1.0\" encoding = \"UTF-8\" ?>",
            "<!DOCTYPE xml>",
            "<configs>",
            "  <t id=\"device\" pk=\"k\" columns=\"k,v\">",
            string.Format("\t<c><k>{0}</k><v>{1}</v></c>", kserv, jserv.Text.Trim()),
            string.Format("\t<c><k>{0}</k><v>{1}</v></c>", kport, port.Text.Trim()),
            string.Format("\t<c><k>{0}</k><v>{1}</v></c>", klogid, logid.Text.Trim()),
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

        #endregion
    }
}
