//using Sharpen;

//namespace io.odysz.semantics.meta
//{
//	public class ColMeta
//	{
//		/// <summary>0: text, 1: datetime, 2: number, 3: clob, 4: bin</summary>
//		internal static io.odysz.common.Regex regtext = new io.odysz.common.Regex("(varchar.?|text|char)?(.*time.*|date.*)?(int.*|float|decimal)?(clob)?(b?lob|bin|binary)?"
//			);

//		public enum coltype
//		{
//			number,
//			text,
//			datetime,
//			clob,
//			bin
//		}

//		private io.odysz.semantics.meta.ColMeta.coltype t;

//		private int len = 0;

//		public ColMeta(io.odysz.semantics.meta.ColMeta.coltype type)
//		{
//			t = type;
//		}

//		public ColMeta(string type)
//		{
//			t = parse(type);
//			len = 0;
//		}

//		private io.odysz.semantics.meta.ColMeta.coltype parse(string type)
//		{
//			if (type == null)
//			{
//				return io.odysz.semantics.meta.ColMeta.coltype.text;
//			}
//			System.Collections.Generic.List<string> g = regtext.findGroups(type.ToLower());
//			if (g[0] != null)
//			{
//				return io.odysz.semantics.meta.ColMeta.coltype.text;
//			}
//			else
//			{
//				if (g[1] != null)
//				{
//					return io.odysz.semantics.meta.ColMeta.coltype.datetime;
//				}
//				else
//				{
//					if (g[2] != null)
//					{
//						return io.odysz.semantics.meta.ColMeta.coltype.number;
//					}
//					else
//					{
//						if (g[3] != null)
//						{
//							return io.odysz.semantics.meta.ColMeta.coltype.clob;
//						}
//						else
//						{
//							if (g[4] != null)
//							{
//								return io.odysz.semantics.meta.ColMeta.coltype.bin;
//							}
//						}
//					}
//				}
//			}
//			return io.odysz.semantics.meta.ColMeta.coltype.text;
//		}

//		public virtual io.odysz.semantics.meta.ColMeta tlen(int len)
//		{
//			this.len = len;
//			return this;
//		}

//		public virtual int len()
//		{
//			return len;
//		}

//		public virtual bool isQuoted()
//		{
//			return this.t == null || this.t == io.odysz.semantics.meta.ColMeta.coltype.text ||
//				 this.t == io.odysz.semantics.meta.ColMeta.coltype.datetime;
//		}

//		public virtual io.odysz.semantics.meta.ColMeta.coltype type()
//		{
//			return t;
//		}
//	}
//}
