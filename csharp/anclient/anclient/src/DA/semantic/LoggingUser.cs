using Sharpen;

namespace io.odysz.semantic
{
	/// <summary>This robot handle logs of table a_log()</summary>
	/// <author>odys-z@github.com</author>
	public class LoggingUser : io.odysz.semantics.IUser
	{
		private io.odysz.semantic.DATranscxt logSemantic;

		private string uid;

		private io.odysz.semantics.SemanticObject action;

		private string sessionKey;

		public static io.odysz.semantics.IUser dumbUser;

		/// <param name="logConn"/>
		/// <param name="logCfgPath">e.g. "src/test/res/semantic-log.xml"</param>
		/// <param name="userId"/>
		/// <param name="action"/>
		public LoggingUser(string logConn, string logCfgPath, string userId, io.odysz.semantics.SemanticObject
			 action)
		{
			this.uid = userId;
			this.action = action;
			dumbUser = new _IUser_41();
			try
			{
				// DATranscxt.initConfigs(logConn, "src/test/res/semantic-log.xml");
				io.odysz.semantic.DATranscxt.loadSemantics(logConn, logCfgPath);
				logSemantic = new io.odysz.semantic.DATranscxt(logConn);
			}
			catch (System.Exception e)
			{
				//, DATranscxt.meta(logConn)); 
				Sharpen.Runtime.printStackTrace(e);
			}
		}

		private sealed class _IUser_41 : io.odysz.semantics.IUser
		{
			public _IUser_41()
			{
			}

			public io.odysz.semantics.meta.TableMeta meta()
			{
				return null;
			}

			public System.Collections.Generic.List<string> dbLog(System.Collections.Generic.List
				<string> sqls)
			{
				return null;
			}

			public string uid()
			{
				return "dummy";
			}

			public io.odysz.semantics.IUser logAct(string funcName, string funcId)
			{
				return null;
			}

			public string sessionKey()
			{
				return null;
			}

			public io.odysz.semantics.IUser sessionKey(string skey)
			{
				return null;
			}

			/// <exception cref="io.odysz.transact.x.TransException"/>
			public io.odysz.semantics.IUser notify(object note)
			{
				return null;
			}

			public System.Collections.Generic.IList<object> notifies()
			{
				return null;
			}
		}

		public virtual io.odysz.semantics.meta.TableMeta meta()
		{
			return null;
		}

		public virtual string uid()
		{
			return uid;
		}

		public virtual System.Collections.Generic.List<string> dbLog(System.Collections.Generic.List
			<string> sqls)
		{
			return genLog(logSemantic, sqls, this, action.getString("funcName"), action.getString
				("funcId"));
		}

		public static System.Collections.Generic.List<string> genLog(io.odysz.semantic.DATranscxt
			 logBuilder, System.Collections.Generic.List<string> sqls, io.odysz.semantics.IUser
			 commitUser, string funcName, string funcId)
		{
			// no exception can be thrown here, no error message for client if failed.
			try
			{
				// String newId = DASemantext.genId(Connects.defltConn(), "a_logs", "logId", null);
				// String sql = DatasetCfg.getSqlx(Connects.defltConn(), "log-template",
				//	// insert into a_logs(logId, oper, funcName, funcId, cmd, url, operDate, txt)
				//	// values ('%s', '%s', '%s', '%s', null, '%s', sysdate, '%s');
				//	newId, uid, funcName, funcId, cmd, url, String.valueOf(sqls.size()), txt(sqls));
				logBuilder.insert("a_logs", dumbUser).nv("oper", commitUser.uid()).nv("funcName", 
					funcName).nv("funcId", funcId).nv("cnt", Sharpen.Runtime.getStringValueOf(sqls.Count
					)).nv("txt", txt(sqls)).ins(logBuilder.basictx().clone(null));
			}
			catch (java.sql.SQLException e)
			{
				// dummy for stop recursive logging
				// Note: must cloned, otherwise there are resulved values.
				// failed case must be a bug - commitLog()'s exception already caught.
				io.odysz.common.Utils.warn("Wrong configuration can leads to this failure. Check includes:\n"
					 + "config.xml/k=log-connId value, make sure the connection is the correct for the semantics.xml."
					);
				Sharpen.Runtime.printStackTrace(e);
			}
			catch (io.odysz.transact.x.TransException e)
			{
				Sharpen.Runtime.printStackTrace(e);
			}
			return null;
		}

		private static string txt(System.Collections.Generic.List<string> sqls)
		{
			return sqls == null ? null : sqls.stream().map(@"TODO: Lambda Expression Ignored
e -> SQLString.formatSql(e)"
				).collect(java.util.stream.Collectors.joining(";"));
		}

		/// <exception cref="io.odysz.transact.x.TransException"/>
		public virtual bool login(object req)
		{
			return false;
		}

		public virtual string sessionId()
		{
			return null;
		}

		public virtual void touch()
		{
		}

		public virtual io.odysz.semantics.SemanticObject logout()
		{
			return null;
		}

		/// <exception cref="System.IO.IOException"/>
		public virtual void writeJsonRespValue(object writer)
		{
		}

		public virtual io.odysz.semantics.IUser logAct(string funcName, string funcId)
		{
			return this;
		}

		public virtual string sessionKey()
		{
			return sessionKey;
		}

		public virtual io.odysz.semantics.IUser sessionKey(string skey)
		{
			this.sessionKey = skey;
			return this;
		}

		/// <exception cref="io.odysz.transact.x.TransException"/>
		public virtual io.odysz.semantics.IUser notify(object note)
		{
			return null;
		}

		public virtual System.Collections.Generic.IList<object> notifies()
		{
			return null;
		}
	}
}
