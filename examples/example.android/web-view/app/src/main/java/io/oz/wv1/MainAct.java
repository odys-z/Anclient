package io.oz.wv1;

import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;

public class MainAct extends AppCompatActivity {

	private static final WvClient appView = new WvClient();

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.wv);

		WebView wv = findViewById(R.id.wv);
		wv.setWebViewClient(appView);
		WebSettings webSettings = wv.getSettings();
		webSettings.setJavaScriptEnabled(true);
		wv.loadUrl("http://192.168.0.201:8888/test/react/dist/login.html?serv=host");
	}
}
