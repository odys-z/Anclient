namespace file.upload {
    partial class XvForm {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            this.pswd = new System.Windows.Forms.TextBox();
            this.txtUser = new System.Windows.Forms.TextBox();
            this.txtRegistry = new System.Windows.Forms.TextBox();
            this.btnExport = new System.Windows.Forms.Button();
            this.txtUrl = new System.Windows.Forms.TextBox();
            this.label4 = new System.Windows.Forms.Label();
            this.label3 = new System.Windows.Forms.Label();
            this.btnLogin = new System.Windows.Forms.Button();
            this.btnUpdate = new System.Windows.Forms.Button();
            this.btnUpload = new System.Windows.Forms.Button();
            this.txtFile = new System.Windows.Forms.TextBox();
            this.lbAttachId = new System.Windows.Forms.Label();
            this.SuspendLayout();
            // 
            // pswd
            // 
            this.pswd.Location = new System.Drawing.Point(203, 40);
            this.pswd.Margin = new System.Windows.Forms.Padding(3, 2, 3, 2);
            this.pswd.Name = "pswd";
            this.pswd.PasswordChar = '*';
            this.pswd.Size = new System.Drawing.Size(185, 25);
            this.pswd.TabIndex = 13;
            this.pswd.Text = "123456";
            // 
            // txtUser
            // 
            this.txtUser.Location = new System.Drawing.Point(87, 40);
            this.txtUser.Margin = new System.Windows.Forms.Padding(3, 2, 3, 2);
            this.txtUser.Name = "txtUser";
            this.txtUser.Size = new System.Drawing.Size(109, 25);
            this.txtUser.TabIndex = 12;
            this.txtUser.Text = "admin";
            // 
            // txtRegistry
            // 
            this.txtRegistry.Location = new System.Drawing.Point(395, 40);
            this.txtRegistry.Margin = new System.Windows.Forms.Padding(3, 2, 3, 2);
            this.txtRegistry.Name = "txtRegistry";
            this.txtRegistry.ReadOnly = true;
            this.txtRegistry.Size = new System.Drawing.Size(171, 25);
            this.txtRegistry.TabIndex = 14;
            // 
            // btnExport
            // 
            this.btnExport.Location = new System.Drawing.Point(688, 38);
            this.btnExport.Margin = new System.Windows.Forms.Padding(4, 4, 4, 4);
            this.btnExport.Name = "btnExport";
            this.btnExport.Size = new System.Drawing.Size(111, 29);
            this.btnExport.TabIndex = 16;
            this.btnExport.Text = "&Open File";
            this.btnExport.UseVisualStyleBackColor = true;
            this.btnExport.Click += new System.EventHandler(this.btnExport_Click);
            // 
            // txtUrl
            // 
            this.txtUrl.Location = new System.Drawing.Point(87, 4);
            this.txtUrl.Margin = new System.Windows.Forms.Padding(4, 4, 4, 4);
            this.txtUrl.Name = "txtUrl";
            this.txtUrl.Size = new System.Drawing.Size(571, 25);
            this.txtUrl.TabIndex = 9;
            this.txtUrl.Text = "http://192.168.0.201:8080/jserv-sample/";
            // 
            // label4
            // 
            this.label4.AutoSize = true;
            this.label4.Location = new System.Drawing.Point(9, 44);
            this.label4.Margin = new System.Windows.Forms.Padding(4, 0, 4, 0);
            this.label4.Name = "label4";
            this.label4.Size = new System.Drawing.Size(71, 15);
            this.label4.TabIndex = 11;
            this.label4.Text = "Registry";
            // 
            // label3
            // 
            this.label3.AutoSize = true;
            this.label3.Location = new System.Drawing.Point(9, 8);
            this.label3.Margin = new System.Windows.Forms.Padding(4, 0, 4, 0);
            this.label3.Name = "label3";
            this.label3.Size = new System.Drawing.Size(79, 15);
            this.label3.TabIndex = 8;
            this.label3.Text = "xv-server";
            // 
            // btnLogin
            // 
            this.btnLogin.Location = new System.Drawing.Point(573, 38);
            this.btnLogin.Margin = new System.Windows.Forms.Padding(4, 4, 4, 4);
            this.btnLogin.Name = "btnLogin";
            this.btnLogin.Size = new System.Drawing.Size(85, 29);
            this.btnLogin.TabIndex = 10;
            this.btnLogin.Text = "&connect";
            this.btnLogin.UseVisualStyleBackColor = true;
            this.btnLogin.Click += new System.EventHandler(this.btnLogin_Click);
            // 
            // btnUpdate
            // 
            this.btnUpdate.Location = new System.Drawing.Point(423, 204);
            this.btnUpdate.Margin = new System.Windows.Forms.Padding(4, 4, 4, 4);
            this.btnUpdate.Name = "btnUpdate";
            this.btnUpdate.Size = new System.Drawing.Size(100, 29);
            this.btnUpdate.TabIndex = 17;
            this.btnUpdate.Text = "Up&date";
            this.btnUpdate.UseVisualStyleBackColor = true;
            // 
            // btnUpload
            // 
            this.btnUpload.Location = new System.Drawing.Point(253, 204);
            this.btnUpload.Margin = new System.Windows.Forms.Padding(4, 4, 4, 4);
            this.btnUpload.Name = "btnUpload";
            this.btnUpload.Size = new System.Drawing.Size(100, 29);
            this.btnUpload.TabIndex = 18;
            this.btnUpload.Text = "&Upload";
            this.btnUpload.UseVisualStyleBackColor = true;
            this.btnUpload.Click += new System.EventHandler(this.btnUpload_Click);
            // 
            // txtFile
            // 
            this.txtFile.Location = new System.Drawing.Point(87, 100);
            this.txtFile.Margin = new System.Windows.Forms.Padding(4, 4, 4, 4);
            this.txtFile.Name = "txtFile";
            this.txtFile.Size = new System.Drawing.Size(571, 25);
            this.txtFile.TabIndex = 19;
            // 
            // lbAttachId
            // 
            this.lbAttachId.AutoSize = true;
            this.lbAttachId.Location = new System.Drawing.Point(84, 140);
            this.lbAttachId.Name = "lbAttachId";
            this.lbAttachId.Size = new System.Drawing.Size(31, 15);
            this.lbAttachId.TabIndex = 20;
            this.lbAttachId.Text = "...";
            // 
            // XvForm
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(8F, 15F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(800, 252);
            this.Controls.Add(this.lbAttachId);
            this.Controls.Add(this.txtFile);
            this.Controls.Add(this.btnUpdate);
            this.Controls.Add(this.btnUpload);
            this.Controls.Add(this.pswd);
            this.Controls.Add(this.txtUser);
            this.Controls.Add(this.txtRegistry);
            this.Controls.Add(this.btnExport);
            this.Controls.Add(this.txtUrl);
            this.Controls.Add(this.label4);
            this.Controls.Add(this.label3);
            this.Controls.Add(this.btnLogin);
            this.Margin = new System.Windows.Forms.Padding(4, 4, 4, 4);
            this.Name = "XvForm";
            this.Text = "Form1";
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.TextBox pswd;
        private System.Windows.Forms.TextBox txtUser;
        private System.Windows.Forms.TextBox txtRegistry;
        private System.Windows.Forms.Button btnExport;
        private System.Windows.Forms.TextBox txtUrl;
        private System.Windows.Forms.Label label4;
        private System.Windows.Forms.Label label3;
        private System.Windows.Forms.Button btnLogin;
        private System.Windows.Forms.Button btnUpdate;
        private System.Windows.Forms.Button btnUpload;
        private System.Windows.Forms.TextBox txtFile;
        private System.Windows.Forms.Label lbAttachId;
    }
}

