package io.oz.album.client.widgets;

import android.app.Dialog;
import android.content.DialogInterface;
import android.os.Bundle;

import androidx.appcompat.app.AlertDialog;
import androidx.fragment.app.DialogFragment;
import androidx.fragment.app.FragmentActivity;

import io.oz.R;

import static io.odysz.common.LangExt.is;

public class ComfirmDlg extends DialogFragment {
    boolean showCancel;
    int dlg_msg;
    private DialogInterface.OnClickListener onOk;
    private DialogInterface.OnClickListener onCancel;

    public ComfirmDlg(boolean... showCancel) {
        this.showCancel = is(showCancel);
    }

    public ComfirmDlg dlgMsg(int msg) {
        dlg_msg = msg;
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

    public DialogFragment showDlg(FragmentActivity act, String tag) {
        show(act.getSupportFragmentManager(), tag);
        return this;
    }
}