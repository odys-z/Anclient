//using Sharpen;
//using System.Collections.Generic;

//namespace io.odysz.semantics
//{
//	/// <summary>
//	/// <h6>Interface for Semantic Event Handler</h6>
//	/// <p>In short, an ISemantext is the statement runtime context for building sql.</p>
//	/// <p>A semantic event can be for example starting an insert transaction with a data row.
//	/// </summary>
//	/// <remarks>
//	/// <h6>Interface for Semantic Event Handler</h6>
//	/// <p>In short, an ISemantext is the statement runtime context for building sql.</p>
//	/// <p>A semantic event can be for example starting an insert transaction with a data row.
//	/// Such data may needing some processing defined by the application requirements.</p>
//	/// <p>For example, a "fullpath" field in a table means a deep first traveling notation of tree nodes.</p>
//	/// In this case, a user defined semantic event handler can compose this data (fullpath) according to it's parent's
//	/// fullpath, then append the field into the inserting row.</p>
//	/// <p>Semantic-transact is designed only process SQL structure, not handling the data semantics,
//	/// so it only fire the event to the handler, to the implementation of ISemantext. </p>
//	/// <p>An ISemantext instance is used as an sql composing context
//	/// by semantic-transact when travel the AST and composing SQL(s). There must be an
//	/// <see cref="insert(io.odysz.transact.sql.Insert, string, IUser[])"/>
//	/// event which fired at the beginning of composing an insert sql, and one event for inserting each row,
//	/// the
//	/// <see cref="onInsert(io.odysz.transact.sql.Insert, string, System.Collections.Generic.IList{E})
//	/// 	"/>
//	/// .</p>
//	/// </remarks>
//	/// <author>odys-z@github.com</author>
//	public interface ISemantext
//	{
//		/// <returns>current connId</returns>
//		string connId();

//		/// <summary>Set connId for committing statement.</summary>
//		/// <param name="conn"/>
//		/// <returns>this context</returns>
//		ISemantext ConnId(string conn);

//		/// <summary>
//		/// Called when starting a insert transaction's sql composing.<br />
//		/// Create a context for the insert-sql composing process.<br />
//		/// Parameter usr is optional if the semantics handler don't care about user's fingerprint.
//		/// </summary>
//		/// <param name="insert"/>
//		/// <param name="statemt"/>
//		/// <param name="mainTabl"/>
//		/// <param name="usr">user information used for modify sql AST</param>
//		/// <returns>the new ISemantext context instance for resolving semantics.</returns>
//		ISemantext insert(sql.Insert insert, string mainTabl, params IUser[] usr);

//		/// <summary>
//		/// Called when starting an update transaction sql composing.<br />
//		/// Create a context for the update-sql composing process.<br />
//		/// Parameter usr is optional if the semantics handler don't care about user's fingerprint.
//		/// </summary>
//		/// <param name="update"/>
//		/// <param name="mainTabl"/>
//		/// <param name="usr">user information used for modify sql AST</param>
//		/// <returns>new ISemantext for update statement</returns>
//		ISemantext update(sql.Update update, string mainTabl, params IUser[] usr);

//		/// <summary>
//		/// Called each time an &lt;@link Insert} statement found itself will composing a insert-sql (
//		/// <see cref="sql.Insert.sql(ISemantext)"/>
//		/// )<br />
//		/// Resolving inserting values, e.g an AUTO key is generated here.
//		/// </summary>
//		/// <param name="insert"/>
//		/// <param name="tabl"></param>
//		/// <param name="rows">[ list[Object[n, v], ... ], ... ]</param>
//		/// <returns>the ISemantext context, a thread safe context for resolving semantics like FK value resolving.<br />
//		/// 	</returns>
//		/// <exception cref="SemanticException"></exception>
//		/// <exception cref="TransException"/>
//		ISemantext onInsert(sql.Insert insert, string tabl, IList<List<object[]>> rows);

//		/// <summary>Called each time an &lt;@link Update} statement found itself will composing an update-sql.
//		/// 	</summary>
//		/// <param name="update"/>
//		/// <param name="tabl"/>
//		/// <param name="nvs"/>
//		/// <returns>the update context</returns>
//		/// <exception cref="SemanticException"></exception>
//		/// <exception cref="TransException"/>
//		ISemantext onUpdate(Update update, string tabl, List<object[]> nvs);

//		/// <exception cref="TransException"/>
//		ISemantext onDelete(Delete delete, string tabl,
//			sql.parts.condition.Condit whereCondt);

//		/// <summary>Handle wiring back resulved values, etc.</summary>
//		/// <remarks>
//		/// Handle wiring back resulved values, etc.
//		/// Called when all children sql generated (posts' commit() called).
//		/// </remarks>
//		/// <param name="stmt"/>
//		/// <param name="mainTabl"/>
//		/// <param name="row"/>
//		/// <param name="sqls"/>
//		/// <returns>this</returns>
//		/// <exception cref="io.odysz.transact.x.TransException">failed handling semantics</exception>
//		ISemantext onPost<_T0>(io.odysz.transact.sql.Statement<_T0> stmt
//			, string mainTabl, System.Collections.Generic.List<object[]> row, System.Collections.Generic.List
//			<string> sqls)
//			where _T0 : io.odysz.transact.sql.Statement<T>;

//		/// <summary>
//		/// Get results from handling semantics.<br />
//		/// Typically it's a new inserting records' auto Id,
//		/// which should usually let the caller / client know about it.
//		/// </summary>
//		/// <param name="table"/>
//		/// <param name="col"/>
//		/// <returns>RESULt resoLVED VALue in tabl.col, or null if not exists.</returns>
//		object resulvedVal(string table, string col);

//		/// <summary>
//		/// Get all the resolved results,
//		/// a.k.a return value of
//		/// <see cref="io.odysz.transact.sql.Statement{T}.doneOp(io.odysz.transact.sql.Statement.IPostOperat)
//		/// 	"/>
//		/// .
//		/// </summary>
//		SemanticObject resulves();

//		/// <summary>Get the dbtype handled by the context</summary>
//		/// <returns>db type</returns>
//		io.odysz.common.dbtype dbtype();

//		/// <summary>
//		/// Generate an auto increasing ID for tabl.col, where connection is initialized when constructing this implementation.<br />
//		/// The new generated value is managed in this implementation class (for future resolving).<br />
//		/// <b>side effect</b>: generated auto key already been put into autoVals, can be referenced later.
//		/// </summary>
//		/// <param name="tabl"/>
//		/// <param name="col"/>
//		/// <returns>new auto key.</returns>
//		/// <exception cref="java.sql.SQLException"/>
//		/// <exception cref="io.odysz.transact.x.TransException"/>
//		string genId(string tabl, string col);

//		/// <summary>Create a new instance for a semantics processing.</summary>
//		/// <param name="usr"></param>
//		/// <returns>new semantext instance</returns>
//		ISemantext clone(IUser usr);

//		meta.TableMeta colType(string tabl);

//		/// <summary>
//		/// Resolve the path for the file system (without file name) for the running environment
//		/// - typically resolved an absolute path to the WEB-INF/sub[0]/sub[1]/...
//		/// </summary>
//		/// <param name="sub"/>
//		/// <returns>
//		/// either a
//		/// <see cref="io.odysz.transact.sql.parts.Resulving">Resulving</see>
//		/// or a constant string
//		/// </returns>
//		/// <exception cref="io.odysz.transact.x.TransException">path resolving failed</exception>
//		string relativpath(params string[] sub);

//		/// <summary>
//		/// Get the container's runtime root path<br />
//		/// For servlet, return the absolute WEB-ROOT, for java application, return the starting relative dir.
//		/// </summary>
//		/// <returns>the root path</returns>
//		string containerRoot();

//		/// <summary>
//		/// When the commitment succeeded, there are still things must be done,
//		/// like deleting external files.
//		/// </summary>
//		/// <remarks>
//		/// When the commitment succeeded, there are still things must be done,
//		/// like deleting external files.
//		/// The operation's (instances of
//		/// <see cref="io.odysz.transact.sql.Statement.IPostOperat">ramda-expression</see>
//		/// are pushed into semantext while handling semantics, via
//		/// <see cref="addOnOkOperate(io.odysz.transact.sql.Statement.IPostOperat)"/>
//		/// .
//		/// </remarks>
//		/// <param name="ctx"/>
//		/// <exception cref="java.sql.SQLException"></exception>
//		/// <exception cref="io.odysz.transact.x.TransException"></exception>
//		void onCommitted(ISemantext ctx);

//		void addOnOkOperate(io.odysz.transact.sql.Statement.IPostOperat op);

//		/// <summary>On selected event handler, the chance that the resultset can be modified.
//		/// 	</summary>
//		/// <param name="resultset">any result object that can be understood by handler. e.g. SResultSet
//		/// 	</param>
//		/// <exception cref="java.sql.SQLException">iterating on resultset failed</exception>
//		/// <exception cref="io.odysz.transact.x.TransException">handling failed</exception>
//		void onSelected(object resultset);

//		/// <summary>Check is an operator already exists.</summary>
//		/// <param name="name">handler name</param>
//		/// <returns>true if has the named operater</returns>
//		bool hasOnSelectedHandler(string name);

//		/// <summary>Add an post selected operation.</summary>
//		/// <remarks>
//		/// Add an post selected operation.
//		/// <p>E.g. extFile Funcall will add a post file reading and replacing operation here.</p>
//		/// <p>Only one type of handler can be added to a context. Use
//		/// <see cref="hasOnSelectedHandler(string)"/>
//		/// to check is there a same type of handler already been added.</p>
//		/// <p>Operations are managed as a linked hash map. All rows are iterated and processed by
//		/// op one by one, from first to last, independently.</p>
//		/// <p>For each row, operations are iterated in the order of been added.</p>
//		/// </remarks>
//		/// <param name="op"/>
//		void addOnSelectedHandler(string name, io.odysz.transact.sql.Statement.IPostSelectOperat
//			 op);

//		/// <summary>
//		/// Compose the v provide by client into target table column's value represented in sql,
//		/// whether add single quote or not.<br />
//		/// <p>If v is an instance of string, add "'" according to db type;
//		/// if it is an instance of
//		/// <see cref="io.odysz.transact.sql.parts.AbsPart">AbsPart</see>
//		/// , return it directly.</p>
//		/// The null/empty values are handled differently according data meta.<br />
//		/// See the <a href='https://odys-z.github.io/notes/semantics/ref-transact.html#ref-transact-empty-vals'>discussions</a>.
//		/// </summary>
//		/// <param name="v"/>
//		/// <param name="tabl"/>
//		/// <param name="col"/>
//		/// <returns>the composed value object</returns>
//		io.odysz.transact.sql.parts.AbsPart composeVal(object v, string tabl, string col);
//	}
//}
