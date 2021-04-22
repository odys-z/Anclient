using Sharpen;

namespace io.odysz.semantic.jprotocol
{
	public class JProtocol
	{
		/// <summary>Typical operation's common names</summary>
		public class CRUD
		{
			public const string C = "I";

			public const string R = "R";

			public const string U = "U";

			public const string D = "D";
		}

		public interface SCallbackV11
		{
			/// <summary>call back function called by semantic.transact</summary>
			/// <param name="msgCode">'ok' | 'ex...'</param>
			/// <param name="resp">response message</param>
			/// <exception cref="System.IO.IOException"/>
			/// <exception cref="java.sql.SQLException"/>
			/// <exception cref="io.odysz.semantics.x.SemanticException"/>
			/// <exception cref="io.odysz.anson.x.AnsonException"/>
			void onCallback(io.odysz.semantic.jprotocol.AnsonMsg.MsgCode msgCode, io.odysz.semantic.jprotocol.AnsonResp
				 resp);
		}

		public static io.odysz.semantics.SemanticObject err(io.odysz.semantic.jprotocol.IPort
			 port, string code, string err)
		{
			io.odysz.semantics.SemanticObject obj = new io.odysz.semantics.SemanticObject();
			obj.put("code", code);
			obj.put("error", err);
			obj.put("port", port.name());
			return obj;
		}

		public static io.odysz.semantics.SemanticObject ok(io.odysz.semantic.jprotocol.IPort
			 port, object data)
		{
			io.odysz.semantics.SemanticObject obj = new io.odysz.semantics.SemanticObject();
			obj.put("code", io.odysz.semantic.jprotocol.AnsonMsg.MsgCode.ok.ToString());
			obj.put("data", data);
			obj.put("port", port.name());
			return obj;
		}

		public static io.odysz.semantics.SemanticObject ok(io.odysz.semantic.jprotocol.IPort
			 port, string msg, params object[] msgArgs)
		{
			return ok(port, string.format(msg, msgArgs));
		}

		//////////////////////// version 1.1 with support of Anson //////////////////////
		public static io.odysz.semantic.jprotocol.AnsonMsg<io.odysz.semantic.jprotocol.AnsonResp
			> err(io.odysz.semantic.jprotocol.AnsonMsg.Port port, io.odysz.semantic.jprotocol.AnsonMsg.MsgCode
			 code, string err)
		{
			io.odysz.semantic.jprotocol.AnsonResp obj = new io.odysz.semantic.jprotocol.AnsonResp
				(err);
			io.odysz.semantic.jprotocol.AnsonMsg<io.odysz.semantic.jprotocol.AnsonResp> msg = 
				new io.odysz.semantic.jprotocol.AnsonMsg<io.odysz.semantic.jprotocol.AnsonResp>(
				port, code).body(obj);
			return msg;
		}
	}
}
