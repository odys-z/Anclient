package com.vincent.filepicker.filter.entity;

import android.os.Parcel;
import android.os.Parcelable;

import com.vincent.filepicker.Util;

import java.util.Date;

import io.odysz.anson.x.AnsonException;
import io.odysz.semantic.tier.docs.SyncDoc;


/**
 * Modified by Ody Zhou
 *
 * Created by Vincent Woo
 * Date: 2016/10/10
 * Time: 17:32
 */

public class BaseFile extends SyncDoc implements Parcelable {
//    public static int Synchronized = 1;
//    public static int SynchUnknown = 0;
//    public static int Synchronizing = -1;

    private long id;
    private String localDirId;  //Directory ID
    private String localDirName;//Directory Name
    private long date;          //Added Date
    private boolean isSelected;

    // FIXME remove this after .jar updated
    String clientpath;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof BaseFile)) return false;

        BaseFile file = (BaseFile) o;
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

    /** @deprecated removeing com.vincent.filepicker.filter */
    public String getName() { return pname; }
    /** @deprecated removeing com.vincent.filepicker.filter */
    public void setName(String name) { this.pname = name; }

    /** @deprecated removeing com.vincent.filepicker.filter */
    public String getPath() { return clientpath; }
    /** @deprecated removeing com.vincent.filepicker.filter */
    public void setPath(String path) { this.clientpath = path; }

    /** @deprecated removeing com.vincent.filepicker.filter */
    public long getSize() { return size; }
    /** @deprecated removeing com.vincent.filepicker.filter */
    public void setSize(long size) { this.size = size; }

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
    public long getDate() { return date; }
    /** @deprecated removeing com.vincent.filepicker.filter */
    public void setDate(long date) { this.date = date; }

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

    public static final Creator<BaseFile> CREATOR = new Creator<BaseFile>() {
        @Override
        public BaseFile[] newArray(int size) {
            return new BaseFile[size];
        }

        @Override
        public BaseFile createFromParcel(Parcel in) {
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

    public BaseFile cdate(long l) {
        cdate(new Date(l));
        return this;
    }
}
