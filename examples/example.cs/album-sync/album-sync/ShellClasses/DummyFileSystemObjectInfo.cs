using System.IO;
using System.Windows.Controls;

namespace TreeViewFileExplorer.ShellClasses
{
    internal class DummyFileSystemObjectInfo : FileSystemObjectInfo
    {
        // public DummyFileSystemObjectInfo(ref ListView files)
        public DummyFileSystemObjectInfo(ref MediaGallery.Gallery files)
            : base(new DirectoryInfo("DummyFileSystemObjectInfo"), ref files)
        {
        }
    }
}
