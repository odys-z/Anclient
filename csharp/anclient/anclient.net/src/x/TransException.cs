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
	}
}
