package io.oz.album.webview;

import android.util.Log;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class VWebAlbum extends WebViewClient {
	@Override
	public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
		/*
		if ("www.example.com".equals(request.getUrl().getHost())) {
			// This is my website, so do not override; let my WebView load the page
			return false;
		}
		// Otherwise, the link is not for a page on my site, so launch another Activity that handles URLs
		Intent intent = new Intent(Intent.ACTION_VIEW, request.getUrl());
		startActivity(intent);
		return true;
		*/

		Log.v("URL", request.getUrl().toString() );
		return false;
	}
}
