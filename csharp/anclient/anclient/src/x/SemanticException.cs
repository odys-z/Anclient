using Sharpen;

namespace io.odysz.semantics.x
{
	[System.Serializable]
	public class SemanticException : io.odysz.transact.x.TransException
	{
		private const long serialVersionUID = 1L;

		private io.odysz.semantics.SemanticObject ex;

		public SemanticException(string format, params object[] args)
			: base(format, args)
		{
		}

		/// <summary>Get the exception message object that can be serialized to json and send to client.
		/// 	</summary>
		/// <returns/>
		public virtual io.odysz.semantics.SemanticObject ex()
		{
			return ex;
		}

		public virtual io.odysz.semantics.x.SemanticException ex(io.odysz.semantics.SemanticObject
			 ex)
		{
			this.ex = ex;
			return this;
		}
	}
}
