/**
 * Credits to https://github.com/HBiSoft/PickiT, License MIT.
 */
package com.hbisoft.pickit;

import android.content.ClipData;
import android.content.ContentResolver;
import android.content.Context;
import android.database.Cursor;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.DocumentsContract;
import android.provider.MediaStore;
import android.webkit.MimeTypeMap;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;

import io.odysz.common.Utils;
import io.odysz.semantic.jprotocol.AnsonMsg;
import io.odysz.semantic.jprotocol.JProtocol;
import io.odysz.semantic.tier.docs.SyncDoc;

import static com.hbisoft.pickit.Utils.*;

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

    public static ArrayList<SyncDoc> getMultiplePaths(Context context, String device, ClipData clipData) throws IOException {
//        int countMultiple = clipData.getItemCount();
        ArrayList<SyncDoc> paths = new ArrayList<>(clipData.getItemCount());
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

    public static SyncDoc getPath(Context context, String device, Uri uri, int APILevel) throws IOException {
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
//            if (isOneDrive(uri) || isDropBox(uri) || isGoogleDrive(uri)) {
//                isDriveFile = true;
//                downloadFile(uri);
//            }
//            else
            // File was selected from Downloads provider
            if (docId !=null && docId.startsWith("msf")) {
                String fileName = getFilePath(context, uri);
                try {
                    File file = new File(Environment.getExternalStorageDirectory().toString() + "/Download/"+ fileName);
                    // If the file exists in the Downloads directory
                    // we can return the path directly
                    if (!file.exists()){
                        // PickiT will try in /proc.
                        // "If doesn't work, or if there is any issue trying to get access to the file, it gets copied to the applications directory."
                        // This is ignored in Album. For linux /proc, see
                        // https://source.android.com/docs/core/architecture/kernel/reqs-interfaces#filesystems
                        // and https://manpages.debian.org/bookworm/manpages/proc.5.en.html#Files_and_directories
                        //
                        // For ignored source, see:
                        // https://github.com/HBiSoft/PickiT/blob/master/pickit/src/main/java/com/hbisoft/pickit/PickiT.java
                        Utils.warn("File dosen't exists: %s", file.getPath());
                    }
                    return (SyncDoc) new SyncDoc()
                            .device(device).clientname(fileName)
                            .fullpath(file.getAbsolutePath());
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
                    // This can be caused by two situations
                    // 1. The file was selected from a third party app and the data column returned null (for example EZ File Explorer)
                    // Some file providers (like EZ File Explorer) will return a URI as shown below:
                    // content://es.fileexplorer.filebrowser.ezfilemanager.externalstorage.documents/document/primary%2AFolderName%2FNameOfFile.mp4
                    // When you try to read the _data column, it will return null, without throwing an exception
                    // In this case the file need to copied/created a new file in the temporary folder
                    // 2. There was an error
                    // In this case call PickiTonCompleteListener and get/provide the reason why it failed

                    //We first check if it was called before, avoiding multiple calls
                    /* PickiT way
                    if (!unknownProviderCalledBefore) {
                        unknownProviderCalledBefore = true;
                        if (uri.getScheme() != null && uri.getScheme().equals(ContentResolver.SCHEME_CONTENT)) {
                            //Then we check if the _data colomn returned null
                            if (errorReason() != null && errorReason().equals("dataReturnedNull")) {
                                isFromUnknownProvider = true;
                                //Copy the file to the temporary folder
                                downloadFile(uri);
                                return;
                            } else if (errorReason() != null && errorReason().contains("column '_data' does not exist")) {
                                isFromUnknownProvider = true;
                                //Copy the file to the temporary folder
                                downloadFile(uri);
                                return;
                            } else if (errorReason() != null && errorReason().equals("uri")) {
                                isFromUnknownProvider = true;
                                //Copy the file to the temporary folder
                                downloadFile(uri);
                                return;
                            }
                        }
                    }
                    //Else an error occurred, get/set the reason for the error
                    pickiTCallbacks.PickiTonCompleteListener(returnedPath, false, false, false, Utils.errorReason());
                    */
                    // Album way
                    errCtx.err(AnsonMsg.MsgCode.exIo, errorReason(), uri.getPath());
                    return null;
                }
                // Path is not null
                else {
                    // This can be caused by two situations
                    // 1. The file was selected from an unknown provider (for example a file that was downloaded from a third party app)
                    // 2. getExtensionFromMimeType returned an unknown mime type for example "audio/mp4"
                    //
                    // When this is case we will copy/write the file to the temp folder, same as when a file is selected from Google Drive etc.
                    // We provide a name by getting the text after the last "/"
                    // Remember if the extension can't be found, it will not be added, but you will still be able to use the file
                    //Todo: Add checks for unknown file extensions

                    /*
                    File checkIfExist = new File(returnedPath);
                    if (!subStringExtension.equals("jpeg") && !subStringExtension.equals(extensionFromMime) && uri.getScheme() != null && uri.getScheme().equals(ContentResolver.SCHEME_CONTENT)) {
                        // First check if the file is available
                        // With PickiT issue #47 the file is available
                        try {
                            File checkIfExist = new File(returnedPath);
                            if (checkIfExist.exists()){
                                // pickiTCallbacks.PickiTonCompleteListener(returnedPath, false, false, true, "");
                            }
                        }catch (Exception e){
                            //Ignore
                        }
                        isFromUnknownProvider = true;
                        downloadFile(uri);
                    }

                     */

                    // Path can be returned, no need to make a "copy"
                    File f = new File(returnedPath);
                    return (SyncDoc) new SyncDoc()
                            .device(device).clientname(f.getName())
                            .fullpath(returnedPath);
                    /*
                    if (wasMultipleFileSelected){
                        multiplePaths.add(returnedPath);
                    }else {
                        pickiTCallbacks.PickiTonCompleteListener(returnedPath, false, false, true, "");
                    }
                    */
                }
            }
        } else {
            //Todo: Test API <19
            // pickiTCallbacks.PickiTonCompleteListener(returnedPath, false, false, true, "");
            String pth = getRealPathFromURI_BelowAPI19(context, uri);
            FilenameUtils.getName(pth);
            return (SyncDoc) new SyncDoc()
                    .device(device)
                    .clientname(FilenameUtils.getName(pth))
                    .fullpath(pth);
        }
    }

    public static String getFilePath(Context context, Uri uri) {
        Cursor cursor = null;
        final String[] projection = {MediaStore.Files.FileColumns.DISPLAY_NAME};
        try {
            cursor = context.getContentResolver().query(uri, projection, null, null, null);
            if (cursor != null && cursor.moveToFirst()) {
                final int index = cursor.getColumnIndexOrThrow(MediaStore.Files.FileColumns.DISPLAY_NAME);
                return cursor.getString(index);
            }
        }catch (Exception e) {
            // failReason = e.getMessage();
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
     */
    private static void downloadFile(Uri uri) {
        // asyntask = new DownloadAsyncTask(uri, context, this, mActivity);
        // asyntask.execute();
    }
}
