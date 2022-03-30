using System.Text.RegularExpressions;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;

namespace TreeViewFileExplorer
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class Login : Window
    {
        MainWindow main; 

        public Login()
        {
            InitializeComponent();
        }
        private void onSetDevice(object sender, RoutedEventArgs e)
        {
            ico.Opacity = 1.0;
            device.IsEnabled = false;
            btDevice.Visibility = Visibility.Collapsed;
            btLogin.IsEnabled = true;
            device_tip.Visibility = Visibility.Collapsed;
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
    }
}
