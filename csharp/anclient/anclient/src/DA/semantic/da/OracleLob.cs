using Sharpen;

namespace io.odysz.semantic.DA
{
	/// <summary>POJO class for oracle lob buffering.</summary>
	/// <author>ody</author>
	public class OracleLob
	{
		internal string tabl;

		public virtual string tabl()
		{
			return tabl;
		}

		internal string lobField;

		public virtual string lobField()
		{
			return lobField;
		}

		internal object lob;

		public virtual object lob()
		{
			return lob;
		}

		internal string idField;

		public virtual string idField()
		{
			return idField;
		}

		internal string recId;

		public virtual string recId()
		{
			return recId;
		}

		public OracleLob(string tabl, string lobField, object lob)
		{
			this.tabl = tabl;
			this.lobField = lobField;
			this.lob = lob;
		}

		public virtual void recId(string idField, string recId)
		{
			this.idField = idField;
			this.recId = recId;
		}

		public static io.odysz.semantic.DA.OracleLob template(string tabl, string idField
			, string lobField)
		{
			io.odysz.semantic.DA.OracleLob orclob = new io.odysz.semantic.DA.OracleLob(tabl, 
				lobField, null);
			orclob.idField = idField;
			return orclob;
		}

		internal static void setClob(java.sql.Connection conn, io.odysz.semantic.DA.OracleLob
			 lob)
		{
		}
	}
}
