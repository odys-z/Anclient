using io.odysz.anson;
using io.odysz.semantic.jprotocol;
using System;
using System.IO;
using System.Text;
using static io.odysz.semantic.jprotocol.AnsonMsg;

namespace io.oz.album {

/**Sample project's prots extension
 * This enum replaced jserv {@link io.odysz.semantic.jprotocol.AnsonMsg.Port}. */
public class AlbumPort : IPort {

	/** users.less */
	public const string userstier = "users.less";
	/** editor.less */
	public const string editor = "editor.less";
	/** album.less */
	public const string album = "album.less";

    class AlbumPortFactory : JsonableFactory
    {
        public IJsonable fromJson(string p) {
            return new AlbumPort(p);
        }
    }

    static AlbumPort()
    {
        JSONAnsonListener.registFactory(typeof(AlbumPort), new AlbumPortFactory());
	}

	public AlbumPort(int port) {
            this.port = port;
    }

	// public string Url() { return url; }

	static IPort valof(string pname) { 
        int p = Port.valueof(pname);
        if (p >= 0) return new AlbumPort(p);
		return AlbumPort.valueOf(pname);
	}

	public override IJsonable toBlock(Stream stream, JsonOpt opts = null) {
		stream.WriteByte((byte)'\"');
		// stream.write(url.getBytes());
		stream.Write(nameOf(port).getBytes());

		stream.WriteByte((byte)'\"');
		return this;
	}

	public override IJsonable toJson(StringBuilder buf) {
		buf.Append('\"');
		// buf.append(url);
		buf.Append(nameOf(p));
		buf.Append('\"');
		return this;
	}

	static public AlbumPort valueOf(string pname)
    {
        int p = pname == "heartbeat" ? Port.heartbeat
            : pname == "session" ? Port.session
            : pname == "query" ? Port.query
            : pname == "update" ? Port.update
            : pname == "insert" ? Port.insert
            : pname == "delete" ? Port.delete
            : pname == "echo" ? Port.echo
            : pname == "file" ? Port.file
            : pname == "user" ? Port.user
            : pname == "stree" || pname == "s-tree" ? Port.stree
            : pname == "dataset" ? Port.dataset
            : Port.NA;
		return new AlbumPort(p);
    }

    static public string nameOf(int port)
    {
        return port == Port.heartbeat ? "heartbeat"
            : port == Port.session ? "session"
            : port == Port.query ? "query"
            : port == Port.update ? "update"
            : port == Port.insert ? "insert"
            : port == Port.delete ? "delete"
            : port == Port.echo ? "echo"
            : port == Port.file ? "file"
            : port == Port.user ? "user"
            : port == Port.stree ? "stree"
            : port == Port.dataset ? "dataset"
            : "NA";
    }

	}
}
