using album_sync;
using album_sync.album.tier;
using io.odysz.anclient;
using io.odysz.anson.common;
using io.odysz.semantic.jprotocol;
using io.oz.album.tier;
using System;
using System.Text.RegularExpressions;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
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
        private AlbumContext singleton;

        //const string kdevice = "device";
        //const string kserv = "jserv";
        //const string kport = "port";
        //const string klogid = "logid";

        public Login()
        {
            this.singleton = AlbumContext.GetInstance();

            InitializeComponent();
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

        /*
        private void loadDeviceInfo()
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
        */

        public void savePrefs()
        {
            Preferences.save(device.Text?.Trim(), jserv.Text?.Trim(), port.Text?.Trim(), logid.Text?.Trim());
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
            if (LangExt.isblank(jserv.Text.Trim()))
                jserv.Text = "127.0.0.1";
            if (LangExt.isblank(port.Text.Trim()))
                port.Text = "8080";

            AnClient.Init(string.Format("http://{0}:{1}/{2}", jserv.Text, port.Text, jservPath));

            // AlbumContext login(String uid, String pswd, TierCallback onOk, JProtocol.OnError onErr)
            singleton.login(new OnLoginHandler(this), new OnLoginHandler(this));
        }

        class OnLoginHandler : TierCallback, OnError
        {
            Login dlg;
            public OnLoginHandler(Login loginDlg)
            {
                this.dlg = loginDlg;
            }

            public void err(AnsonMsg.MsgCode code, string msg, string[] args = null)
            {
                MessageBox.Show(string.Format(
                    "Login Failed!\ndetails:\n{0}", msg),
                    "Error", MessageBoxButton.OK, MessageBoxImage.Error);
            }

            /*
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
            */

            public void ok(AlbumClientier tier)
            {
                // ((App)Application.Current).loggedIn = true;
                // ((App)Application.Current).client = client;

                Application.Current.Dispatcher.Invoke(new Action(() => {
                    dlg.savePrefs();

                    FileExplorer form = new FileExplorer(tier);
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
