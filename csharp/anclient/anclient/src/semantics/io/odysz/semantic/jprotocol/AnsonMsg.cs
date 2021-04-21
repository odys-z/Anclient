using Sharpen;

namespace io.odysz.semantic.jprotocol
{
	/// <summary>
	/// <p>Base class of message used by
	/// <see cref="io.odysz.semantic.jserv.ServPort{T}">serv11</see>
	/// .</p>
	/// 1. A incoming json message is parsed by *.serv into JMessage,
	/// which can be used to directly to build statements;<br />
	/// 2. An outgoing data object which is presented as AnsonMsg<AnsonResp>,
	/// which should been directly write into output stream.
	/// </summary>
	/// <author>odys-z@github.com</author>
	public class AnsonMsg<T> : Anson
		where T : AnsonBody
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
		public sealed class Port : io.odysz.semantic.jprotocol.IPort
		{
			public static readonly io.odysz.semantic.jprotocol.AnsonMsg.Port heartbeat = new 
				io.odysz.semantic.jprotocol.AnsonMsg.Port("ping.serv11");

			public static readonly io.odysz.semantic.jprotocol.AnsonMsg.Port session = new io.odysz.semantic.jprotocol.AnsonMsg.Port
				("login.serv11");

			public static readonly io.odysz.semantic.jprotocol.AnsonMsg.Port query = new io.odysz.semantic.jprotocol.AnsonMsg.Port
				("r.serv11");

			public static readonly io.odysz.semantic.jprotocol.AnsonMsg.Port update = new io.odysz.semantic.jprotocol.AnsonMsg.Port
				("u.serv11");

			public static readonly io.odysz.semantic.jprotocol.AnsonMsg.Port insert = new io.odysz.semantic.jprotocol.AnsonMsg.Port
				("c.serv11");

			public static readonly io.odysz.semantic.jprotocol.AnsonMsg.Port delete = new io.odysz.semantic.jprotocol.AnsonMsg.Port
				("d.serv11");

			public static readonly io.odysz.semantic.jprotocol.AnsonMsg.Port echo = new io.odysz.semantic.jprotocol.AnsonMsg.Port
				("echo.serv11");

			/// <summary>serv port for downloading json/xml file or uploading a file.<br /></summary>
			/// <seealso>
			/// 
			/// <see cref="io.odysz.semantic.jserv.file.JFileServ"/>
			/// .
			/// </seealso>
			public static readonly io.odysz.semantic.jprotocol.AnsonMsg.Port file = new io.odysz.semantic.jprotocol.AnsonMsg.Port
				("file.serv11");

			/// <summary>Any user defined request using message body of subclass of JBody must use this port
			/// 	</summary>
			public static readonly io.odysz.semantic.jprotocol.AnsonMsg.Port user = new io.odysz.semantic.jprotocol.AnsonMsg.Port
				("user.serv11");

			/// <summary>semantic tree of dataset extensions<br /></summary>
			/// <seealso>
			/// 
			/// <see cref="io.odysz.semantic.ext.SemanticTree"/>
			/// .
			/// </seealso>
			public static readonly io.odysz.semantic.jprotocol.AnsonMsg.Port stree = new io.odysz.semantic.jprotocol.AnsonMsg.Port
				("s-tree.serv11");

			/// <summary>dataset extensions<br /></summary>
			/// <seealso>
			/// 
			/// <see cref="io.odysz.semantic.ext.Dataset"/>
			/// .
			/// </seealso>
			public static readonly io.odysz.semantic.jprotocol.AnsonMsg.Port dataset = new io.odysz.semantic.jprotocol.AnsonMsg.Port
				("ds.serv11");

			static Port()
			{
				io.odysz.anson.JSONAnsonListener.registFactory(Sharpen.Runtime.getClassForType(typeof(
					io.odysz.semantic.jprotocol.IPort)), @"TODO: Lambda Expression Ignored
(s) -> {
  try {
    return defaultPortImpl.valof(s);
  }
 catch (  SemanticException e) {
    e.printStackTrace();
    return null;
  }
}
"
					);
			}

			private string url;

			public string url()
			{
				return io.odysz.semantic.jprotocol.AnsonMsg.Port.url;
			}

			internal Port(string url)
			{
				this.url = url;
			}

			public io.odysz.semantic.jprotocol.IPort valof(string pname)
			{
				return valueOf(pname);
			}

			/// <exception cref="io.odysz.anson.x.AnsonException"/>
			/// <exception cref="System.IO.IOException"/>
			public io.odysz.anson.IJsonable toBlock(java.io.OutputStream stream, params io.odysz.anson.JsonOpt
				[] opts)
			{
				stream.write('\"');
				stream.write(Sharpen.Runtime.getBytesForString(name()));
				stream.write('\"');
				return this;
			}

			/// <exception cref="System.IO.IOException"/>
			/// <exception cref="io.odysz.anson.x.AnsonException"/>
			public io.odysz.anson.IJsonable toJson(System.Text.StringBuilder buf)
			{
				buf.Append('\"');
				buf.Append(Sharpen.Runtime.getBytesForString(name()));
				buf.Append('\"');
				return this;
			}
		}

		[System.Serializable]
		public sealed class MsgCode
		{
			public static readonly io.odysz.semantic.jprotocol.AnsonMsg.MsgCode ok = new io.odysz.semantic.jprotocol.AnsonMsg.MsgCode
				();

			public static readonly io.odysz.semantic.jprotocol.AnsonMsg.MsgCode exSession = new 
				io.odysz.semantic.jprotocol.AnsonMsg.MsgCode();

			public static readonly io.odysz.semantic.jprotocol.AnsonMsg.MsgCode exSemantic = 
				new io.odysz.semantic.jprotocol.AnsonMsg.MsgCode();

			public static readonly io.odysz.semantic.jprotocol.AnsonMsg.MsgCode exIo = new io.odysz.semantic.jprotocol.AnsonMsg.MsgCode
				();

			public static readonly io.odysz.semantic.jprotocol.AnsonMsg.MsgCode exTransct = new 
				io.odysz.semantic.jprotocol.AnsonMsg.MsgCode();

			public static readonly io.odysz.semantic.jprotocol.AnsonMsg.MsgCode exDA = new io.odysz.semantic.jprotocol.AnsonMsg.MsgCode
				();

			public static readonly io.odysz.semantic.jprotocol.AnsonMsg.MsgCode exGeneral = new 
				io.odysz.semantic.jprotocol.AnsonMsg.MsgCode();

			public static readonly io.odysz.semantic.jprotocol.AnsonMsg.MsgCode ext = new io.odysz.semantic.jprotocol.AnsonMsg.MsgCode
				();

			public bool eq(string code)
			{
				if (code == null)
				{
					return false;
				}
				io.odysz.semantic.jprotocol.AnsonMsg.MsgCode c = io.odysz.semantic.jprotocol.AnsonMsg.MsgCode
					.valueOf<io.odysz.semantic.jprotocol.AnsonMsg.MsgCode>(code);
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
		internal static io.odysz.semantic.jprotocol.IPort defaultPortImpl;

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
		public static void understandPorts(io.odysz.semantic.jprotocol.IPort p)
		{
			defaultPortImpl = p;
		}

		private string version = "1.0";

		internal int seq;

		public virtual int seq()
		{
			return seq;
		}

		internal io.odysz.semantic.jprotocol.IPort port;

		public virtual io.odysz.semantic.jprotocol.IPort port()
		{
			return port;
		}

		private io.odysz.semantic.jprotocol.AnsonMsg.MsgCode code;

		public virtual io.odysz.semantic.jprotocol.AnsonMsg.MsgCode code()
		{
			return code;
		}

		/// <exception cref="io.odysz.semantics.x.SemanticException"/>
		public virtual void port(string pport)
		{
			/// translate from string to enum
			if (defaultPortImpl == null)
			{
				port = io.odysz.semantic.jprotocol.AnsonMsg.Port.echo.valof(pport);
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

		public AnsonMsg(io.odysz.semantic.jprotocol.IPort port)
		{
			this.port = port;
			seq = (int)(System.Math.random() * 1000);
		}

		/// <summary>Typically for response</summary>
		/// <param name="p"></param>
		/// <param name="code"/>
		public AnsonMsg(io.odysz.semantic.jprotocol.IPort p, io.odysz.semantic.jprotocol.AnsonMsg.MsgCode
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
		public virtual io.odysz.semantic.jprotocol.AnsonMsg<T> body(io.odysz.semantic.jprotocol.AnsonBody
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

		public virtual io.odysz.semantic.jprotocol.AnsonMsg<T> incSeq()
		{
			seq++;
			return this;
		}

		internal io.odysz.semantic.jprotocol.AnsonHeader header;

		public virtual io.odysz.semantic.jprotocol.AnsonHeader header()
		{
			return header;
		}

		public virtual io.odysz.semantic.jprotocol.AnsonMsg<T> header(io.odysz.semantic.jprotocol.AnsonHeader
			 header)
		{
			this.header = header;
			return this;
		}

		internal io.odysz.anson.JsonOpt opts;

		public virtual void opts(io.odysz.anson.JsonOpt readOpts)
		{
			this.opts = readOpts;
		}

		public virtual io.odysz.anson.JsonOpt opts()
		{
			return opts == null ? new io.odysz.anson.JsonOpt() : opts;
		}

		public virtual io.odysz.semantic.jprotocol.AnsonMsg<T> body(System.Collections.Generic.IList
			<T> bodyItems)
		{
			this.body = bodyItems;
			return this;
		}

		public static io.odysz.semantic.jprotocol.AnsonMsg<io.odysz.semantic.jprotocol.AnsonResp
			> ok(io.odysz.semantic.jprotocol.IPort p, string txt)
		{
			io.odysz.semantic.jprotocol.AnsonResp bd = new io.odysz.semantic.jprotocol.AnsonResp
				(txt);
			return new io.odysz.semantic.jprotocol.AnsonMsg<io.odysz.semantic.jprotocol.AnsonResp
				>(p, io.odysz.semantic.jprotocol.AnsonMsg.MsgCode.ok).body(bd);
		}

		public static io.odysz.semantic.jprotocol.AnsonMsg<io.odysz.semantic.jprotocol.AnsonResp
			> ok(io.odysz.semantic.jprotocol.IPort p, io.odysz.semantic.jprotocol.AnsonResp 
			resp)
		{
			return new io.odysz.semantic.jprotocol.AnsonMsg<io.odysz.semantic.jprotocol.AnsonResp
				>(p, io.odysz.semantic.jprotocol.AnsonMsg.MsgCode.ok).body(resp);
		}
	}
}
