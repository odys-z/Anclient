﻿using System;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.IO;
using System.Linq;
using System.Windows.Controls;
using System.Windows.Media;
using TreeViewFileExplorer.Enums;

namespace TreeViewFileExplorer.ShellClasses
{
    public class SyncObjectInfo : BaseObject
    {
        public SyncObjectInfo(FileSystemInfo info)
        {
            // Children = new ObservableCollection<SyncObjectInfo>();
            SyncItemInfo = info;
            // this.filelist = filelist;

            if (info is DirectoryInfo)
            {
                ImageSource = FolderManager.GetImageSource(info.FullName, ItemState.Close);
                // AddDummy();
            }
            else if (info is FileInfo)
            {
                ImageSource = FileManager.GetImageSource(info.FullName);
            }

            PropertyChanged += new PropertyChangedEventHandler(FileSystemObjectInfo_PropertyChanged);
        }

        //public SyncObjectInfo(DriveInfo drive, ref ListView list)
        //    : this(drive.RootDirectory, ref list)
        //{
        //}

        #region Events

        public event EventHandler BeforeExpand;

        public event EventHandler AfterExpand;

        public event EventHandler BeforeExplore;

        public event EventHandler AfterExplore;

        //private void RaiseBeforeExpand()
        //{
        //    BeforeExpand?.Invoke(this, EventArgs.Empty);
        //}

        //private void RaiseAfterExpand()
        //{
        //    AfterExpand?.Invoke(this, EventArgs.Empty);
        //}

        //private void RaiseBeforeExplore()
        //{
        //    BeforeExplore?.Invoke(this, EventArgs.Empty);
        //}

        //private void RaiseAfterExplore()
        //{
        //    AfterExplore?.Invoke(this, EventArgs.Empty);
        //}

        #endregion

        #region EventHandlers

        void FileSystemObjectInfo_PropertyChanged(object sender, PropertyChangedEventArgs e)
        {
            //if (ParentFolderInfo is DirectoryInfo)
            //{
                //if (string.Equals(e.PropertyName, "IsExpanded", StringComparison.CurrentCultureIgnoreCase))
                //{
                //    // RaiseBeforeExpand();
                //    if (IsExpanded)
                //    {
                //        ImageSource = FolderManager.GetImageSource(ParentFolderInfo.FullName, ItemState.Open);
                //        if (HasDummy())
                //        {
                //            // RaiseBeforeExplore();
                //            RemoveDummy();
                //            ExploreDirectories();/
                //            // RaiseAfterExplore();
                //        }
                //    }
                //    else
                //    {
                //        ImageSource = FolderManager.GetImageSource(ParentFolderInfo.FullName, ItemState.Close);
                //    }
                //    // RaiseAfterExpand();
                //}
                //else if (string.Equals(e.PropertyName, "IsSelect", StringComparison.CurrentCultureIgnoreCase))
                //{
                //    filelist.Items.Clear();

                //    if (IsSelect)
                //    {
                //        try
                //        {
                //            var dirs = ((DirectoryInfo)FileSystemInfo).GetDirectories();
                //            foreach (DirectoryInfo f in dirs)
                //                filelist.Items.Add(new FileSystemObjectInfo(f, ref filelist));
                //        }
                //        catch (UnauthorizedAccessException) { }

                //        try
                //        {
                //            var files = ((DirectoryInfo)FileSystemInfo).GetFiles();
                //            foreach (FileInfo f in files)
                //                filelist.Items.Add(new FileSystemObjectInfo(f, ref filelist));
                //        }
                //        catch (UnauthorizedAccessException) { }
                //    }
                //}
                //else if (string.Equals(e.PropertyName, "IsSelectItem", StringComparison.CurrentCultureIgnoreCase))
                //{
                //    if (this.IsSelectItem)
                //        this.IsChecked = !this.IsChecked;
                //}
            //} else
            if (string.Equals(e.PropertyName, "IsSelectItem", StringComparison.CurrentCultureIgnoreCase))
            {
                if (this.IsSelectItem)
                    this.IsChecked = !this.IsChecked;
            }
        }

        #endregion

        #region Properties

        //public ObservableCollection<SyncObjectInfo> Children
        //{
        //    get { return GetValue<ObservableCollection<SyncObjectInfo>>("Children"); }
        //    private set { SetValue("Children", value); }
        //}

        public ImageSource ImageSource
        {
            get { return GetValue<ImageSource>("ImageSource"); }
            private set { SetValue("ImageSource", value); }
        }

        //public bool IsExpanded
        //{
        //    get { return GetValue<bool>("IsExpanded"); }
        //    set { SetValue("IsExpanded", value); }
        //}

        /// <summary>
        /// Select tree item
        /// </summary>
        public bool IsSelect
        {
            get { return GetValue<bool>("IsSelect"); }
            set { SetValue("IsSelect", value); }
        }

        /// <summary>
        /// Select file list item
        /// </summary>
        public bool IsSelectItem
        {
            get { return GetValue<bool>("IsSelectItem"); }
            set { SetValue("IsSelectItem", value); }
        }

        public bool IsChecked
        {
            get { return GetValue<bool>("IsChecked"); }
            set { SetValue("IsChecked", value); }
        }

        private string[] suf = { "B", "KB", "MB", "GB", "TB", "PB", "EB" }; //Longs run out around EB
        public string Size
        {
            get
            {
                long s = 0;
                if (SyncItemInfo is FileInfo)
                    s = ((FileInfo)SyncItemInfo).Length;
                else return "";
                if (s == 0)
                    return "0" + suf[0];
                long bytes = Math.Abs(s);
                int place = Convert.ToInt32(Math.Floor(Math.Log(bytes, 1024)));
                double num = Math.Round(bytes / Math.Pow(1024, place), 1);
                return (Math.Sign(s) * num).ToString() + suf[place];
            }
        }

        public FileSystemInfo SyncItemInfo
        {
            get { return GetValue<FileSystemInfo>("FileSystemInfo"); }
            private set { SetValue("FileSystemInfo", value); }
        }

        //private ListView filelist;

        //private DriveInfo Drive
        //{
        //    get { return GetValue<DriveInfo>("Drive"); }
        //    set { SetValue("Drive", value); }
        //}

        #endregion

        #region Methods

        //private void AddDummy()
        //{
        //    Children.Add(new DummyFileSystemObjectInfo(ref filelist));
        //}

        //private bool HasDummy()
        //{
        //    return GetDummy() != null;
        //}

        //private DummyFileSystemObjectInfo GetDummy()
        //{
        //    return Children.OfType<DummyFileSystemObjectInfo>().FirstOrDefault();
        //}

        //private void RemoveDummy()
        //{
        //    Children.Remove(GetDummy());
        //}

        //private void ExploreDirectories()
        //{
        //    if (Drive?.IsReady == false)
        //    {
        //        return;
        //    }
        //    if (FileSystemInfo is DirectoryInfo)
        //    {
        //        var subdirs = ((DirectoryInfo)FileSystemInfo).GetDirectories(); // Returns the subdirectories of the current directory.
        //        foreach (var directory in subdirs.OrderBy(d => d.Name))
        //        {
        //            if ((directory.Attributes & FileAttributes.System) != FileAttributes.System &&
        //                (directory.Attributes & FileAttributes.Hidden) != FileAttributes.Hidden &&
        //                !IsRepoDir(directory))
        //            {
        //                var fileSystemObject = new FileSystemObjectInfo(directory, ref filelist);
        //                fileSystemObject.BeforeExplore += FileSystemObject_BeforeExplore;
        //                fileSystemObject.AfterExplore += FileSystemObject_AfterExplore;
        //                Children.Add(fileSystemObject);
        //            }
        //        }
        //    }
        //}
        
        /// <summary>
        /// Is this dir contain "system.db"?
        /// </summary>
        /// <param name="path"></param>
        /// <exception cref="NotImplementedException"></exception>
        //private static bool IsRepoDir(DirectoryInfo dir)
        //{
        //    try
        //    {
        //        FileInfo[] files = dir.GetFiles();
        //        foreach (FileInfo f in files)
        //        {
        //            if (f.Name == "system.db")
        //                return true;
        //        }
        //    } catch { }
        //    return false;
        //}



        //private void FileSystemObject_AfterExplore(object sender, EventArgs e)
        //{
        //    RaiseAfterExplore();
        //}

        //private void FileSystemObject_BeforeExplore(object sender, EventArgs e)
        //{
        //    RaiseBeforeExplore();
        //}

        //private void ExploreFiles()
        //{
        //    if (Drive?.IsReady == false)
        //    {
        //        return;
        //    }
        //    if (FileSystemInfo is DirectoryInfo)
        //    {
        //        var files = ((DirectoryInfo)FileSystemInfo).GetFiles();
        //        foreach (var file in files.OrderBy(d => d.Name))
        //        {
        //            if ((file.Attributes & FileAttributes.System) != FileAttributes.System &&
        //                (file.Attributes & FileAttributes.Hidden) != FileAttributes.Hidden)
        //            {
        //                Children.Add(new FileSystemObjectInfo(file, ref filelist));
        //            }
        //        }
        //    }
        //}

        #endregion
    }
}
