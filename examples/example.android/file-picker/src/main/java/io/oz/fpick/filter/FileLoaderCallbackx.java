package io.oz.fpick.filter;

import android.content.Context;
import android.database.Cursor;
import android.os.Bundle;

import com.vincent.filepicker.Util;
import com.vincent.filepicker.filter.callback.FilterResultCallback;
import com.vincent.filepicker.filter.entity.AudioFile;
import com.vincent.filepicker.filter.entity.Directory;
import com.vincent.filepicker.filter.entity.ImageFile;
import com.vincent.filepicker.filter.entity.NormalFile;
import com.vincent.filepicker.filter.entity.VideoFile;
import com.vincent.filepicker.filter.loader.AudioLoader;
import com.vincent.filepicker.filter.loader.FileLoader;
import com.vincent.filepicker.filter.loader.ImageLoader;
import com.vincent.filepicker.filter.loader.VideoLoader;

import java.io.IOException;
import java.lang.ref.WeakReference;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import androidx.loader.app.LoaderManager;
import androidx.loader.content.CursorLoader;
import androidx.loader.content.Loader;

import io.odysz.anson.Anson;
import io.odysz.anson.x.AnsonException;
import io.odysz.common.Utils;

import static android.provider.BaseColumns._ID;
import static android.provider.MediaStore.Files.FileColumns.MIME_TYPE;
import static android.provider.MediaStore.Images.ImageColumns.BUCKET_DISPLAY_NAME;
import static android.provider.MediaStore.Images.ImageColumns.BUCKET_ID;
import static android.provider.MediaStore.Images.ImageColumns.ORIENTATION;
import static android.provider.MediaStore.MediaColumns.DATA;
import static android.provider.MediaStore.MediaColumns.DATE_ADDED;
import static android.provider.MediaStore.MediaColumns.SIZE;
import static android.provider.MediaStore.MediaColumns.TITLE;
import static android.provider.MediaStore.Video.VideoColumns.DURATION;

public class FileLoaderCallbackx implements LoaderManager.LoaderCallbacks<Cursor> {
    public static final int TYPE_IMAGE = 0;
    public static final int TYPE_VIDEO = 1;
    public static final int TYPE_AUDIO = 2;
    public static final int TYPE_FILE  = 3;

    private WeakReference<Context> context;
    private FilterResultCallback resultCallback;

    private int mType = TYPE_IMAGE;
    private String[] mSuffixArgs;
    private CursorLoader mLoader;
    private String mSuffixRegex;

//    public FileLoaderCallbackx(Context context, FilterResultCallback resultCallback, int type) {
//        this(context, resultCallback, type, null);
//    }

    public FileLoaderCallbackx(Context context, FilterResultCallback resultCallback, int type, String[] suffixArgs) {
        this.context = new WeakReference<>(context);
        this.resultCallback = resultCallback;
        this.mType = type;
        this.mSuffixArgs = suffixArgs;
        if (suffixArgs != null && suffixArgs.length > 0) {
            mSuffixRegex = obtainSuffixRegex(suffixArgs);
        }
    }

    @Override
    public Loader<Cursor> onCreateLoader(int id, Bundle args) {
        switch (mType) {
            case TYPE_IMAGE:
                mLoader = new ImageLoader(context.get());
                break;
            case TYPE_VIDEO:
                mLoader = new VideoLoader(context.get());
                break;
            case TYPE_AUDIO:
                mLoader = new AudioLoader(context.get());
                break;
            case TYPE_FILE:
                mLoader = new FileLoader(context.get());
                break;
        }

        return mLoader;
    }

    @Override
    public void onLoadFinished(Loader<Cursor> loader, Cursor data) {
        if (data == null) return;
        try {
            switch (mType) {
            case TYPE_IMAGE:
                onImageResult(data);
                break;
            case TYPE_VIDEO:
                onVideoResult(data);
                break;
            case TYPE_AUDIO:
                onAudioResult(data);
                break;
            case TYPE_FILE:
                onFileResult(data);
                break;
            }
        } catch (IOException e) {
            e.printStackTrace();
            throw new AnsonException(0, e.getMessage());
        }
    }

    @Override
    public void onLoaderReset(Loader<Cursor> loader) {

    }

    @SuppressWarnings("unchecked")
    private void onImageResult(Cursor data) throws IOException {
        List<Directory<ImageFile>> directories = new ArrayList<>();

        if (data.getPosition() != -1) {
            data.moveToPosition(-1);
        }

        while (data.moveToNext()) {
            //Create a File instance
            ImageFile img = new ImageFile();
            img.setId(data.getLong(data.getColumnIndexOrThrow(_ID)));
            img.clientname(data.getString(data.getColumnIndexOrThrow(TITLE)));
            img.fullpath(data.getString(data.getColumnIndexOrThrow(DATA)));
            img.size = data.getLong(data.getColumnIndexOrThrow(SIZE));
            img.setLocalDirId(data.getString(data.getColumnIndexOrThrow(BUCKET_ID)));
            img.setLocalDirName(data.getString(data.getColumnIndexOrThrow(BUCKET_DISPLAY_NAME)));
            img.cdate(data.getLong(data.getColumnIndexOrThrow(DATE_ADDED)));

            img.setOrientation(data.getInt(data.getColumnIndexOrThrow(ORIENTATION)));

            //Create a Directory
            Directory<ImageFile> directory = new Directory<>();
            directory.setId(img.getLocalDirId());
            directory.setName(img.getLocalDirName());
            directory.setPath(img.path());

            if (!directories.contains(directory)) {
                directory.addFile(img);
                directories.add(directory);
            } else {
                directories.get(directories.indexOf(directory)).addFile(img);
            }
//            Utils.logi("%d, %s", directories.size(), directory.getName());
        }

        if (resultCallback != null) {
            resultCallback.onResult(directories);
        }
    }

    @SuppressWarnings("unchecked")
    private void onVideoResult(final Cursor data) throws IOException {
        List<Directory<VideoFile>> directories = new ArrayList<>();

        if (data.getPosition() != -1) {
            data.moveToPosition(-1);
        }

        while (data.moveToNext()) {
            //Create a File instance
            VideoFile video = new VideoFile();
            video.setId(data.getLong(data.getColumnIndexOrThrow(_ID)));
            video.clientname(data.getString(data.getColumnIndexOrThrow(TITLE)));
            video.fullpath(data.getString(data.getColumnIndexOrThrow(DATA)));
            video.size = data.getLong(data.getColumnIndexOrThrow(SIZE));
            video.setLocalDirId(data.getString(data.getColumnIndexOrThrow(BUCKET_ID)));
            video.setLocalDirName(data.getString(data.getColumnIndexOrThrow(BUCKET_DISPLAY_NAME)));
            video.cdate(data.getLong(data.getColumnIndexOrThrow(DATE_ADDED)));

            video.setDuration(data.getLong(data.getColumnIndexOrThrow(DURATION)));

            //Create a Directory
            Directory<VideoFile> directory = new Directory<>();
            directory.setId(video.getLocalDirId());
            directory.setName(video.getLocalDirName());
            directory.setPath(video.path());

            if (!directories.contains(directory)) {
                directory.addFile(video);
                directories.add(directory);
            } else {
                directories.get(directories.indexOf(directory)).addFile(video);
            }
        }

        if (resultCallback != null) {
            resultCallback.onResult(directories);
        }
    }

    @SuppressWarnings("unchecked")
    private void onAudioResult(Cursor data) throws IOException {
        List<Directory<AudioFile>> directories = new ArrayList<>();

        if (data.getPosition() != -1) {
            data.moveToPosition(-1);
        }

        while (data.moveToNext()) {
            //Create a File instance
            AudioFile audio = new AudioFile();
            audio.setId(data.getLong(data.getColumnIndexOrThrow(_ID)));
            audio.clientname(data.getString(data.getColumnIndexOrThrow(TITLE)));
            audio.fullpath(data.getString(data.getColumnIndexOrThrow(DATA)));
            audio.size = data.getLong(data.getColumnIndexOrThrow(SIZE));
            audio.cdate(data.getLong(data.getColumnIndexOrThrow(DATE_ADDED)));

            audio.setDuration(data.getLong(data.getColumnIndexOrThrow(DURATION)));

            //Create a Directory
            Directory<AudioFile> directory = new Directory<>();
            directory.setName(Util.extractFileNameWithSuffix(Util.extractPathWithoutSeparator(audio.fullpath())));
            directory.setPath(audio.path());

            if (!directories.contains(directory)) {
                directory.addFile(audio);
                directories.add(directory);
            } else {
                directories.get(directories.indexOf(directory)).addFile(audio);
            }
        }

        if (resultCallback != null) {
            resultCallback.onResult(directories);
        }
    }

    @SuppressWarnings("unchecked")
    private void onFileResult(Cursor data) throws IOException {
        Utils.warn("[onFileResult]: %d", data.getCount());

        List<Directory<NormalFile>> directories = new ArrayList<>();

        if (data.getPosition() != -1) {
            data.moveToPosition(-1);
        }

        while (data.moveToNext()) {
            String path = data.getString(data.getColumnIndexOrThrow(DATA));
            // if ( Anson.verbose ) Utils.logi(path);
            if (path != null && contains(path)) {
                //Create a File instance
                NormalFile file = new NormalFile();
                file.setId(data.getLong(data.getColumnIndexOrThrow(_ID)));
                file.clientname(data.getString(data.getColumnIndexOrThrow(TITLE)));
                file.fullpath(data.getString(data.getColumnIndexOrThrow(DATA)));
                file.size = data.getLong(data.getColumnIndexOrThrow(SIZE));
                file.cdate(data.getLong(data.getColumnIndexOrThrow(DATE_ADDED)));

                file.mime = data.getString(data.getColumnIndexOrThrow(MIME_TYPE));

                //Create a Directory
                Directory<NormalFile> directory = new Directory<>();
                directory.setName(Util.extractFileNameWithSuffix(Util.extractPathWithoutSeparator(file.fullpath())));
                directory.setPath(Util.extractPathWithoutSeparator(file.fullpath()));

                if (!directories.contains(directory)) {
                    directory.addFile(file);
                    directories.add(directory);
                } else {
                    directories.get(directories.indexOf(directory)).addFile(file);
                }
            }
        }

        if (resultCallback != null) {
            resultCallback.onResult(directories);
        }
    }

    private boolean contains(String path) {
        String name = Util.extractFileNameWithSuffix(path);
        Pattern pattern = Pattern.compile(mSuffixRegex, Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(name);
        return matcher.matches();
    }

    /**
     * Convert suffices to file loader usable regex.
     *
     * @param suffixes
     * @return regex for loader
     */
    private String obtainSuffixRegex(String[] suffixes) {
        StringBuilder builder = new StringBuilder();
        for (int i = 0; i < suffixes.length ; i++) {
            if (i ==0) {
                builder.append(suffixes[i].replace(".", ""));
            } else {
                builder.append("|\\.");
                builder.append(suffixes[i].replace(".", ""));
            }
        }
        return ".+(\\." + builder.toString() + ")$";
    }
}
