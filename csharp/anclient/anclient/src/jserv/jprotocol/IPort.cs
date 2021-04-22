namespace io.odysz.semantic.jprotocol
{
	public interface IPort
	{
		string url { get; }

		string name();

		/// <summary>Equivalent of enum.valueOf(), except for subclass returning instance of jserv.Port.
		/// 	</summary>
		/// <exception cref="semantics.x.SemanticException"></exception>
		IPort valof(string pname);
	}
}
