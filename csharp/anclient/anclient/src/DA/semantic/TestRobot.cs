using io.odysz.semantics;
using io.odysz.semantics.meta;
using System;

namespace io.odysz.semantic
{
	/// <summary>This robot is only used for test.</summary>
	/// <remarks>
	/// This robot is only used for test.
	/// If you are implementin a servlet without login, subclassing a
	/// <see cref="io.odysz.semantic.jserv.jsession.JUser">JUser</see>
	/// instead.
	/// </remarks>
	/// <author>odys-z@github.com</author>
	public class TestRobot : IUser
	{
		internal long touched;
        private string _sessionId;

        public virtual System.Collections.Generic.List<string> dbLog(System.Collections.Generic.List
			<string> sqls)
		{
			return null;
		}

		/// <exception cref="TransException"/>
		public virtual bool login(object request)
		{
			return true;
		}

		public virtual string sessionId()
		{
			return _sessionId;
		}
		public virtual IUser sessionId(string ssid)
        {
			_sessionId = ssid;
			return this;
        }

		public virtual void touch()
		{
			touched = DateTime.Now.Ticks;
		}

		public virtual long touchedMs()
		{
			return touched;
		}

		public virtual string uid()
		{
			return "jrobot";
		}

		public virtual SemanticObject logout()
		{
			return null;
		}

		/// <exception cref="System.IO.IOException"/>
		public virtual void writeJsonRespValue(object writer)
		{
		}

		public virtual IUser logAct(string funcName, string funcId)
		{
			return this;
		}

		public virtual string sessionKey()
		{
			return null;
		}

		public virtual IUser sessionKey(string skey)
		{
			return null;
		}

		/// <exception cref="TransException"/>
		public virtual IUser notify(object note)
		{
			return null;
		}

		public virtual System.Collections.Generic.IList<object> notifies()
		{
			return null;
		}

		public virtual TableMeta meta()
		{
			return null;
		}
	}
}
