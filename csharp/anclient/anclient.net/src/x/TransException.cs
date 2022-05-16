namespace io.odysz.transact.x
{
	[System.Serializable]
	public class TransException : System.Exception
	{
		public TransException(string format, object[] args = null)
			: base(string.IsNullOrEmpty(format) ?  null
				  : args != null && args.Length > 0 ?
					string.Format(format, args) : format)
		{
		}
		public TransException(string format, object arg1, object arg2 = null) : this(format, new object[] { arg1, arg2 })
        {
        }
	}
}
