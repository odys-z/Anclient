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
            this.folderContents = new ImageControls.ImageAccordion();
            this.imageSliderBox1 = new ImageControls.ImageSilder.ImageSliderBox();
            ((System.ComponentModel.ISupportInitialize)(this.treeListView)).BeginInit();
            this.SuspendLayout();
            // 
            // treeListView
            // 
            this.treeListView.AllColumns.Add(this.colName);
            this.treeListView.AllColumns.Add(this.colCreateTime);
            this.treeListView.AllColumns.Add(this.colSize);
            this.treeListView.AllColumns.Add(this.colType);
            this.treeListView.AllColumns.Add(this.colAttrs);
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
            this.colName.Width = 110;
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
            this.colType.Text = "File Type";
            this.colType.Width = 140;
            // 
            // colAttrs
            // 
            this.colAttrs.IsEditable = false;
            this.colAttrs.Text = "Album";
            this.colAttrs.Width = 105;
            // 
            // folderContents
            // 
            this.folderContents.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle;
            this.folderContents.HoverColor = System.Drawing.Color.Purple;
            this.folderContents.Location = new System.Drawing.Point(581, 156);
            this.folderContents.Name = "folderContents";
            this.folderContents.SelectedColor = System.Drawing.Color.DarkBlue;
            this.folderContents.Size = new System.Drawing.Size(598, 558);
            this.folderContents.TabIndex = 1;
            // 
            // imageSliderBox1
            // 
            this.imageSliderBox1.AutoStart = false;
            this.imageSliderBox1.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle;
            this.imageSliderBox1.Location = new System.Drawing.Point(581, 0);
            this.imageSliderBox1.Loop = false;
            this.imageSliderBox1.Name = "imageSliderBox1";
            this.imageSliderBox1.Size = new System.Drawing.Size(598, 150);
            this.imageSliderBox1.TabIndex = 2;
            this.imageSliderBox1.TabStop = false;
            // 
            // FileExplorer
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(8F, 15F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.BackColor = System.Drawing.Color.Bisque;
            this.ClientSize = new System.Drawing.Size(1182, 713);
            this.Controls.Add(this.imageSliderBox1);
            this.Controls.Add(this.folderContents);
            this.Controls.Add(this.treeListView);
            this.Icon = ((System.Drawing.Icon)(resources.GetObject("$this.Icon")));
            this.Name = "FileExplorer";
            this.Text = "Album Synchronizer";
            ((System.ComponentModel.ISupportInitialize)(this.treeListView)).EndInit();
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
        private ImageControls.ImageSilder.ImageSliderBox imageSliderBox1;
    }
}