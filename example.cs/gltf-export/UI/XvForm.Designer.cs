namespace io.odysz.anclient.example.revit {
    partial class XvForm {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing) {
            if (disposing && (components != null)) {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent() {
            System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(XvForm));
            this.btnExpt = new System.Windows.Forms.Button();
            this.txtJson = new System.Windows.Forms.TextBox();
            this.btnLogin = new System.Windows.Forms.Button();
            this.label3 = new System.Windows.Forms.Label();
            this.txtUrl = new System.Windows.Forms.TextBox();
            this.btnExport = new System.Windows.Forms.Button();
            this.btnUpdate = new System.Windows.Forms.Button();
            this.grdNodes = new System.Windows.Forms.DataGridView();
            this.node = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.opaque = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.visible = new System.Windows.Forms.DataGridViewCheckBoxColumn();
            this.label4 = new System.Windows.Forms.Label();
            this.txtRegistry = new System.Windows.Forms.TextBox();
            this.txtUser = new System.Windows.Forms.TextBox();
            this.pswd = new System.Windows.Forms.TextBox();
            this.button1 = new System.Windows.Forms.Button();
            ((System.ComponentModel.ISupportInitialize)(this.grdNodes)).BeginInit();
            this.SuspendLayout();
            // 
            // btnExpt
            // 
            this.btnExpt.Location = new System.Drawing.Point(271, 654);
            this.btnExpt.Margin = new System.Windows.Forms.Padding(4);
            this.btnExpt.Name = "btnExpt";
            this.btnExpt.Size = new System.Drawing.Size(100, 29);
            this.btnExpt.TabIndex = 11;
            this.btnExpt.Text = "&Upload";
            this.btnExpt.UseVisualStyleBackColor = true;
            this.btnExpt.Click += new System.EventHandler(this.btnExpt_Click);
            // 
            // txtJson
            // 
            this.txtJson.Location = new System.Drawing.Point(4, 87);
            this.txtJson.Margin = new System.Windows.Forms.Padding(4);
            this.txtJson.Multiline = true;
            this.txtJson.Name = "txtJson";
            this.txtJson.Size = new System.Drawing.Size(787, 400);
            this.txtJson.TabIndex = 9;
            // 
            // btnLogin
            // 
            this.btnLogin.Location = new System.Drawing.Point(564, 50);
            this.btnLogin.Margin = new System.Windows.Forms.Padding(4);
            this.btnLogin.Name = "btnLogin";
            this.btnLogin.Size = new System.Drawing.Size(86, 29);
            this.btnLogin.TabIndex = 2;
            this.btnLogin.Text = "&connect";
            this.btnLogin.UseVisualStyleBackColor = true;
            this.btnLogin.Click += new System.EventHandler(this.onLogin);
            // 
            // label3
            // 
            this.label3.AutoSize = true;
            this.label3.Location = new System.Drawing.Point(1, 21);
            this.label3.Margin = new System.Windows.Forms.Padding(4, 0, 4, 0);
            this.label3.Name = "label3";
            this.label3.Size = new System.Drawing.Size(79, 15);
            this.label3.TabIndex = 0;
            this.label3.Text = "xv-server";
            // 
            // txtUrl
            // 
            this.txtUrl.Location = new System.Drawing.Point(79, 17);
            this.txtUrl.Margin = new System.Windows.Forms.Padding(4);
            this.txtUrl.Name = "txtUrl";
            this.txtUrl.Size = new System.Drawing.Size(571, 25);
            this.txtUrl.TabIndex = 1;
            this.txtUrl.Text = "http://192.168.0.201:8080/jserv-sample/";
            // 
            // btnExport
            // 
            this.btnExport.Location = new System.Drawing.Point(680, 51);
            this.btnExport.Margin = new System.Windows.Forms.Padding(4);
            this.btnExport.Name = "btnExport";
            this.btnExport.Size = new System.Drawing.Size(111, 29);
            this.btnExport.TabIndex = 7;
            this.btnExport.Text = "E&xport GLTF";
            this.btnExport.UseVisualStyleBackColor = true;
            this.btnExport.Click += new System.EventHandler(this.onExportClick);
            // 
            // btnUpdate
            // 
            this.btnUpdate.Location = new System.Drawing.Point(440, 654);
            this.btnUpdate.Margin = new System.Windows.Forms.Padding(4);
            this.btnUpdate.Name = "btnUpdate";
            this.btnUpdate.Size = new System.Drawing.Size(100, 29);
            this.btnUpdate.TabIndex = 0;
            this.btnUpdate.Text = "Up&date";
            this.btnUpdate.UseVisualStyleBackColor = true;
            this.btnUpdate.Click += new System.EventHandler(this.btnExpt_Click);
            // 
            // grdNodes
            // 
            this.grdNodes.AllowUserToAddRows = false;
            this.grdNodes.AllowUserToDeleteRows = false;
            this.grdNodes.ColumnHeadersHeightSizeMode = System.Windows.Forms.DataGridViewColumnHeadersHeightSizeMode.AutoSize;
            this.grdNodes.Columns.AddRange(new System.Windows.Forms.DataGridViewColumn[] {
            this.node,
            this.opaque,
            this.visible});
            this.grdNodes.Location = new System.Drawing.Point(4, 494);
            this.grdNodes.Name = "grdNodes";
            this.grdNodes.RowHeadersWidth = 51;
            this.grdNodes.RowTemplate.Height = 27;
            this.grdNodes.Size = new System.Drawing.Size(787, 153);
            this.grdNodes.TabIndex = 10;
            // 
            // node
            // 
            this.node.DataPropertyName = "id";
            this.node.HeaderText = "Node";
            this.node.MinimumWidth = 6;
            this.node.Name = "node";
            this.node.ReadOnly = true;
            this.node.Width = 492;
            // 
            // opaque
            // 
            this.opaque.HeaderText = "Transparent";
            this.opaque.MinimumWidth = 6;
            this.opaque.Name = "opaque";
            this.opaque.Width = 140;
            // 
            // visible
            // 
            this.visible.HeaderText = "Visible";
            this.visible.MinimumWidth = 6;
            this.visible.Name = "visible";
            this.visible.Resizable = System.Windows.Forms.DataGridViewTriState.True;
            this.visible.SortMode = System.Windows.Forms.DataGridViewColumnSortMode.Automatic;
            this.visible.Width = 80;
            // 
            // label4
            // 
            this.label4.AutoSize = true;
            this.label4.Location = new System.Drawing.Point(1, 57);
            this.label4.Margin = new System.Windows.Forms.Padding(4, 0, 4, 0);
            this.label4.Name = "label4";
            this.label4.Size = new System.Drawing.Size(71, 15);
            this.label4.TabIndex = 3;
            this.label4.Text = "Registry";
            // 
            // txtRegistry
            // 
            this.txtRegistry.Location = new System.Drawing.Point(386, 54);
            this.txtRegistry.Name = "txtRegistry";
            this.txtRegistry.ReadOnly = true;
            this.txtRegistry.Size = new System.Drawing.Size(171, 25);
            this.txtRegistry.TabIndex = 6;
            // 
            // txtUser
            // 
            this.txtUser.Location = new System.Drawing.Point(79, 54);
            this.txtUser.Name = "txtUser";
            this.txtUser.Size = new System.Drawing.Size(109, 25);
            this.txtUser.TabIndex = 4;
            this.txtUser.Text = "admin";
            // 
            // pswd
            // 
            this.pswd.Location = new System.Drawing.Point(194, 54);
            this.pswd.Name = "pswd";
            this.pswd.PasswordChar = '*';
            this.pswd.Size = new System.Drawing.Size(186, 25);
            this.pswd.TabIndex = 5;
            // 
            // button1
            // 
            this.button1.Location = new System.Drawing.Point(680, 17);
            this.button1.Margin = new System.Windows.Forms.Padding(4);
            this.button1.Name = "button1";
            this.button1.Size = new System.Drawing.Size(111, 29);
            this.button1.TabIndex = 7;
            this.button1.Text = "E&xport IFC";
            this.button1.UseVisualStyleBackColor = true;
            this.button1.Click += new System.EventHandler(this.onExportClick);
            // 
            // XvForm
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(8F, 15F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.BackColor = System.Drawing.SystemColors.ControlLight;
            this.ClientSize = new System.Drawing.Size(794, 696);
            this.Controls.Add(this.pswd);
            this.Controls.Add(this.txtUser);
            this.Controls.Add(this.txtRegistry);
            this.Controls.Add(this.grdNodes);
            this.Controls.Add(this.button1);
            this.Controls.Add(this.btnExport);
            this.Controls.Add(this.txtUrl);
            this.Controls.Add(this.label4);
            this.Controls.Add(this.label3);
            this.Controls.Add(this.btnLogin);
            this.Controls.Add(this.txtJson);
            this.Controls.Add(this.btnUpdate);
            this.Controls.Add(this.btnExpt);
            this.Icon = ((System.Drawing.Icon)(resources.GetObject("$this.Icon")));
            this.Margin = new System.Windows.Forms.Padding(4);
            this.Name = "XvForm";
            this.Text = "X-visual BIM Import";
            ((System.ComponentModel.ISupportInitialize)(this.grdNodes)).EndInit();
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion
        private System.Windows.Forms.Button btnExpt;
        private System.Windows.Forms.TextBox txtJson;
        private System.Windows.Forms.Button btnLogin;
        private System.Windows.Forms.Label label3;
        private System.Windows.Forms.TextBox txtUrl;
        private System.Windows.Forms.Button btnExport;
        private System.Windows.Forms.Button btnUpdate;
        private System.Windows.Forms.DataGridView grdNodes;
        private System.Windows.Forms.DataGridViewTextBoxColumn node;
        private System.Windows.Forms.DataGridViewTextBoxColumn opaque;
        private System.Windows.Forms.DataGridViewCheckBoxColumn visible;
        private System.Windows.Forms.Label label4;
        private System.Windows.Forms.TextBox txtRegistry;
        private System.Windows.Forms.TextBox txtUser;
        private System.Windows.Forms.TextBox pswd;
        private System.Windows.Forms.Button button1;
    }
}