namespace ImageControls
{
  
        partial class ThumbnailBox
        {
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

            #region Component Designer generated code

            /// <summary> 
            /// Required method for Designer support - do not modify 
            /// the contents of this method with the code editor.
            /// </summary>
            private void InitializeComponent()
            {
            System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(ThumbnailBox));
            this.OuterPanel = new System.Windows.Forms.Panel();
            this.ThumbPictureBox = new System.Windows.Forms.PictureBox();
            this.labelPanel = new System.Windows.Forms.Panel();
            this.checkbox = new System.Windows.Forms.CheckBox();
            this.albumIcon = new System.Windows.Forms.PictureBox();
            this.thumbLabel = new System.Windows.Forms.Label();
            this.OuterPanel.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)(this.ThumbPictureBox)).BeginInit();
            this.labelPanel.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)(this.albumIcon)).BeginInit();
            this.SuspendLayout();
            // 
            // OuterPanel
            // 
            this.OuterPanel.Controls.Add(this.ThumbPictureBox);
            this.OuterPanel.Controls.Add(this.labelPanel);
            this.OuterPanel.Location = new System.Drawing.Point(21, 18);
            this.OuterPanel.Margin = new System.Windows.Forms.Padding(4, 3, 4, 3);
            this.OuterPanel.Name = "OuterPanel";
            this.OuterPanel.Size = new System.Drawing.Size(339, 160);
            this.OuterPanel.TabIndex = 3;
            // 
            // ThumbPictureBox
            // 
            this.ThumbPictureBox.BackgroundImageLayout = System.Windows.Forms.ImageLayout.Stretch;
            this.ThumbPictureBox.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle;
            this.ThumbPictureBox.Dock = System.Windows.Forms.DockStyle.Fill;
            this.ThumbPictureBox.Location = new System.Drawing.Point(0, 25);
            this.ThumbPictureBox.Margin = new System.Windows.Forms.Padding(4, 3, 4, 3);
            this.ThumbPictureBox.Name = "ThumbPictureBox";
            this.ThumbPictureBox.Size = new System.Drawing.Size(339, 135);
            this.ThumbPictureBox.TabIndex = 2;
            this.ThumbPictureBox.TabStop = false;
            this.ThumbPictureBox.Click += new System.EventHandler(this.onClick);
            this.ThumbPictureBox.MouseEnter += new System.EventHandler(this.ThumbnailBox_MouseEnter);
            this.ThumbPictureBox.MouseLeave += new System.EventHandler(this.ThumbnailBox_MouseLeave);
            // 
            // labelPanel
            // 
            this.labelPanel.Controls.Add(this.checkbox);
            this.labelPanel.Controls.Add(this.albumIcon);
            this.labelPanel.Controls.Add(this.thumbLabel);
            this.labelPanel.Dock = System.Windows.Forms.DockStyle.Top;
            this.labelPanel.Location = new System.Drawing.Point(0, 0);
            this.labelPanel.Margin = new System.Windows.Forms.Padding(4, 3, 4, 3);
            this.labelPanel.Name = "labelPanel";
            this.labelPanel.Size = new System.Drawing.Size(339, 25);
            this.labelPanel.TabIndex = 3;
            this.labelPanel.MouseEnter += new System.EventHandler(this.ThumbnailBox_MouseEnter);
            this.labelPanel.MouseLeave += new System.EventHandler(this.ThumbnailBox_MouseLeave);
            // 
            // checkbox
            // 
            this.checkbox.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Right)));
            this.checkbox.AutoSize = true;
            this.checkbox.Font = new System.Drawing.Font("SimSun", 10.8F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.checkbox.Location = new System.Drawing.Point(320, 3);
            this.checkbox.Name = "checkbox";
            this.checkbox.Size = new System.Drawing.Size(18, 17);
            this.checkbox.TabIndex = 3;
            this.checkbox.UseVisualStyleBackColor = true;
            // 
            // albumIcon
            // 
            this.albumIcon.Image = ((System.Drawing.Image)(resources.GetObject("albumIcon.Image")));
            this.albumIcon.InitialImage = null;
            this.albumIcon.Location = new System.Drawing.Point(3, 3);
            this.albumIcon.Name = "albumIcon";
            this.albumIcon.Size = new System.Drawing.Size(24, 21);
            this.albumIcon.SizeMode = System.Windows.Forms.PictureBoxSizeMode.Zoom;
            this.albumIcon.TabIndex = 2;
            this.albumIcon.TabStop = false;
            // 
            // thumbLabel
            // 
            this.thumbLabel.AutoSize = true;
            this.thumbLabel.Location = new System.Drawing.Point(34, 7);
            this.thumbLabel.Margin = new System.Windows.Forms.Padding(4, 0, 4, 0);
            this.thumbLabel.Name = "thumbLabel";
            this.thumbLabel.Size = new System.Drawing.Size(55, 15);
            this.thumbLabel.TabIndex = 1;
            this.thumbLabel.Text = "label1";
            this.thumbLabel.TextAlign = System.Drawing.ContentAlignment.MiddleCenter;
            this.thumbLabel.MouseEnter += new System.EventHandler(this.ThumbnailBox_MouseEnter);
            this.thumbLabel.MouseLeave += new System.EventHandler(this.ThumbnailBox_MouseLeave);
            // 
            // ThumbnailBox
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(8F, 15F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.BackColor = System.Drawing.Color.Silver;
            this.Controls.Add(this.OuterPanel);
            this.Cursor = System.Windows.Forms.Cursors.Hand;
            this.Margin = new System.Windows.Forms.Padding(4, 3, 4, 3);
            this.Name = "ThumbnailBox";
            this.Size = new System.Drawing.Size(373, 190);
            this.MouseEnter += new System.EventHandler(this.ThumbnailBox_MouseEnter);
            this.MouseLeave += new System.EventHandler(this.ThumbnailBox_MouseLeave);
            this.OuterPanel.ResumeLayout(false);
            ((System.ComponentModel.ISupportInitialize)(this.ThumbPictureBox)).EndInit();
            this.labelPanel.ResumeLayout(false);
            this.labelPanel.PerformLayout();
            ((System.ComponentModel.ISupportInitialize)(this.albumIcon)).EndInit();
            this.ResumeLayout(false);

            }

            #endregion

            private System.Windows.Forms.Panel OuterPanel;
            private System.Windows.Forms.PictureBox ThumbPictureBox;
            private System.Windows.Forms.Panel labelPanel;
            private System.Windows.Forms.Label thumbLabel;
        private System.Windows.Forms.CheckBox checkbox;
        private System.Windows.Forms.PictureBox albumIcon;
    }
    
}
