using io.odysz.anclient;
using io.odysz.semantic.jprotocol;
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

        public XvForm()
        {
            InitializeComponent();
        }

        private async void btnLogin_Click(object sender, EventArgs e)
        {
            uid = txtUser.Text;
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
        private void btnExport_Click(object sender, EventArgs e)
        {
            OpenFileDialog fd = new OpenFileDialog();
            fd.Filter = "GLTF(*.gltf,*.glb)|*.gltf;*.glb|All files (*.*)|*.*";
            DialogResult dialogResult = fd.ShowDialog();
            if (dialogResult == DialogResult.OK)
            {
                string filename = fd.FileName;
                if (".gltf" == Path.GetExtension(filename))
                {
                    string directory = Path.GetDirectoryName(filename) + "\\";
                    string gltf = Path.GetFileName(filename);
                    string glb = Path.GetFileNameWithoutExtension(gltf) + ".bin";
                    txtFile.Text = filename + ", " + glb;
                    currentFiles = new List<string> { filename, Path.Combine(directory, glb) };
                }
                else
                {
                    txtFile.Text = filename;
                    currentFiles = new List<string>() { filename };
                }
            }
        }


        private void btnUpload_Click(object sender, EventArgs e)
        {
            if (string.IsNullOrEmpty(txtFile.Text))
                btnExport_Click(null, null);

            foreach(string fn in currentFiles) 
                if (string.IsNullOrEmpty(fn) || !File.Exists(fn))
                {
                    MessageBox.Show("File not found: " + fn, "Upload");
                    return;
                }

            // upload to a_attaches
            if (client == null)
                    MessageBox.Show("Please connect first.", "Uploat");
            
            else
            {
                client.AttachFiles(currentFiles, "a_users", uid, (c, d) => {
                    SemanticObject resulved = (SemanticObject)((AnsonResp)d).Map("resulved");
                    SemanticObject attId0 = (SemanticObject)resulved.Get("a_attaches"); // some Id losted when resulving
                    lbAttachId.Invoke((MethodInvoker)delegate {
                        lbAttachId.Text = "last file recId: " + attId0.Get("attId");
                    });
                });
            }
        }
    }
}
