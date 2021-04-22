//using Sharpen;

//namespace io.odysz.semantic.jserv
//{
//	/// <summary>
//	/// <p>Base serv class for handling json request.</p>
//	/// Servlet extending this must subclass this class, and override
//	/// <see cref="ServPort{T}.onGet(io.odysz.semantic.jprotocol.AnsonMsg{T}, javax.servlet.http.HttpServletResponse)
//	/// 	">onGet()</see>
//	/// and
//	/// <see cref="ServPort{T}.onPost(io.odysz.semantic.jprotocol.AnsonMsg{T}, javax.servlet.http.HttpServletResponse)
//	/// 	">onPost()</see>
//	/// .
//	/// </summary>
//	/// <author>odys-z@github.com</author>
//	/// <?/>
//	[System.Serializable]
//	public abstract class ServPort<T> : javax.servlet.http.HttpServlet
//		where T : io.odysz.semantic.jprotocol.AnsonBody
//	{
//		protected internal static io.odysz.semantic.jsession.ISessionVerifier verifier;

//		protected internal io.odysz.semantic.jprotocol.IPort p;

//		static ServPort()
//		{
//			verifier = io.odysz.semantic.jserv.JSingleton.getSessionVerifier();
//		}

//		public ServPort(io.odysz.semantic.jprotocol.AnsonMsg.Port port)
//		{
//			this.p = port;
//		}

//		/// <exception cref="javax.servlet.ServletException"/>
//		/// <exception cref="System.IO.IOException"/>
//		protected override void doGet(javax.servlet.http.HttpServletRequest req, javax.servlet.http.HttpServletResponse
//			 resp)
//		{
//			java.io.InputStream @in;
//			string headstr = req.getParameter("header");
//			if (headstr != null && headstr.Length > 1)
//			{
//				byte[] b = Sharpen.Runtime.getBytesForString(headstr);
//				@in = new java.io.ByteArrayInputStream(b);
//			}
//			else
//			{
//				if (req.getContentLength() == 0)
//				{
//					return;
//				}
//				@in = req.getInputStream();
//			}
//			resp.setCharacterEncoding("UTF-8");
//			resp.setContentType("application/json");
//			try
//			{
//				io.odysz.semantic.jprotocol.AnsonMsg<T> msg = (io.odysz.semantic.jprotocol.AnsonMsg
//					<T>)io.odysz.anson.Anson.fromJson(@in);
//				onGet(msg, resp);
//			}
//			catch (System.Exception e)
//			{
//				Sharpen.Runtime.printStackTrace(e);
//				write(resp, err(io.odysz.semantic.jprotocol.AnsonMsg.MsgCode.exSemantic, e.Message
//					));
//			}
//			catch (System.Exception t)
//			{
//				Sharpen.Runtime.printStackTrace(t);
//				write(resp, err(io.odysz.semantic.jprotocol.AnsonMsg.MsgCode.exGeneral, "Internal error at sever side."
//					));
//			}
//			@in.close();
//		}

//		/// <exception cref="javax.servlet.ServletException"/>
//		/// <exception cref="System.IO.IOException"/>
//		protected override void doPost(javax.servlet.http.HttpServletRequest req, javax.servlet.http.HttpServletResponse
//			 resp)
//		{
//			try
//			{
//				resp.setCharacterEncoding("UTF-8");
//				// Firefox will complain "XML Parsing Error: not well-formed" even parsed resp correctly.
//				resp.setContentType("application/json");
//				java.io.InputStream @in = req.getInputStream();
//				io.odysz.semantic.jprotocol.AnsonMsg<T> msg = (io.odysz.semantic.jprotocol.AnsonMsg
//					<T>)io.odysz.anson.Anson.fromJson(@in);
//				onPost(msg, resp);
//			}
//			catch (System.Exception e)
//			{
//				Sharpen.Runtime.printStackTrace(e);
//				write(resp, err(io.odysz.semantic.jprotocol.AnsonMsg.MsgCode.exSemantic, e.Message
//					));
//			}
//		}

//		protected internal virtual void write<_T0>(javax.servlet.http.HttpServletResponse
//			 resp, io.odysz.semantic.jprotocol.AnsonMsg<_T0> msg, params io.odysz.anson.JsonOpt
//			[] opts)
//			where _T0 : io.odysz.semantic.jprotocol.AnsonResp
//		{
//			try
//			{
//				msg.toBlock(resp.getOutputStream(), opts);
//			}
//			catch (System.Exception e)
//			{
//				Sharpen.Runtime.printStackTrace(e);
//			}
//		}

//		/// <summary>Response with OK message.</summary>
//		/// <param name="arrayList"/>
//		/// <returns></returns>
//		protected internal virtual io.odysz.semantic.jprotocol.AnsonMsg<io.odysz.semantic.jprotocol.AnsonResp
//			> ok(System.Collections.Generic.List<io.odysz.module.rs.AnResultset> arrayList)
//		{
//			io.odysz.semantic.jprotocol.AnsonMsg<io.odysz.semantic.jprotocol.AnsonResp> msg = 
//				new io.odysz.semantic.jprotocol.AnsonMsg<io.odysz.semantic.jprotocol.AnsonResp>(
//				p, io.odysz.semantic.jprotocol.AnsonMsg.MsgCode.ok);
//			io.odysz.semantic.jprotocol.AnsonResp bd = new io.odysz.semantic.jprotocol.AnsonResp
//				(msg);
//			msg.body(bd.rs(arrayList));
//			return msg;
//		}

//		protected internal virtual io.odysz.semantic.jprotocol.AnsonMsg<io.odysz.semantic.jprotocol.AnsonResp
//			> ok(io.odysz.module.rs.AnResultset rs)
//		{
//			io.odysz.semantic.jprotocol.AnsonMsg<io.odysz.semantic.jprotocol.AnsonResp> msg = 
//				new io.odysz.semantic.jprotocol.AnsonMsg<io.odysz.semantic.jprotocol.AnsonResp>(
//				p, io.odysz.semantic.jprotocol.AnsonMsg.MsgCode.ok);
//			io.odysz.semantic.jprotocol.AnsonResp bd = new io.odysz.semantic.jprotocol.AnsonResp
//				(msg);
//			msg.body(bd.rs(rs));
//			return msg;
//		}

//		protected internal virtual io.odysz.semantic.jprotocol.AnsonMsg<U> ok<U>(U body)
//			where U : io.odysz.semantic.jprotocol.AnsonResp
//		{
//			io.odysz.semantic.jprotocol.AnsonMsg<U> msg = new io.odysz.semantic.jprotocol.AnsonMsg
//				<U>(p, io.odysz.semantic.jprotocol.AnsonMsg.MsgCode.ok);
//			msg.body(body);
//			return msg;
//		}

//		protected internal virtual io.odysz.semantic.jprotocol.AnsonMsg<io.odysz.semantic.jprotocol.AnsonResp
//			> ok(string templ, params object[] args)
//		{
//			io.odysz.semantic.jprotocol.AnsonMsg<io.odysz.semantic.jprotocol.AnsonResp> msg = 
//				io.odysz.semantic.jprotocol.AnsonMsg.ok(p, string.format(templ, args));
//			return msg;
//		}

//		protected internal virtual io.odysz.semantic.jprotocol.AnsonMsg<io.odysz.semantic.jprotocol.AnsonResp
//			> err(io.odysz.semantic.jprotocol.AnsonMsg.MsgCode code, string templ, params object
//			[] args)
//		{
//			io.odysz.semantic.jprotocol.AnsonMsg<io.odysz.semantic.jprotocol.AnsonResp> msg = 
//				new io.odysz.semantic.jprotocol.AnsonMsg<io.odysz.semantic.jprotocol.AnsonResp>(
//				p, code);
//			io.odysz.semantic.jprotocol.AnsonResp bd = new io.odysz.semantic.jprotocol.AnsonResp
//				(msg, string.format(templ, args));
//			return msg.body(bd);
//		}

//		/// <exception cref="javax.servlet.ServletException"/>
//		/// <exception cref="System.IO.IOException"/>
//		/// <exception cref="io.odysz.anson.x.AnsonException"/>
//		/// <exception cref="io.odysz.semantics.x.SemanticException"/>
//		protected internal abstract void onGet(io.odysz.semantic.jprotocol.AnsonMsg<T> msg
//			, javax.servlet.http.HttpServletResponse resp);

//		/// <exception cref="javax.servlet.ServletException"/>
//		/// <exception cref="System.IO.IOException"/>
//		/// <exception cref="io.odysz.anson.x.AnsonException"/>
//		/// <exception cref="io.odysz.semantics.x.SemanticException"/>
//		protected internal abstract void onPost(io.odysz.semantic.jprotocol.AnsonMsg<T> msg
//			, javax.servlet.http.HttpServletResponse resp);
//	}
//}
