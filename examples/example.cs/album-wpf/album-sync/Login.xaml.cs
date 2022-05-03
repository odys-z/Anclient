using album_sync;
using album_sync.album.tier;
using io.odysz.anclient;
using io.odysz.anson.common;
using io.odysz.semantic.jprotocol;
using io.oz.album.tier;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.IO;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using System.Windows.Interop;
using System.Xml;
using static io.odysz.semantic.jprotocol.JProtocol;

namespace io.oz.album
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class Login : Window
    {
        // MainWindow main;
        private const string jservPath = "jserv-album";
        string execPath;
        //const string kdevice = "device";
        //const string kserv = "jserv";
        //const string kport = "port";
        //const string klogid = "logid";

        public Login()
        {
            InitializeComponent();
            loadDeviceInfo();
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
                execPath = AppDomain.CurrentDomain.BaseDirectory;
                /*
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
                */
                AlbumContext.init(execPath);

            }
            catch (Exception) { }
        }

        private void savePrefs()
        {
            string dev = device.Text?.Trim();

            string[] xml = {
            "<?xml version = \"1.0\" encoding = \"UTF-8\" ?>",
            "<!DOCTYPE xml>",
            "<configs>",
            "  <t id=\"preferences\" pk=\"k\" columns=\"k,v\">",
            string.Format("\t<c><k>{0}</k><v>{1}</v></c>", kdevice, dev),
            string.Format("\t<c><k>{0}</k><v>{1}</v></c>", kserv, jserv.Text?.Trim()),
            string.Format("\t<c><k>{0}</k><v>{1}</v></c>", kport, port.Text?.Trim()),
            string.Format("\t<c><k>{0}</k><v>{1}</v></c>", klogid, logid.Text?.Trim()),
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
                MessageBox.Show("Device name can not be empty!", "Information",
                                MessageBoxButton.OK, MessageBoxImage.Exclamation);
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
            if (LangExt.isblank(jserv.Text.Trim()))
                jserv.Text = "127.0.0.1";
            if (LangExt.isblank(port.Text.Trim()))
                port.Text = "8080";

            // AlbumContext login(String uid, String pswd, TierCallback onOk, JProtocol.OnError onErr)
            AlbumContext.login(logid, pswd, new OnLoginHandler(this));

            AnClient.Init(string.Format("http://{0}:{1}/{2}", jserv.Text, port.Text, jservPath));

            try
            {
                Task<SessionClient> tclient =
                AnClient.Login(logid, pswd, device, new OnLoginHandler(this), new OnLoginHandler(this));
                // tclient.Wait();
                // client = tclient.Result;
                // Assert.IsNotNull(client);
            }
            catch (Exception ex)
            {
                MessageBox.Show(string.Format(
                    "Login Failed!\ndetails:\n{0}\n{1}", ex.Message, ex.InnerException?.Message),
                    "Error", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        class OnLoginHandler : OnLogin, OnError
        {
            Login dlg;
            public OnLoginHandler(Login loginDlg)
            {
                this.dlg = loginDlg;
            }

            public void err(AnsonMsg.MsgCode code, string msg, string[] args = null)
            {
                MessageBox.Show(String.Format(
                    "Login Failed!\ndetails:\n{0}", msg),
                    "Error", MessageBoxButton.OK, MessageBoxImage.Error);
            }

            public void ok(SessionClient client)
            {
                ((App)Application.Current).loggedIn = true;
                ((App)Application.Current).client = client;

                Application.Current.Dispatcher.Invoke(new Action(() => {
                    dlg.savePrefs();

                    // MainWindow main = new MainWindow(client);
                    // main.ShowDialog();
                    FileExplorer form = new FileExplorer(client);
                    dlg.Hide();
                    form.ShowDialog();
                    dlg.Show();
                }));
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
            if (pswdPlaceholder != null)
            if (pswd.Password != "")
                pswdPlaceholder.Visibility = Visibility.Collapsed;
            else
                pswdPlaceholder.Visibility = Visibility.Visible;
        }

    }
}
