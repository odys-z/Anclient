using io.odysz.anson;
using io.odysz.anson.common;
using io.odysz.semantic.jprotocol;
using System.IO;
using System.Text;
using static io.odysz.semantic.jprotocol.AnsonMsg;

namespace io.oz.album {

    /**Sample project's prots extension
     * This enum replaced jserv {@link io.odysz.semantic.jprotocol.AnsonMsg.Port}. */
    public class AlbumPort : IPort, IJsonable {

        /** users.less */
        public const int userstier = 81;
        /** editor.less */
        public const int editor = 82;
        /** album.less */
        public const int album = 83;

        class AlbumPortFactory : JsonableFactory
        {
            public IJsonable fromJson(string p) {
                return new AlbumPort(AlbumPort.valueOf(p));
            }
        }

        static AlbumPort()
        {
            JSONAnsonListener.registFactory(typeof(AlbumPort), new AlbumPortFactory());
        }

        private int port;
        public AlbumPort(int port) {
            this.port = port;
        }

        //string url;
        //public string Url() { return url; }

        public string name { get { return nameof(port); } }

        static IPort valof(string pname) { 
            int p = valueOf(pname);
            return new AlbumPort(p);
        }

        public IJsonable ToBlock(Stream stream, JsonOpt opts = null) {
            stream.WriteByte((byte)'\"');
            byte[] byts = Encoding.ASCII.GetBytes(nameOf(port));
            stream.Write(byts, 0, 1);

            stream.WriteByte((byte)'\"');
            return this;
        }

        public IJsonable toJson(StringBuilder buf) {
            buf.Append('\"');
            buf.Append(nameOf(port));
            buf.Append('\"');
            return this;
        }

	    static public int valueOf(string pname)
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
                : pname == "album" ? album
                : Port.NA;
            return p;
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
                : port == album ? "album"
                : "";
        }

        public string Url()
        {
            string url = new Port(port).Url();
            if (LangExt.isblank(url, ""))
                return port == album ? "album.tier" : "";
            return url;
        }
    }
}
