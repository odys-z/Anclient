using io.odysz.transact.x;
using System;

namespace io.odysz.semantics.x
{
	[Serializable]
	public class SemanticException : TransException
	{
		public SemanticObject ex { get; set; }

		public SemanticException(string format, object[] args)
			: base(format, args)
		{ }

        public SemanticException(string message, object arg = null)
			: base(message, new object[] { arg })
        { } 

        public SemanticException(string format, object arg1, object arg2)
			: base(format, new object[] {arg1, arg2}) 
		{ }
        public SemanticException(string format, object arg1, object arg2, object arg3, object arg4 = null)
			: base(format, new object[] {arg1, arg2, arg3, arg4}) 
		{ }
    }
}
