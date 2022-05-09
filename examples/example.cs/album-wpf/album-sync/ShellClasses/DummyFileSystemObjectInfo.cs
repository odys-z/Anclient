using System.IO;
using System.Windows.Controls;

namespace TreeViewFileExplorer.ShellClasses
{
    internal class DummyFileSystemObjectInfo : FileSystemObjectInfo
    {
        public DummyFileSystemObjectInfo(ref ListView files)
            : base(new DirectoryInfo("DummyFileSystemObjectInfo"), ref files)
        {
        }
    }
}
