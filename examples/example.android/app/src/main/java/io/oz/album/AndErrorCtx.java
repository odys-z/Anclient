package io.oz.album;

import android.app.Activity;
import android.content.Context;
import android.view.View;
import android.widget.TextView;

import io.odysz.jclient.tier.ErrorCtx;
import io.odysz.semantic.jprotocol.AnsonMsg;

import static io.odysz.common.LangExt.isNull;

public class AndErrorCtx extends ErrorCtx {
	Context ctx;
	TextView msgv;
	int template;

	public AndErrorCtx context(Context ctx) {
		this.ctx = ctx;
		return this;
	}

	public ErrorCtx prepare(TextView view, int template) {
		this.msgv = view;
		this.template = template;
		return this; // FIXME: should create new instance to avoid multiple thread interfering?
	}

	@Override
	public void err(AnsonMsg.MsgCode code, String msg, String ... args) {
		super.err(code, msg, args);
		showMsg(template, code, msg, (Object[]) args);
	}

	/**
	 * Note: Keep this method - will be implemented with UI elements in the future?
	 * @param template string template, R.string.id, Important: tamplate can have at most 2 formater, i.e. %s.
	 * @param args only max 2 value handled as the second value. Tried as: "details: %s\n%s"
	 */
	void showMsg(int template, AnsonMsg.MsgCode code, String m, Object ... args) {
		((Activity)ctx).runOnUiThread( () -> {
			String details ="";
			if (args != null && args.length > 1)
				try { details = String.format("details: %s\n%s", args);} catch (Exception e) {}
			else if (!isNull(args))
				try { details = String.format("details: %s", args);} catch (Exception e) {}
			String msg = String.format(ctx.getString(template), m, details);

			msgv.setText(msg);
			msgv.setVisibility(View.VISIBLE);
		});
	}
}
