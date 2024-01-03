package io.oz.album.webview;

import android.content.Intent;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import androidx.appcompat.app.AppCompatActivity;

import io.oz.R;
import io.oz.albumtier.AlbumContext;

public class WebAlbumAct extends AppCompatActivity {

	public static final String Web_ActionName = "WebAction";

	public static final int Act_Help = 1;
	public static final int Act_Landing = 2;
	public static final int Act_Album = 3;
	public static final int Act_SyncReport = 4;

	private static final VWebAlbum appView = new VWebAlbum();

	private static final String url_landing = "https://odys-z.github.io/Anclient";

	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.wv);

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
	    switch (act) {
			case Act_Album:
				return getString(R.string.url_album, AlbumContext.getInstance().jserv(), AlbumContext.getInstance().albumHome);
			case Act_SyncReport:
				return getString(R.string.url_sync_report, AlbumContext.getInstance().jserv(), AlbumContext.getInstance().synchPage);
			case Act_Help:
				return getString(R.string.url_help);
			case Act_Landing:
			default:
				return url_landing;
		}
	}
}
