package io.oz.album.webview;

import android.app.Activity;
import android.webkit.JavascriptInterface;

import io.odysz.common.Utils;
import io.oz.album.WelcomeAct;

public class WebViewJavaScriptInterface {

    @FunctionalInterface
    public interface IJsHandler {
        void onEvent(String edata);
    }

    private final Activity activity;
    private final IJsHandler handler;

    public WebViewJavaScriptInterface(WelcomeAct activity, IJsHandler h) {
        this.activity = activity;
        this.handler  = h;
    }

    @JavascriptInterface
    public void onEvent(String eventData) {
        activity.runOnUiThread(() -> {
            Utils.logi("onEvent: %s", eventData);
            this.handler.onEvent(eventData);
        });
    }
}
