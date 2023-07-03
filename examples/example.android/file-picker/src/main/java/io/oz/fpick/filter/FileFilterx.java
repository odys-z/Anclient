package io.oz.fpick.filter;

import static io.odysz.common.LangExt.isNull;

import static com.vincent.filepicker.filter.callback.FileLoaderCallbacks.TYPE_AUDIO;
import static com.vincent.filepicker.filter.callback.FileLoaderCallbacks.TYPE_FILE;
import static com.vincent.filepicker.filter.callback.FileLoaderCallbacks.TYPE_IMAGE;
import static com.vincent.filepicker.filter.callback.FileLoaderCallbacks.TYPE_VIDEO;

import androidx.fragment.app.FragmentActivity;
import androidx.loader.app.LoaderManager;

import com.vincent.filepicker.filter.callback.FilterResultCallback;
import com.vincent.filepicker.filter.entity.AudioFile;
import com.vincent.filepicker.filter.entity.BaseFile;
import com.vincent.filepicker.filter.entity.ImageFile;
import com.vincent.filepicker.filter.entity.NormalFile;
import com.vincent.filepicker.filter.entity.VideoFile;

public class FileFilterx {
    public static void getImages(FragmentActivity activity, FilterResultCallback<ImageFile> callback){
        LoaderManager.getInstance(activity).initLoader(0, null,
                new FileLoaderCallbackx(activity, callback, TYPE_IMAGE));
    }

    public static void getVideos(FragmentActivity activity, FilterResultCallback<VideoFile> callback){
        LoaderManager.getInstance(activity).initLoader(1, null,
                new FileLoaderCallbackx(activity, callback, TYPE_VIDEO));
    }

    public static void getAudios(FragmentActivity activity, FilterResultCallback<AudioFile> callback){
        LoaderManager.getInstance(activity).initLoader(2, null,
                new FileLoaderCallbackx(activity, callback, TYPE_AUDIO));
    }

    public static void getFiles(FragmentActivity activity, FilterResultCallback<NormalFile> callback, String[] suffix){
        LoaderManager.getInstance(activity).initLoader(3, null,
                new FileLoaderCallbackx(activity, callback, TYPE_FILE, suffix));
    }

    final int filetype;
    final FilterResultCallback<? extends BaseFile> callback;

    /**
     * resType      : callback<br>
     * TYPE_IMAGE   : FilterResultCallback<ImageFile><br>
     * TYPE_VIDEO   : FilterResultCallback<VideoFile><br>
     * TYPE_AUDIO   : FilterResultCallback<AudioFile><br>
     * TYPE_FILE    : FilterResultCallback<NormalFile>
     * @param resType
     * @param callback
     */
    public FileFilterx(int resType, FilterResultCallback<? extends BaseFile> callback) {
        this.filetype = resType;
        this.callback = callback;
    }

    public FileFilterx filter(FragmentActivity activity, String... suffix) {
        if (isNull(suffix))
            LoaderManager.getInstance(activity).initLoader(1, null,
                new FileLoaderCallbackx(activity, callback, filetype));
        else
            LoaderManager.getInstance(activity).initLoader(3, null,
                new FileLoaderCallbackx(activity, callback, filetype, suffix));
        return this;
    }
}
