package io.oz.album.webview;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.webkit.WebSettings;
import android.webkit.WebView;
import androidx.appcompat.app.AppCompatActivity;

import io.odysz.semantic.jprotocol.AnsonMsg;
import io.odysz.semantic.jprotocol.JProtocol;
import io.oz.R;
import io.oz.album.AndErrorCtx;
import io.oz.albumtier.AlbumContext;

public class WebAlbumAct extends AppCompatActivity {

	public static final String Web_ActionName = "WebAction";

	public static final int Act_Help = 1;
	public static final int Act_Landing = 2;
	public static final int Act_Album = 3;
	public static final int Act_SyncReport = 4;

	private static final VWebAlbum appView = new VWebAlbum();

	private static final String url_landing = "https://odys-z.github.io/Anclient";

	AndErrorCtx errCtx;

	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.wv);

		errCtx = new AndErrorCtx().context(this);

		Intent intt = getIntent();
		int act = intt.getIntExtra(Web_ActionName, Act_Landing);
		String url = loadUrls(act);

		WebView wv = findViewById(R.id.wv);
		wv.setWebViewClient(appView);
		WebSettings webSettings = wv.getSettings();
		webSettings.setJavaScriptEnabled(true);
		wv.loadUrl(url);
	}

	private String loadUrls(int act) {
		AlbumContext single = AlbumContext.getInstance(errCtx);
	    switch (act) {
			case Act_Album:
				return getString(R.string.url_album, single.jserv(), single.albumHome);
			case Act_SyncReport:
				return getString(R.string.url_sync_report, single.jserv(), single.synchPage);
			case Act_Help:
				return getString(R.string.url_help);
			case Act_Landing:
			default:
				return url_landing;
		}
	}
}
