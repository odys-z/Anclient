/**
 * Created by Ody Zhou
 *
 * Credits to Vincent Woo
 */

package io.oz.fpick;

import static io.odysz.common.LangExt.isblank;
import static io.odysz.common.DateFormat.formatYYmm;
import static io.odysz.common.LangExt.mustnonull;

import android.net.Uri;
import android.os.Parcel;
import android.os.Parcelable;

import com.vincent.filepicker.Util;

import java.io.IOException;
import java.text.ParseException;
import java.util.Date;

import io.odysz.anson.Anson;
import io.odysz.anson.AnsonField;
import io.odysz.anson.x.AnsonException;
import io.odysz.common.DateFormat;
import io.odysz.semantic.tier.docs.ExpSyncDoc;
import io.odysz.semantic.tier.docs.IFileDescriptor;
import io.odysz.semantic.tier.docs.ShareFlag;

public class AndroidFile extends ExpSyncDoc implements Parcelable {

    /** The File id in Android, which is different from rec-id in docsync.jserv. */
    private long id;
    private String localDirId;  //Directory ID
    private String localDirName;//Directory Name

    @AnsonField(ignoreTo = true)
    private boolean isSelected;
    private Uri contUri;

    /**
     * Create a server side understandable object.
     * @param template for new instance, can be null
     * @return the doc object
     */
    @Override
    public ExpSyncDoc syndoc (ExpSyncDoc template) {
        String d = !isblank(createDate)
                ? createDate
                : template != null
                ? template.cdate()
                : DateFormat.formatime(new Date());

        String shared = !isblank(this.sharedate)
                ? sharedate
                : template != null
                ? template.sharedate
                : DateFormat.formatime(new Date());

        if (template != null) {
            mustnonull(template.shareby, "Forcing template's sharer cannot be empty.");
            mustnonull(template.device(), "Forcing template's device info cannot be empty.");
            mustnonull(template.shareflag, "Forcing template's share-flag cannot be empty.");
        }

        return template == null ?
            new ExpSyncDoc(entMeta, org)
                .recId(recId)
                .device(device)
                .clientpath(clientpath)

                .share(this.shareby, this.shareflag, this.sharedate)
                .sharedate(shared)
                .cdate(d)
                .folder(folder())
                .clientname(pname)
                .uri64(uri64)
                .mime(mime)
                .size(size)
                :
           new ExpSyncDoc(entMeta == null ? template.entMeta : entMeta, isblank(org) ? template.org : org)
                .recId(recId)
                .device(isblank(device) ? template.device() : device)
                .clientpath(clientpath)

                .shareby(template.shareby)
                .shareflag(template.shareflag)
                .sharedate(shared)
                .cdate(d)
                .folder(isblank(this.folder) ? template.folder() : folder())
                .clientname(pname)
                .uri64(uri64)
                .mime(mime)
                .size(size)
                ;
    }

    @Override
    public String folder() {
        if (isblank(super.folder()))
            folder = formatYYmm(new Date());
        return folder;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof AndroidFile)) return false;

        AndroidFile file = (AndroidFile) o;
        return this.clientpath.equals(file.clientpath);
    }

    @Override
    public int hashCode() {
        return clientpath.hashCode();
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getLocalDirId() { return localDirId; }

    public void setLocalDirId(String localDirId) {
        this.localDirId = localDirId;
    }

    public String getLocalDirName() {
        return localDirName;
    }

    public void setLocalDirName(String localDirName) {
        this.localDirName = localDirName;
    }

//    /** @deprecated removeing com.vincent.filepicker.filter */
//    public long date() { return date; }
//    /** @deprecated removeing com.vincent.filepicker.filter */
//    public void date(long date) { this.date = date; }

    public boolean isSelected() { return isSelected; }

    /**
     * @param selected
     * @return previous state
     */
    public boolean setSelected(boolean selected, ShareFlag shareAs) {
        return setSelected(selected, shareAs.name());

    }
    public boolean setSelected(boolean selected, String shareAs) {
        boolean old = isSelected;
        isSelected = selected;
        shareflag = shareAs;
        return old;
    }

    @Override
    public void writeToParcel(Parcel dest, int flags) {
        try {
            dest.writeString(this.toBlock());
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public int describeContents() { return 0; }

    public static final Creator<AndroidFile> CREATOR = new Creator<AndroidFile>() {
        @Override
        public AndroidFile[] newArray(int size) {
            return new AndroidFile[size];
        }

        /**
         * @param in The Parcel to read the object's data from.
         * @return
         */
        @Override
        public AndroidFile createFromParcel(Parcel in) {
            return (AndroidFile) Anson.fromJson(in.readString());
        }
    };

    public String path() {
        return Util.extractPathWithoutSeparator(clientpath);
    }

    public AndroidFile cdate(long l) {
        cdate(new Date(l));
        return this;
    }

    SupportContentype contype;
    public AndroidFile contentProvider(SupportContentype t, Uri uri) {
        contype = t;
        contUri = uri;
        return this;
    }

    public Uri contentUri() {
        return contUri;
    }
}
