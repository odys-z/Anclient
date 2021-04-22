using Sharpen;

namespace io.odysz.semantics
{
	/// <summary><p>Provide user e.g.</summary>
	/// <remarks>
	/// <p>Provide user e.g. servlet session information to modify some date in AST.</p>
	/// <p>This is not necessary if using semantic-transact directly. But if the caller
	/// want to set user information like fingerpirnt for modified records, this can be used
	/// to let semantic-transact providing user identity to the semantics handler.</p>
	/// </remarks>
	/// <author>ody</author>
	public interface IUser
	{
		meta.TableMeta meta();

		/// <summary>The sqls is committed to database, do something for logging.</summary>
		/// <remarks>
		/// The sqls is committed to database, do something for logging.
		/// If there are some operation needing to update db, return those sql statements.
		/// <p><b>Make sure the committed sqls is not returned, only logging sqls are needed.</b><br />
		/// If the parameter sqls is returned, it will be committed again because the semantic connection
		/// is think it's the logging sql.</p>
		/// </remarks>
		/// <param name="sqls"/>
		/// <returns>SQLs for logging</returns>
		List<string> dbLog(List<string> sqls);

		/// <summary>Check user log in (already has pswd, iv and user Id from db)</summary>
		/// <param name="request">request object. In sematic.jserv, it's SessionReq object.</param>
		/// <returns>true: ok; false: failed</returns>
		/// <exception cref="io.odysz.transact.x.TransException">Checking login information failed
		/// 	</exception>
		bool login(object request);

		string sessionId();

		/// <summary>Update last touched time stamp.</summary>
		void touch();

		/// <summary>
		/// Last touched time in milliseconds, set by
		/// <see cref="touch()"/>
		/// .<br />
		/// </summary>
		long touchedMs();

		// { return 20 * 60 * 1000; }
		/// <summary>user id</summary>
		string uid();

		IUser logAct(string funcName, string funcId);

		SemanticObject logout();

		/// <exception cref="System.IO.IOException"/>
		void writeJsonRespValue(object writer);

		// public String sessionId();
		IUser sessionId(string ssId);

		/// <summary>Add notifyings</summary>
		/// <param name="n"/>
		/// <returns>this</returns>
		/// <exception cref="io.odysz.transact.x.TransException"></exception>
		IUser notify(object note);

		/// <summary>Get notified string list.</summary>
		/// <returns>notifyings</returns>
		IList<object> notifies();
	}
}
