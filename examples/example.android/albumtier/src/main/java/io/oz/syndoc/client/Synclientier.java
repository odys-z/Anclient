package io.oz.syndoc.client;

import java.io.IOException;
import io.odysz.jclient.tier.ErrorCtx;
import io.odysz.semantics.x.SemanticException;
import io.oz.jserv.docs.syn.Doclientier;

public class Synclientier extends Doclientier {

 	public Synclientier(String sysuri, String synuri, ErrorCtx errCtx)
 			throws SemanticException, IOException {

		super(sysuri, synuri, errCtx);
	}
}
