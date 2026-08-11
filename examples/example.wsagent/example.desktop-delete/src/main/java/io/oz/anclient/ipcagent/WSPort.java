package io.oz.anclient.ipcagent;

import java.io.IOException;
import java.io.OutputStream;

import io.odysz.anson.AnsonException;
import io.odysz.anson.IJsonable;
import io.odysz.anson.JsonOpt;
import io.odysz.semantic.jprotocol.IPort;
import io.odysz.semantics.x.SemanticException;

/**
 * @deprecated as the ISSUE of 42fb6d8e73cef944e025c0fc7862c5001706ae01
 * 
 * The polymorphism problem while deserialization is not considered right at the beginning of anson.
 * 
 * Currently, the IPort polymorphism is handled in anson.cmake by JsonOpt.polymorphs map
 * and in ipc-agent (examples/example.desktop) by Ignoring WSPort, making c++ end thinking
 * port: "echo" as WSPort.echo while ipc-agent thinking it as AnsonMsg.Port.echo.
 * 
 * To solve this questing, i.e. to understand polymorphism while deserialization, the jprotocol
 * object must carry the polymorphism configuration and work as an instance for the protocol stack.
 * 
 */
public enum WSPort implements IPort {
	doclient("doclient.ws"), configIPC("config.ws"), echo("echo.ws"),
	ping("ping.ws"),
	/**
	 * See jserv/ExpDoctier
	 * @WebServlet(description = "Synode Tier: docs-sync", urlPatterns = { "/docs.tier" })
	 */
	docstier("docs.ws");

	private String url;
	WSPort(String v) { url = v; };
	public String url() { return url; }
	@Override
	public IPort valof(String pname) throws SemanticException {
		try {
			return WSPort.valueOf(pname);
		} catch (Exception e) {
			try { return valueOf(pname); }
			catch (IllegalArgumentException ex) {
				throw new SemanticException("Error of IllegalArgumentException: %s", ex.getMessage());
			}
		}
	}

	@Override
	public IJsonable toBlock(OutputStream stream, JsonOpt... opts) throws AnsonException, IOException {
		stream.write('\"');
		stream.write(name().getBytes());
		stream.write('\"');
		return this;
	}

	@Override
	public IJsonable toJson(StringBuffer buf) throws IOException, AnsonException {
		buf.append('\"');
		buf.append(name());
		buf.append('\"');
		return this;
	}	
}
