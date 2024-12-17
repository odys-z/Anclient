//package io.oz.syndoc.client;
//
//import io.odysz.semantic.syn.SynodeMode;
//import io.odysz.semantics.x.SemanticException;
//
///**
// * File's pushing flag at mobile devices. Replacing SyncDoc.syncFlag.
// * See semantic.jserv 1.4.41 package io.odysz.semantic.tier.docs.SyncDoc#SyncFlag.
// *
// * @deprecated to be deleted, replaced by ShareFlag.
// */
//public class PushingState {
//	/** Kept as private file ('🔒') at private node. */
//	public static final String priv = "🔒";
//
//	/** To be pushed (shared) to hub ('⇈') */
//	public static final String pushing = "⇈";
//
//	/**synchronized (shared) with a synode ('🌎') */
//	public static final String publish = "🌎";
//	
//	/**created at a device (client) node ('📱') */
//	public static final String device = "📱";
//	
//	/** The doc is locally removed, and the task is waiting to push to a synode ('Ⓛ') */
//	public static final String loc_remove = "Ⓛ";
//
//	/** what's this for ? */
//	public static final String deny = "⛔";
//	
//	public static String start(SynodeMode mode, String share) throws SemanticException {
////		if (SynodeMode.hub == mode)
////			return Share.isPub(share) ? publish : hub;
////		else if (SynodeMode.bridge == mode || SynodeMode.main == mode)
////			return priv;
//		throw new SemanticException("Unhandled state starting: mode %s : share %s.", mode, share);
//	}
//}
