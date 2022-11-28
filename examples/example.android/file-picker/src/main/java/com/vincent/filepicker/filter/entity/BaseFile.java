package com.vincent.filepicker.filter.entity;

import android.os.Parcel;
import android.os.Parcelable;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Date;

import io.odysz.common.DateFormat;
import io.odysz.semantic.tier.docs.IFileDescriptor;
import io.odysz.semantic.tier.docs.SyncDoc;

/**
 * Modyfied by Ody Zhou
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
    private String name;
    // private String path;
    private long size;          //byte
    private String bucketId;    //Directory ID
    private String bucketName;  //Directory Name
    private long date;          //Added Date
    private boolean isSelected;

    // public int synchFlag = SynchUnknown;

    private String recId;

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

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPath() {
        return clientpath;
    }

    public void setPath(String path) {
        this.clientpath = path;
    }

    public long getSize() {
        return size;
    }

    public void setSize(long size) {
        this.size = size;
    }

    public String getBucketId() {
        return bucketId;
    }

    public void setBucketId(String bucketId) {
        this.bucketId = bucketId;
    }

    public String getBucketName() {
        return bucketName;
    }

    public void setBucketName(String bucketName) {
        this.bucketName = bucketName;
    }

    public long getDate() {
        return date;
    }

    public void setDate(long date) {
        this.date = date;
    }

    public boolean isSelected() {
        return isSelected;
    }

    public void setSelected(boolean selected) {
        isSelected = selected;
    }

    @Override
    public void writeToParcel(Parcel dest, int flags) {
        dest.writeLong(id);
        dest.writeString(name);
        dest.writeString(clientpath);
        dest.writeLong(size);
        dest.writeString(bucketId);
        dest.writeString(bucketName);
        dest.writeLong(date);
        dest.writeByte((byte) (isSelected ? 1 : 0));
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
            BaseFile file = new BaseFile();
            file.id = in.readLong();
            file.name = in.readString();
            file.clientpath = in.readString();
            file.size = in.readLong();
            file.bucketId = in.readString();
            file.bucketName = in.readString();
            file.date = in.readLong();
            file.isSelected = in.readByte() != 0;
            return file;
        }
    };
}
