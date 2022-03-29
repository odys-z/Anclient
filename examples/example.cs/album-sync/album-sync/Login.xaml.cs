using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;
using TreeViewFileExplorer;

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
        private void onLogin(object sender, RoutedEventArgs e)
        {
            main = new MainWindow();
            //main.WindowStartupLocation = WindowStartupLocation.CenterScreen;
            //main.SourceInitialized += (s, a) => main.WindowState = WindowState.Maximized;
            main.ShowDialog();
        }
    }
}
