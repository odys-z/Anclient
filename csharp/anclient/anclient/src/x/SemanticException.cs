namespace io.odysz.semantics.x
{
	[System.Serializable]
	public class SemanticException : io.odysz.transact.x.TransException
	{
		private SemanticObject ex { get; set; }

		public SemanticException(string format, params object[] args)
			: base(format, args)
		{
		}

		///// <summary>Get the exception message object that can be serialized to json and send to client.
		///// 	</summary>
		///// <returns/>
		//public virtual SemanticObject ex()
		//{
		//	return ex;
		//}

		//public virtual SemanticException ex(manticObject ex)
		//{
		//	this.ex = ex;
		//	return this;
		//}
	}
}
