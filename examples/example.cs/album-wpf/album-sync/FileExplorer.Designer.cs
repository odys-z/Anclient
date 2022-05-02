namespace album_sync
{
    partial class FileExplorer
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

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            this.components = new System.ComponentModel.Container();
            System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(FileExplorer));
            this.treeListView = new BrightIdeasSoftware.TreeListView();
            this.colName = ((BrightIdeasSoftware.OLVColumn)(new BrightIdeasSoftware.OLVColumn()));
            this.colCreateTime = ((BrightIdeasSoftware.OLVColumn)(new BrightIdeasSoftware.OLVColumn()));
            this.colSize = ((BrightIdeasSoftware.OLVColumn)(new BrightIdeasSoftware.OLVColumn()));
            this.colType = ((BrightIdeasSoftware.OLVColumn)(new BrightIdeasSoftware.OLVColumn()));
            this.colAttrs = ((BrightIdeasSoftware.OLVColumn)(new BrightIdeasSoftware.OLVColumn()));
            this.lbClientPath = new System.Windows.Forms.Label();
            this.splitContainer1 = new System.Windows.Forms.SplitContainer();
            this.imgbox = new Cyotek.Windows.Forms.ImageBox();
            this.btUpload = new System.Windows.Forms.Button();
            this.imgUpload = new System.Windows.Forms.ImageList(this.components);
            this.folderContents = new ImageControls.ImageAccordion();
            ((System.ComponentModel.ISupportInitialize)(this.treeListView)).BeginInit();
            ((System.ComponentModel.ISupportInitialize)(this.splitContainer1)).BeginInit();
            this.splitContainer1.Panel1.SuspendLayout();
            this.splitContainer1.Panel2.SuspendLayout();
            this.splitContainer1.SuspendLayout();
            this.SuspendLayout();
            // 
            // treeListView
            // 
            this.treeListView.AllColumns.Add(this.colName);
            this.treeListView.AllColumns.Add(this.colCreateTime);
            this.treeListView.AllColumns.Add(this.colSize);
            this.treeListView.AllColumns.Add(this.colType);
            this.treeListView.AllColumns.Add(this.colAttrs);
            this.treeListView.Anchor = ((System.Windows.Forms.AnchorStyles)(((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom) 
            | System.Windows.Forms.AnchorStyles.Left)));
            this.treeListView.BackColor = System.Drawing.Color.OldLace;
            this.treeListView.Columns.AddRange(new System.Windows.Forms.ColumnHeader[] {
            this.colName,
            this.colCreateTime,
            this.colSize,
            this.colType,
            this.colAttrs});
            this.treeListView.Font = new System.Drawing.Font("SimSun", 10.8F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(134)));
            this.treeListView.HideSelection = false;
            this.treeListView.Location = new System.Drawing.Point(0, 0);
            this.treeListView.Name = "treeListView";
            this.treeListView.OwnerDraw = true;
            this.treeListView.ShowGroups = false;
            this.treeListView.Size = new System.Drawing.Size(575, 714);
            this.treeListView.TabIndex = 0;
            this.treeListView.UseCompatibleStateImageBehavior = false;
            this.treeListView.View = System.Windows.Forms.View.Details;
            this.treeListView.VirtualMode = true;
            this.treeListView.SelectedIndexChanged += new System.EventHandler(this.toBrowse);
            // 
            // colName
            // 
            this.colName.AspectName = "Name";
            this.colName.IsEditable = false;
            this.colName.Text = "Folder";
            this.colName.UseInitialLetterForGroup = true;
            this.colName.Width = 210;
            this.colName.WordWrap = true;
            // 
            // colCreateTime
            // 
            this.colCreateTime.AspectName = "CreationTime";
            this.colCreateTime.IsEditable = false;
            this.colCreateTime.Text = "Created";
            this.colCreateTime.Width = 97;
            // 
            // colSize
            // 
            this.colSize.AspectName = "Extension";
            this.colSize.HeaderTextAlign = System.Windows.Forms.HorizontalAlignment.Right;
            this.colSize.IsEditable = false;
            this.colSize.Text = "Size";
            this.colSize.TextAlign = System.Windows.Forms.HorizontalAlignment.Right;
            this.colSize.Width = 80;
            // 
            // colType
            // 
            this.colType.IsEditable = false;
            this.colType.Text = "Type";
            this.colType.Width = 70;
            // 
            // colAttrs
            // 
            this.colAttrs.IsEditable = false;
            this.colAttrs.Text = "Album";
            this.colAttrs.Width = 105;
            // 
            // lbClientPath
            // 
            this.lbClientPath.AutoSize = true;
            this.lbClientPath.Location = new System.Drawing.Point(3, 7);
            this.lbClientPath.Name = "lbClientPath";
            this.lbClientPath.Size = new System.Drawing.Size(31, 15);
            this.lbClientPath.TabIndex = 4;
            this.lbClientPath.Text = "...";
            // 
            // splitContainer1
            // 
            this.splitContainer1.Anchor = ((System.Windows.Forms.AnchorStyles)((((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom) 
            | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.splitContainer1.Location = new System.Drawing.Point(581, 0);
            this.splitContainer1.Name = "splitContainer1";
            this.splitContainer1.Orientation = System.Windows.Forms.Orientation.Horizontal;
            // 
            // splitContainer1.Panel1
            // 
            this.splitContainer1.Panel1.Controls.Add(this.imgbox);
            this.splitContainer1.Panel1.Controls.Add(this.lbClientPath);
            // 
            // splitContainer1.Panel2
            // 
            this.splitContainer1.Panel2.Controls.Add(this.btUpload);
            this.splitContainer1.Panel2.Controls.Add(this.folderContents);
            this.splitContainer1.Size = new System.Drawing.Size(762, 714);
            this.splitContainer1.SplitterDistance = 335;
            this.splitContainer1.TabIndex = 6;
            // 
            // imgbox
            // 
            this.imgbox.Anchor = ((System.Windows.Forms.AnchorStyles)((((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom) 
            | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.imgbox.AutoSize = false;
            this.imgbox.Location = new System.Drawing.Point(3, 27);
            this.imgbox.Name = "imgbox";
            this.imgbox.Size = new System.Drawing.Size(759, 304);
            this.imgbox.TabIndex = 0;
            // 
            // btUpload
            // 
            this.btUpload.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Right)));
            this.btUpload.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.btUpload.ImageList = this.imgUpload;
            this.btUpload.Location = new System.Drawing.Point(623, 340);
            this.btUpload.Name = "btUpload";
            this.btUpload.Size = new System.Drawing.Size(128, 32);
            this.btUpload.TabIndex = 2;
            this.btUpload.Text = "Upload";
            this.btUpload.UseVisualStyleBackColor = true;
            this.btUpload.MouseLeave += new System.EventHandler(this.btUpload_Leave);
            this.btUpload.MouseHover += new System.EventHandler(this.btUpload_Hover);
            this.btUpload.MouseUp += new System.Windows.Forms.MouseEventHandler(this.toUpload);
            // 
            // imgUpload
            // 
            this.imgUpload.ImageStream = ((System.Windows.Forms.ImageListStreamer)(resources.GetObject("imgUpload.ImageStream")));
            this.imgUpload.TransparentColor = System.Drawing.Color.Transparent;
            this.imgUpload.Images.SetKeyName(0, "up1.bmp");
            this.imgUpload.Images.SetKeyName(1, "up2.bmp");
            // 
            // folderContents
            // 
            this.folderContents.Anchor = ((System.Windows.Forms.AnchorStyles)((((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom) 
            | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.folderContents.BackColor = System.Drawing.Color.OldLace;
            this.folderContents.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle;
            this.folderContents.HoverColor = System.Drawing.Color.Purple;
            this.folderContents.Location = new System.Drawing.Point(0, -2);
            this.folderContents.Name = "folderContents";
            this.folderContents.SelectedColor = System.Drawing.Color.DarkBlue;
            this.folderContents.Size = new System.Drawing.Size(762, 339);
            this.folderContents.TabIndex = 1;
            this.folderContents.ThumbnailChanged += new ImageControls.ImageAccordion.ThumbnailChangedDelegate(this.toChangeImg);
            // 
            // FileExplorer
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(8F, 15F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.BackColor = System.Drawing.Color.Cornsilk;
            this.ClientSize = new System.Drawing.Size(1344, 713);
            this.Controls.Add(this.splitContainer1);
            this.Controls.Add(this.treeListView);
            this.Icon = ((System.Drawing.Icon)(resources.GetObject("$this.Icon")));
            this.Name = "FileExplorer";
            this.Text = "Album Synchronizer";
            ((System.ComponentModel.ISupportInitialize)(this.treeListView)).EndInit();
            this.splitContainer1.Panel1.ResumeLayout(false);
            this.splitContainer1.Panel1.PerformLayout();
            this.splitContainer1.Panel2.ResumeLayout(false);
            ((System.ComponentModel.ISupportInitialize)(this.splitContainer1)).EndInit();
            this.splitContainer1.ResumeLayout(false);
            this.ResumeLayout(false);

        }

        #endregion

        private BrightIdeasSoftware.TreeListView treeListView;
        private BrightIdeasSoftware.OLVColumn colName;
        private BrightIdeasSoftware.OLVColumn colCreateTime;
        private BrightIdeasSoftware.OLVColumn colSize;
        private BrightIdeasSoftware.OLVColumn colType;
        private BrightIdeasSoftware.OLVColumn colAttrs;
        private ImageControls.ImageAccordion folderContents;
        private System.Windows.Forms.Label lbClientPath;
        private System.Windows.Forms.SplitContainer splitContainer1;
        private Cyotek.Windows.Forms.ImageBox imgbox;
        private System.Windows.Forms.Button btUpload;
        private System.Windows.Forms.ImageList imgUpload;
    }
}