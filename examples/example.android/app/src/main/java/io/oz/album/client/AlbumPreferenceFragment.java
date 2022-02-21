package io.oz.album.client;

import android.app.Activity;
import android.os.Bundle;
import android.text.InputType;
import android.util.Log;

import androidx.annotation.Nullable;
import androidx.preference.EditTextPreference;
import androidx.preference.Preference;
import androidx.preference.PreferenceCategory;
import androidx.preference.PreferenceFragmentCompat;

import io.odysz.common.LangExt;
import io.oz.AlbumApp;
import io.oz.R;

public class AlbumPreferenceFragment extends PreferenceFragmentCompat {
    Preference summery;
    Preference homepref;
    EditTextPreference device;
    Preference btnRegist;
    PreferenceCategory cateHome;

    Activity ctx;

    public AlbumPreferenceFragment(PrefsContentActivity ctx) {
        this.ctx = ctx;
    }

    @Override
    public void onCreatePreferences(@Nullable Bundle savedInstanceState, @Nullable String rootKey) {
        addPreferencesFromResource(R.xml.pref);

        PrefsContentActivity.bindPref2Val(findPreference(AlbumApp.keys.home));
        PrefsContentActivity.bindPref2Val(findPreference(AlbumApp.keys.device));
        PrefsContentActivity.bindPref2Val(findPreference(AlbumApp.keys.jserv));
        PrefsContentActivity.bindPref2Val(findPreference(AlbumApp.keys.usrid));
        PrefsContentActivity.bindPref2Val(findPreference(AlbumApp.keys.pswd));

        cateHome = (PreferenceCategory) findPreference(AlbumApp.keys.homeCate);
        btnRegist = findPreference(AlbumApp.keys.bt_regist);
        device = findPreference(AlbumApp.keys.device);

        EditTextPreference pswd = findPreference(AlbumApp.keys.pswd);
        pswd.setOnBindEditTextListener(editText ->
                editText.setInputType(InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_VARIATION_PASSWORD));

        homepref = findPreference(AlbumApp.keys.home);
        String devid = PrefsContentActivity.singleton.photoUser.device;
        if (!LangExt.isblank(devid)) {
            homepref.setSummary(getString(R.string.devide_name, devid));
            findPreference(AlbumApp.keys.device).setEnabled(false);
            cateHome.removePreference(btnRegist);
            device.setSummary(getString(R.string.devide_name, devid));
        } else {
            findPreference(AlbumApp.keys.device).setEnabled(true);
            device.setSummary(R.string.txt_only_once);
        }
        summery = findPreference(AlbumApp.keys.login_summery);

//        findPreference(AlbumApp.keys.bt_login).setOnPreferenceClickListener((prf) -> {
//            try {
//                PrefsContentActivity.singleton.login((tier) -> {
//                            PrefsContentActivity.singleton.tier = tier;
//                            updateSummery(summery, getString(R.string.login_succeed));
//                            updateSummery(homepref, getString(R.string.devide_name, PrefsContentActivity.singleton.photoUser.device()));
//                        },
//                        (c, t, args) -> {
//                            updateSummery(summery, String.format(t,
//                                    args == null ? new String[]{"", ""} : args));
//                        });
//            } catch (Exception e) {
//                Log.e(PrefsContentActivity.singleton.clientUri, e.getClass().getName() + e.getMessage());
//                updateSummery(summery, "Login failed!\nDetails: " + e.getMessage());
//            }
//            return true;
//        });
    }

//    void updateSummery(Preference of, String s) {
//        ctx.runOnUiThread(() -> of.setSummary(s));
//    }
}
