package com.vincent.filepicker.filter.loader;

import android.content.Context;
import android.net.Uri;
import android.os.Build;
import android.provider.MediaStore;

import androidx.loader.content.CursorLoader;

import static android.provider.MediaStore.MediaColumns.MIME_TYPE;

/**
 * Created by Vincent Woo
 * Date: 2016/10/12
 * Time: 14:48
 */

public class FileLoader extends CursorLoader {
    private static final String[] FILE_PROJECTION = {
            //Base File
            MediaStore.Files.FileColumns._ID,
            MediaStore.Files.FileColumns.TITLE,
            MediaStore.Files.FileColumns.DATA,
            MediaStore.Files.FileColumns.SIZE,
            MediaStore.Files.FileColumns.DATE_ADDED,

            //Normal File
            MediaStore.Files.FileColumns.MIME_TYPE
    };

    private FileLoader(Context context, Uri uri, String[] projection, String selection,
                        String[] selectionArgs, String sortOrder) {
        super(context, uri, projection, selection, selectionArgs, sortOrder);
    }

    public FileLoader(Context context) {
        super(context);
        setProjection(FILE_PROJECTION);
        // setUri(MediaStore.Files.getContentUri("external"));
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q)
            setUri(MediaStore.Files.getContentUri(MediaStore.VOLUME_EXTERNAL));
        else
            setUri(MediaStore.Files.getContentUri("external"));

        setSortOrder(MediaStore.Files.FileColumns.DATE_ADDED + " DESC");

//        // https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
//        setSelection(MIME_TYPE + "=? or " // txt
//                + MIME_TYPE + "=? or " // pdf
//                + MIME_TYPE + "=? or " // zip
//                + MIME_TYPE + "=? or " // x-rar
//                + MIME_TYPE + "=? or " // vnd.rar
//                + MIME_TYPE + "=? or " // rtf
//                + MIME_TYPE + "=? or " // msword
//                + MIME_TYPE + "=? or " // pptx
//                + MIME_TYPE + "=? or " // gzip
//                + MIME_TYPE + "=?");   // plain
//
//        String[] selectionArgs;
//        selectionArgs = new String[] { "text/txt", "application/pdf", "application/zip",
//                "application/x-rar-compressed", "application/vnd.rar", "application/rtf",
//                "application/msword", "application/vnd.openxmlformats-officedocument.presentationml.presentation",
//                "application/gzip",
//                "text/plain" };
//        setSelectionArgs(selectionArgs);
    }
}
