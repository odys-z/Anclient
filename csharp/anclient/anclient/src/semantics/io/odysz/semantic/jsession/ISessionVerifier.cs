using Sharpen;

namespace io.odysz.semantic.jsession
{
	public interface ISessionVerifier
	{
		/// <summary>Verify session token</summary>
		/// <param name="AnsonHeader"/>
		/// <returns/>
		/// <exception cref="io.odysz.semantic.jserv.x.SsException"/>
		/// <exception cref="java.sql.SQLException"/>
		io.odysz.semantics.IUser verify(io.odysz.semantic.jprotocol.AnsonHeader AnsonHeader
			);
		// default function body for old version
	}
}
