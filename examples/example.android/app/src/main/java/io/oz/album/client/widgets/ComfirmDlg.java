package io.oz.album.client.widgets;

import android.app.Activity;
import android.app.Dialog;
import android.content.DialogInterface;
import android.os.Bundle;
import android.os.CountDownTimer;

import androidx.appcompat.app.AlertDialog;
import androidx.fragment.app.DialogFragment;
import androidx.fragment.app.FragmentActivity;

import io.oz.R;

import static io.odysz.common.LangExt.is;

public class ComfirmDlg extends DialogFragment {
    private final Activity acty;
    boolean showCancel;
    int msgid;
    /** default for msgid == 0 */
    String msg;

    int txt_ok;
    int txt_cancel;
    int livingms;
    DialogInterface.OnClickListener onOk;
    DialogInterface.OnClickListener onCancel;

    public ComfirmDlg(final Activity acty, boolean... showCancel) {
        this.acty = acty;
        this.showCancel = is(showCancel);
    }

    /**
     *
     * @param msg
     * @param txtOk OK button text, 0 for default
     * @param txtCancel Cancel button text, 0 for default
     * @return this
     */
    public ComfirmDlg dlgMsg(int msg, int txtOk, int... txtCancel) {
        msgid = msg;
        txt_ok = txtOk > 0 ? txtOk : R.string.txt0_ok;
        txt_cancel = txtCancel == null || txtCancel.length == 0 ? R.string.txt0_cancel : txtCancel[0];
        return this;
    }

    public ComfirmDlg msg(String msg) {
        this.msg = msg;
        return this;
    }

    public ComfirmDlg onOk(DialogInterface.OnClickListener ok) {
        onOk = ok;
        return this;
    }

    public ComfirmDlg onCancel(DialogInterface.OnClickListener cancel) {
        onCancel = cancel;
        return this;
    }

    @Override
    public Dialog onCreateDialog(Bundle savedInstanceState) {
        AlertDialog.Builder builder = new AlertDialog.Builder(getActivity());
        if (msgid == 0)
            builder.setMessage(this.msg);
        else
            builder.setMessage(msgid);

        builder.setPositiveButton(txt_ok, (dialog, id) -> {
                    if (onOk != null)
                        onOk.onClick(dialog, id);
                });
        if (showCancel)
            builder.setNegativeButton(txt_cancel, (dialog, id) -> {
                    if (onCancel != null)
                        onCancel.onClick(dialog, id);
                });
        return builder.create();
    }

    public ComfirmDlg showDlg(FragmentActivity act, String tag) {
        show(getActivity().getSupportFragmentManager(), tag);
        dismissin(livingms);
        return this;
    }

    private void dismissin(int ms) {
        if (ms > 0) {
            acty.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    new CountDownTimer(ms, ms) {
                        @Override public void onTick(long millisUntilFinished) { }
                        @Override public void onFinish() { dismiss(); }
                    }.start();
                }
            } );
        }
//            new CountDownTimer(ms, ms) {
//                @Override public void onTick(long millisUntilFinished) { }
//                @Override public void onFinish() { dismiss(); }
////                @Override public void onFinish() {
////                    getActivity().runOnUiThread(new Runnable() {
////                        @Override
////                        public void run() {
////                            dismiss();
////                        }
////                    });
////                }
////            }.start();
//        }
    }

    public ComfirmDlg live(int milliseconds) {
        livingms = milliseconds;
        dismissin(livingms);
        return this;
    }
}
