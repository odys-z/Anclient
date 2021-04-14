using io.oz.anson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace anclient.src.jserv
{
	public class Port : IPort
	{

        //private readonly string _url;
        //private readonly int _port;
        //public override string name() { return _url; }
        //public override int port() { return _port; }

        private string _name;
        private int _port;
        private int session;

        Port(string url) {
			this._name = url;
			this._port = valof(url);
		}

        public Port(int port)
        {
            this._port = port;
			this._name = nameof(port);
        }

        public string name() { return _name; }

        public int port() { return _port; }

        static public int valof(string pname) {
			return pname == "ping.serv11" ? IPort.heartbeat
				: pname == "login.serv11" ? IPort.session
				: pname == "r.serv11" ? IPort.query
				: pname == "u.serv11" ? IPort.update
				: pname == "c.serv11" ? IPort.insert
				: pname == "d.serv11" ? IPort.delete
				: pname == "echo.serv11" ? IPort.echo
				: pname == "file.serv11" ? IPort.file
				: pname == "user.serv11" ? IPort.user
				: pname == "stree.serv11" ? IPort.stree
				: pname == "dataset.serv11" ? IPort.dataset
				: IPort.NA;
		}
        static public string nameof(int port) {
			return port == IPort.heartbeat ? "ping.serv11"
				: port == IPort.session ? "login.serv11"
				: port == IPort.query ? "r.serv11"
				: port == IPort.update ? "u.serv11" 
				: port == IPort.insert ? "c.serv11" 
				: port == IPort.delete ? "d.serv11"
				: port == IPort.echo ? "echo.serv11"
				: port == IPort.file ? "file.serv11"
				: port == IPort.user ? "user.serv11"
				: port == IPort.stree ? "stree.serv11" 
				: port == IPort.dataset ? "dataset.serv11"
				: "NA";
		}

	}
    /// <summary>
    /// Anson message type, with body of type T.
    /// </summary>
    /// <typeparam name="T">T must subclass of AnsonBody</typeparam>
    public class AnsonMsg<T> : Antson
    {
        public class MsgCode
        {
            public const int ok = 0;
        }

        int seq;
        IPort port;

        public AnsonMsg()
        {
            seq = new Random().Next(64^6);
        }

        public AnsonMsg(IPort port)
        {
            seq = new Random().Next(64^6);
            this.port = port;
        }
    }
}
