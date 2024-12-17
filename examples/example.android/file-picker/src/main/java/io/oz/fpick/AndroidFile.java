/**
 * Created by Ody Zhou
 *
 * Credits to Vincent Woo
 */

package io.oz.fpick;

import static io.odysz.common.LangExt.isblank;
import static io.odysz.common.DateFormat.formatYYmm;

import android.net.Uri;
import android.os.Parcel;
import android.os.Parcelable;

import com.vincent.filepicker.Util;

import java.util.Date;

import io.odysz.anson.x.AnsonException;
import io.odysz.semantic.tier.docs.ExpSyncDoc;
import io.oz.syndoc.client.PushingState;

public class AndroidFile extends ExpSyncDoc implements Parcelable {
    /** Any constants of {@link PushingState} */
     public String syncFlag;
    private long id;
    private String localDirId;  //Directory ID
    private String localDirName;//Directory Name
    private long date;          //Added Date
    private boolean isSelected;
    private Uri contUri;

    /**
     * Create a server side understandable object.
     * @return the doc object
     */
    @Override
    public ExpSyncDoc syndoc () {
        return new ExpSyncDoc(null, org)
                .recId(recId)
                .share(this.shareby, this.shareflag, this.sharedate)
                .sharedate(new Date())
                .cdate(new Date(date))
                .clientpath(clientpath)
                .device(device)
                .folder(folder())
                .clientname(pname)
                .uri64(uri64)
                .mime(mime);
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

//    /** @deprecated removeing com.vincent.filepicker.filter */
//    public String getName() { return pname; }
//    /** @deprecated removeing com.vincent.filepicker.filter */
//    public void setName(String name) { this.pname = name; }
//
//    /** @deprecated removeing com.vincent.filepicker.filter */
//    public String getPath() { return clientpath; }
//    /** @deprecated removeing com.vincent.filepicker.filter */
//    public void setPath(String path) { this.clientpath = path; }
//
//    /** @deprecated removeing com.vincent.filepicker.filter */
//    public long getSize() { return size; }
//    /** @deprecated removeing com.vincent.filepicker.filter */
//    public void setSize(long size) { this.size = size; }

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

    /** @deprecated removeing com.vincent.filepicker.filter */
    public long date() { return date; }
    /** @deprecated removeing com.vincent.filepicker.filter */
    public void date(long date) { this.date = date; }

    public boolean isSelected() { return isSelected; }

    public void setSelected(boolean selected) { isSelected = selected; }

    @Override
    public void writeToParcel(Parcel dest, int flags) {
        dest.writeLong(id);
        dest.writeString(pname);
        dest.writeString(clientpath);
        dest.writeLong(size);
        dest.writeString(localDirId);
        dest.writeString(localDirName);
        dest.writeLong(date);
        dest.writeByte((byte) (isSelected ? 1 : 0));
        dest.writeString(folder);
    }

    @Override
    public int describeContents() { return 0; }

    public static final Creator<AndroidFile> CREATOR = new Creator<AndroidFile>() {
        @Override
        public AndroidFile[] newArray(int size) {
            return new AndroidFile[size];
        }

        @Override
        public AndroidFile createFromParcel(Parcel in) {
            throw new AnsonException(0, "No overriding?");
//            BaseFile file = new BaseFile();
//            file.id = in.readLong();
//            file.name = in.readString();
//            file.clientpath = in.readString();
//            file.size = in.readLong();
//            file.localDirId = in.readString();
//            file.localDirName = in.readString();
//            file.date = in.readLong();
//            file.isSelected = in.readByte() != 0;
//            return file;
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
