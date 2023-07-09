/**
 * Credits to https://github.com/HBiSoft/PickiT, License MIT.
 */
package com.hbisoft.pickit;

import android.content.ClipData;
import android.content.Context;
import android.database.Cursor;
import android.net.Uri;
import android.os.Build;
import android.provider.DocumentsContract;
import android.provider.MediaStore;
import android.webkit.MimeTypeMap;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;

import io.odysz.semantic.jprotocol.AnsonMsg;
import io.odysz.semantic.jprotocol.JProtocol;
import io.oz.fpick.AndroidFile;
import io.oz.fpick.SupportContentype;

import static com.hbisoft.pickit.Utils.*;

import androidx.documentfile.provider.DocumentFile;

import org.apache.commons.io_odysz.FilenameUtils;

public class DeviceHelper {
    /** experienced file provider other than system's */
    static boolean unknownProviderCalledBefore;
    /** experienced file provider other than system's */
    static boolean isFromUnknownProvider;

    static JProtocol.OnError errCtx;

    public static void init(JProtocol.OnError err) {
        errCtx = err;
    }

    public static ArrayList<AndroidFile> getMultiplePaths(Context context, String device, ClipData clipData) throws IOException {
//        int countMultiple = clipData.getItemCount();
        ArrayList<AndroidFile> paths = new ArrayList<>(clipData.getItemCount());
        for (int i = 0; i < clipData.getItemCount(); i++) {
            Uri uri = clipData.getItemAt(i).getUri();
            paths.add(getPath(context, device, uri, Build.VERSION.SDK_INT));
        }
//        if (!isDriveFile) {
//            pickiTCallbacks.PickiTonMultipleCompleteListener(multiplePaths, true, "");
//            multiplePaths.clear();
//            wasMultipleFileSelected = false;
//            wasUriReturnedCalledBefore = false;
//            wasPreExecuteCalledBefore = false;
//        }
        return paths;
    }

    public static AndroidFile getPath(Context context, String device, Uri uri, int APILevel) throws IOException {
        String returnedPath;
        if (APILevel >= 19) {
            String docId = null;
            // This is only used when a file is selected from a sub-directory inside the Downloads folder
            // and when the Uri returned has the msf: prefix
            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
                    docId = DocumentsContract.getDocumentId(uri);
                }
            } catch (Exception e){
                // Ignore
            }
            // Drive file was selected
            if (isOneDrive(uri) || isDropBox(uri) || isGoogleDrive(uri)) {
                // downloadFile(uri);
                return (AndroidFile) new AndroidFile()
                        .contentProvider(SupportContentype.download, uri)
                        .device(device)
                        .cdate(new Date(DocumentFile.fromSingleUri(context, uri).lastModified() ))
                        .clientname(getDrvFileName(uri, context))
                        .fullpath(uri.getPath());
            }
            else
            // File was selected from Downloads provider
            if (docId !=null && docId.startsWith("msf")) {
                String fileName = getFilePath(context, uri);
                try {
                    // PickiT will try in /proc.
                    // "If doesn't work, or if there is any issue trying to get access to the file, it gets copied to the applications directory."
                    // This is ignored in Album. For linux /proc, see
                    // https://source.android.com/docs/core/architecture/kernel/reqs-interfaces#filesystems
                    // and https://manpages.debian.org/bookworm/manpages/proc.5.en.html#Files_and_directories
                    //
                    // For ignored source, see:
                    // https://github.com/HBiSoft/PickiT/blob/master/pickit/src/main/java/com/hbisoft/pickit/PickiT.java
                    /*
                    File file = new File(Environment.getExternalStorageDirectory().toString() + "/Download/"+ fileName);
                    if (!file.exists()){
                    ...
                    }
                    */
                    return (AndroidFile) new AndroidFile()
                            .contentProvider(SupportContentype.download, uri)
                            .device(device)
                            .clientname(fileName)
                            .cdate(new Date(DocumentFile.fromSingleUri(context, uri).lastModified() ))
                            // .fullpath(uri.toString());
                            .fullpath(String.format("%d/%s/%s", Build.VERSION.SDK_INT, uri.getEncodedPath(), fileName));
                }catch (Exception e){
                    e.printStackTrace();
                    return null;
                }
            }
            // Local file was selected
            else {
                returnedPath = getRealPathFromURI_API19(context, uri);
                //Get the file extension
                final MimeTypeMap mime = MimeTypeMap.getSingleton();
                String subStringExtension = String.valueOf(returnedPath).substring(String.valueOf(returnedPath).lastIndexOf(".") + 1);
                String extensionFromMime = mime.getExtensionFromMimeType(context.getContentResolver().getType(uri));

                // Path is null
                if (returnedPath == null || returnedPath.equals("")) {
                    // Album way, shouldn't be here?
                    errCtx.err(AnsonMsg.MsgCode.exIo, errorReason(), uri.getPath());
                    return null;
                }
                // Path is not null
                else {
                    // Path can be returned, no need to make a "copy"
                    File f = new File(returnedPath);
                    return (AndroidFile) new AndroidFile()
                            .contentProvider(SupportContentype.shared, uri)
                            .device(device)
                            .cdate(new Date(DocumentFile.fromSingleUri(context, uri).lastModified() ))
                            .clientname(f.getName())
                            .fullpath(returnedPath);
                }
            }
        } else {
            //Todo: Test API <19
            // pickiTCallbacks.PickiTonCompleteListener(returnedPath, false, false, true, "");
            String pth = getRealPathFromURI_BelowAPI19(context, uri);
            FilenameUtils.getName(pth);
            return (AndroidFile) new AndroidFile()
                    .contentProvider(SupportContentype.shared, uri)
                    .device(device)
                    .cdate(new Date(DocumentFile.fromSingleUri(context, uri).lastModified() ))
                    .clientname(FilenameUtils.getName(pth))
                    .fullpath(pth);
        }
    }

    public static String getFilePath/* fileName */(Context context, Uri uri) {
        Cursor cursor = null;
        final String[] projection = {MediaStore.Files.FileColumns.DISPLAY_NAME};
        try {
            cursor = context.getContentResolver().query(uri, projection, null, null, null);
            if (cursor != null && cursor.moveToFirst()) {
                final int index = cursor.getColumnIndexOrThrow(MediaStore.Files.FileColumns.DISPLAY_NAME);
                return cursor.getString(index);
            }
        }catch (Exception e) {
            e.printStackTrace();
        } finally {
            if (cursor != null)
                cursor.close();
        }
        return null;
    }

    /**
     * Download a new online file from the Uri that was selected
     * @param uri
    private static void downloadFile(Uri uri) {
        // asyntask = new DownloadAsyncTask(uri, context, this, mActivity);
        // asyntask.execute();
    }
     */
}
