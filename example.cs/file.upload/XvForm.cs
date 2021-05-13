using io.odysz.anclient;
using System;
using System.Windows.Forms;

namespace file.upload {
    public partial class XvForm : Form {
        private AnsonClient client;

        public XvForm()
        {
            InitializeComponent();
        }

        private void btnExport_Click(object sender, EventArgs e)
        {
        }

        private async void btnLogin_Click(object sender, EventArgs e)
        {
            string uid = txtUser.Text;
            string pwd = pswd.Text;
            if (string.IsNullOrEmpty(uid) || string.IsNullOrEmpty(pwd) || uid.Length != 5 || pwd.Length != 6)
            {
                MessageBox.Show("login", "user/password invalid!");
                return;
            }

            Clients.Init(txtUrl.Text);
            await Clients.Login(uid, "----------" + pwd,
                (code, resp) =>
                {
                    client = new AnsonClient(resp.ssInf);
                    txtRegistry.Text = client.ssInf.ssid;
                });
        }
    }
}
