using anclient.src.anclient;
using anclient.src.jserv;
using io.odysz.anson;
using System;
using
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
	public class AnsonMsg<T> : Anson where T : AnsonBody
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
		[System.Serializable]
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

            private string _name;
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

		private string url { get; set; }

            string IPort.url => throw new NotImplementedException();

            Port(string url) {
                _name = url;
                _port = valof(url);
            }

            public Port(int port)
            {
                _port = port;
                _name = nameof(port);
            }

            public string name() { return _name; }

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
                throw new NotImplementedException();
            }
        }

		[System.Serializable]
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

            public MsgCode(int ok1)
            {
            }

            public bool eq(string code)
			{
				if (code == null)
				{
					return false;
				}
				AnsonMsg<T>.MsgCode c = AnsonMsg<T>.MsgCode
					.valueOf<AnsonMsg<AnsonBody>.MsgCode>(code);
				return this == c;
			}

            private static MsgCode valueOf<T>(string code)
            {
                throw new NotImplementedException();
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
		/// <see cref="Port"/>
		/// .<br />
		/// Because {
		/// <see cref="Port"/>
		/// only defined limited ports, user must initialize JMessage with
		/// <see cref="AnsonMsg{T}.understandPorts(IPort)"/>
		/// .<br />
		/// An example of how to use this is shown in jserv-sample/io.odysz.jsample.SysMenu.<br />
		/// Also check how to implement IPort extending
		/// <see cref="Port"/>
		/// , see example of jserv-sample/io.odysz.jsample.protocol.Samport.
		/// </summary>
		/// <param name="p">extended Port</param>
		public static void understandPorts(IPort p)
		{
			defaultPortImpl = p;
		}

		private string version = "1.0";

		internal int seq { get; }

		internal IPort port { get; set; }

		private AnsonMsg<T>.MsgCode code { get; }

		/// public virtual AnsonMsg<T>.MsgCode code() { return code; }

		/// <exception cref="SemanticException"/>
		public virtual void portOf(string pport)
		{
			/// translate from string to enum
			if (defaultPortImpl == null)
			{
				port = new AnsonMsg<AnsonBody>.Port(Port.echo);
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
			seq = new Random().Next(1000));
		}

		/// <summary>Typically for response</summary>
		/// <param name="p"></param>
		/// <param name="code"/>
		public AnsonMsg(IPort p, AnsonMsg<T>.MsgCode code)
		{
			this.port = p;
			this.code = code;
		}

		protected internal IList<T> body;

		public virtual T BodyAt(int i)
		{
			return body.get(0);
		}

		public virtual IList<T> Body()
		{
			return body;
		}

		/// <summary>Add a request body to the request list.</summary>
		/// <param name="bodyItem"/>
		/// <returns>new message object</returns>
		public virtual AnsonMsg<T> Body(AnsonBody bodyItem)
		{
			if (body == null)
			{
				body = new List<T>();
			}
			body.add((T)bodyItem);
			bodyItem.parent = this;
			return this;
		}

		public virtual AnsonMsg<T> incSeq()
		{
			seq++;
			return this;
		}

		internal AnsonHeader header;

		public virtual AnsonHeader header()
		{
			return header;
		}

		public virtual AnsonMsg<T> header(AnsonHeader
			 header)
		{
			this.header = header;
			return this;
		}

		internal JsonOpt opts;

		public virtual void opts(JsonOpt readOpts)
		{
			this.opts = readOpts;
		}

		public virtual JsonOpt opts()
		{
			return opts == null ? new JsonOpt() : opts;
		}

		public virtual AnsonMsg<T> Body(IList<T> bodyItems)
		{
			this.body = bodyItems;
			return this;
		}

		public static AnsonMsg<T> Ok(IPort p, string txt)
		{
			AnsonResp bd = new AnsonResp(txt);
			return new AnsonMsg<T>(p, new AnsonMsg<T>.MsgCode(MsgCode.ok)).Body(bd);
		}

		public static AnsonMsg<T> ok(IPort p, T resp)
		{
			return new AnsonMsg<T>(p, AnsonMsg<T>.MsgCode.ok).Body(resp);
		}
	}
}
