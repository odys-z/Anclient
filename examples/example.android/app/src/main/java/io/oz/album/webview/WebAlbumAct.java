package io.oz.album.webview;

import android.content.Intent;
import android.os.Bundle;
import android.webkit.WebView;
import androidx.appcompat.app.AppCompatActivity;

import io.oz.R;
import io.oz.album.AndErrorCtx;
import io.oz.album.AssetHelper;
import io.oz.albumtier.AlbumContext;

public class WebAlbumAct extends AppCompatActivity {

	public static final String Help_ActionName = "WebAction";

	protected static final VWebAlbum webView = new VWebAlbum();

	/** Landing uril such as error page, e.g. http://odys-z.github.io/Anclient */
	static String url_landing;

	AlbumContext singleton;
	AndErrorCtx errCtx;

	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.wv);

		errCtx = new AndErrorCtx().context(this);
		singleton = AlbumContext.getInstance(errCtx);

		url_landing = getString(R.string.url_landing);

		Intent intt = getIntent();
		int act = intt.getIntExtra(Help_ActionName, AssetHelper.Act_Landing);

		WebView wv = findViewById(R.id.wv);
		wv.getSettings().setJavaScriptEnabled(true);
		// WebSettings webSettings = wv.getSettings();
		// webSettings.setJavaScriptEnabled(true);
		// wv.setWebViewClient(webView);
		wv.loadUrl(AssetHelper.url4intent(this, act));
	}
}
