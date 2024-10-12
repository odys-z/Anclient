package io.oz.album.webview;

import android.content.Intent;
import android.content.res.Configuration;
import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import androidx.appcompat.app.AppCompatActivity;

import org.jetbrains.annotations.NotNull;

import io.oz.R;
import io.oz.album.AndErrorCtx;
import io.oz.album.AssetHelper;
import io.oz.album.WelcomeAct;
import io.oz.albumtier.AlbumContext;

public class WebAlbumAct extends AppCompatActivity {

	public static final String Web_PageName = "WebAction";

	/** Landing uril such as error page, e.g. http://odys-z.github.io/Anclient */
	static String url_landing;

	AlbumContext singleton;
	AndErrorCtx errCtx;
	int webpageId;

	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.wv);

		errCtx = new AndErrorCtx().context(this);
		singleton = AlbumContext.getInstance(errCtx);

		url_landing = getString(R.string.url_landing);

		Intent intt = getIntent();
		webpageId = intt.getIntExtra(Web_PageName, AssetHelper.Act_Landing);

		WebView wv = findViewById(R.id.wv);
		wv.getSettings().setJavaScriptEnabled(true);
		wv.setWebViewClient(new WebViewClient() {
		});
		wv.loadUrl(AssetHelper.url4intent(this, webpageId));
	}

	@Override
	protected void onResume() {
		super.onResume();

		WebView wv = findViewById(R.id.wv);
		WelcomeAct.reloadWeb(singleton, wv, this, webpageId);
	}

	@Override
	public void onConfigurationChanged(@NotNull Configuration newConfig) {
		super.onConfigurationChanged(newConfig);

		WindowManager.LayoutParams attrs = getWindow().getAttributes();

		if (newConfig.orientation == Configuration.ORIENTATION_LANDSCAPE) {
			attrs.flags |= WindowManager.LayoutParams.FLAG_FULLSCREEN;
			getWindow().setAttributes(attrs);

			if(this.getSupportActionBar() != null)
				getSupportActionBar().hide();
		} else if (newConfig.orientation == Configuration.ORIENTATION_PORTRAIT) {
			attrs.flags &= ~WindowManager.LayoutParams.FLAG_FULLSCREEN;
			getWindow().setAttributes(attrs);

			if(this.getSupportActionBar() != null)
				this.getSupportActionBar().show();
		}
	}

}
