using Sharpen;

namespace io.odysz.semantic.DA
{
	/// <summary>
	/// Configured dataset.xml manager and helper.<br />
	/// - won't care using CP data source or DB manager (2019.2.28).
	/// </summary>
	/// <author>odys-z@github.com</author>
	public class DatasetCfg
	{
		/// <summary>Data structure of s-tree configuration.</summary>
		/// <author>odys-z@github.com</author>
		public class TreeSemantics : io.odysz.anson.Anson
		{
			/// <summary>s-tree tag's fields index.</summary>
			internal class Ix
			{
				/// <summary>filed count: 9</summary>
				public const int count = 9;

				/// <summary>the is-checked boolean field</summary>
				public const int chked = 0;

				/// <summary>main table name</summary>
				public const int tabl = 1;

				/// <summary>record pk filed (only single column)</summary>
				public const int recId = 2;

				/// <summary>parent field</summary>
				public const int parent = 3;

				/// <summary>fullpath field (optional)</summary>
				public const int fullpath = 4;

				/// <summary>sibling sort (fullpath first, optinal)</summary>
				public const int sort = 5;

				/// <summary>lable / text field for client binding</summary>
				public const int text = 6;

				/// <summary>paging by server</summary>
				public const int pageByServer = 8;
			}

			/// <summary>parse tree semantics like ",checked,table,recId id,parentId,itemName text,fullpath,siblingSort,false" to 2d array.
			/// 	</summary>
			/// <param name="semantic"/>
			/// <returns>[0:[checked, null], 1:[tabl, null], 2:[areaId, id], ...]</returns>
			public static string[][] parseSemantics(string semantic)
			{
				if (semantic == null)
				{
					return null;
				}
				string[] sms = semantic.split(",");
				return parseSemantics(sms);
			}

			public static string[][] parseSemantics(string[] sms)
			{
				if (sms == null)
				{
					return new string[][] {  };
				}
				string[][] sm = new string[io.odysz.semantic.DA.DatasetCfg.TreeSemantics.Ix.count
					][];
				for (int ix = 0; ix < sms.Length; ix++)
				{
					string smstr = sms[ix];
					if (smstr == null)
					{
						continue;
					}
					smstr = smstr.replaceAll("\\s+[aA][sS]\\s+", " ");
					// replace " as "
					string[] smss = smstr.split(" ");
					if (smss == null || smss.Length > 2 || smss[0] == null)
					{
						System.Console.Error.WriteLine(string.format("WARN - SematnicTree: ignoring semantics not understandable: %s"
							, smstr));
					}
					else
					{
						sm[ix] = new string[] { smss[0].Trim(), (smss.Length > 1 && smss[1] != null) ? smss
							[1].Trim() : null };
					}
				}
				return sm;
			}

			public override string ToString()
			{
				if (treeSmtcs != null)
				{
					return java.util.Arrays.stream(treeSmtcs).map(@"TODO: Lambda Expression Ignored
e -> e == null ? null : String.format("[%s, %s]",e[0],e.length > 0 ? e[1] : null)"
						).collect(java.util.stream.Collectors.joining(", ", "[", "]"));
				}
				return "[]";
			}

			internal string[][] treeSmtcs;

			public virtual string[][] treeSmtcs()
			{
				return treeSmtcs;
			}

			public TreeSemantics(string stree)
			{
				treeSmtcs = parseSemantics(stree);
			}

			public TreeSemantics(string[] stree)
			{
				treeSmtcs = parseSemantics(stree);
			}

			public TreeSemantics(string[][] stree)
			{
				treeSmtcs = stree;
			}

			public virtual string tabl()
			{
				return alias(io.odysz.semantic.DA.DatasetCfg.TreeSemantics.Ix.tabl);
			}

			/// <summary>Get raw expression of record id.</summary>
			/// <returns>column name of sql result</returns>
			public virtual string dbRecId()
			{
				return exp(io.odysz.semantic.DA.DatasetCfg.TreeSemantics.Ix.recId)[0];
			}

			public virtual string dbParent()
			{
				return alias(io.odysz.semantic.DA.DatasetCfg.TreeSemantics.Ix.parent);
			}

			public virtual string dbFullpath()
			{
				return alias(io.odysz.semantic.DA.DatasetCfg.TreeSemantics.Ix.fullpath);
			}

			public virtual string dbSort()
			{
				return alias(io.odysz.semantic.DA.DatasetCfg.TreeSemantics.Ix.sort);
			}

			private string[] exp(int ix)
			{
				return treeSmtcs != null && treeSmtcs.Length > ix ? treeSmtcs[ix] : null;
			}

			/// <summary>Get column name, if there is an alias, get alias, otherwise get the db field name.
			/// 	</summary>
			/// <param name="ix"/>
			/// <returns/>
			internal virtual string alias(int ix)
			{
				return treeSmtcs != null && treeSmtcs.Length > ix ? treeSmtcs[ix].Length > 0 && treeSmtcs
					[ix][1] != null ? treeSmtcs[ix][1] : treeSmtcs[ix][0] : null;
			}

			/// <summary>
			/// Is value of <i>col</i> should changed to boolean.<br />
			/// If the semantics configuration's first field is this col's name,
			/// the the value should changed into boolean.
			/// </summary>
			/// <param name="col"/>
			/// <returns>true: this column should covert to boolean.</returns>
			public virtual bool isColChecked(string col)
			{
				string chk = alias(io.odysz.semantic.DA.DatasetCfg.TreeSemantics.Ix.chked);
				if (col == null || chk == null)
				{
					return false;
				}
				return (chk.Equals(col.Trim()));
			}

			public virtual string aliasParent()
			{
				return alias(io.odysz.semantic.DA.DatasetCfg.TreeSemantics.Ix.parent);
			}

			/// <summary>Get alias if possible, other wise the expr itself</summary>
			/// <param name="expr"/>
			/// <returns>alias</returns>
			public virtual string alias(string expr)
			{
				if (expr != null)
				{
					// for (String[] colAls : treeSmtcs)
					for (int x = 0; x < treeSmtcs.Length; x++)
					{
						string[] colAls = treeSmtcs[x];
						if (colAls != null && expr.Equals(colAls[0]))
						{
							return alias(x);
						}
					}
				}
				return expr;
			}
		}

		/// <summary>
		/// <p>Representing each tree node.</p>
		/// Design Memo:<br />
		/// What easy ui tree control expected is this:<pre>
		/// [{"children":[
		/// { "fullpath":"01.0101",
		/// "checked":true,
		/// "text":"users","sort":"0101", "value":"0101", "parentId":"01" },
		/// { "fullpath":"01.0102",
		/// "checked":true,
		/// "text":"roles","sort":"0102","value":"0102","parentId":"01" },
		/// { "fullpath":"01.0103",
		/// "checked":true,
		/// "text":"sys log","sort":"0103","value":"0103","parentId":"01" } ],
		/// "fullpath":"01",
		/// "checked":true,
		/// "text":"system","sort":"01","value":"01","parentId":""
		/// },
		/// {"children":[
		/// { "fullpath":"03.0301",
		/// "checked":true,
		/// "text":"FUNC 0301","sort":"0301","value":"0301","parentId":"03"} ],
		/// "fullpath":"03",
		/// "checked":true,
		/// "text":"web contents","sort":"03","value":"03"
		/// }]</pre>
		/// </summary>
		public class AnTreeNode : io.odysz.anson.Anson
		{
			internal System.Collections.Generic.Dictionary<string, object> node;

			internal string id;

			internal string parent;

			public AnTreeNode()
			{
			}

			public AnTreeNode(string id, string parent)
			{
				// Only for Anson parser
				this.id = id;
				this.parent = parent;
				node = new System.Collections.Generic.Dictionary<string, object>(io.odysz.semantic.DA.DatasetCfg.TreeSemantics.Ix
					.count);
			}

			public virtual io.odysz.semantic.DA.DatasetCfg.AnTreeNode put(string k, object v)
			{
				node[k] = v;
				return this;
			}

			public virtual object get(string k)
			{
				return node == null ? null : node[k];
			}

			public virtual string id()
			{
				return id;
			}

			public virtual string parent()
			{
				return parent;
			}

			public virtual string fullpath()
			{
				return node == null ? null : (string)node["fullpath"];
			}

			public virtual System.Collections.Generic.IList<object> children()
			{
				return node == null ? null : (System.Collections.Generic.IList<object>)node["children"
					];
			}

			public virtual object child(int cx)
			{
				return node == null ? null : ((System.Collections.Generic.IList<object>)node["children"
					])[cx];
			}

			public virtual void children(System.Collections.Generic.IList<object> arrChildren
				)
			{
				put("children", arrChildren);
			}
		}

		public const int ixMysql = 0;

		public const int ixOrcl = 1;

		public const int ixMs2k = 2;

		public const int ixSqlit = 3;

		public const int ixUnknow = 4;

		protected internal const string tag = "DataSet";

		protected internal const string cfgFile = "dataset.xml";

		protected internal const string deftId = "ds";

		protected internal static System.Collections.Generic.Dictionary<string, io.odysz.semantic.DA.DatasetCfg.Dataset
			> dss;

		private static bool inited = false;

		/// <exception cref="org.xml.sax.SAXException"/>
		/// <exception cref="System.IO.IOException"/>
		public static void init(string path)
		{
			if (inited == false)
			{
				dss = new System.Collections.Generic.Dictionary<string, io.odysz.semantic.DA.DatasetCfg.Dataset
					>();
				load(dss, path);
				inited = true;
			}
		}

		/// <summary>
		/// Load all dataset.xml into the argument cfgs.<br />
		/// When return, cfgs is loaded with dataset configurations like [id, mysql:sql, orcl:sql, ...].
		/// </summary>
		/// <param name="cfgs"/>
		/// <param name="xmlPath"/>
		/// <exception cref="System.IO.IOException"></exception>
		/// <exception cref="org.xml.sax.SAXException"></exception>
		protected internal static void load(System.Collections.Generic.Dictionary<string, 
			io.odysz.semantic.DA.DatasetCfg.Dataset> cfgs, string xmlPath)
		{
			string fullpath = org.apache.commons.io_odysz.FilenameUtils.concat(xmlPath + "/", 
				cfgFile);
			java.io.File f = new java.io.File(fullpath);
			if (!f.exists() || !f.isFile())
			{
				io.odysz.common.Utils.warn("WARN - Can't find dataset.xml, configuration ignored. Check %s"
					, fullpath);
				return;
			}
			java.util.LinkedHashMap<string, io.odysz.module.xtable.XMLTable> xtabs = io.odysz.module.xtable.XMLDataFactoryEx
				.getXtables(new io.odysz.module.xtable.Log4jWrapper("DA").setDebugMode(false), fullpath
				, new _IXMLStruct_299());
			io.odysz.module.xtable.XMLTable deft = xtabs[deftId];
			// FIXME no multiple tables?
			parseConfigs(cfgs, deft);
		}

		private sealed class _IXMLStruct_299 : io.odysz.module.xtable.IXMLStruct
		{
			public _IXMLStruct_299()
			{
			}

			public string rootTag()
			{
				return "dataset";
			}

			public string tableTag()
			{
				return "t";
			}

			public string recordTag()
			{
				return "c";
			}
		}

		public static void parseConfigs(System.Collections.Generic.Dictionary<string, io.odysz.semantic.DA.DatasetCfg.Dataset
			> cfgs, io.odysz.module.xtable.XMLTable xSmtcs)
		{
			if (xSmtcs != null)
			{
				try
				{
					xSmtcs.beforeFirst();
					io.odysz.semantic.DA.DatasetCfg.Dataset ds = null;
					while (xSmtcs.next())
					{
						string[] sqls = new string[4];
						sqls[ixMysql] = xSmtcs.getString("mysql");
						sqls[ixOrcl] = xSmtcs.getString("orcl");
						sqls[ixSqlit] = xSmtcs.getString("sqlit");
						sqls[ixMs2k] = xSmtcs.getString("ms2k");
						// columns="id,tabls,cols,orcl,mysql,ms2k"
						ds = new io.odysz.semantic.DA.DatasetCfg.Dataset(xSmtcs.getString("sk"), xSmtcs.getString
							("cols"), sqls, xSmtcs.getString("s-tree"));
						if (ds != null)
						{
							cfgs[xSmtcs.getString("sk")] = ds;
						}
					}
				}
				catch (org.xml.sax.SAXException e)
				{
					Sharpen.Runtime.printStackTrace(e);
				}
			}
		}

		/// <exception cref="io.odysz.semantics.x.SemanticException"/>
		/// <exception cref="java.sql.SQLException"/>
		public static io.odysz.module.rs.AnResultset select(string conn, string sk, int page
			, int size, params string[] args)
		{
			string sql = getSql(conn, sk, args);
			if (page >= 0 && size > 0)
			{
				sql = io.odysz.semantic.DA.Connects.pagingSql(conn, sql, page, size);
			}
			io.odysz.module.rs.AnResultset rs = new io.odysz.module.rs.AnResultset(io.odysz.semantic.DA.Connects
				.select(conn, sql));
			return rs;
		}

		/// <exception cref="java.sql.SQLException"/>
		/// <exception cref="io.odysz.semantics.x.SemanticException"/>
		public static string getSql(string conn, string k, params string[] args)
		{
			if (dss == null)
			{
				throw new java.sql.SQLException("FATAL - dataset not initialized...");
			}
			if (k == null || !dss.Contains(k))
			{
				throw new java.sql.SQLException(string.format("No dataset configuration found for k = %s"
					, k));
			}
			if (conn == null)
			{
				conn = io.odysz.semantic.DA.Connects.defltConn();
			}
			string sql = dss[k].getSql(io.odysz.semantic.DA.Connects.driverType(conn));
			if (sql == null)
			{
				throw new io.odysz.semantics.x.SemanticException("Sql not found for sk=%s, type = %s"
					, k, io.odysz.semantic.DA.Connects.driverType(conn));
			}
			if (args == null || args.Length == 0)
			{
				return sql;
			}
			else
			{
				return string.format(sql, (object[])args);
			}
		}

		public static io.odysz.semantic.DA.DatasetCfg.TreeSemantics getTreeSemtcs(string 
			sk)
		{
			if (dss != null && dss.Contains(sk))
			{
				return dss[sk].treeSemtcs;
			}
			else
			{
				return null;
			}
		}

		/// <exception cref="io.odysz.semantics.x.SemanticException"/>
		/// <exception cref="java.sql.SQLException"/>
		public static io.odysz.module.rs.AnResultset loadDataset(string conn, string sk, 
			int page, int size, params string[] args)
		{
			if (sk == null)
			{
				throw new io.odysz.semantics.x.SemanticException("null semantic key");
			}
			if (conn == null)
			{
				conn = io.odysz.semantic.DA.Connects.defltConn();
			}
			return select(conn, sk, page, size, args);
		}

		/// <exception cref="io.odysz.semantics.x.SemanticException"/>
		/// <exception cref="java.sql.SQLException"/>
		public static System.Collections.Generic.IList<object> loadStree(string conn, string
			 sk, int page, int size, params string[] args)
		{
			if (dss == null || !dss.Contains(sk))
			{
				throw new io.odysz.semantics.x.SemanticException("Can't find tree semantics, dss %s, sk = %s. Check configuration."
					, dss == null ? "null" : dss.Count, sk);
			}
			io.odysz.module.rs.AnResultset rs = loadDataset(conn, sk, page, size, args);
			io.odysz.semantic.DA.DatasetCfg.TreeSemantics smx = dss[sk].treeSemtcs;
			if (smx == null)
			{
				throw new io.odysz.semantics.x.SemanticException("sk (%s) desn't configured with a tree semantics"
					, sk);
			}
			return buildForest(rs, smx);
		}

		/// <summary>Build forest.</summary>
		/// <param name="rs"/>
		/// <param name="treeSemtcs"/>
		/// <returns>built forest</returns>
		/// <exception cref="java.sql.SQLException"/>
		/// <exception cref="io.odysz.semantics.x.SemanticException">data structure can not build  tree / forest
		/// 	</exception>
		public static System.Collections.Generic.IList<object> buildForest(io.odysz.module.rs.AnResultset
			 rs, io.odysz.semantic.DA.DatasetCfg.TreeSemantics treeSemtcs)
		{
			// build the tree/forest
			System.Collections.Generic.IList<object> forest = new System.Collections.Generic.List
				<object>();
			rs.beforeFirst();
			while (rs.next())
			{
				// Map<String, Object> root  = formatSemanticNode(treeSemtcs, rs);
				io.odysz.semantic.DA.DatasetCfg.AnTreeNode root = formatSemanticNode(treeSemtcs, 
					rs);
				// sometimes error results from inconsistent data is confusing, so report an error here - it's debug experience.
				// if (!rs.getColnames().containsKey(treeSemtcs.dbRecId()))
				if (!rs.hasCol(treeSemtcs.dbRecId()))
				{
					throw new io.odysz.semantics.x.SemanticException("Building s-tree requires column '%s'(configured id). You'd better check the query request and the semantics configuration:\n%s"
						, treeSemtcs.dbRecId(), io.odysz.common.LangExt.toString(treeSemtcs.treeSmtcs())
						);
				}
				// checkSemantics(rs, semanticss, Ix.recId);
				System.Collections.Generic.IList<object> children = buildSubTree(treeSemtcs, root
					, rs.getString(treeSemtcs.dbRecId()), rs);
				// rs.getString(treeSemtcs[Ix.recId] == null ? treeSemtcs[Ix.recId] : treeSemtcs[Ix.recId]),
				if (children.Count > 0)
				{
					root.children(children);
				}
				forest.add(root);
			}
			return forest;
		}

		/// <summary>
		/// Create a SemanticObject for tree node with current rs row.<br />
		/// TODO should this moved to TreeSemantics?
		/// </summary>
		/// <param name="treeSemtcs"/>
		/// <param name="rs"/>
		/// <returns>
		/// 
		/// <see cref="io.odysz.semantics.SemanticObject"/>
		/// of node
		/// </returns>
		/// <exception cref="java.sql.SQLException"/>
		private static io.odysz.semantic.DA.DatasetCfg.AnTreeNode formatSemanticNode(io.odysz.semantic.DA.DatasetCfg.TreeSemantics
			 treeSemtcs, io.odysz.module.rs.AnResultset rs)
		{
			// Map<String, Object> node = new HashMap<String, Object>();
			io.odysz.semantic.DA.DatasetCfg.AnTreeNode node = new io.odysz.semantic.DA.DatasetCfg.AnTreeNode
				(rs.getString(io.odysz.semantic.DA.DatasetCfg.TreeSemantics.Ix.recId), rs.getString
				(io.odysz.semantic.DA.DatasetCfg.TreeSemantics.Ix.parent));
			for (int i = 1; i <= rs.getColCount(); i++)
			{
				string v = rs.getString(i);
				string col = rs.getColumnName(i);
				col = treeSemtcs.alias(col);
				if (v != null)
				{
					node.put(col, v);
				}
			}
			return node;
		}

		/// <exception cref="java.sql.SQLException"/>
		/// <exception cref="io.odysz.semantics.x.SemanticException"/>
		private static System.Collections.Generic.IList<object> buildSubTree(io.odysz.semantic.DA.DatasetCfg.TreeSemantics
			 sm, io.odysz.semantic.DA.DatasetCfg.AnTreeNode root, string parentId, io.odysz.module.rs.AnResultset
			 rs)
		{
			System.Collections.Generic.IList<object> childrenArray = new System.Collections.Generic.List
				<object>();
			while (rs.next())
			{
				if (parentId == null || root == null)
				{
					io.odysz.common.Utils.warn("Found children for null parent. Parent: %s\n", root.ToString
						());
					io.odysz.common.Utils.warn(rs.getRowAt(rs.getRow()));
					io.odysz.common.Utils.warn("\n-- -- -- -- This is a common error when tree structure is broken, check data of recently printed sql."
						);
					throw new io.odysz.semantics.x.SemanticException("Found children for null parent. Check the data queried by recent committed SQL."
						);
				}
				string currentParentID = rs.getString(sm.aliasParent());
				if (currentParentID == null || currentParentID.Trim().Length == 0)
				{
					// new tree root
					rs.previous();
					if (childrenArray.Count > 0)
					{
						root.children(childrenArray);
					}
					return childrenArray;
				}
				// HERE! ending adding children
				if (!currentParentID.Trim().Equals(parentId.Trim()))
				{
					rs.previous();
					if (childrenArray.Count > 0)
					{
						root.children(childrenArray);
					}
					return childrenArray;
				}
				io.odysz.semantic.DA.DatasetCfg.AnTreeNode child = formatSemanticNode(sm, rs);
				System.Collections.Generic.IList<object> subOrg = buildSubTree(sm, child, rs.getString
					(sm.dbRecId()), rs);
				if (subOrg.Count > 0)
				{
					root.children(childrenArray);
				}
				childrenArray.add(child);
			}
			return childrenArray;
		}

		/// <summary>
		/// POJO dataset element as configured in dataset.xml.<br />
		/// (oracle mapping information also initialized according to mapping file and the "cols" tag.)
		/// </summary>
		public class Dataset
		{
			internal string k;

			internal string[] sqls;

			/// <summary>
			/// Configuration in dataset.xml/t/c/s-tree.<br />
			/// If the result set can be used to construct a tree, a tree semantics configuration is needed.
			/// </summary>
			/// <remarks>
			/// Configuration in dataset.xml/t/c/s-tree.<br />
			/// If the result set can be used to construct a tree, a tree semantics configuration is needed.
			/// "s-tree" tag is used to configure a tree semantics configuration.
			/// <p>s-tree tag can support optional alias, which is needed in Stree servlet
			/// as the client needing some special fields but with queried results from abstract sql construction.<br />
			/// Core data: String[][] treeSemtcs;
			/// </remarks>
			internal io.odysz.semantic.DA.DatasetCfg.TreeSemantics treeSemtcs;

			/// <summary>Create a dataset, with mapping prepared according with mapping file.</summary>
			/// <param name="k"/>
			/// <param name="cols"/>
			/// <param name="sqls"/>
			/// <param name="stree"/>
			/// <param name="orclMappings">mappings from mapping the file.</param>
			/// <exception cref="org.xml.sax.SAXException"></exception>
			public Dataset(string k, string cols, string[] sqls, string stree)
			{
				this.k = k;
				this.sqls = sqls;
				this.treeSemtcs = stree == null ? null : new io.odysz.semantic.DA.DatasetCfg.TreeSemantics
					(stree);
			}

			/// <param name="driver">drv_orcl, drv_ms2k, drv_sqlit, drv_mysql(default)</param>
			/// <returns>sql db version of the jdbc connection</returns>
			/// <exception cref="io.odysz.semantics.x.SemanticException">can't find correct sql version
			/// 	</exception>
			public virtual string getSql(io.odysz.common.dbtype driver)
			{
				if (driver == null)
				{
					return null;
				}
				if (driver == io.odysz.common.dbtype.oracle)
				{
					return sqls[ixOrcl];
				}
				else
				{
					if (driver == io.odysz.common.dbtype.ms2k)
					{
						return sqls[ixMs2k];
					}
					else
					{
						if (driver == io.odysz.common.dbtype.sqlite)
						{
							return sqls[ixSqlit];
						}
						else
						{
							if (driver == io.odysz.common.dbtype.mysql)
							{
								return sqls[ixMysql];
							}
							else
							{
								throw new io.odysz.semantics.x.SemanticException("unsupported db type: %s", driver
									);
							}
						}
					}
				}
			}

			public virtual string sk()
			{
				return k;
			}
		}

		/// <exception cref="io.odysz.semantics.x.SemanticException"/>
		/// <exception cref="java.sql.SQLException"/>
		public static io.odysz.module.rs.AnResultset loadDataset(string conn, string sk)
		{
			return loadDataset(conn, sk, -1, -1, string.Empty);
		}
	}
}
