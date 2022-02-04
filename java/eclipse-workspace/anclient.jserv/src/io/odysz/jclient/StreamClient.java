package io.odysz.jclient;

import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;

import org.apache.commons.io.IOUtils;

import io.odysz.anson.x.AnsonException;
import io.odysz.common.Utils;
import io.odysz.semantic.tier.docs.DocsReq;
import io.oz.album.tier.FileRecord;

public class StreamClient extends HttpServClient {

	protected String url;

	public StreamClient(String jserv) {
		this.url = jserv;
	}

	public String download(DocsReq rec, String localpath) throws IOException, AnsonException {
		URL obj = new URL(url);
		HttpURLConnection con = (HttpURLConnection) obj.openConnection();

		//add reuqest header
		con.setRequestMethod("POST");
		con.setRequestProperty("User-Agent", USER_AGENT);
		con.setRequestProperty("Accept-Language", "en-US,en;q=0.5");
		con.setRequestProperty("Content-Type", "text/plain"); 
	    con.setRequestProperty("charset", "utf-8");

		// Send post request
		con.setDoOutput(true);

		// JHelper.writeAnsonReq(con.getOutputStream(), jreq);
		rec.toBlock(con.getOutputStream());

		if (Clients.console) Utils.logi(url);

		InputStream ins = con.getInputStream();
		FileOutputStream ofs = new FileOutputStream(localpath);  
		IOUtils.copy(ins, ofs);
		ofs.close();

		return localpath;
	}

	public String upload(FileRecord rec, String localPath) {
		return localPath;
	}

}
