package io.odysz.jclient;

import static io.odysz.common.LangExt.f;
import static io.odysz.common.Utils.turngreen;
import static io.odysz.common.Utils.turnred;

import static org.junit.jupiter.api.Assertions.*;

import java.net.URL;

import org.junit.jupiter.api.Test;

import io.odysz.anson.Anson;
import io.odysz.common.AESHelper;
import io.odysz.semantic.jprotocol.AnsonMsg;
import io.odysz.semantic.jprotocol.AnsonMsg.Port;
import io.odysz.semantic.tier.docs.DocsReq;
import io.oz.jsample.SampleApp;

class HttpServClientTest {

	@Test
	void testToUrlParam() throws Exception {
		boolean[] can_quit = new boolean[] {false};
		try {
		turnred(can_quit);
		SampleApp.startSampleServ(can_quit);
		String sample_jserv = f("http://localhost:%s/jserv-album", SampleApp.sampleton().settings.port);

		AnsonMsg.understandPorts(Port.echo);
		
		String req = "{\"type\": \"io.odysz.semantic.jprotocol.AnsonMsg\", "
				+ "\"code\": null, \"opts\": null, \"port\": \"syntier\", "
				+ "\"header\": {\"type\": \"io.odysz.semantic.jprotocol.AnsonHeader\", \"uid\": \"ody\", "
				+ "\"ssToken\": \"ebHFPATPGWt+8fEsehr3onIDHOH90j/QThPD/5SCdA8=:Wl+PK8LEDOI7AYW+sLPs6A==\", "
				+ "\"iv64\": null, \"ssid\": \"--t9qztg\", "
				+ "\"usrAct\": [\"/syn/X29\", \"r/doc206\", \"syntier\", \"C:\\\\Users\\\\Alice\\\\github\\\\semantic-jserv\\\\jserv-album\\\\vol-Y201\\\\resolve-X29\\\\--t9qztg\\\\ura\\\\ody\\\\2025-04\\\\010A 02重庆轨道交通6号线一、二期大修项目综合监控系统—ISCS技术要求202312.pdf\"]}, "
				+ "\"body\": [{\"type\": \"io.odysz.semantic.tier.docs.DocsReq\", \"tabl\": null, \"parent\": \"io.odysz.semantic.jprotocol.AnsonMsg\", \"a\": \"r/doc206\", \"data\": null, \"org\": null, \"pageInf\": null, \"stamp\": null, \"deletings\": null, \"nextBlock\": null, \"uri\": \"/syn/X29\", \"blockSeq\": 0, \"syncingPage\": null, \"syncQueries\": null, \"limit\": -1, "
				+ "\"doc\": {\"type\": \"io.odysz.semantic.tier.docs.ExpSyncDoc\", \"synoder\": null, \"org\": \"\", \"subs\": null, \"pname\": \"02重庆轨道交通6号线一、二期大修项目综合监控系统—ISCS技术要求202312.pdf\", \"shareby\": null, \"mime\": null, \"shareMsg\": null, \"uri64\": \"Asnon field shortened ... \", \"clientpath\": null, \"synode\": null, \"folder\": null, \"size\": 0, \"uids\": \"X29,010A\", \"sharedate\": null, \"shareflag\": null, \"device\": null, \"nyquence\": null, \"recId\": \"010A\", \"createDate\": null}, "
				+ "\"reset\": false, \"docTabl\": \"h_photos\", \"device\": null, \"synuri\": null}], "
				+ "\"addr\": null, \"version\": \"1.1\", \"seq\": 980}";
		
		@SuppressWarnings("unchecked")
		AnsonMsg<DocsReq> jreq = (AnsonMsg<DocsReq>) Anson.fromJson(req);

		String[] parss = AESHelper.encode64(jreq.toBlock().getBytes()).split("\\+");
		assertTrue(parss != null && parss.length > 2);

 		URL url = new URL(f("%s?anson64=%s",
 				Port.echo.url(sample_jserv),
 				HttpServClient.escapeUrlParam(jreq)));

 		System.out.println(url);

		assertEquals(parss.length, url.toString().split("\\%2B").length);
		} finally { turngreen(can_quit); }
	}
}
