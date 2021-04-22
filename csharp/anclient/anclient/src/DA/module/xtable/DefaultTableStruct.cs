using Sharpen;

namespace io.odysz.module.xtable
{
	public class DefaultTableStruct : io.odysz.module.xtable.ITableStruct
	{
		protected internal const string attrNameTableID = "tableID";

		protected internal const string attrNameColumns = "columns";

		protected internal const string attrNamePks = "pk";

		protected internal java.util.LinkedHashMap<string, int> pkIdx;

		protected internal string pkDef;

		protected internal java.util.LinkedHashMap<string, int> colIdx;

		protected internal string colDef;

		public DefaultTableStruct(string colDefs, string pkDefs)
		{
			pkDef = pkDefs;
			colDef = colDefs;
		}

		public virtual java.util.LinkedHashMap<string, int> pkIdx()
		{
			if (pkIdx == null)
			{
				pkIdx = buildIdx(pkDef);
			}
			return pkIdx;
		}

		public virtual string pkDefs()
		{
			return pkDef;
		}

		public virtual java.util.LinkedHashMap<string, int> colIdx()
		{
			if (colIdx == null)
			{
				colIdx = buildIdx(colDef);
			}
			return colIdx;
		}

		protected internal static java.util.LinkedHashMap<string, int> buildIdx(string defs
			)
		{
			if (defs == null)
			{
				return null;
			}
			java.util.LinkedHashMap<string, int> idx = new java.util.LinkedHashMap<string, int
				>();
			string[] fns = defs.split(",");
			if (fns == null)
			{
				return null;
			}
			for (int i = 0; i < fns.Length; i++)
			{
				idx[fns[i].Trim()] = i;
			}
			return idx;
		}

		public virtual string colDefs()
		{
			return colDef;
		}

		public virtual string attrTableID()
		{
			return attrNameTableID;
		}

		public virtual string attrPks()
		{
			return attrNamePks;
		}

		public virtual string attrCols()
		{
			return attrNameColumns;
		}
	}
}
