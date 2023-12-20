package io.oz.album.webview;

import android.util.Log;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class VWebAlbum extends WebViewClient {

	@Override
	public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
		Log.v("URL", request.getUrl().toString() );
		return false;
	}
}
