using Sharpen;

namespace io.odysz.semantic.jserv.file
{
	public class FileReq : io.odysz.semantic.jprotocol.AnsonBody
	{
		internal string file;

		internal int len;

		internal string payload;

		protected internal FileReq(io.odysz.semantic.jprotocol.AnsonMsg<io.odysz.semantic.jprotocol.AnsonBody
			> parent, string filename)
			: base(parent, null)
		{
			file = filename;
		}

		public virtual string file()
		{
			return file;
		}
	}
}
