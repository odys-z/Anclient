using album_sync;
using io.odysz.anclient;
using io.odysz.anson.common;
using io.odysz.semantic.jprotocol;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.Collections;
using System.IO;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using System.Xml;
using static io.odysz.semantic.jprotocol.JProtocol;

namespace TreeViewFileExplorer
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class Login : Window
    {
        // MainWindow main;
        string execPath;
        private SessionClient client;
        const string kdevice = "device";
        const string kserv = "jserv";
        const string kport = "port";
        const string klogid = "logid";

        public Login()
        {
            InitializeComponent();
            execPath = AppDomain.CurrentDomain.BaseDirectory;
            loadDeviceInfo(execPath);
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

        private void loadDeviceInfo(string execPath)
        {
            try
            {
                if (File.Exists(Path.Combine(execPath, "device.xml")))
                {
                    XmlDocument doc = new XmlDocument();
                    doc.Load(Path.Combine(execPath, "device.xml"));
                    XmlNodeList xnodes = doc.DocumentElement.SelectNodes("/configs/t[@id='preferences']/c");
                    foreach (XmlNode n in xnodes)
                    {
                        XmlNode k = n.ChildNodes[0];
                        XmlNode v = n.ChildNodes[1];
                        if (kdevice.Equals(k.InnerText))
                            device.Text = v.InnerText.Trim();
                        else if (kserv.Equals(k.InnerText))
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
            "  <t id=\"preferences\" pk=\"k\" columns=\"k,v\">",
            string.Format("\t<c><k>{0}</k><v>{1}</v></c>", kdevice, device.Text.Trim()),
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

        private void toLogin(object sender, RoutedEventArgs e)
        {
            Loging(logid.Text, pswd.Password, device.Text);
        }

        #endregion
 
        #region login
        internal void Loging(string logid, string pswd, string device)
        {
            Task<SessionClient> tclient = AnClient.Login(logid, pswd, device, new OnLoginHandler());
            tclient.Wait();
            client = tclient.Result;
            Assert.IsNotNull(client);
        }

        class OnLoginHandler : OnLogin
        {
            public void ok(SessionClient client)
            {
                ((App)Application.Current).loggedIn = true;
                ((App)Application.Current).client = client;

                MainWindow main = new MainWindow();
                //main.WindowStartupLocation = WindowStartupLocation.CenterScreen;
                //main.SourceInitialized += (s, a) => main.WindowState = WindowState.Maximized;
                main.ShowDialog();
            }
        }

        #endregion

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

    }
}
