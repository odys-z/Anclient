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
            this.label1 = new System.Windows.Forms.Label();
            this.btnExpt = new System.Windows.Forms.Button();
            this.txtConn = new System.Windows.Forms.TextBox();
            this.btnConn = new System.Windows.Forms.Button();
            this.label3 = new System.Windows.Forms.Label();
            this.servUrl = new System.Windows.Forms.TextBox();
            this.label5 = new System.Windows.Forms.Label();
            this.btnGltf = new System.Windows.Forms.Button();
            this.button1 = new System.Windows.Forms.Button();
            this.dataGridView1 = new System.Windows.Forms.DataGridView();
            this.node = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.opaque = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.visible = new System.Windows.Forms.DataGridViewCheckBoxColumn();
            ((System.ComponentModel.ISupportInitialize)(this.dataGridView1)).BeginInit();
            this.SuspendLayout();
            // 
            // label1
            // 
            this.label1.AutoSize = true;
            this.label1.Font = new System.Drawing.Font("SimSun", 12F, System.Drawing.FontStyle.Bold);
            this.label1.Location = new System.Drawing.Point(267, 9);
            this.label1.Margin = new System.Windows.Forms.Padding(4, 0, 4, 0);
            this.label1.Name = "label1";
            this.label1.Size = new System.Drawing.Size(229, 20);
            this.label1.TabIndex = 0;
            this.label1.Text = "GLTF Export Settings";
            // 
            // btnExpt
            // 
            this.btnExpt.Location = new System.Drawing.Point(271, 649);
            this.btnExpt.Margin = new System.Windows.Forms.Padding(4);
            this.btnExpt.Name = "btnExpt";
            this.btnExpt.Size = new System.Drawing.Size(100, 29);
            this.btnExpt.TabIndex = 2;
            this.btnExpt.Text = "&Upload";
            this.btnExpt.UseVisualStyleBackColor = true;
            this.btnExpt.Click += new System.EventHandler(this.btnExpt_Click);
            // 
            // txtConn
            // 
            this.txtConn.Location = new System.Drawing.Point(4, 68);
            this.txtConn.Margin = new System.Windows.Forms.Padding(4);
            this.txtConn.Multiline = true;
            this.txtConn.Name = "txtConn";
            this.txtConn.Size = new System.Drawing.Size(787, 58);
            this.txtConn.TabIndex = 6;
            // 
            // btnConn
            // 
            this.btnConn.Location = new System.Drawing.Point(691, 37);
            this.btnConn.Margin = new System.Windows.Forms.Padding(4);
            this.btnConn.Name = "btnConn";
            this.btnConn.Size = new System.Drawing.Size(100, 29);
            this.btnConn.TabIndex = 7;
            this.btnConn.Text = "&connect";
            this.btnConn.UseVisualStyleBackColor = true;
            this.btnConn.Click += new System.EventHandler(this.btnConn_ClickAsync);
            // 
            // label3
            // 
            this.label3.AutoSize = true;
            this.label3.Location = new System.Drawing.Point(4, 44);
            this.label3.Margin = new System.Windows.Forms.Padding(4, 0, 4, 0);
            this.label3.Name = "label3";
            this.label3.Size = new System.Drawing.Size(71, 15);
            this.label3.TabIndex = 9;
            this.label3.Text = "Serv-URL";
            // 
            // servUrl
            // 
            this.servUrl.Location = new System.Drawing.Point(82, 40);
            this.servUrl.Margin = new System.Windows.Forms.Padding(4);
            this.servUrl.Name = "servUrl";
            this.servUrl.Size = new System.Drawing.Size(601, 25);
            this.servUrl.TabIndex = 10;
            this.servUrl.Text = "http://192.168.0.201:8080/jserv-sample/login.serv11";
            // 
            // label5
            // 
            this.label5.AutoSize = true;
            this.label5.Location = new System.Drawing.Point(7, 135);
            this.label5.Margin = new System.Windows.Forms.Padding(4, 0, 4, 0);
            this.label5.Name = "label5";
            this.label5.Size = new System.Drawing.Size(127, 15);
            this.label5.TabIndex = 9;
            this.label5.Text = "selected object";
            // 
            // btnGltf
            // 
            this.btnGltf.Location = new System.Drawing.Point(142, 129);
            this.btnGltf.Margin = new System.Windows.Forms.Padding(4);
            this.btnGltf.Name = "btnGltf";
            this.btnGltf.Size = new System.Drawing.Size(135, 29);
            this.btnGltf.TabIndex = 11;
            this.btnGltf.Text = "&GLTF Preview";
            this.btnGltf.UseVisualStyleBackColor = true;
            this.btnGltf.Click += new System.EventHandler(this.btnSelected_Click);
            // 
            // button1
            // 
            this.button1.Location = new System.Drawing.Point(445, 649);
            this.button1.Margin = new System.Windows.Forms.Padding(4);
            this.button1.Name = "button1";
            this.button1.Size = new System.Drawing.Size(100, 29);
            this.button1.TabIndex = 2;
            this.button1.Text = "Up&date";
            this.button1.UseVisualStyleBackColor = true;
            this.button1.Click += new System.EventHandler(this.btnExpt_Click);
            // 
            // dataGridView1
            // 
            this.dataGridView1.AllowUserToAddRows = false;
            this.dataGridView1.AllowUserToDeleteRows = false;
            this.dataGridView1.ColumnHeadersHeightSizeMode = System.Windows.Forms.DataGridViewColumnHeadersHeightSizeMode.AutoSize;
            this.dataGridView1.Columns.AddRange(new System.Windows.Forms.DataGridViewColumn[] {
            this.node,
            this.opaque,
            this.visible});
            this.dataGridView1.Location = new System.Drawing.Point(4, 165);
            this.dataGridView1.Name = "dataGridView1";
            this.dataGridView1.RowHeadersWidth = 51;
            this.dataGridView1.RowTemplate.Height = 27;
            this.dataGridView1.Size = new System.Drawing.Size(787, 477);
            this.dataGridView1.TabIndex = 12;
            this.dataGridView1.CellContentClick += new System.Windows.Forms.DataGridViewCellEventHandler(this.dataGridView1_CellContentClick);
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
            // XvForm
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(8F, 15F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(794, 691);
            this.Controls.Add(this.dataGridView1);
            this.Controls.Add(this.btnGltf);
            this.Controls.Add(this.servUrl);
            this.Controls.Add(this.label5);
            this.Controls.Add(this.label3);
            this.Controls.Add(this.btnConn);
            this.Controls.Add(this.txtConn);
            this.Controls.Add(this.button1);
            this.Controls.Add(this.btnExpt);
            this.Controls.Add(this.label1);
            this.Icon = ((System.Drawing.Icon)(resources.GetObject("$this.Icon")));
            this.Margin = new System.Windows.Forms.Padding(4);
            this.Name = "XvForm";
            this.Text = "Device Settings";
            ((System.ComponentModel.ISupportInitialize)(this.dataGridView1)).EndInit();
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.Label label1;
        private System.Windows.Forms.Button btnExpt;
        private System.Windows.Forms.TextBox txtConn;
        private System.Windows.Forms.Button btnConn;
        private System.Windows.Forms.Label label3;
        private System.Windows.Forms.TextBox servUrl;
        private System.Windows.Forms.Label label5;
        private System.Windows.Forms.Button btnGltf;
        private System.Windows.Forms.Button button1;
        private System.Windows.Forms.DataGridView dataGridView1;
        private System.Windows.Forms.DataGridViewTextBoxColumn node;
        private System.Windows.Forms.DataGridViewTextBoxColumn opaque;
        private System.Windows.Forms.DataGridViewCheckBoxColumn visible;
    }
}