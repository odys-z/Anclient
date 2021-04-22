using Sharpen;

namespace io.odysz.semantic
{
	/// <summary>
	/// <h2>The default semantics plugin used by semantic-DA.</h2>
	/// <p>
	/// The
	/// <see cref="DASemantext"/>
	/// use this to manage semantics configuration for
	/// resolving data semantics.
	/// </p>
	/// DASemantics is basically a
	/// <see cref="SemanticHandler"/>
	/// 's container, with subclass
	/// handlers handling different semantics (processing values).
	/// </p>
	/// <h3>What's DASemantics for?</h3>
	/// <p>
	/// Well, the word semantics is a computer science term. The author don't want to
	/// redefine this word, but here is some explanation what <i>semantic-DA</i> with
	/// <i>semantic-transact</i> is trying to support.
	/// </p>
	/// <p>
	/// In a typical relational database based application, the main operation of
	/// data is CRUD. And the most often such data operation can be abstracted to
	/// some operation pattern, and they are always organized as a database
	/// transaction/batch operation described in SQL.
	/// </p>
	/// <p>
	/// Take "book-author" relation for example, the author's ID is also the parent
	/// referenced by book's author FK. If trying to delete an author in DB, there
	/// are 2 typical policies can be applied by the application. The first is delete
	/// all books by the author accordingly; the second is warning and denying the
	/// operation if some books are referencing the author. Both of this must/can
	/// been organized into a transact/batch operation, with the second transact as
	/// check-then-delete.
	/// </p>
	/// <p>
	/// In this case, you will find the FK relationship can be handled in a
	/// generalized operation, through parameterizing some variables like table name,
	/// child referencing column name and parent ID.
	/// </p>
	/// <p>
	/// Take the
	/// <see cref="smtype.parentChildrenOnDel"/>
	/// for example, it's
	/// automatically support "deleting all children when deleting parent" semantics.
	/// What the user (application developer) need to do is configure a semantics
	/// item then delete the parent directly.
	/// </p>
	/// <p>
	/// Now you (a developer) will definitely understand what's the
	/// "parentChildrenOnDel" for. Semantic-DA abstract and hide these patterns,
	/// wrapped them automatically into a transaction. That's what semantic- DA want
	/// to do.
	/// </p>
	/// <h3>How to Use</h3>
	/// <p>
	/// To use this function:
	/// </p>
	/// <p>
	/// 1. Configure the "semantics.xml". See example in
	/// test/resources/semantics.xml.<br />
	/// 2. Set the configured semantics as context of
	/// <see cref="io.odysz.transact.sql.Statement{T}"/>
	/// . See example in
	/// <see cref="io.odysz.semantic.DASemantextTest"/>
	/// . Then use Statement's subclass's
	/// commit() method to generate SQLs
	/// </p>
	/// <h3>Is this Enough?</h3>
	/// <p>
	/// The 9 or 10 types of semantics defined in
	/// <see cref="smtype"/>
	/// is
	/// enough for some enterprise projects. It depends on how abstract the semantics
	/// we want to support. But it seems enough for us, at least now.
	/// </p>
	/// </p>
	/// Another consideration is that semantic-DA never take supporting all semantics
	/// logic as it's goal. It's only trying to release burden of daily repeated
	/// tasks. Fortunately, such tasks' logic is simple, and the burden is heavy. Let
	/// semantic-* handle these simple logic, that's semantic-* designed for. If the
	/// semantics is complex, use anything you are familiar with. But in this case
	/// semantic-* are still useful to do this tasks, if users are familiar with the
	/// lower level API.
	/// </p>
	/// <p>
	/// Before doing that, check the semantics-cheapflow workflow engine first, which
	/// is based on semantics-*, and can handle typical - not very cheap if by our
	/// define - logics all necessary for enterprise applications. It's a good
	/// example illustrating that if the semantics is designed carefully, those
	/// semantics supported by this pattern is enough.
	/// </p>
	/// <p>
	/// But it do needs the application developers follow some design conventions. If
	/// you need you own semantics implementation, implement the interface
	/// <see cref="io.odysz.semantics.ISemantext"/>
	/// , or simply initialize
	/// <see cref="io.odysz.transact.sql.Transcxt"/>
	/// with null semantics, which will
	/// disable semantic supporting. In that way, it's working as a structured sql
	/// composing API.
	/// </summary>
	/// <author>odys-z@github.com</author>
	public class DASemantics
	{
		/// <summary>error code key word</summary>
		public const string ERR_CHK = "err_smtcs";

		public static bool debug = true;

		/// <summary>Semantics type supported by DASemantics.</summary>
		/// <remarks>
		/// Semantics type supported by DASemantics. For each semantics example, see
		/// <a href='https://github.com/odys-z/semantic-DA/blob/master/semantic.DA/src/test/res/semantics.xml'>
		/// semantic.DA/test/semantics.xml</a><br />
		/// For semanticx.xml/s/smtc value, check the individual enum values:<br />
		/// <b>0.
		/// <see cref="autoInc"/>
		/// </b><br />
		/// <b>1.
		/// <see cref="fkIns"/>
		/// </b><br />
		/// <b>2.
		/// <see cref="fkCateIns"/>
		/// </b><br />
		/// <b>3.
		/// <see cref="fullpath"/>
		/// </b><br />
		/// <b>4.
		/// <see cref="defltVal"/>
		/// </b><br />
		/// <b>5.
		/// <see cref="parentChildrenOnDel"/>
		/// </b><br />
		/// <b>6.
		/// <see cref="#parentChildrenOnDelByTable"/>
		/// </b><br />
		/// <b>7.
		/// <see cref="dencrypt"/>
		/// </b><br />
		/// <b>8.
		/// <see cref="opTime"/>
		/// </b><br />
		/// <b>9.
		/// <see cref="checkSqlCountOnDel"/>
		/// </b><br />
		/// <b>10.
		/// <see cref="checkSqlCountOnInsert"/>
		/// </b><br />
		/// <b>11.
		/// <see cref="#checkDsCountOnDel"/>
		/// </b><br />
		/// <b>12.
		/// <see cref="postFk"/>
		/// </b><br />
		/// <b>13.
		/// <see cref="extFile"/>
		/// </b><br />
		/// <b>14.
		/// <see cref="composingCol"/>
		/// TODO</b><br />
		/// <b>15.
		/// <see cref="#stampUp1ThanDown"/>
		/// TODO</b><br />
		/// <b>16.
		/// <see cref="orclob"/>
		/// TODO</b><br />
		/// </remarks>
		[System.Serializable]
		public sealed class smtype
		{
			/// <summary>
			/// Auto Key<br />
			/// xml/smtc = "auto" | "pk" | "a-k" | "autopk" <br />
			/// Generate auto increased value for the field when inserting.<br />
			/// on-events: insert<br />
			/// <p>
			/// args: [0]: pk-field
			/// </p>
			/// Handler:
			/// <see cref="ShAutoK"/>
			/// </summary>
			public static readonly io.odysz.semantic.DASemantics.smtype autoInc = new io.odysz.semantic.DASemantics.smtype
				();

			/// <summary>
			/// xml/smtc = "fk" | "pkref" | "fk-ins"<br />
			/// <p>
			/// Automatically fill fk when inserting.
			/// </summary>
			/// <remarks>
			/// xml/smtc = "fk" | "pkref" | "fk-ins"<br />
			/// <p>
			/// Automatically fill fk when inserting. Only referenced auto pk can be
			/// resolved.
			/// </p>
			/// <p>
			/// args: 0 referencing col, 1 parent table, 2 parent pk
			/// </p>
			/// Handler:
			/// <see cref="ShFkOnIns"/>
			/// </remarks>
			public static readonly io.odysz.semantic.DASemantics.smtype fkIns = new io.odysz.semantic.DASemantics.smtype
				();

			/// <summary>
			/// xml/smtc = "fkc" | "f-i-c" | "fk-ins-cate"<br />
			/// <p>Automatically fill merged child fk when inserting.
			/// </summary>
			/// <remarks>
			/// xml/smtc = "fkc" | "f-i-c" | "fk-ins-cate"<br />
			/// <p>Automatically fill merged child fk when inserting.
			/// Only referenced auto pk can be resolved.</p>
			/// <p>About Merged Child Table:<br />
			/// Take the <i>attachements</i> table for external file's information for example,
			/// the a_attaches(See
			/// <a href='https://github.com/odys-z/semantic-DA/blob/master/semantic.DA/src/test/res'>
			/// sqlite test DB</a>) has a field, named 'busiId', referencing multiple parent table.
			/// The parent table is distinguished with filed busiTbl.
			/// </p>
			/// <p>args: 0 business cate (table name); 1 merged child fk; 2 parent table, 3 parent referee [, ...]</p>
			/// Handler:
			/// <see cref="ShFkInsCates"/>
			/// </remarks>
			public static readonly io.odysz.semantic.DASemantics.smtype fkCateIns = new io.odysz.semantic.DASemantics.smtype
				();

			/// <summary>
			/// xml/smtc = "f-p" | "fp" | "fullpath":<br />
			/// <p>args: 0: parent Id field, 1: sibling/sort field (optional), 2: fullpath field, 3: sort size (optional, default 2)
			/// <br />where sort size is the digital length for formatting fullpath string.</p>
			/// Handler:
			/// <see cref="ShFullpath"/>
			/// </summary>
			public static readonly io.odysz.semantic.DASemantics.smtype fullpath = new io.odysz.semantic.DASemantics.smtype
				();

			/// <summary>
			/// xml/smtc = "dv" | "d-v" | "dfltVal":<br />
			/// Handler:
			/// <see cref="ShDefltVal"/>
			/// </summary>
			public static readonly io.odysz.semantic.DASemantics.smtype defltVal = new io.odysz.semantic.DASemantics.smtype
				();

			/// <summary>
			/// "pc-del-all" | "parent-child-del-all" | "parentchildondel"<br />
			/// <pre>args: [pc-define, ...], where pc-define is a space sperated strings:
			/// pc-define[0] name or child referencing column, e.g.
			/// </summary>
			/// <remarks>
			/// "pc-del-all" | "parent-child-del-all" | "parentchildondel"<br />
			/// <pre>args: [pc-define, ...], where pc-define is a space sperated strings:
			/// pc-define[0] name or child referencing column, e.g. domainId for a_domain.domainId
			/// pc-define[1] child table, e.g. a_orgs
			/// pc-define[2] child fk (or condition column), e.g. orgType
			/// Example: domainId a_orgs orgType, ...
			/// When deleting a_domain, the sql of the results shall be:
			/// delete from a_orgs where orgType in (select domainId from a_domain where domainId = '000001')
			/// where the 'where clause' in select clause is composed from condition of the delete request's where condition.
			/// </pre>
			/// Handler:
			/// <see cref="ShPCDelAll"/>
			/// </remarks>
			public static readonly io.odysz.semantic.DASemantics.smtype parentChildrenOnDel = 
				new io.odysz.semantic.DASemantics.smtype();

			/// <summary>
			/// "pc-del-tbl" | "pc-del-by-tbl" | "pc-tbl"<br />
			/// <pre>args: [pc-define, ...], where pc-define is a space sperated strings:
			/// pc-define[0] name or child referencing column (a_domain.domainId's value will be used)
			/// pc-define[1] child table
			/// pc-define[2] child fk (or condition column)
			/// pc-define[3] child cate (e.g.
			/// </summary>
			/// <remarks>
			/// "pc-del-tbl" | "pc-del-by-tbl" | "pc-tbl"<br />
			/// <pre>args: [pc-define, ...], where pc-define is a space sperated strings:
			/// pc-define[0] name or child referencing column (a_domain.domainId's value will be used)
			/// pc-define[1] child table
			/// pc-define[2] child fk (or condition column)
			/// pc-define[3] child cate (e.g. table name)
			/// Example: domainId a_orgs orgType, ...
			/// The sql of the results shall be:
			/// delete from a_orgs where orgType in (select domainId from a_domain where domainId = '000001')
			/// where the 'where clause' in select clause is composed from condition of the delete request's where condition.
			/// </pre>
			/// Handler:
			/// <see cref="ShPCDelByTbl"/>
			/// </remarks>
			public static readonly io.odysz.semantic.DASemantics.smtype parentChildrenOnDelByTabl
				 = new io.odysz.semantic.DASemantics.smtype();

			/// <summary>
			/// "d-e" | "de-encrypt" | "dencrypt":<br />
			/// decrypt then encrypt (target col cannot be pk or anything other semantics
			/// will updated<br />
			/// Handler:
			/// <see cref="ShDencrypt"/>
			/// </summary>
			public static readonly io.odysz.semantic.DASemantics.smtype dencrypt = new io.odysz.semantic.DASemantics.smtype
				();

			/// <summary>
			/// xml/smtc = "o-t" | "oper-time" | "optime"<br />
			/// Finger printing session user's db updating - record operator / oper-time<br />
			/// Handler:
			/// <see cref="ShOperTime"/>
			/// </summary>
			public static readonly io.odysz.semantic.DASemantics.smtype opTime = new io.odysz.semantic.DASemantics.smtype
				();

			/// <summary>
			/// "ck-cnt-del" | "check-count-del" | "checksqlcountondel":<br />
			/// check is this record a referee of children records - results from
			/// sql.select(count, description-args ...).
			/// </summary>
			/// <remarks>
			/// "ck-cnt-del" | "check-count-del" | "checksqlcountondel":<br />
			/// check is this record a referee of children records - results from
			/// sql.select(count, description-args ...). The record(s) can't been deleted if
			/// referenced;<br />
			/// <pre>
			/// [0] name or child referencing column (a_domain.domainId's value will be used)
			/// [1] child table
			/// [2] child pk (or condition column)
			/// Example: domainId a_orgs orgType, ...
			/// The sql of the results shall be:
			/// select count(orgType) from a_orgs where orgType in (select domainId from a_domain where domainId = '000001')
			/// where the 'where clause' in select clause is composed from condition of the delete request's where condition.
			/// </pre>
			/// where args are column name of parent table.
			/// </p>
			/// Handler:
			/// <see cref="ShChkSqlCntDel"/>
			/// </remarks>
			public static readonly io.odysz.semantic.DASemantics.smtype checkSqlCountOnDel = 
				new io.odysz.semantic.DASemantics.smtype();

			/// <summary>
			/// "ck-cnt-ins" | "check-count-ins" | "checksqlcountoninsert":<br />
			/// Check is this record count when inserting - results from
			/// sql.select(count-sql, description-args ...).
			/// </summary>
			/// <remarks>
			/// "ck-cnt-ins" | "check-count-ins" | "checksqlcountoninsert":<br />
			/// Check is this record count when inserting - results from
			/// sql.select(count-sql, description-args ...). The record(s) can't been
			/// inserted if count &gt; 0;<br />
			/// <p>
			/// args: [0] arg1, [1] arg2, ..., [len -1] count-sql with "%s" formatter<br />
			/// where args are column name of parent table.
			/// </p>
			/// Handler:
			/// <see cref="ShChkCntInst"/>
			/// </remarks>
			public static readonly io.odysz.semantic.DASemantics.smtype checkSqlCountOnInsert
				 = new io.odysz.semantic.DASemantics.smtype();

			/// <summary>
			/// "p-f" | "p-fk" | "post-fk"<br />
			/// <p>
			/// <b>semantics:</b><br />
			/// post fk wire back - parent has an fk to child (only one
			/// child makes sense, like making cross refs)
			/// </p>
			/// <p>
			/// <b>Note:</b><br />
			/// This semantics works only when previously resolved auto key exists; if the
			/// value doesn't exist, will be ignored.<br />
			/// The former is the case of inserting new child, and parent refer to it; the
			/// later is the case of updating a child, the parent already has it's pk,
			/// nothing should be done.
			/// </summary>
			/// <remarks>
			/// "p-f" | "p-fk" | "post-fk"<br />
			/// <p>
			/// <b>semantics:</b><br />
			/// post fk wire back - parent has an fk to child (only one
			/// child makes sense, like making cross refs)
			/// </p>
			/// <p>
			/// <b>Note:</b><br />
			/// This semantics works only when previously resolved auto key exists; if the
			/// value doesn't exist, will be ignored.<br />
			/// The former is the case of inserting new child, and parent refer to it; the
			/// later is the case of updating a child, the parent already has it's pk,
			/// nothing should be done.
			/// </p>
			/// <p>
			/// <b>Further Discussion:</b><br />
			/// As cross reference is not a good ideal, this semantics sometimes leads to
			/// trouble. Any suggestion or comments are welcome.
			/// </p>
			/// <p>
			/// <b>args:</b> 0 referencing col, 1 target table, 2 target pk(must be an auto
			/// key)
			/// </p>
			/// <b>Handler:</b>
			/// <see cref="ShPostFk"/>
			/// </remarks>
			public static readonly io.odysz.semantic.DASemantics.smtype postFk = new io.odysz.semantic.DASemantics.smtype
				();

			/// <summary>
			/// Attach Attachments to Attaching Table (saving file in file system)<br />
			/// xml/smtc = "ef" | "xf" | "ext-file" | "e-f" | "x-f" <br />
			/// Take the update statement's file field as a separated file clob (base 64
			/// encoded).
			/// </summary>
			/// <remarks>
			/// Attach Attachments to Attaching Table (saving file in file system)<br />
			/// xml/smtc = "ef" | "xf" | "ext-file" | "e-f" | "x-f" <br />
			/// Take the update statement's file field as a separated file clob (base 64
			/// encoded). When updating, save it to file system, then replace the nv's v with
			/// filename<br />
			/// on-events: insert, update<br />
			/// <p>
			/// args 0: uploads, 1: uri, 2: busiTbl, 3: busiId, 4: client-name (optional)<br />
			/// Handler:
			/// <see cref="ShExtFile"/>
			/// <br />
			/// <h5>About Updating Handling</h5>
			/// <p>On updating external files handler.</p>
			/// <p>This method only throw an exception currently, applying the semantics predefined as:<br />
			/// AS all files are treaded as binary file, no file can be modified, only delete then create it makes sense.</p>
			/// <p>Client should avoid updating an external file will handling business logics.</p>
			/// <p><b>NOTE:</b><br />This can be changed in the future.</p>
			/// Attechment info's table sql (mysql)
			/// <pre>CREATE TABLE `a_attaches` (
			/// `attId` varchar(20) COLLATE utf8mb4_bin NOT NULL,
			/// `attName` varchar(50) CHARACTER SET utf8mb4 DEFAULT NULL,
			/// `subPath` varchar(100) COLLATE utf8mb4_bin DEFAULT NULL,
			/// `busiTbl` varchar(50) COLLATE utf8mb4_bin DEFAULT NULL,
			/// `recId` varchar(20) COLLATE utf8mb4_bin DEFAULT NULL,
			/// `oper` varchar(20) COLLATE utf8mb4_bin DEFAULT NULL,
			/// `optime` datetime DEFAULT NULL,
			/// PRIMARY KEY (`attId`)
			/// ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin
			/// </pre>
			/// sqlite:
			/// <pre>
			/// CREATE TABLE a_attaches (
			/// attId TEXT NOT NULL,
			/// attName TEXT,
			/// uri TEXT,
			/// busiTbl TEXT,
			/// busiId TEXT,
			/// oper TEXT,
			/// optime DATETIME,
			/// CONSTRAINT a_attaches_PK PRIMARY KEY (attId)) ;
			/// </pre>
			/// </remarks>
			public static readonly io.odysz.semantic.DASemantics.smtype extFile = new io.odysz.semantic.DASemantics.smtype
				();

			/// <summary>
			/// "cmp-col" | "compose-col" | "compse-column": compose a column from other
			/// columns;<br />
			/// TODO
			/// </summary>
			public static readonly io.odysz.semantic.DASemantics.smtype composingCol = new io.odysz.semantic.DASemantics.smtype
				();

			/// <summary>
			/// TODO
			/// "s-up1" | "stamp-up1": add 1 more second to down-stamp column and save to
			/// up-stamp<br />
			/// UpdateBatch supporting:<br />
			/// on inserting, up-stamp is the value of increased down stamp, or current time
			/// if it's not usable;<br />
			/// on updating, up-stamp is set as down stamp increased if down stamp value not
			/// presented in sql, or, up stamp will be ignored if down stamp presented.
			/// </summary>
			/// <remarks>
			/// TODO
			/// "s-up1" | "stamp-up1": add 1 more second to down-stamp column and save to
			/// up-stamp<br />
			/// UpdateBatch supporting:<br />
			/// on inserting, up-stamp is the value of increased down stamp, or current time
			/// if it's not usable;<br />
			/// on updating, up-stamp is set as down stamp increased if down stamp value not
			/// presented in sql, or, up stamp will be ignored if down stamp presented. (use
			/// case of down stamp updating by synchronizer).<br />
			/// </remarks>
			public static readonly io.odysz.semantic.DASemantics.smtype stamp1MoreThanRefee = 
				new io.odysz.semantic.DASemantics.smtype();

			/// <summary>
			/// "clob" | "orclob": the column is a CLOB field, semantic-transact will
			/// read/write separately in stream and get final results.<br />
			/// Handler: TODO?
			/// </summary>
			public static readonly io.odysz.semantic.DASemantics.smtype orclob = new io.odysz.semantic.DASemantics.smtype
				();

			/// <summary>Note: we don't use enum.valueOf(), because of fault / fuzzy tolerate.</summary>
			/// <param name="type"/>
			/// <returns>
			/// 
			/// <see cref="smtype"/>
			/// </returns>
			/// <exception cref="io.odysz.semantics.x.SemanticException"/>
			public static io.odysz.semantic.DASemantics.smtype parse(string type)
			{
				if (type == null)
				{
					throw new io.odysz.semantics.x.SemanticException("semantics is null");
				}
				type = type.ToLower().Trim();
				if ("auto".Equals(type) || "pk".Equals(type) || "a-k".Equals(type) || "autopk".Equals
					(type))
				{
					return io.odysz.semantic.DASemantics.smtype.autoInc;
				}
				else
				{
					if ("fk".Equals(type) || "pkref".Equals(type) || "fk-ins".Equals(type))
					{
						return io.odysz.semantic.DASemantics.smtype.fkIns;
					}
					else
					{
						if ("fk-ins-cate".Equals(type) || "f-i-c".Equals(type) || "fkc".Equals(type))
						{
							return io.odysz.semantic.DASemantics.smtype.fkCateIns;
						}
						else
						{
							if ("fp".Equals(type) || "f-p".Equals(type) || "fullpath".Equals(type))
							{
								return io.odysz.semantic.DASemantics.smtype.fullpath;
							}
							else
							{
								if ("dfltVal".Equals(type) || "d-v".Equals(type) || "dv".Equals(type))
								{
									return io.odysz.semantic.DASemantics.smtype.defltVal;
								}
								else
								{
									if ("pc-del-all".Equals(type) || "parent-child-del-all".Equals(type) || "parentchildondel"
										.Equals(type))
									{
										return io.odysz.semantic.DASemantics.smtype.parentChildrenOnDel;
									}
									else
									{
										if ("pc-del-tbl".Equals(type) || "pc-del-by-tabl".Equals(type) || "pc-tbl".Equals
											(type))
										{
											return io.odysz.semantic.DASemantics.smtype.parentChildrenOnDelByTabl;
										}
										else
										{
											if ("d-e".Equals(type) || "de-encrypt".Equals(type) || "dencrypt".Equals(type))
											{
												return io.odysz.semantic.DASemantics.smtype.dencrypt;
											}
											else
											{
												if ("o-t".Equals(type) || "oper-time".Equals(type) || "optime".Equals(type))
												{
													return io.odysz.semantic.DASemantics.smtype.opTime;
												}
												else
												{
													if ("ck-cnt-del".Equals(type) || "check-count-del".Equals(type) || "checksqlcountondel"
														.Equals(type))
													{
														return io.odysz.semantic.DASemantics.smtype.checkSqlCountOnDel;
													}
													else
													{
														if ("ck-cnt-ins".Equals(type) || "check-count-ins".Equals(type) || "checksqlcountoninsert"
															.Equals(type))
														{
															return io.odysz.semantic.DASemantics.smtype.checkSqlCountOnInsert;
														}
														else
														{
															if ("p-f".Equals(type) || "p-fk".Equals(type) || "post-fk".Equals(type))
															{
																return io.odysz.semantic.DASemantics.smtype.postFk;
															}
															else
															{
																if ("cmp-col".Equals(type) || "compose-col".Equals(type) || "compse-column".Equals
																	(type) || "composingcol".Equals(type))
																{
																	return io.odysz.semantic.DASemantics.smtype.composingCol;
																}
																else
																{
																	if ("s-up1".Equals(type) || type.StartsWith("stamp1"))
																	{
																		return io.odysz.semantic.DASemantics.smtype.stamp1MoreThanRefee;
																	}
																	else
																	{
																		if ("clob".Equals(type) || "orclob".Equals(type))
																		{
																			return io.odysz.semantic.DASemantics.smtype.orclob;
																		}
																		else
																		{
																			if ("ef".Equals(type) || "e-f".Equals(type) || "ext-file".Equals(type) || "xf".Equals
																				(type) || "x-f".Equals(type))
																			{
																				return io.odysz.semantic.DASemantics.smtype.extFile;
																			}
																			else
																			{
																				throw new io.odysz.semantics.x.SemanticException("semantics not known, type: " + 
																					type);
																			}
																		}
																	}
																}
															}
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}

		/// <summary>
		/// [table, DASeamtnics]<br />
		/// This is not static because there are many connections
		/// </summary>
		private System.Collections.Generic.Dictionary<string, io.odysz.semantic.DASemantics
			> ss;

		/// <summary>
		/// Static transact context for DB accessing without semantics support.<br />
		/// Used to generate auto ID.
		/// </summary>
		private io.odysz.transact.sql.Transcxt basicTsx;

		public virtual io.odysz.semantic.DASemantics get(string tabl)
		{
			return ss == null ? null : ss[tabl];
		}

		private System.Collections.Generic.List<io.odysz.semantic.DASemantics.SemanticHandler
			> handlers;

		private string tabl;

		private string pk;

		public static bool verbose = false;

		public DASemantics(io.odysz.transact.sql.Transcxt basicTx, string tabl, string recId
			)
		{
			this.tabl = tabl;
			this.pk = recId;
			basicTsx = basicTx;
			handlers = new System.Collections.Generic.List<io.odysz.semantic.DASemantics.SemanticHandler
				>();
		}

		/// <exception cref="io.odysz.semantics.x.SemanticException"/>
		/// <exception cref="java.sql.SQLException"/>
		public virtual void addHandler(io.odysz.semantic.DASemantics.smtype semantic, string
			 tabl, string recId, string[] args)
		{
			checkParas(tabl, pk, args);
			if (isDuplicate(tabl, semantic))
			{
				return;
			}
			io.odysz.semantic.DASemantics.SemanticHandler handler = null;
			if (io.odysz.semantic.DASemantics.smtype.fullpath == semantic)
			{
				handler = new io.odysz.semantic.DASemantics.ShFullpath(basicTsx, tabl, recId, args
					);
			}
			else
			{
				if (io.odysz.semantic.DASemantics.smtype.autoInc == semantic)
				{
					handler = new io.odysz.semantic.DASemantics.ShAutoK(basicTsx, tabl, recId, args);
				}
				else
				{
					if (io.odysz.semantic.DASemantics.smtype.fkIns == semantic)
					{
						handler = new io.odysz.semantic.DASemantics.ShFkOnIns(basicTsx, tabl, recId, args
							);
					}
					else
					{
						if (io.odysz.semantic.DASemantics.smtype.fkCateIns == semantic)
						{
							handler = new io.odysz.semantic.DASemantics.ShFkInsCates(basicTsx, tabl, recId, args
								);
						}
						else
						{
							if (io.odysz.semantic.DASemantics.smtype.parentChildrenOnDel == semantic)
							{
								handler = new io.odysz.semantic.DASemantics.ShPCDelAll(basicTsx, tabl, recId, args
									);
							}
							else
							{
								if (io.odysz.semantic.DASemantics.smtype.parentChildrenOnDelByTabl == semantic)
								{
									handler = new io.odysz.semantic.DASemantics.ShPCDelByCate(basicTsx, tabl, recId, 
										args);
								}
								else
								{
									if (io.odysz.semantic.DASemantics.smtype.defltVal == semantic)
									{
										handler = new io.odysz.semantic.DASemantics.ShDefltVal(basicTsx, tabl, recId, args
											);
									}
									else
									{
										if (io.odysz.semantic.DASemantics.smtype.dencrypt == semantic)
										{
											handler = new io.odysz.semantic.DASemantics.ShDencrypt(basicTsx, tabl, recId, args
												);
										}
										else
										{
											if (io.odysz.semantic.DASemantics.smtype.opTime == semantic)
											{
												handler = new io.odysz.semantic.DASemantics.ShOperTime(basicTsx, tabl, recId, args
													);
											}
											else
											{
												if (io.odysz.semantic.DASemantics.smtype.checkSqlCountOnDel == semantic)
												{
													handler = new io.odysz.semantic.DASemantics.ShChkCntDel(basicTsx, tabl, recId, args
														);
												}
												else
												{
													if (io.odysz.semantic.DASemantics.smtype.checkSqlCountOnInsert == semantic)
													{
														handler = new io.odysz.semantic.DASemantics.ShChkPCInsert(basicTsx, tabl, recId, 
															args);
													}
													else
													{
														if (io.odysz.semantic.DASemantics.smtype.postFk == semantic)
														{
															handler = new io.odysz.semantic.DASemantics.ShPostFk(basicTsx, tabl, recId, args);
														}
														else
														{
															if (io.odysz.semantic.DASemantics.smtype.extFile == semantic)
															{
																handler = new io.odysz.semantic.DASemantics.ShExtFile(basicTsx, tabl, recId, args
																	);
															}
															else
															{
																throw new io.odysz.semantics.x.SemanticException("Unsuppported semantics: " + semantic
																	);
															}
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
			if (debug)
			{
				handler.logi();
			}
			handlers.add(handler);
		}

		public virtual io.odysz.semantic.DASemantics.SemanticHandler handler(io.odysz.semantic.DASemantics.smtype
			 sm)
		{
			if (handlers == null)
			{
				return null;
			}
			foreach (io.odysz.semantic.DASemantics.SemanticHandler h in handlers)
			{
				if (h.@is(sm))
				{
					return h;
				}
			}
			return null;
		}

		/// <summary>Throw exception if args is null or target (table) not correct.</summary>
		/// <param name="tabl"/>
		/// <param name="pk"/>
		/// <param name="args"/>
		/// <exception cref="io.odysz.semantics.x.SemanticException">sementic configuration not matching the target or lack of args.
		/// 	</exception>
		private void checkParas(string tabl, string pk, string[] args)
		{
			if (tabl == null || pk == null || args == null || args.Length == 0)
			{
				throw new io.odysz.semantics.x.SemanticException(string.format("adding semantics with empty targets? %s %s %s"
					, tabl, pk, args));
			}
			if (this.tabl != null && !this.tabl.Equals(tabl))
			{
				throw new io.odysz.semantics.x.SemanticException(string.format("adding semantics for different target? %s vs. %s"
					, this.tabl, tabl));
			}
			if (this.pk != null && !this.pk.Equals(pk))
			{
				throw new io.odysz.semantics.x.SemanticException(string.format("adding semantics for target of diferent id field? %s vs. %s"
					, this.pk, pk));
			}
		}

		/// <summary>Check is the semantics duplicated?</summary>
		/// <param name="tabl"/>
		/// <param name="newSmtcs"/>
		/// <returns>false no duplicating, true duplicated</returns>
		/// <exception cref="io.odysz.semantics.x.SemanticException"/>
		private bool isDuplicate(string tabl, io.odysz.semantic.DASemantics.smtype newSmtcs
			)
		{
			if (handlers == null)
			{
				return false;
			}
			foreach (io.odysz.semantic.DASemantics.SemanticHandler handler in handlers)
			{
				if (handler.sm == newSmtcs && newSmtcs != io.odysz.semantic.DASemantics.smtype.fkIns
					 && newSmtcs != io.odysz.semantic.DASemantics.smtype.postFk)
				{
					io.odysz.common.Utils.warn("Found duplicate semantics: %s %s\n" + "Details: All semantics configuration is merged into 1 static copy. Each table in every connection can only have one instance of the same smtype."
						, tabl, newSmtcs.ToString());
					return true;
				}
			}
			return false;
		}

		public virtual bool has(io.odysz.semantic.DASemantics.smtype sm)
		{
			if (handlers != null)
			{
				foreach (io.odysz.semantic.DASemantics.SemanticHandler handler in handlers)
				{
					if (handler.sm == sm)
					{
						return true;
					}
				}
			}
			return false;
		}

		/// <exception cref="io.odysz.semantics.x.SemanticException"/>
		public virtual void onInsert(io.odysz.semantics.ISemantext semantx, io.odysz.transact.sql.Insert
			 statemt, System.Collections.Generic.List<object[]> row, System.Collections.Generic.IDictionary
			<string, int> cols, io.odysz.semantics.IUser usr)
		{
			if (handlers != null)
			{
				foreach (io.odysz.semantic.DASemantics.SemanticHandler handler in handlers)
				{
					if (handler.insert)
					{
						handler.onInsert(semantx, statemt, row, cols, usr);
					}
				}
			}
		}

		/// <exception cref="io.odysz.semantics.x.SemanticException"/>
		public virtual void onUpdate(io.odysz.semantics.ISemantext semantx, io.odysz.transact.sql.Update
			 satemt, System.Collections.Generic.List<object[]> row, System.Collections.Generic.IDictionary
			<string, int> cols, io.odysz.semantics.IUser usr)
		{
			if (handlers != null)
			{
				foreach (io.odysz.semantic.DASemantics.SemanticHandler handler in handlers)
				{
					if (handler.update)
					{
						handler.onUpdate(semantx, satemt, row, cols, usr);
					}
				}
			}
		}

		/// <exception cref="io.odysz.semantics.x.SemanticException"/>
		public virtual void onDelete<_T0>(io.odysz.semantics.ISemantext semantx, io.odysz.transact.sql.Statement
			<_T0> stmt, io.odysz.transact.sql.parts.condition.Condit whereCondt, io.odysz.semantics.IUser
			 usr)
			where _T0 : io.odysz.transact.sql.Statement<object>
		{
			if (handlers != null)
			{
				foreach (io.odysz.semantic.DASemantics.SemanticHandler handler in handlers)
				{
					if (handler.delete)
					{
						handler.onDelete(semantx, stmt, whereCondt, usr);
					}
				}
			}
		}

		/// <exception cref="io.odysz.semantics.x.SemanticException"/>
		public virtual void onPost<_T0>(io.odysz.semantic.DASemantext sx, io.odysz.transact.sql.Statement
			<_T0> stmt, System.Collections.Generic.List<object[]> row, System.Collections.Generic.IDictionary
			<string, int> cols, io.odysz.semantics.IUser usr, System.Collections.Generic.List
			<string> sqlBuf)
			where _T0 : io.odysz.transact.sql.Statement<object>
		{
			if (handlers != null)
			{
				foreach (io.odysz.semantic.DASemantics.SemanticHandler handler in handlers)
				{
					if (handler.post)
					{
						handler.onPost(sx, stmt, row, cols, usr, sqlBuf);
					}
				}
			}
		}

		internal abstract class SemanticHandler
		{
			internal bool insert = false;

			internal bool update = false;

			internal bool delete = false;

			internal bool post = false;

			internal string target;

			internal string pkField;

			internal string[] args;

			protected internal io.odysz.transact.sql.Transcxt trxt;

			protected internal io.odysz.semantic.DASemantics.smtype sm;

			/// <exception cref="io.odysz.semantics.x.SemanticException"/>
			internal SemanticHandler(io.odysz.transact.sql.Transcxt trxt, string semantic, string
				 tabl, string pk, string[] args)
			{
				this.trxt = trxt;
				target = tabl;
				pkField = pk;
			}

			public virtual void logi()
			{
				io.odysz.common.Utils.logi("Semantics Handler %s\ntabl %s, pk %s, args %s", sm.ToString
					(), target, pkField, io.odysz.common.LangExt.toString(args));
			}

			/// <exception cref="io.odysz.semantics.x.SemanticException"/>
			internal virtual void onInsert(io.odysz.semantics.ISemantext stx, io.odysz.transact.sql.Insert
				 insrt, System.Collections.Generic.List<object[]> row, System.Collections.Generic.IDictionary
				<string, int> cols, io.odysz.semantics.IUser usr)
			{
			}

			/// <exception cref="io.odysz.semantics.x.SemanticException"/>
			internal virtual void onUpdate(io.odysz.semantics.ISemantext stx, io.odysz.transact.sql.Update
				 updt, System.Collections.Generic.List<object[]> row, System.Collections.Generic.IDictionary
				<string, int> cols, io.odysz.semantics.IUser usr)
			{
			}

			/// <summary>Handle onDelete event.</summary>
			/// <param name="stx"/>
			/// <param name="stmt"/>
			/// <param name="whereCondt">delete statement's condition.</param>
			/// <param name="usr"/>
			/// <exception cref="io.odysz.semantics.x.SemanticException"/>
			/// <exception cref="java.sql.SQLException"></exception>
			internal virtual void onDelete<_T0>(io.odysz.semantics.ISemantext stx, io.odysz.transact.sql.Statement
				<_T0> stmt, io.odysz.transact.sql.parts.condition.Condit whereCondt, io.odysz.semantics.IUser
				 usr)
				where _T0 : io.odysz.transact.sql.Statement<object>
			{
			}

			/// <exception cref="io.odysz.semantics.x.SemanticException"/>
			internal virtual void onPost<_T0>(io.odysz.semantic.DASemantext sm, io.odysz.transact.sql.Statement
				<_T0> stmt, System.Collections.Generic.List<object[]> row, System.Collections.Generic.IDictionary
				<string, int> cols, io.odysz.semantics.IUser usr, System.Collections.Generic.List
				<string> sqlBuf)
				where _T0 : io.odysz.transact.sql.Statement<object>
			{
			}

			/// <exception cref="io.odysz.semantics.x.SemanticException"/>
			internal SemanticHandler(io.odysz.transact.sql.Transcxt trxt, io.odysz.semantic.DASemantics.smtype
				 sm, string tabl, string pk, string[] args)
			{
				this.trxt = trxt;
				target = tabl;
				pkField = pk;
				this.sm = sm;
				this.args = args;
			}

			public static string[][] split(string[] ss)
			{
				if (ss == null)
				{
					return null;
				}
				string[][] argss = new string[ss.Length][];
				for (int ix = 0; ix < ss.Length; ix++)
				{
					string[] args = io.odysz.common.LangExt.split(ss[ix], "\\s+");
					argss[ix] = args;
				}
				return argss;
			}

			/// <summary>Expand the row to the size of cols - in case the cols expanded by semantics handling
			/// 	</summary>
			/// <param name="row">row to expand</param>
			/// <param name="cols">column index</param>
			/// <returns>the row expanded</returns>
			internal static System.Collections.Generic.List<object[]> expandRow(System.Collections.Generic.List
				<object[]> row, System.Collections.Generic.IDictionary<string, int> cols)
			{
				if (row == null || cols == null || row.Count >= cols.Count)
				{
					return row;
				}
				int size0 = row.Count;
				for (int cx = size0; cx < cols.Count; cx++)
				{
					row.add(new object[] { null, null });
				}
				foreach (string col in cols.Keys)
				{
					if (cols[col] >= size0)
					{
						row.set(cols[col], new object[] { col, null });
					}
				}
				return row;
			}

			public virtual bool @is(io.odysz.semantic.DASemantics.smtype sm)
			{
				return this.sm == sm;
			}
		}

		/// <summary>
		/// When updating, auto update fullpath field according to parent-id and current
		/// record id<br />
		/// args 0: parent Id field, 1: sibling/sort field (optional), 2: fullpath field
		/// </summary>
		/// <author>odys-z@github.com</author>
		internal class ShFullpath : io.odysz.semantic.DASemantics.SemanticHandler
		{
			private static string faqPage = "https://odys-z.github.io/notes/semantics/best-practices.html#DA-concept-fullpath";

			private int siblingSize;

			/// <param name="tabl"/>
			/// <param name="recId"/>
			/// <param name="args">
			/// see
			/// <see cref="smtype.fullpath"/>
			/// </param>
			/// <exception cref="io.odysz.semantics.x.SemanticException"/>
			public ShFullpath(io.odysz.transact.sql.Transcxt trxt, string tabl, string recId, 
				string[] args)
				: base(trxt, io.odysz.semantic.DASemantics.smtype.fullpath, tabl, recId, args)
			{
				insert = true;
				update = true;
				siblingSize = 2;
				if (args.Length >= 4)
				{
					try
					{
						siblingSize = int.Parse(args[3]);
					}
					catch (System.Exception)
					{
					}
				}
			}

			/// <exception cref="io.odysz.semantics.x.SemanticException"/>
			internal override void onInsert(io.odysz.semantics.ISemantext stx, io.odysz.transact.sql.Insert
				 insert, System.Collections.Generic.List<object[]> row, System.Collections.Generic.IDictionary
				<string, int> cols, io.odysz.semantics.IUser usr)
			{
				string sibling;
				try
				{
					string s = Sharpen.Runtime.getStringValueOf(row[cols[args[1]]][1]);
					sibling = io.odysz.common.LangExt.leftPad(s, siblingSize, '0');
				}
				catch (System.Exception)
				{
					sibling = io.odysz.common.LangExt.leftPad(string.Empty, siblingSize, "0");
				}
				object v = null;
				try
				{
					if (!cols.Contains(pkField) || row[cols[pkField]] == null)
					{
						throw new io.odysz.semantics.x.SemanticException("Fullpath configuration wrong: idField = %s,\nargs:%s,\ncols: %s"
							 + "\nSee %s ", pkField, io.odysz.common.LangExt.toString(args), io.odysz.common.LangExt
							.toString(cols), faqPage);
					}
					object id = row[cols[pkField]][1];
					object pid = cols.Contains(args[0]) ? row[cols[args[0]]][1] : null;
					if (io.odysz.common.LangExt.isblank(pid, "null"))
					{
						io.odysz.common.Utils.warn("Fullpath Handling Error\nTo generate fullpath, parentId must configured.\nFound parent col: %s,\nconfigured args = %s,\nhandling cols = %s\nrows = %s"
							, pid, io.odysz.common.LangExt.toString(args), io.odysz.common.LangExt.toString(
							cols), io.odysz.common.LangExt.toString(row));
						v = id;
					}
					else
					{
						io.odysz.semantics.SemanticObject s = trxt.select(target, "_t0").col(args[2]).where
							("=", pkField, "'" + pid + "'").rs(stx);
						io.odysz.module.rs.AnResultset rs = (io.odysz.module.rs.AnResultset)s.rs(0);
						if (rs.beforeFirst().next())
						{
							string parentpath = rs.getString(args[2]);
							v = string.format("%s.%s %s", io.odysz.common.LangExt.isblank(parentpath, "null")
								 ? string.Empty : parentpath, sibling, id);
						}
						else
						{
							v = string.format("%s %s", sibling, id);
						}
					}
				}
				catch (System.Exception e)
				{
					if (!(e is io.odysz.transact.x.TransException))
					{
						Sharpen.Runtime.printStackTrace(e);
					}
					throw new io.odysz.semantics.x.SemanticException(e.Message);
				}
				object[] nv;
				if (cols.Contains(args[2]))
				{
					if (row.Count <= cols[args[2]])
					{
						row = expandRow(row, cols);
					}
					nv = row[cols[args[2]]];
				}
				else
				{
					nv = new object[] { args[2], stx.composeVal(v, target, args[2]) };
					cols[args[2]] = row.Count;
					row.add(nv);
				}
			}

			/// <exception cref="io.odysz.semantics.x.SemanticException"/>
			internal override void onUpdate(io.odysz.semantics.ISemantext sxt, io.odysz.transact.sql.Update
				 updt, System.Collections.Generic.List<object[]> row, System.Collections.Generic.IDictionary
				<string, int> cols, io.odysz.semantics.IUser usr)
			{
				onInsert(sxt, null, row, cols, usr);
			}
		}

		/// <summary>
		/// Auto Pk Handler.<br />
		/// Generate a radix 64, 6 bit of string representation of integer.
		/// </summary>
		/// <seealso cref="smtype.autoInc"/>
		/// <author>odys-z@github.com</author>
		internal class ShAutoK : io.odysz.semantic.DASemantics.SemanticHandler
		{
			/// <param name="trxt"/>
			/// <param name="tabl"/>
			/// <param name="pk"/>
			/// <param name="args">0: auto field</param>
			/// <exception cref="io.odysz.semantics.x.SemanticException"/>
			internal ShAutoK(io.odysz.transact.sql.Transcxt trxt, string tabl, string pk, string
				[] args)
				: base(trxt, io.odysz.semantic.DASemantics.smtype.autoInc, tabl, pk, args)
			{
				if (args == null || args.Length == 0 || io.odysz.common.LangExt.isblank(args[0]))
				{
					throw new io.odysz.semantics.x.SemanticException("AUTO pk semantics configuration not correct. tabl = %s, pk = %s, args: %s"
						, tabl, pk, io.odysz.common.LangExt.toString(args));
				}
				insert = true;
			}

			internal override void onInsert(io.odysz.semantics.ISemantext stx, io.odysz.transact.sql.Insert
				 insrt, System.Collections.Generic.List<object[]> row, System.Collections.Generic.IDictionary
				<string, int> cols, io.odysz.semantics.IUser usr)
			{
				object[] nv;
				if (cols.Contains(args[0]) && cols[args[0]] < row.Count)
				{
					nv = row[cols[args[0]]];
				}
				else
				{
					nv = new object[2];
					cols[args[0]] = row.Count;
					row.add(nv);
				}
				nv[0] = args[0];
				try
				{
					object alreadyResulved = stx.resulvedVal(target, args[0]);
					if (verbose && alreadyResulved != null)
					{
						io.odysz.common.Utils.warn("Debug Notes(verbose): Found an already resulved value (%s) while handling %s auto-key generation. Replacing ..."
							, alreadyResulved, target);
					}
					nv[1] = stx.composeVal(stx.genId(target, args[0]), target, args[0]);
				}
				catch (System.Exception e)
				{
					Sharpen.Runtime.printStackTrace(e);
				}
			}
		}

		/// <summary>Handle fk referencing resolving when inserting children.<br /></summary>
		/// <seealso cref="smtype.fkIns"/>
		internal class ShFkOnIns : io.odysz.semantic.DASemantics.SemanticHandler
		{
			/// <exception cref="io.odysz.semantics.x.SemanticException"/>
			internal ShFkOnIns(io.odysz.transact.sql.Transcxt trxt, string tabl, string pk, string
				[] args)
				: base(trxt, io.odysz.semantic.DASemantics.smtype.fkIns, tabl, pk, args)
			{
				insert = true;
			}

			internal override void onInsert(io.odysz.semantics.ISemantext stx, io.odysz.transact.sql.Insert
				 insrt, System.Collections.Generic.List<object[]> row, System.Collections.Generic.IDictionary
				<string, int> cols, io.odysz.semantics.IUser usr)
			{
				object[] nv;
				if (cols.Contains(args[0]) && cols[args[0]] < row.Count)
				{
					nv = row[cols[args[0]]];
				}
				else
				{
					nv = new object[] { args[0], null };
					cols[args[0]] = row.Count;
					row.add(nv);
				}
				try
				{
					object v = stx.resulvedVal(args[1], args[2]);
					if (v != null && (nv[1] == null || io.odysz.common.LangExt.isblank(nv[1])))
					{
						nv[1] = stx.composeVal(v, target, (string)nv[0]);
					}
				}
				catch (System.Exception e)
				{
					if (nv[1] != null)
					{
						if (debug)
						{
							io.odysz.common.Utils.warn("Trying resolve FK failed, but fk value exists. child-fk(%s.%s) = %s, parent = %s.%s"
								, target, args[0], nv[1], args[1], args[2]);
						}
					}
					else
					{
						io.odysz.common.Utils.warn("Trying resolve FK failed. child-fk = %s.%s, parent = %s.%s,\n"
							 + "FK config args:\t%s,\ndata cols:\t%s,\ndata row:\t%s.\n%s: %s\n" + "Also note that in current version, only auto key can be referenced and auto resolved."
							, target, args[0], args[1], args[2], io.odysz.common.LangExt.toString(args), io.odysz.common.LangExt
							.toString(cols), io.odysz.common.LangExt.toString(row), Sharpen.Runtime.getClassForObject
							(e).getName(), e.Message);
					}
				}
			}
		}

		/// <summary>
		/// Delete childeren before delete parent.<br />
		/// args: [0] parent's referee column\s [1] child-table1\s [2] child pk1, //
		/// child 1, with comma ending, space separated {0] parent's referee column\s [1]
		/// child-table2\s [2] child pk2 // child 1, without comma ending, space
		/// separated smtype:
		/// <see cref="smtype.parentChildrenOnDel"/>
		/// </summary>
		/// <author>odys-z@github.com</author>
		internal class ShPCDelAll : io.odysz.semantic.DASemantics.SemanticHandler
		{
			protected internal string[][] argss;

			/// <exception cref="io.odysz.semantics.x.SemanticException"/>
			public ShPCDelAll(io.odysz.transact.sql.Transcxt trxt, string tabl, string recId, 
				string[] args)
				: base(trxt, io.odysz.semantic.DASemantics.smtype.parentChildrenOnDel, tabl, recId
					, args)
			{
				delete = true;
				argss = split(args);
			}

			/// <exception cref="io.odysz.semantics.x.SemanticException"/>
			internal override void onDelete<_T0>(io.odysz.semantics.ISemantext stx, io.odysz.transact.sql.Statement
				<_T0> stmt, io.odysz.transact.sql.parts.condition.Condit condt, io.odysz.semantics.IUser
				 usr)
			{
				if (argss != null && argss.Length > 0)
				{
					foreach (string[] args in argss)
					{
						if (args != null && args.Length > 1 && args[1] != null)
						{
							stmt.before(delChild(args, stmt, condt, usr));
						}
					}
				}
			}

			/// <summary>genterate sql e.g.</summary>
			/// <remarks>genterate sql e.g. delete from child where child_pk = parent.referee</remarks>
			/// <param name="args"/>
			/// <param name="stmt"/>
			/// <param name="condt">deleting's condition</param>
			/// <param name="usr"/>
			/// <returns>
			/// 
			/// <see cref="io.odysz.transact.sql.Delete"/>
			/// </returns>
			/// <exception cref="io.odysz.semantics.x.SemanticException"/>
			protected internal virtual io.odysz.transact.sql.Delete delChild<_T0>(string[] args
				, io.odysz.transact.sql.Statement<_T0> stmt, io.odysz.transact.sql.parts.condition.Condit
				 condt, io.odysz.semantics.IUser usr)
				where _T0 : io.odysz.transact.sql.Statement<object>
			{
				if (condt == null)
				{
					throw new io.odysz.semantics.x.SemanticException("Parent table %s has a semantics triggering child table (%s) deletion, but the condition is null."
						, target, args[1]);
				}
				try
				{
					io.odysz.transact.sql.Query s = stmt.transc().select(target).col(pkField).where(condt
						);
					io.odysz.transact.sql.parts.condition.Predicate inCondt = new io.odysz.transact.sql.parts.condition.Predicate
						(io.odysz.transact.sql.parts.Logic.op.@in, args[0], s);
					io.odysz.transact.sql.Delete d = stmt.transc().delete(args[1]).where(new io.odysz.transact.sql.parts.condition.Condit
						(inCondt));
					return d;
				}
				catch (io.odysz.transact.x.TransException e)
				{
					throw new io.odysz.semantics.x.SemanticException(e.Message);
				}
			}
		}

		internal class ShPCDelByCate : io.odysz.semantic.DASemantics.ShPCDelAll
		{
			/// <exception cref="io.odysz.semantics.x.SemanticException"/>
			public ShPCDelByCate(io.odysz.transact.sql.Transcxt trxt, string tabl, string recId
				, string[] args)
				: base(trxt, tabl, recId, args)
			{
				base.sm = io.odysz.semantic.DASemantics.smtype.parentChildrenOnDelByTabl;
			}

			/// <exception cref="io.odysz.semantics.x.SemanticException"/>
			protected internal override io.odysz.transact.sql.Delete delChild<_T0>(string[] args
				, io.odysz.transact.sql.Statement<_T0> stmt, io.odysz.transact.sql.parts.condition.Condit
				 condt, io.odysz.semantics.IUser usr)
			{
				return base.delChild(args, stmt, condt, usr).whereEq(args[3], target);
			}
		}

		internal class ShFkInsCates : io.odysz.semantic.DASemantics.SemanticHandler
		{
			protected internal string[][] argss;

			/// <summary>configured field of busi-tbl, e.g.</summary>
			/// <remarks>configured field of busi-tbl, e.g. busiTbl for a_attaches</remarks>
			private int ixbusiTbl = 0;

			private int ixbusiId = 1;

			private int ixparentbl = 2;

			private int ixparentpk = 3;

			/// <exception cref="io.odysz.semantics.x.SemanticException"/>
			public ShFkInsCates(io.odysz.transact.sql.Transcxt trxt, string tabl, string recId
				, string[] args)
				: base(trxt, io.odysz.semantic.DASemantics.smtype.fkCateIns, tabl, recId, args)
			{
				argss = split(args);
				insert = true;
			}

			/// <exception cref="io.odysz.semantics.x.SemanticException"/>
			internal override void onInsert(io.odysz.semantics.ISemantext stx, io.odysz.transact.sql.Insert
				 insrt, System.Collections.Generic.List<object[]> row, System.Collections.Generic.IDictionary
				<string, int> cols, io.odysz.semantics.IUser usr)
			{
				foreach (string[] argus in argss)
				{
					if (cols == null || !cols.Contains(argus[ixbusiTbl]) || cols[argus[ixbusiTbl]] ==
						 null)
					{
						io.odysz.common.Utils.warn("Can't handle fk-busi without column %s", argus[ixbusiTbl
							]);
						continue;
					}
					object[] nvBusiTbl = row[cols[argus[ixbusiTbl]]];
					if (nvBusiTbl == null || io.odysz.common.LangExt.isblank(nvBusiTbl[1]))
					{
						io.odysz.common.Utils.warn("Can't generate value of %s.%s without business cate, the value of %s not provided"
							, target, argus[ixbusiId], argus[ixbusiTbl]);
					}
					else
					{
						if (!nvBusiTbl[1].ToString().Equals(argus[ixparentbl]))
						{
							continue;
						}
					}
					object bid;
					bid = stx.resulvedVal(argus[ixparentbl], argus[ixparentpk]);
					if (io.odysz.common.LangExt.isblank(bid, "''"))
					{
						if (cols.Contains(argus[ixbusiId]))
						{
							bid = row[cols[argus[ixbusiId]]][1];
						}
					}
					if (io.odysz.common.LangExt.isblank(bid, "''"))
					{
						throw new io.odysz.semantics.x.SemanticException("Semantics %s can't been handled without business record Id - resulving failed: %s.%s"
							, sm.ToString(), argus[ixparentbl], argus[ixparentpk]);
					}
					object[] rowBid;
					string fBusiId = argus[ixbusiId];
					if (cols.Contains(fBusiId) && cols[fBusiId] >= 0 && cols[fBusiId] < row.Count)
					{
						rowBid = row[cols[fBusiId]];
						if (rowBid != null)
						{
							if (bid != null)
							{
								rowBid[1] = stx.composeVal(bid, target, fBusiId);
							}
						}
					}
					else
					{
						object vbusiTbl = nvBusiTbl[1];
						object[] rowBusiTbl = row[cols[argus[ixbusiTbl]]];
						if (rowBusiTbl == null)
						{
							io.odysz.common.Utils.warn("%s is a semantics that is intend to use a table name as business cate, but date to handled doesn't provide the business cate (by %s) .\n"
								 + sm.ToString(), argus[ixbusiTbl], vbusiTbl, target);
							continue;
						}
						if (io.odysz.common.LangExt.isblank(vbusiTbl, "'\\s*'") || vbusiTbl.Equals(rowBusiTbl
							[0]))
						{
							continue;
						}
						if (stx.colType(vbusiTbl.ToString()) == null)
						{
							io.odysz.common.Utils.warn("%s is a semantics that is intend to use a table name as business cate, but table %s can't been found.\n"
								 + "Deleting the records of table %s or %s will result in logical error.", sm.ToString
								(), argus[ixbusiTbl], vbusiTbl, target);
						}
						cols[fBusiId] = row.Count;
						row.add(new object[] { argus[ixbusiId], stx.composeVal(bid, target, argus[ixbusiId
							]) });
					}
				}
			}
		}

		/// <summary>Handle default value.</summary>
		/// <remarks>
		/// Handle default value. args: [0] value-field, [1] default-value<br />
		/// e.g. pswd,123456 can set pwd = '123456'
		/// </remarks>
		/// <author>odys-z@github.com</author>
		internal class ShDefltVal : io.odysz.semantic.DASemantics.SemanticHandler
		{
			internal static io.odysz.common.Regex regQuot = new io.odysz.common.Regex("^\\s*'.*'\\s*$"
				);

			/// <exception cref="io.odysz.semantics.x.SemanticException"/>
			internal ShDefltVal(io.odysz.transact.sql.Transcxt trxt, string tabl, string recId
				, string[] args)
				: base(trxt, io.odysz.semantic.DASemantics.smtype.defltVal, tabl, recId, args)
			{
				insert = true;
				args[1] = dequote(args[1]);
			}

			internal override void onInsert(io.odysz.semantics.ISemantext stx, io.odysz.transact.sql.Insert
				 insrt, System.Collections.Generic.List<object[]> row, System.Collections.Generic.IDictionary
				<string, int> cols, io.odysz.semantics.IUser usr)
			{
				if (args.Length > 1 && args[1] != null)
				{
					object[] nv;
					if (cols.Contains(args[0]) && cols[args[0]] < row.Count)
					{
						nv = row[cols[args[0]]];
					}
					else
					{
						nv = new object[2];
						cols[args[0]] = row.Count;
						row.add(nv);
					}
					nv[0] = args[0];
					if (nv[1] == null)
					{
						nv[1] = stx.composeVal(args[1], target, (string)nv[0]);
					}
					else
					{
						if (string.Empty.Equals(nv[1]) && args[1] != null && !args[1].Equals(string.Empty
							))
						{
							nv[1] = stx.composeVal(args[1], target, (string)nv[0]);
						}
					}
				}
			}

			private string dequote(string dv)
			{
				if (dv != null && dv is string && regQuot.match((string)dv))
				{
					return ((string)dv).replaceAll("^\\s*'", string.Empty).replaceFirst("'\\s*$", string.Empty
						);
				}
				return (string)dv;
			}
		}

		/// <summary>
		/// Save configured nv as file.<br />
		/// args 0: uploads, 1: uri, 2: busiTbl, 3: busiId, 4: client-name (optional)
		/// </summary>
		/// <author>odys-z@github.com</author>
		internal class ShExtFile : io.odysz.semantic.DASemantics.SemanticHandler
		{
			/// <summary>
			/// Saving root.<br />
			/// The path rooted from return of
			/// <see cref="io.odysz.semantics.ISemantext.relativpath(string[])"/>
			/// .
			/// </summary>
			internal const int ixRoot = 0;

			/// <summary>Index of Path field</summary>
			internal const int ixUri = 1;

			internal const int ixBusiTbl = 2;

			internal const int ixBusiId = 3;

			/// <summary>Index of client file name</summary>
			internal const int ixClientName = 4;

			internal string rootpath = string.Empty;

			/// <exception cref="io.odysz.semantics.x.SemanticException"/>
			/// <exception cref="java.sql.SQLException"/>
			internal ShExtFile(io.odysz.transact.sql.Transcxt trxt, string tabl, string pk, string
				[] args)
				: base(trxt, io.odysz.semantic.DASemantics.smtype.extFile, tabl, pk, args)
			{
				delete = true;
				insert = true;
				rootpath = args[ixRoot];
				if (io.odysz.common.LangExt.isblank(args[ixBusiTbl]))
				{
					io.odysz.common.Utils.warn("ShExtFile handling special attachment table semantics, which is needing a business category filed in the table.\n"
						 + "But the configuration on the target table (%s) doesn't provide the semantics (business table name field not specified)"
						, target);
				}
			}

			internal override void onInsert(io.odysz.semantics.ISemantext stx, io.odysz.transact.sql.Insert
				 insrt, System.Collections.Generic.List<object[]> row, System.Collections.Generic.IDictionary
				<string, int> cols, io.odysz.semantics.IUser usr)
			{
				if (args.Length > 1 && args[1] != null)
				{
					object[] nv;
					if (cols.Contains(args[ixUri]))
					{
						nv = row[cols[args[ixUri]]];
						if (nv != null && nv[1] != null && (nv[1] is string && !io.odysz.common.LangExt.isblank
							(nv[1]) || nv[1] is io.odysz.transact.sql.parts.AbsPart))
						{
							object busi = row[cols[args[ixBusiTbl]]][1];
							try
							{
								string relatvpth = stx.relativpath(args[ixRoot], busi.ToString());
								object fn = row[cols[pkField]][1];
								io.odysz.transact.sql.parts.ExtFile f;
								if (fn is io.odysz.transact.sql.parts.Resulving)
								{
									f = new io.odysz.transact.sql.parts.ExtFile((io.odysz.transact.sql.parts.Resulving
										)fn);
								}
								else
								{
									f = new io.odysz.transact.sql.parts.ExtFile(new io.odysz.transact.sql.parts.condition.ExprPart
										(fn.ToString()));
								}
								if (args.Length >= ixClientName)
								{
									string clientname = args[ixClientName];
									if (cols.Contains(clientname))
									{
										clientname = row[cols[clientname]][1].ToString();
										if (clientname != null)
										{
											f.filename(clientname);
										}
									}
								}
								f.prefixPath(relatvpth).absPath(stx.containerRoot()).b64(nv[1].ToString());
								nv = new object[] { nv[0], f };
								row.set(cols[args[ixUri]], nv);
							}
							catch (io.odysz.transact.x.TransException e)
							{
								Sharpen.Runtime.printStackTrace(e);
							}
						}
					}
				}
			}

			/// <summary>
			/// <p>On updating external files handler.</p>
			/// <p>This method only throw an exception currently, applying the semantics predefined as:<br />
			/// AS all files are treaded as binary file, no file can be modified, only delete then create it makes sense.</p>
			/// <p>Client should avoid updating an external file will handling business logics.</p>
			/// <p><b>NOTE:</b><br />This can be changed in the future.</p>
			/// </summary>
			/// <seealso cref="SemanticHandler.onUpdate(io.odysz.semantics.ISemantext, io.odysz.transact.sql.Update, System.Collections.Generic.List{E}, System.Collections.Generic.IDictionary{K, V}, io.odysz.semantics.IUser)
			/// 	"/>
			/// <exception cref="io.odysz.semantics.x.SemanticException"/>
			internal override void onUpdate(io.odysz.semantics.ISemantext stx, io.odysz.transact.sql.Update
				 updt, System.Collections.Generic.List<object[]> row, System.Collections.Generic.IDictionary
				<string, int> cols, io.odysz.semantics.IUser usr)
			{
				if (args.Length > 1 && args[1] != null)
				{
					object[] nv;
					if (cols.Contains(args[ixUri]))
					{
						nv = row[cols[args[ixUri]]];
						if (nv != null && nv[1] != null && nv[1] is string && ((string)nv[1]).Length > 0)
						{
							throw new io.odysz.semantics.x.SemanticException("Found the extFile value presented in %s, but updating is not supported by extFile. See:\n"
								 + "https://odys-z.github.io/javadoc/semantic.DA/io/odysz/semantic/DASemantics.smtype.html#extFile\n"
								 + "About Updating Handling", args[ixUri]);
						}
					}
				}
			}

			/// <exception cref="io.odysz.semantics.x.SemanticException"/>
			internal override void onDelete<_T0>(io.odysz.semantics.ISemantext stx, io.odysz.transact.sql.Statement
				<_T0> stmt, io.odysz.transact.sql.parts.condition.Condit condt, io.odysz.semantics.IUser
				 usr)
			{
				io.odysz.module.rs.AnResultset rs;
				try
				{
					rs = (io.odysz.module.rs.AnResultset)stmt.transc().select(target).col(args[ixUri]
						).where(condt).rs(stmt.transc().basictx()).rs(0);
					rs.beforeFirst();
					while (rs.next())
					{
						try
						{
							string uri = rs.getString(args[ixUri]);
							if (io.odysz.common.LangExt.isblank(uri, "\\.*", "\\**", "\\s*"))
							{
								continue;
							}
							uri = org.apache.commons.io_odysz.FilenameUtils.concat(stx.containerRoot(), uri);
							if (verbose)
							{
								io.odysz.common.Utils.warn("deleting %s", uri);
							}
							string v = uri;
							stx.addOnOkOperate(@"TODO: Lambda Expression Ignored
(st,sqls) -> {
  File f=new File(v);
  if (!f.isDirectory())   f.delete();
 else   Utils.warn("ShExtHandler#onDelete(): Ignoring deleting directory %s",v);
  return null;
}
"
								);
						}
						catch (System.Exception ex)
						{
							Sharpen.Runtime.printStackTrace(ex);
						}
					}
				}
				catch (java.sql.SQLException e)
				{
					Sharpen.Runtime.printStackTrace(e);
				}
				catch (io.odysz.transact.x.TransException e)
				{
					throw new io.odysz.semantics.x.SemanticException(e.Message);
				}
			}
		}

		/// <summary>Check with sql before deleting<br /></summary>
		/// <seealso cref="smtype.checkSqlCountOnDel"/>
		/// <author>odys-z@github.com</author>
		internal class ShChkCntDel : io.odysz.semantic.DASemantics.SemanticHandler
		{
			private string[][] argss;

			/// <exception cref="io.odysz.semantics.x.SemanticException"/>
			public ShChkCntDel(io.odysz.transact.sql.Transcxt trxt, string tabl, string recId
				, string[] args)
				: base(trxt, io.odysz.semantic.DASemantics.smtype.checkSqlCountOnDel, tabl, recId
					, args)
			{
				delete = true;
				argss = split(args);
			}

			/// <exception cref="io.odysz.semantics.x.SemanticException"/>
			internal override void onDelete<_T0>(io.odysz.semantics.ISemantext stx, io.odysz.transact.sql.Statement
				<_T0> stmt, io.odysz.transact.sql.parts.condition.Condit condt, io.odysz.semantics.IUser
				 usr)
			{
				if (argss != null && argss.Length > 0)
				{
					foreach (string[] args in argss)
					{
						if (args != null && args.Length > 1 && args[1] != null)
						{
							chkCnt(args, stmt, condt);
						}
					}
				}
			}

			/// <exception cref="io.odysz.semantics.x.SemanticException"/>
			private void chkCnt<_T0>(string[] args, io.odysz.transact.sql.Statement<_T0> stmt
				, io.odysz.transact.sql.parts.condition.Condit condt)
				where _T0 : io.odysz.transact.sql.Statement<object>
			{
				io.odysz.semantics.SemanticObject s;
				try
				{
					io.odysz.transact.sql.Query slct = stmt.transc().select(target).col(args[0]).where
						(condt);
					io.odysz.transact.sql.parts.condition.Predicate inCondt = new io.odysz.transact.sql.parts.condition.Predicate
						(io.odysz.transact.sql.parts.Logic.op.@in, args[2], slct);
					s = stmt.transc().select(args[1]).col("count(" + args[2] + ")", "cnt").where(inCondt
						).rs(stmt.transc().basictx());
					io.odysz.module.rs.AnResultset rs = (io.odysz.module.rs.AnResultset)s.rs(0);
					rs.beforeFirst().next();
					if (rs.getInt("cnt") > 0)
					{
						throw new io.odysz.semantics.x.SemanticException("%s.%s: %s %s", target, sm.ToString
							(), args[1], rs.getInt("cnt")).ex(new io.odysz.semantics.SemanticObject().put("sm"
							, sm.ToString()).put("tbl", target).put("childTbl", args[1]).put("cnt", rs.getInt
							("cnt")));
					}
				}
				catch (System.Exception e)
				{
					if (e is io.odysz.semantics.x.SemanticException)
					{
						throw (io.odysz.semantics.x.SemanticException)e;
					}
					Sharpen.Runtime.printStackTrace(e);
					throw new io.odysz.semantics.x.SemanticException(e.Message);
				}
			}
		}

		internal class ShChkPCInsert : io.odysz.semantic.DASemantics.SemanticHandler
		{
			/// <exception cref="io.odysz.semantics.x.SemanticException"/>
			public ShChkPCInsert(io.odysz.transact.sql.Transcxt trxt, string tabl, string recId
				, string[] args)
				: base(trxt, io.odysz.semantic.DASemantics.smtype.checkSqlCountOnInsert, tabl, recId
					, args)
			{
				insert = true;
			}

			/// <exception cref="io.odysz.semantics.x.SemanticException"/>
			internal override void onInsert(io.odysz.semantics.ISemantext stx, io.odysz.transact.sql.Insert
				 insrt, System.Collections.Generic.List<object[]> row, System.Collections.Generic.IDictionary
				<string, int> cols, io.odysz.semantics.IUser usr)
			{
				if (args.Length > 1 && args[1] != null)
				{
					object[] nv = new object[args.Length - 1];
					for (int ix = 0; ix < args.Length - 1; ix++)
					{
						if (cols.Contains(args[ix]))
						{
							object[] nmval = row[cols[args[ix]]];
							if (nmval != null && nmval.Length > 1 && nmval[1] != null)
							{
								nv[ix] = nmval[1];
							}
							else
							{
								nv[ix] = string.Empty;
							}
						}
					}
					string sql = string.format(args[args.Length - 1], nv);
					try
					{
						io.odysz.module.rs.AnResultset rs = io.odysz.semantic.DA.Connects.select(stx.connId
							(), sql, io.odysz.semantic.DA.Connects.flag_nothing);
						rs.beforeFirst().next();
						if (rs.getInt(1) > 0)
						{
							throw new io.odysz.semantics.x.SemanticException("Checking count on %s.%s (%s = %s ...) failed"
								, target, pkField, args[0], nv[0]).ex(new io.odysz.semantics.SemanticObject().put
								("sm", sm.ToString()).put("tbl", target).put("childTbl", args[0]).put("childField"
								, nv[0]));
						}
					}
					catch (java.sql.SQLException)
					{
						throw new io.odysz.semantics.x.SemanticException("Can't access db to check count on insertion, check sql configuration: %s"
							, sql);
					}
				}
			}
		}

		internal class ShDencrypt : io.odysz.semantic.DASemantics.SemanticHandler
		{
			internal string colIv;

			internal string colCipher;

			/// <exception cref="io.odysz.semantics.x.SemanticException"/>
			internal ShDencrypt(io.odysz.transact.sql.Transcxt trxt, string tabl, string pk, 
				string[] args)
				: base(trxt, io.odysz.semantic.DASemantics.smtype.dencrypt, tabl, pk, args)
			{
				insert = true;
				update = true;
				colIv = args[1];
				colCipher = args[0];
			}

			/// <exception cref="io.odysz.semantics.x.SemanticException"/>
			internal override void onInsert(io.odysz.semantics.ISemantext stx, io.odysz.transact.sql.Insert
				 insrt, System.Collections.Generic.List<object[]> row, System.Collections.Generic.IDictionary
				<string, int> cols, io.odysz.semantics.IUser usr)
			{
			}
		}
	}
}
