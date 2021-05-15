using io.odysz.anclient;
using io.odysz.anclient.example.revit;
using io.odysz.semantics;
using System;
using System.Collections.Generic;
using System.IO;
using System.Windows.Forms;

namespace file.upload
{
    public partial class XvForm : Form {
        private AnsonClient client;
        private string uid;
        private List<string> currentFiles;

        public XvForm() => InitializeComponent();

        private async void btnLogin_Click(object sender, EventArgs e)
        {
            uid = txtUser.Text;
            string pwd = pswd.Text;
            if (string.IsNullOrEmpty(uid) || string.IsNullOrEmpty(pwd) || uid.Length != 5 || pwd.Length != 6)
            {
                MessageBox.Show("login", "user/password invalid!");
                return;
            }

            try
            {
                Clients.Init(txtUrl.Text);
                await Clients.Login(uid, "----------" + pwd,
                    (code, resp) =>
                    {
                        client = new AnsonClient(resp.ssInf);
                        txtRegistry.Text = client.ssInf.ssid;
                    });
            }
            catch (Exception x)
            {
                MessageBox.Show(x.Message, "Jserv Login Exception");
            }
        }
        private void onOpen(object sender, EventArgs e)
        {
            OpenFileDialog fd = new OpenFileDialog();
            fd.Filter = "GLTF(*.gltf,*.glb)|*.gltf;*.glb|All files (*.*)|*.*";
            DialogResult dialogResult = fd.ShowDialog();
            if (dialogResult == DialogResult.OK)
            {
                currentFiles = Core.Gltfilenames(fd.FileName, txtGltf);
                txtFile.Text = txtGltf.Text;
            }
        }

        private void onToGlb(object sender, EventArgs e)
        {
            if (currentFiles == null || string.IsNullOrEmpty(currentFiles[0]))
            {
                MessageBox.Show("Gltf file path is not correct!", "Converting GLB");
            }
            else
            {
                string pgltf = Path.Combine(currentFiles[0]);
                try
                {
                    txtFile.Text = Core.ConvertGlb(pgltf);
                    currentFiles.Clear();
                    currentFiles.Add(txtFile.Text);
                }
                catch (Exception ex)
                {
                    txtFile.Text = ex.GetType().Name + ": " + ex.Message;
                }
            }
        }

       private void btnUpload_Click(object sender, EventArgs e)
        {
            if (string.IsNullOrEmpty(txtFile.Text))
                onOpen(null, null);

            foreach(string fn in currentFiles) 
                if (string.IsNullOrEmpty(fn) || !File.Exists(fn))
                {
                    MessageBox.Show("File not found: " + fn, "Upload");
                    return;
                }

            Core.UploadUi(client, uid, currentFiles,
                (resulved) =>
                {
                    SemanticObject attId0 = (SemanticObject)resulved.Get("a_attaches"); // some Id losted when resulving
                    lbAttachId.Invoke((MethodInvoker)delegate
                    {
                        lbAttachId.Text = "last file recId: " + attId0.Get("attId");
                    });
                });
        }
    }
}
