using Sharpen;

namespace io.odysz.semantic.jsession
{
	/// <summary>
	/// <p>IUser implementation supporting session.</p>
	/// <p>This object is usually created when user logged in,
	/// and is used for semantics processing like finger print, etc.</p>
	/// <p>The logging connection is configured in configs.xml/k=log-connId.</p>
	/// <p>A subclass can be used for handling serv without login.</p>
	/// </summary>
	/// <author>odys-z@github.com</author>
	public class JUser : io.odysz.semantics.SemanticObject, io.odysz.semantics.IUser
	{
		/// <summary>Hard coded field string of user table information.</summary>
		/// <author>odys-z@github.com</author>
		public class JUserMeta : io.odysz.semantics.meta.TableMeta
		{
			public JUserMeta(string tbl, params string[] conn)
				: base(tbl, conn)
			{
				this.tbl = "a_user";
				this.pk = "userId";
				this.uname = "userName";
				this.pswd = "pswd";
				this.iv = "encAuxiliary";
			}

			/// <summary>key in config.xml for class name, this class implementing IUser is used as user object's type.
			/// 	</summary>
			protected internal string tbl;

			protected internal string pk;

			protected internal string uname;

			protected internal string pswd;

			protected internal string iv;

			//		String clzz = "class-IUser";
			// = "a_user";
			// = "userId";
			// = "userName";
			// = "pswd";
			// = "encAuxiliary";
			public virtual io.odysz.semantic.jsession.JUser.JUserMeta userName(string unamefield
				)
			{
				uname = unamefield;
				return this;
			}

			public virtual io.odysz.semantic.jsession.JUser.JUserMeta iv(string ivfield)
			{
				iv = ivfield;
				return this;
			}

			public virtual io.odysz.semantic.jsession.JUser.JUserMeta pswd(string pswdfield)
			{
				pswd = pswdfield;
				return this;
			}
		}

		protected internal string ssid;

		protected internal string uid;

		private string pswd;

		private string usrName;

		private long touched;

		private string funcId;

		private string funcName;

		private static io.odysz.semantic.DATranscxt logsctx;

		static JUser()
		{
			string conn = io.odysz.common.Configs.getCfg("log-connId");
			if (io.odysz.common.LangExt.isblank(conn))
			{
				io.odysz.common.Utils.warn("ERROR\nERROR JUser need a log connection id configured in configs.xml, but get: "
					, conn);
			}
			try
			{
				logsctx = new io.odysz.semantic.DATranscxt(conn);
			}
			catch (System.Exception e)
			{
				Sharpen.Runtime.printStackTrace(e);
			}
		}

		/// <summary>Constructor for session login</summary>
		/// <param name="uid">user Id</param>
		/// <param name="pswd">pswd in DB (plain text)</param>
		/// <param name="usrName"/>
		/// <exception cref="io.odysz.transact.x.TransException"></exception>
		/// <exception cref="io.odysz.semantics.x.SemanticException"/>
		public JUser(string uid, string pswd, string usrName)
		{
			this.uid = uid;
			this.pswd = pswd;
			this.usrName = usrName;
			string rootK = io.odysz.semantic.DATranscxt.key("user-pswd");
			if (rootK == null)
			{
				throw new io.odysz.semantics.x.SemanticException("Session rootKey not initialized. Have checked context prameter like server's context.xml/Parameter/name='io.oz.root-key'?"
					);
			}
			// decrypt db-pswd-cipher with sys-key and db-iv => db-pswd
			//		try {
			//			if (iv == null || iv.trim().length() == 0) {
			//				// this record is not encrypted - for robustness
			//				this.pswd = pswd;
			//			}
			//			else {
			//				byte[] dbiv = AESHelper.decode64(iv);
			//				String plain = AESHelper.decrypt(pswd, rootK, dbiv);
			//				this.pswd = plain;
			//			}
			//		}
			//		catch (Throwable e) { throw new SemanticException (e.getMessage()); }
			this.pswd = pswd;
		}

		public virtual io.odysz.semantics.meta.TableMeta meta()
		{
			return new io.odysz.semantic.jsession.JUser.JUserMeta("a_user", io.odysz.semantic.jsession.AnSession
				.sctx.basiconnId());
		}

		/// <summary>
		/// jmsg should be what the response of
		/// <see cref="SSession"/>
		/// </summary>
		/// <param name="jmsg"/>
		public JUser(io.odysz.semantics.SemanticObject jmsg)
		{
			uid = jmsg.getString("uid");
		}

		public virtual string uid()
		{
			return uid;
		}

		public virtual System.Collections.Generic.List<string> dbLog(System.Collections.Generic.List
			<string> sqls)
		{
			return io.odysz.semantic.LoggingUser.genLog(logsctx, sqls, this, funcName, funcId
				);
		}

		public virtual void touch()
		{
			touched = Sharpen.Runtime.currentTimeMillis();
		}

		public virtual long touchedMs()
		{
			return touched;
		}

		public virtual io.odysz.semantics.IUser logAct(string funcName, string funcId)
		{
			this.funcName = funcName;
			this.funcId = funcId;
			return this;
		}

		public virtual string sessionId()
		{
			return ssid;
		}

		public virtual io.odysz.semantics.IUser sessionId(string skey)
		{
			return (io.odysz.semantics.IUser)put("s-key", skey);
		}

		/// <summary>Add notifyings</summary>
		/// <param name="n"/>
		/// <returns>this</returns>
		/// <exception cref="io.odysz.transact.x.TransException"></exception>
		public virtual io.odysz.semantic.jsession.JUser notify(object note)
		{
			return (io.odysz.semantic.jsession.JUser)add("_notifies_", note);
		}

		/// <summary>Get notified string list.</summary>
		/// <returns>notifyings</returns>
		public virtual System.Collections.Generic.IList<object> notifies()
		{
			return (System.Collections.Generic.IList<object>)get("_notifies_");
		}

		/// <exception cref="io.odysz.transact.x.TransException"/>
		public virtual bool login(object reqObj)
		{
			io.odysz.semantic.jsession.AnSessionReq req = (io.odysz.semantic.jsession.AnSessionReq
				)reqObj;
			// 1. encrypt db-uid with (db.pswd, j.iv) => pswd-cipher
			byte[] ssiv = io.odysz.common.AESHelper.decode64(req.iv);
			string c = null;
			try
			{
				c = io.odysz.common.AESHelper.encrypt(uid, pswd, ssiv);
			}
			catch (System.Exception e)
			{
				throw new io.odysz.transact.x.TransException(e.Message);
			}
			// 2. compare pswd-cipher with j.pswd
			if (c.Equals(req.token()))
			{
				touch();
				return true;
			}
			return false;
		}

		public virtual io.odysz.semantics.SemanticObject logout()
		{
			return new io.odysz.semantics.SemanticObject().code(io.odysz.semantic.jprotocol.AnsonMsg.MsgCode
				.ok.ToString());
		}
	}
}
