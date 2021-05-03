using io.odysz.anson;
using io.odysz.semantics.x;
using System;
using System.Collections.Generic;

namespace io.odysz.semantic.jprotocol
{
	/// <summary>
	/// <p>Base class of message used by
	/// <see cref="jserv.ServPort{T}">serv11</see>
	/// .</p>
	/// 1. A incoming json message is parsed by *.serv into JMessage,
	/// which can be used to directly to build statements;<br />
	/// 2. An outgoing data object which is presented as AnsonMsg<AnsonResp>,
	/// which should been directly write into output stream.
	/// </summary>
	/// <author>odys-z@github.com</author>
	public class AnsonMsg : Anson
	{
		/// <summary>
		/// Port is the conceptual equivalent to the SOAP port, the service methods' group.<br />
		/// NOTE: java code shouldn't use switch-case block on enum.
		/// </summary>
		/// <remarks>
		/// Port is the conceptual equivalent to the SOAP port, the service methods' group.<br />
		/// NOTE: java code shouldn't use switch-case block on enum. That cause problem with generated class.
		/// </remarks>
		/// <author>odys-z@github.com</author>
		[Serializable]
		public sealed class Port : IPort
		{
			/// <summary>ping.serv11</summary>
			public const int heartbeat = 0;

			/// <summary>login.serv11</summary>
			public const int session = 1;

			/// <summary>r.serv11</summary>
			public const int query = 2;

			/// <summary>u.serv11</summary>
			public const int update = 3;

			/// <summary>c.serv11</summary>
			public const int insert = 4;

			/// <summary>d.serv11</summary>
			public const int delete = 5;

			/// <summary>echo.serv11</summary>
			public const int echo = 6;

			/// <summary>file.serv11:
			/// serv port for downloading json/xml file or uploading a file.</summary> 
            /// <seealso>
            /// <see cref="jserv.file.JFileServ"/>
            /// </seealso>
			public const int file = 7;

			/// <summary>user.serv11:
			/// Any user defined request using message body of subclass of JBody must
			/// use this port</summary>
			public const int user = 8;

			/// <summary>s-tree.serv11:
			/// semantic tree of dataset extensions</summary>
            /// <seealso>
            /// <see cref="ext.SemanticTree"/>
            /// </seealso>
			public const int stree = 9;

            /// <summary>ds.serv11:
			/// dataset extensions<br /></summary>
            /// <seealso>
            /// <see cref="ext.Dataset"/>
            /// </seealso>
			public const int dataset = 10;

			public const int NA = -1;

            private int _port;

			/// <summary>
			/// TODO Setup a register for extinding new port.
			/// </summary>
            static Port()
            {
                /*
                JSONAnsonListener.registFactory(Sharpen.Runtime.getClassForType(typeof(IPort)),
                    @"TODO: Lambda Expression Ignored
                    (s) -> {
                      try {
                        return defaultPortImpl.valof(s);
                      }
                     catch (  SemanticException e) {
                        e.printStackTrace();
                        return null;
                      }
                    }" );
                */
            }

			public string url { get; private set; }

            Port(string url) {
                this.url = url;
                _port = valof(url);
            }

            public Port(int port)
            {
                _port = port;
                url = nameof(port);
            }

            // public string name() { return _name; }

            public int port() { return _port; }

            static public int valof(string pname) {
                return pname == "ping.serv11" ? Port.heartbeat
                    : pname == "login.serv11" ? Port.session
                    : pname == "r.serv11" ? Port.query
                    : pname == "u.serv11" ? Port.update
                    : pname == "c.serv11" ? Port.insert
                    : pname == "d.serv11" ? Port.delete
                    : pname == "echo.serv11" ? Port.echo
                    : pname == "file.serv11" ? Port.file
                    : pname == "user.serv11" ? Port.user
                    : pname == "stree.serv11" ? Port.stree
                    : pname == "dataset.serv11" ? Port.dataset
                    : Port.NA;
            }
            static public string nameof(int port) {
                return port == Port.heartbeat ? "ping.serv11"
                    : port == Port.session ? "login.serv11"
                    : port == Port.query ? "r.serv11"
                    : port == Port.update ? "u.serv11" 
                    : port == Port.insert ? "c.serv11" 
                    : port == Port.delete ? "d.serv11"
                    : port == Port.echo ? "echo.serv11"
                    : port == Port.file ? "file.serv11"
                    : port == Port.user ? "user.serv11"
                    : port == Port.stree ? "stree.serv11" 
                    : port == Port.dataset ? "dataset.serv11"
                    : "NA";
            }

            IPort IPort.valof(string pname)
            {
				return pname == "ping.serv11" ? new Port(IPort.heartbeat)
					: pname == "login.serv11" ? new Port(IPort.session)
					: pname == "r.serv11" ? new Port(IPort.query)
					: pname == "u.serv11" ? new Port(IPort.update)
					: pname == "c.serv11" ? new Port(IPort.insert)
					: pname == "d.serv11" ? new Port(IPort.delete)
					: pname == "echo.serv11" ? new Port(IPort.echo)
					: pname == "file.serv11" ? new Port(IPort.file)
					: pname == "user.serv11" ? new Port(IPort.user)
					: pname == "s-tree.serv11" ? new Port(IPort.stree)
					: pname == "ds.serv11" ? new Port(IPort.dataset)
					: new Port(IPort.NA);
            }
        }

        //public static explicit operator AnsonMsg(AnsonMsg v)
        //{
        //    throw new NotImplementedException();
        //}

        [Serializable]
		public sealed class MsgCode
		{
			public const int ok = 0;

			public const int exSession = 1;

			public const int exSemantic = 2;

			public const int exIo = 3;

			public const int exTransct = 4;

			public const int exDA = 5;

			public const int exGeneral = 6;

			public const int ext = 7;

			internal int code { get; set; }
            public MsgCode(int code)
            {
				this.code = code;
            }

            public bool eq(string code)
			{
				if (code == null)
				{
					return false;
				}
				int c = codeOf(code);
				return this.code == c;
			}

            private static int codeOf(string name)
            {
				name = name.ToLower();
				return name == "ok" ? MsgCode.ok
					: name == "exsession" ? MsgCode.exSession
					: name == "exsemantic" ? MsgCode.exSemantic
					: name == "exio" ? MsgCode.exIo
					: name == "extransct" ? MsgCode.exTransct
					: name == "exda" ? MsgCode.exDA
					: name == "exgeneral" ? MsgCode.exGeneral
					: MsgCode.ext;
            }
        }

		/// <summary>The default IPort implelemtation.</summary>
		/// <remarks>
		/// The default IPort implelemtation.
		/// Used for parsing port name (string) to IPort instance, like
		/// <see cref="#Port"/>
		/// .<br />
		/// </remarks>
		internal static IPort defaultPortImpl;

		/// <summary>
		/// Set the default IPort implelemtation, which is used for parsing port name (string)
		/// to IPort instance, like
		/// <see cref="Port"/>.
		/// Because <see cref="Port"/> only defined limited ports, user must initialize JMessage with
		/// <see cref="AnsonMsg{T}.understandPorts(IPort)"/>.
		/// An example of how to use this is shown in jserv-sample/io.odysz.jsample.SysMenu.<br />
		/// Also check how to implement IPort extending
		/// <see cref="Port"/>, see example of jserv-sample/io.odysz.jsample.protocol.Samport.
		/// </summary>
		/// <param name="p">extended Port</param>
		public static void understandPorts(IPort p)
		{
			defaultPortImpl = p;
		}

		private string version = "1.0";

		internal int seq { get; set; }

		internal IPort port { get; set; }

		public MsgCode code { get; }

		public virtual void portOf(string pport)
		{
			/// translate from string to enum
			if (defaultPortImpl == null)
			{
				port = new Port(Port.echo);
			}
			else
			{
				port = defaultPortImpl.valof(pport);
			}
			if (port == null)
			{
				throw new SemanticException(
					"Port can not be null. Not initialized? To use JMassage understand ports, call understandPorts(IPort) first.");
			}
		}

		public AnsonMsg()
		{
			seq = new Random().Next(1000);
		}

		public AnsonMsg(IPort port)
		{
			this.port = port;
			seq = new Random().Next(1000);
		}

		/// <summary>Typically for response</summary>
		/// <param name="p"></param>
		/// <param name="code"/>
		public AnsonMsg(IPort p, MsgCode code)
		{
			port = p;
			this.code = code;
		}

		protected internal IList<AnsonBody> body;

		public virtual AnsonBody BodyAt(int i)
		{
			return body[0];
		}

		public virtual IList<AnsonBody> Body()
		{
			return body;
		}

		/// <summary>Add a request body to the request list.</summary>
		/// <param name="bodyItem"/>
		/// <returns>new message object</returns>
		public virtual AnsonMsg Body(AnsonBody bodyItem)
		{
			if (body == null)
			{
				body = new List<AnsonBody>();
			}
			body.Add(bodyItem);
			// bodyItem.parent = this;
			bodyItem.Parent(this);
			return this;
		}

		public virtual AnsonMsg incSeq()
		{
			seq = seq + 1;
			return this;
		}

		internal AnsonHeader header { get; set; }
		public AnsonMsg Header(AnsonHeader h)
        {
			header = h;
			return this;
        }

		internal JsonOpt opts { get; set; }

		public virtual AnsonMsg Body(IList<AnsonBody> bodyItems)
		{
			body = bodyItems;
			return this;
		}

		public static AnsonMsg Ok(IPort p, string txt)
		{
			AnsonResp bd = new AnsonResp(txt);
			return new AnsonMsg(p, new MsgCode(MsgCode.ok)).Body(bd);
		}

		public static AnsonMsg ok(IPort p, AnsonBody resp)
		{
			return new AnsonMsg(p, new MsgCode(MsgCode.ok)).Body(resp);
		}
    }
}
