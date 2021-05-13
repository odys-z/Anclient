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
            this.btnExpt = new System.Windows.Forms.Button();
            this.textBox1 = new System.Windows.Forms.TextBox();
            this.SuspendLayout();
            // 
            // pswd
            // 
            this.pswd.Location = new System.Drawing.Point(152, 32);
            this.pswd.Margin = new System.Windows.Forms.Padding(2);
            this.pswd.Name = "pswd";
            this.pswd.PasswordChar = '*';
            this.pswd.Size = new System.Drawing.Size(140, 21);
            this.pswd.TabIndex = 13;
            this.pswd.Text = "123456";
            // 
            // txtUser
            // 
            this.txtUser.Location = new System.Drawing.Point(65, 32);
            this.txtUser.Margin = new System.Windows.Forms.Padding(2);
            this.txtUser.Name = "txtUser";
            this.txtUser.Size = new System.Drawing.Size(83, 21);
            this.txtUser.TabIndex = 12;
            this.txtUser.Text = "admin";
            // 
            // txtRegistry
            // 
            this.txtRegistry.Location = new System.Drawing.Point(296, 32);
            this.txtRegistry.Margin = new System.Windows.Forms.Padding(2);
            this.txtRegistry.Name = "txtRegistry";
            this.txtRegistry.ReadOnly = true;
            this.txtRegistry.Size = new System.Drawing.Size(129, 21);
            this.txtRegistry.TabIndex = 14;
            // 
            // btnExport
            // 
            this.btnExport.Location = new System.Drawing.Point(516, 30);
            this.btnExport.Name = "btnExport";
            this.btnExport.Size = new System.Drawing.Size(83, 23);
            this.btnExport.TabIndex = 16;
            this.btnExport.Text = "&Open File";
            this.btnExport.UseVisualStyleBackColor = true;
            this.btnExport.Click += new System.EventHandler(this.btnExport_Click);
            // 
            // txtUrl
            // 
            this.txtUrl.Location = new System.Drawing.Point(65, 3);
            this.txtUrl.Name = "txtUrl";
            this.txtUrl.Size = new System.Drawing.Size(429, 21);
            this.txtUrl.TabIndex = 9;
            this.txtUrl.Text = "http://192.168.0.201:8080/jserv-sample/";
            // 
            // label4
            // 
            this.label4.AutoSize = true;
            this.label4.Location = new System.Drawing.Point(7, 35);
            this.label4.Name = "label4";
            this.label4.Size = new System.Drawing.Size(53, 12);
            this.label4.TabIndex = 11;
            this.label4.Text = "Registry";
            // 
            // label3
            // 
            this.label3.AutoSize = true;
            this.label3.Location = new System.Drawing.Point(7, 6);
            this.label3.Name = "label3";
            this.label3.Size = new System.Drawing.Size(59, 12);
            this.label3.TabIndex = 8;
            this.label3.Text = "xv-server";
            // 
            // btnLogin
            // 
            this.btnLogin.Location = new System.Drawing.Point(430, 30);
            this.btnLogin.Name = "btnLogin";
            this.btnLogin.Size = new System.Drawing.Size(64, 23);
            this.btnLogin.TabIndex = 10;
            this.btnLogin.Text = "&connect";
            this.btnLogin.UseVisualStyleBackColor = true;
            this.btnLogin.Click += new System.EventHandler(this.btnLogin_Click);
            // 
            // btnUpdate
            // 
            this.btnUpdate.Location = new System.Drawing.Point(317, 163);
            this.btnUpdate.Name = "btnUpdate";
            this.btnUpdate.Size = new System.Drawing.Size(75, 23);
            this.btnUpdate.TabIndex = 17;
            this.btnUpdate.Text = "Up&date";
            this.btnUpdate.UseVisualStyleBackColor = true;
            // 
            // btnExpt
            // 
            this.btnExpt.Location = new System.Drawing.Point(190, 163);
            this.btnExpt.Name = "btnExpt";
            this.btnExpt.Size = new System.Drawing.Size(75, 23);
            this.btnExpt.TabIndex = 18;
            this.btnExpt.Text = "&Upload";
            this.btnExpt.UseVisualStyleBackColor = true;
            // 
            // textBox1
            // 
            this.textBox1.Location = new System.Drawing.Point(65, 80);
            this.textBox1.Name = "textBox1";
            this.textBox1.Size = new System.Drawing.Size(429, 21);
            this.textBox1.TabIndex = 19;
            // 
            // XvForm
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 12F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(600, 202);
            this.Controls.Add(this.textBox1);
            this.Controls.Add(this.btnUpdate);
            this.Controls.Add(this.btnExpt);
            this.Controls.Add(this.pswd);
            this.Controls.Add(this.txtUser);
            this.Controls.Add(this.txtRegistry);
            this.Controls.Add(this.btnExport);
            this.Controls.Add(this.txtUrl);
            this.Controls.Add(this.label4);
            this.Controls.Add(this.label3);
            this.Controls.Add(this.btnLogin);
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
        private System.Windows.Forms.Button btnExpt;
        private System.Windows.Forms.TextBox textBox1;
    }
}

