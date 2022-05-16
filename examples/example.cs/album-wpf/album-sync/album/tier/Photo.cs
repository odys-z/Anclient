using io.odysz.anson;
using System;
using System.Collections;

namespace io.odysz.tier
{
    public class Photo : Anson
    {
        // public string recId;
        public string recId;

		public string pname;

		public string clientpath;

		public int syncFlag;
		/** usally reported by client file system, overriden by exif date, if exits */
		public string createDate;

		public string uri;
		public string shareby;
		public string sharedate;
		public string geox;
		public string geoy;
		public string sharer;
		public ArrayList exif;
		public string mime;

        // public string collectId;
        public string collectId;

		public string albumId;

		public Photo() { }

		string month;
        protected string Month()
        {
            if (month == null)
                photoDate();
            return month;
        }

        public DateTime photoDate()
        {
            if (createDate != null && createDate != "")
            {
                DateTime d = DateTime.Parse(createDate);
                month = d.ToString("yyyy_MM");
                return d; // new ExprPart("'" + createDate + "'");
            }
            else
            {
                DateTime d = new DateTime();
                month = d.ToString("yyyy_MM");
                return d; //  Funcall.now();
            }
        }

        public Photo Month(DateTime d)
        {
            month = d.ToString("yyyy_MM");
            return this;
        }

        //public void month(FileTime d)
        //{
        //    _month = DateFormat.formatYYmm(d);
        //}
    }
}
