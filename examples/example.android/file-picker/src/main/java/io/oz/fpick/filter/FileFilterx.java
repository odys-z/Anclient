package io.oz.fpick.filter;

import static io.oz.fpick.filter.FileLoaderCallbackx.TYPE_IMAGE;
import static io.oz.fpick.filter.FileLoaderCallbackx.TYPE_VIDEO;

import androidx.fragment.app.FragmentActivity;
import androidx.loader.app.LoaderManager;

import com.vincent.filepicker.filter.callback.FilterResultCallback;
import com.vincent.filepicker.filter.entity.ImageFile;
import com.vincent.filepicker.filter.entity.VideoFile;

import io.oz.fpick.AndroidFile;

public class FileFilterx {
    /**
     * @deprecated to be removed once referencer removed
     *
     */
    public static void getImages(FragmentActivity activity, FilterResultCallback<ImageFile> callback){
        LoaderManager.getInstance(activity).initLoader(0, null,
                new FileLoaderCallbackx(activity, callback, TYPE_IMAGE, null));
    }

    public static void getVideos(FragmentActivity activity, FilterResultCallback<VideoFile> callback){
        LoaderManager.getInstance(activity).initLoader(1, null,
                new FileLoaderCallbackx(activity, callback, TYPE_VIDEO, null));
    }

//    public static void getAudios(FragmentActivity activity, FilterResultCallback<AudioFile> callback){
//        LoaderManager.getInstance(activity).initLoader(2, null,
//                new FileLoaderCallbackx(activity, callback, TYPE_AUDIO));
//    }
//
//    public static void getFiles(FragmentActivity activity, FilterResultCallback<NormalFile> callback, String[] suffix){
//        LoaderManager.getInstance(activity).initLoader(3, null,
//                new FileLoaderCallbackx(activity, callback, TYPE_FILE, suffix));
//    }

    final int filetype;
    final FilterResultCallback<? extends AndroidFile> callback;

    /**
     * resType      : callback<br>
     * TYPE_IMAGE   : FilterResultCallback<ImageFile><br>
     * TYPE_VIDEO   : FilterResultCallback<VideoFile><br>
     * TYPE_AUDIO   : FilterResultCallback<AudioFile><br>
     * TYPE_FILE    : FilterResultCallback<NormalFile>
     */
    public FileFilterx(int resType, FilterResultCallback<? extends AndroidFile> callback) {
        this.filetype = resType;
        this.callback = callback;
    }

    public FileFilterx filter(FragmentActivity activity, String... suffix) {
//        if (isNull(suffix))
//            LoaderManager.getInstance(activity).initLoader(1, null,
//                new FileLoaderCallbackx(activity, callback, filetype));
//        else
            LoaderManager.getInstance(activity).initLoader(3, null,
                new FileLoaderCallbackx(activity, callback, filetype, suffix));
        return this;
    }
}
