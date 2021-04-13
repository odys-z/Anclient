namespace anclient.src.jserv
{
    internal interface IPort
    {
		static int NA = -1;       // error
		static int heartbeat = 0; // ("ping.serv11"),
		static int session = 1;   // ("login.serv11"),
		static int query = 2;     // ("r.serv11"),
		static int update = 3;    // ("u.serv11"),
		static int insert = 4;    // ("c.serv11");
		static int delete = 5;    // ("d.serv11"),
		static int echo = 6;      // ("echo.serv11"),
		/// <summary> serv port for downloading json/xml file or uploading a file.</summary>
		/// <see cref="io.odysz.semantic.jserv.file.JFileServ"/>
		static int file = 6; // ("file.serv11"),
		/// <summary>Any user defined request using message body of subclass of JBody must use this port </summary>
		static int user = 7; // ("user.serv11"),
		/// <summary>semantic tree of dataset extensions</summary>
		/// <see cref="io.odysz.semantic.ext.SemanticTree"/>
		static int stree = 8; // ("s-tree.serv11"),
		/// <summary>dataset extensions<br> </summary> 
		/// <see cref="io.odysz.semantic.ext.Dataset" />
		static int dataset = 9; // ("ds.serv11");

		public string name();
		public int port();

        /// <summary> Equivalent of enum.valueOf(), except for subclass returning instance of jserv.Port.
        /// </summary>
        /// <exception cref="SemanticException">Parsing value failed.</exception>
        public int valof(string pname);
    }
}