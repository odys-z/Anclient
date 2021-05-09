//using Sharpen;

//namespace io.odysz.semantics.meta
//{
//	public class TableMeta
//	{
//		private string conn;

//		private System.Collections.Generic.Dictionary<string, io.odysz.semantics.meta.ColMeta
//			> types;

//		public TableMeta(string tbl, params string[] conn)
//		{
//			types = new System.Collections.Generic.Dictionary<string, io.odysz.semantics.meta.ColMeta
//				>();
//			this.conn = conn != null && conn.Length > 0 ? conn[0] : null;
//		}

//		public virtual io.odysz.semantics.meta.TableMeta col(string col, io.odysz.semantics.meta.ColMeta.coltype
//			 t)
//		{
//			types[col] = new io.odysz.semantics.meta.ColMeta(t);
//			return this;
//		}

//		public virtual bool isQuoted(string col)
//		{
//			return types.Contains(col) ? types[col].isQuoted() : true;
//		}

//		public virtual io.odysz.semantics.meta.TableMeta col(string coln, string t, int len
//			)
//		{
//			io.odysz.semantics.meta.ColMeta cm = new io.odysz.semantics.meta.ColMeta(t);
//			//		// weird maven behavior
//			//		Utils.warn("weird weird weird  %s %s %s...............................", coln, t, len);
//			//		if (types == null)
//			//			// strange
//			//			Utils.warn("That's so strange ...............................");
//			types[coln] = cm.tlen(len);
//			return this;
//		}

//		public virtual io.odysz.semantics.meta.TableMeta col(string col, string type)
//		{
//			return col(col, type, 0);
//		}

//		public virtual io.odysz.semantics.meta.ColMeta.coltype coltype(string col)
//		{
//			return types != null && types.Contains(col) ? types[col].type() : io.odysz.semantics.meta.ColMeta.coltype
//				.text;
//		}
//	}
//}
