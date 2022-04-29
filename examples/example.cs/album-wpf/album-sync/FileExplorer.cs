﻿using BrightIdeasSoftware;
using System;
using System.Collections;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace album_sync
{
    public partial class FileExplorer : Form
    {
        public FileExplorer()
        {
            InitializeComponent();
            InitializeTreeListExample();
        }

        void InitializeTreeListExample()
        {

            this.treeListView.HierarchicalCheckboxes = true;
            this.treeListView.HideSelection = false;
            this.treeListView.CanExpandGetter = delegate (object x) {
                return ((MyFileSystemInfo)x).IsDirectory;
            };
            this.treeListView.ChildrenGetter = delegate (object x) {
                MyFileSystemInfo myFileSystemInfo = (MyFileSystemInfo)x;
                try
                {
                    return myFileSystemInfo.GetFileSystemInfos();
                }
                catch (UnauthorizedAccessException ex)
                {
                    MessageBox.Show(this, ex.Message, "ObjectListViewDemo", MessageBoxButtons.OK, MessageBoxIcon.Exclamation);
                    return new ArrayList();
                }
            };

            // checkBox11.Checked = this.treeListView.HierarchicalCheckboxes;

            //this.treeListView.CheckBoxes = false;

            // You can change the way the connection lines are drawn by changing the pen
            TreeListView.TreeRenderer renderer = this.treeListView.TreeColumnRenderer;
            renderer.LinePen = new Pen(Color.Firebrick, 0.5f);
            renderer.LinePen.DashStyle = DashStyle.Dot;

            //-------------------------------------------------------------------
            // Eveything after this is the same as the Explorer example tab --
            // nothing specific to the TreeListView. It doesn't have the grouping
            // delegates, since TreeListViews can't show groups.

            // Draw the system icon next to the name
            SysImageListHelper helper = new SysImageListHelper(this.treeListView);
            this.colName.ImageGetter = delegate (object x) {
                return helper.GetImageIndex(((MyFileSystemInfo)x).FullName);
            };

            // Show the size of files as GB, MB and KBs. Also, group them by
            // some meaningless divisions
            this.colSize.AspectGetter = delegate (object x) {
                MyFileSystemInfo myFileSystemInfo = (MyFileSystemInfo)x;

                if (myFileSystemInfo.IsDirectory)
                    return (long)-1;

                try
                {
                    return myFileSystemInfo.Length;
                }
                catch (System.IO.FileNotFoundException)
                {
                    // Mono 1.2.6 throws this for hidden files
                    return (long)-2;
                }
            };
            this.colSize.AspectToStringConverter = delegate (object x) {
                if ((long)x == -1) // folder
                    return "";

                return FormatFileSize((long)x);
            };

            // Show the system description for this object
            this.colType.AspectGetter = delegate (object x) {
                return ShellUtilities.GetFileType(((MyFileSystemInfo)x).FullName);
            };

            // Show the file attributes for this object
            this.colAttrs.AspectGetter = delegate (object x) {
                return ((MyFileSystemInfo)x).Attributes;
            };
            FlagRenderer attributesRenderer = new FlagRenderer();
            attributesRenderer.Add(FileAttributes.Archive, "archive");
            attributesRenderer.Add(FileAttributes.ReadOnly, "readonly");
            attributesRenderer.Add(FileAttributes.System, "system");
            attributesRenderer.Add(FileAttributes.Hidden, "hidden");
            attributesRenderer.Add(FileAttributes.Temporary, "temporary");
            this.colAttrs.Renderer = attributesRenderer;
            this.colAttrs.ClusteringStrategy = new FlagClusteringStrategy(typeof(FileAttributes));

            // List all drives as the roots of the tree
            ArrayList roots = new ArrayList();
            foreach (DriveInfo di in DriveInfo.GetDrives())
            {
                if (di.IsReady)
                {
                    roots.Add(new MyFileSystemInfo(new DirectoryInfo(di.Name)));
                    break;
                }
            }
            this.treeListView.Roots = roots;

        }

        static string FormatFileSize(long size)
        {
            int[] limits = new int[] { 1024 * 1024 * 1024, 1024 * 1024, 1024 };
            string[] units = new string[] { "GB", "MB", "KB" };

            for (int i = 0; i < limits.Length; i++)
            {
                if (size >= limits[i])
                    return string.Format("{0:#,##0.##} " + units[i], ((double)size / limits[i]));
            }

            return string.Format("{0} bytes", size);
        }

        private void toBrowse(object sender, EventArgs e)
        {
            string msg;
            ObjectListView listView = sender as ObjectListView;
            MyFileSystemInfo p = (MyFileSystemInfo)listView.SelectedObject;
            if (p == null)
                msg = listView.SelectedIndices.Count.ToString();
            else
                msg = string.Format("'{0}'", p.Name);
            // Person focused = listView.FocusedItem == null ? null : (((OLVListItem)listView.FocusedItem).RowObject) as Person;
            // this.lbTreeItemName.Text = string.Format("Selected {0} of {1} items", msg, listView.GetItemCount());

        }
    }
}
