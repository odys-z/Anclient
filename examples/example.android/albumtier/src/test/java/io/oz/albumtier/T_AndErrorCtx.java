//package io.oz.albumtier;
//
//import static io.odysz.common.LangExt.isNull;
//
//import io.odysz.common.Utils;
//import io.odysz.jclient.tier.ErrorCtx;
//import io.odysz.semantic.jprotocol.AnsonMsg;
//
//public class T_AndErrorCtx extends ErrorCtx {
//	int template;
//
//	@Override
//	public void err(AnsonMsg.MsgCode code, String msg, String ... args) {
//		super.err(code, msg, args);
//		showMsg(template, code, msg, (Object[]) args);
//	}
//
//	/**
//	 * @param template string template, R.string.id, Important: tamplate can have at most 2 formater, i.e. %s.
//	 * @param args only max 2 value handled as the second value. Tried as: "details: %s\n%s"
//	 */
//	void showMsg(int template, AnsonMsg.MsgCode code, String m, Object ... args) {
//			String details ="";
//			if (args != null && args.length > 1)
//				try { details = String.format("details: %s\n%s", args);} catch (Exception e) {}
//			else if (!isNull(args))
//				try { details = String.format("details: %s", args);} catch (Exception e) {}
//
//			Utils.warn("%s, %s", m, details);
//	}
//}
