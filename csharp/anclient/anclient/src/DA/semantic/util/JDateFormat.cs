using Sharpen;

namespace io.odysz.semantic.util
{
	/// <summary>
	/// Date formatting and parsing helper.<br />
	/// This is basically used for datatime used in Json / Gson.
	/// </summary>
	/// <remarks>
	/// Date formatting and parsing helper.<br />
	/// This is basically used for datatime used in Json / Gson.
	/// <p>For date format reference, see
	/// <a href='https://docs.oracle.com/javase/7/docs/api/java/text/SimpleDateFormat.html'>Class SimpleDateFormat API at Oracle</a><br />
	/// For additional information of Json datetime format:
	/// <a href='https://www.ibm.com/developerworks/library/j-javaee8-json-binding-4/index.html'>IBM Learn</a>
	/// </p>
	/// <br />For sql format helper, see
	/// <see cref="DateFormat"/>
	/// .
	/// </remarks>
	/// <author>ody</author>
	public class JDateFormat
	{
		/// <summary>yyyy-MM-dd</summary>
		private static java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("yyyy-MM-dd"
			);

		private static io.odysz.semantic.util.JDateFormat sdfInst;

		/// <summary>yyyy年MM月dd日</summary>
		private static readonly java.text.SimpleDateFormat sdfZh = new java.text.SimpleDateFormat
			("yyyy年MM月dd日");

		private static io.odysz.semantic.util.JDateFormat sdfZhInst;

		/// <summary>yyyy-MM-dd'T'HH:mm:ss.SSSZ, e.g.</summary>
		/// <remarks>yyyy-MM-dd'T'HH:mm:ss.SSSZ, e.g. 2001-07-04T12:08:56.235-0700</remarks>
		private static java.text.SimpleDateFormat iso8601 = new java.text.SimpleDateFormat
			("yyyy-MM-dd'T'HH:mm:ss.SSSZ");

		private static io.odysz.semantic.util.JDateFormat iso8601Inst;

		/// <summary>yyyy年MM月dd日'T'HH:mm:ss.SSSZ, e.g.</summary>
		/// <remarks>yyyy年MM月dd日'T'HH:mm:ss.SSSZ, e.g. 2001年07月04日T12:08:56.235-0700</remarks>
		private static java.text.SimpleDateFormat iso8601zh = new java.text.SimpleDateFormat
			("yyyy年MM月dd日'T'HH:mm:ss.SSSZ");

		private static io.odysz.semantic.util.JDateFormat iso8601zhInst;

		/// <summary>yyyy-MM-dd HH:mm:ss, e.g.</summary>
		/// <remarks>yyyy-MM-dd HH:mm:ss, e.g. 2001-07-04 12:08:56.235</remarks>
		private static java.text.SimpleDateFormat sdflong = new java.text.SimpleDateFormat
			("yyyy-MM-dd HH:mm:ss");

		private static io.odysz.semantic.util.JDateFormat sdflongInst;

		private java.text.SimpleDateFormat mysdf;

		public JDateFormat(java.text.SimpleDateFormat sdf)
		{
			mysdf = sdf;
		}

		/// <summary>yyyy年MM月dd日</summary>
		public static io.odysz.semantic.util.JDateFormat JdateZh()
		{
			if (sdfZhInst == null)
			{
				sdfZhInst = new io.odysz.semantic.util.JDateFormat(sdfZh);
			}
			return sdfZhInst;
		}

		/// <summary>yyyy-MM-dd</summary>
		public static io.odysz.semantic.util.JDateFormat Jdate()
		{
			if (sdfInst == null)
			{
				sdfInst = new io.odysz.semantic.util.JDateFormat(sdf);
			}
			return sdfInst;
		}

		/// <summary>yyyy年MM月dd日'T'HH:mm:ss.SSSZ, e.g.</summary>
		/// <remarks>yyyy年MM月dd日'T'HH:mm:ss.SSSZ, e.g. 2001年07月04日T12:08:56.235-0700</remarks>
		public static io.odysz.semantic.util.JDateFormat iso8601Zh()
		{
			if (iso8601zhInst == null)
			{
				iso8601zhInst = new io.odysz.semantic.util.JDateFormat(iso8601zh);
			}
			return iso8601zhInst;
		}

		/// <summary>yyyy-MM-dd'T'HH:mm:ss.SSSZ, e.g.</summary>
		/// <remarks>yyyy-MM-dd'T'HH:mm:ss.SSSZ, e.g. 2001-07-04T12:08:56.235-0700</remarks>
		public static io.odysz.semantic.util.JDateFormat iso8601()
		{
			if (iso8601Inst == null)
			{
				iso8601Inst = new io.odysz.semantic.util.JDateFormat(iso8601);
			}
			return iso8601Inst;
		}

		/// <summary>yyyy-MM-dd HH:mm:ss, e.g.</summary>
		/// <remarks>yyyy-MM-dd HH:mm:ss, e.g. 2001-07-04 12:08:56.235</remarks>
		public static io.odysz.semantic.util.JDateFormat simpleLong()
		{
			if (sdflongInst == null)
			{
				sdflongInst = new io.odysz.semantic.util.JDateFormat(sdflong);
			}
			return sdflongInst;
		}

		/// <summary>yyyy-MM-dd</summary>
		/// <param name="d"/>
		/// <returns>mysdf.format(d)</returns>
		public virtual string format(System.DateTime d)
		{
			return d == null ? " - - " : mysdf.format(d);
		}

		/// <exception cref="java.text.ParseException"/>
		public virtual System.DateTime parse(string text)
		{
			return mysdf.parse(text);
		}

		/// <exception cref="java.text.ParseException"/>
		public virtual string incSeconds(io.odysz.common.dbtype drvType, string date0, int
			 snds)
		{
			System.DateTime d0 = parse(date0);
			d0.setTime(d0.getTime() + snds);
			return format(d0);
		}

		public static string getDayDiff(System.DateTime date2, System.DateTime date1)
		{
			if (date2 == null || date1 == null)
			{
				return "-";
			}
			return Sharpen.Runtime.getStringValueOf(getDayDiffInt(date2, date1));
		}

		public static long getDayDiffInt(System.DateTime d2, System.DateTime d1)
		{
			if (d2 == null || d1 == null)
			{
				return -1;
			}
			long diff = d2.getTime() - d1.getTime();
			return java.util.concurrent.TimeUnit.DAYS.convert(diff, java.util.concurrent.TimeUnit
				.MILLISECONDS);
		}
	}
}
