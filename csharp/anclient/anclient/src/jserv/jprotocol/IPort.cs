using Sharpen;

namespace io.odysz.semantic.jprotocol
{
	public interface IPort : io.odysz.anson.IJsonable
	{
		string url();

		string name();

		/// <summary>Equivalent of enum.valueOf(), except for subclass returning instance of jserv.Port.
		/// 	</summary>
		/// <exception cref="io.odysz.semantics.x.SemanticException"></exception>
		io.odysz.semantic.jprotocol.IPort valof(string pname);
	}
}
