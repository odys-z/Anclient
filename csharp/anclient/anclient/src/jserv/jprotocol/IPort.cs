using io.odysz.anson;

namespace io.odysz.semantic.jprotocol
{
	public interface IPort : IJsonable
	{
        const int NA = -1;       // error
        const int heartbeat = 0; // ("ping.serv11"),
        const int session = 1;   // ("login.serv11"),
        const int query = 2;     // ("r.serv11"),
        const int update = 3;    // ("u.serv11"),
        const int insert = 4;    // ("c.serv11");
        const int delete = 5;    // ("d.serv11"),
        const int echo = 6;      // ("echo.serv11"),
        /// <summary> serv port for downloading json/xml file or uploading a file.</summary>
        /// <see cref="jserv.file.JFileServ"/>
        const int file = 6; // ("file.serv11"),
        /// <summary>Any user defined request using message body of subclass of JBody must use this port </summary>
        const int user = 7; // ("user.serv11"),
        /// <summary>semantic tree of dataset extensions</summary>
        /// <see cref="ext.SemanticTree"/>
        const int stree = 8; // ("s-tree.serv11"),
        /// <summary>dataset extensions<br> </summary> 
        /// <see cref="ext.Dataset" />
        const int dataset = 9; // ("ds.serv11");

        string name { get; }

		/// <summary>Equivalent of enum.valueOf(), except for subclass returning instance of jserv.Port.
		/// 	</summary>
		/// <exception cref="SemanticException"></exception>
		IPort valof(string pname);
	}
}
