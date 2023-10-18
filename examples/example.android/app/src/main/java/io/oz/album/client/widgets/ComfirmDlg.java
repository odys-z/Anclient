package io.oz.album.client.widgets;

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
    boolean showCancel;
    int dlg_msg;
    int txt_ok;
    int txt_cancel;
    int livingms;
    private DialogInterface.OnClickListener onOk;
    private DialogInterface.OnClickListener onCancel;

    public ComfirmDlg(boolean... showCancel) {
        this.showCancel = is(showCancel);
    }


    /**
     *
     * @param msg
     * @param ok OK button text, 0 for default
     * @param cancel Cancel button text, 0 for default
     * @return this
     */
    public ComfirmDlg dlgMsg(int msg, int ok, int... cancel) {
        dlg_msg = msg;
        txt_ok = ok > 0 ? ok : R.string.txt0_ok;
        txt_cancel = cancel == null || cancel.length == 0 ? R.string.txt0_cancel : cancel[0];
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
        builder.setMessage(dlg_msg)
                .setPositiveButton(dlg_msg, (dialog, id) -> {
                    if (onOk != null)
                        onOk.onClick(dialog, id);
                })
                .setNegativeButton(dlg_msg, (dialog, id) -> {
                    if (onCancel != null)
                        onCancel.onClick(dialog, id);
                });
        return builder.create();
    }

    public ComfirmDlg showDlg(FragmentActivity act, String tag) {
        show(act.getSupportFragmentManager(), tag);
        if (livingms > 0) {
            new CountDownTimer(livingms, livingms) {
                @Override public void onTick(long millisUntilFinished) { }
                @Override public void onFinish() { dismiss(); }
            }.start();
        }
        return this;
    }

    public ComfirmDlg live(int milliseconds) {
        livingms = milliseconds;
        return this;
    }
}
