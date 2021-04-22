using anclient.src.jserv;
using io.odysz.anson;

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
			public static readonly AnsonMsg<AnsonBody>.Port heartbeat = new 
				AnsonMsg<AnsonBody>.Port("ping.serv11");

			public static readonly AnsonMsg<AnsonBody>.Port session = new AnsonMsg<AnsonBody>.Port
				("login.serv11");

			public static readonly AnsonMsg<AnsonBody>.Port query = new AnsonMsg<AnsonBody>.Port
				("r.serv11");

			public static readonly AnsonMsg<AnsonBody>.Port update = new AnsonMsg<AnsonBody>.Port
				("u.serv11");

			public static readonly AnsonMsg<AnsonBody>.Port insert = new AnsonMsg<AnsonBody>.Port
				("c.serv11");

			public static readonly AnsonMsg<AnsonBody>.Port delete = new AnsonMsg<AnsonBody>.Port
				("d.serv11");

			public static readonly AnsonMsg<AnsonBody>.Port echo = new AnsonMsg<AnsonBody>.Port
				("echo.serv11");

			/// <summary>serv port for downloading json/xml file or uploading a file.<br /></summary>
			/// <seealso>
			/// 
			/// <see cref="jserv.file.JFileServ"/>
			/// .
			/// </seealso>
			public static readonly AnsonMsg<AnsonBody>.Port file = new AnsonMsg<AnsonBody>.Port
				("file.serv11");

			/// <summary>Any user defined request using message body of subclass of JBody must use this port
			/// 	</summary>
			public static readonly AnsonMsg<AnsonBody>.Port user = new AnsonMsg<AnsonBody>.Port
				("user.serv11");

			/// <summary>semantic tree of dataset extensions<br /></summary>
			/// <seealso>
			/// 
			/// <see cref="ext.SemanticTree"/>
			/// .
			/// </seealso>
			public static readonly AnsonMsg<AnsonBody>.Port stree = new AnsonMsg<AnsonBody>.Port
				("s-tree.serv11");

			/// <summary>dataset extensions<br /></summary>
			/// <seealso>
			/// 
			/// <see cref="ext.Dataset"/>
			/// .
			/// </seealso>
			public static readonly AnsonMsg<AnsonBody>.Port dataset = new AnsonMsg<AnsonBody>.Port
				("ds.serv11");

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

            string IPort.url => throw new System.NotImplementedException();

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
                return pname == "ping.serv11" ? Port.heartbeat
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
            IPort IPort.valof(string pname)
            {
                throw new System.NotImplementedException();
            }
        }

		[System.Serializable]
		public sealed class MsgCode
		{
			public static readonly AnsonMsg<T>.MsgCode ok = new AnsonMsg<T>.MsgCode();

			public static readonly AnsonMsg<T>.MsgCode exSession = new AnsonMsg<T>.MsgCode();

			public static readonly AnsonMsg<T>.MsgCode exSemantic = new AnsonMsg<T>.MsgCode();

			public static readonly AnsonMsg<T>.MsgCode exIo = new AnsonMsg<T>.MsgCode();

			public static readonly AnsonMsg<T>.MsgCode exTransct = new AnsonMsg<T>.MsgCode();

			public static readonly AnsonMsg<T>.MsgCode exDA = new AnsonMsg<T>.MsgCode();

			public static readonly AnsonMsg<T>.MsgCode exGeneral = new AnsonMsg<T>.MsgCode();

			public static readonly AnsonMsg<T>.MsgCode ext = new AnsonMsg<T>.MsgCode();

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

		internal int seq;

		public virtual int seq()
		{
			return seq;
		}

		internal IPort port;

		public virtual IPort port()
		{
			return port;
		}

		private AnsonMsg.MsgCode code;

		public virtual AnsonMsg.MsgCode code()
		{
			return code;
		}

		/// <exception cref="io.odysz.semantics.x.SemanticException"/>
		public virtual void port(string pport)
		{
			/// translate from string to enum
			if (defaultPortImpl == null)
			{
				port = AnsonMsg.Port.echo.valof(pport);
			}
			else
			{
				port = defaultPortImpl.valof(pport);
			}
			if (port == null)
			{
				throw new io.odysz.semantics.x.SemanticException("Port can not be null. Not initialized? To use JMassage understand ports, call understandPorts(IPort) first."
					);
			}
		}

		public AnsonMsg()
		{
			seq = (int)(System.Math.random() * 1000);
		}

		public AnsonMsg(IPort port)
		{
			this.port = port;
			seq = (int)(System.Math.random() * 1000);
		}

		/// <summary>Typically for response</summary>
		/// <param name="p"></param>
		/// <param name="code"/>
		public AnsonMsg(IPort p, AnsonMsg.MsgCode
			 code)
		{
			this.port = p;
			this.code = code;
		}

		protected internal System.Collections.Generic.IList<T> body;

		public virtual T body(int i)
		{
			return body[0];
		}

		public virtual System.Collections.Generic.IList<T> body()
		{
			return body;
		}

		/// <summary>Add a request body to the request list.</summary>
		/// <param name="bodyItem"/>
		/// <returns>new message object</returns>
		public virtual AnsonMsg<T> body(AnsonBody
			 bodyItem)
		{
			if (body == null)
			{
				body = new System.Collections.Generic.List<T>();
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

		public virtual AnsonMsg<T> body(System.Collections.Generic.IList
			<T> bodyItems)
		{
			this.body = bodyItems;
			return this;
		}

		public static AnsonMsg<AnsonResp
			> ok(IPort p, string txt)
		{
			AnsonResp bd = new AnsonResp
				(txt);
			return new AnsonMsg<AnsonResp
				>(p, AnsonMsg.MsgCode.ok).body(bd);
		}

		public static AnsonMsg<AnsonBody> ok(IPort p, AnsonResp resp)
		{
			return new AnsonMsg<AnsonBody>(p, AnsonMsg.MsgCode.ok).body(resp);
		}
	}
}
