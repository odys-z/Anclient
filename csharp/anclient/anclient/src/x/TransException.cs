namespace io.odysz.transact.x
{
	[System.Serializable]
	public class TransException : System.Exception
	{
		private const long serialVersionUID = 1L;

		public TransException(string format, params object[] args)
			: base(string.IsNullOrEmpty(format) ?  null
				  : args != null && args.Length > 0 ?
					string.Format(format, args) : format)
		{
		}
	}
}
