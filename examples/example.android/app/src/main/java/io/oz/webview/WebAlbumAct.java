package io.oz.webview;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;

import androidx.appcompat.app.AppCompatActivity;

public class WebAlbumAct extends AppCompatActivity {

	private static final VWebAlbum appView = new VWebAlbum();

	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.wv);

		WebView wv = findViewById(R.id.wv);
		wv.setWebViewClient(appView);
		WebSettings webSettings = wv.getSettings();
		webSettings.setJavaScriptEnabled(true);
		wv.loadUrl("http://10.0.0.245:8888/index.html?serv=host");
	}
}
