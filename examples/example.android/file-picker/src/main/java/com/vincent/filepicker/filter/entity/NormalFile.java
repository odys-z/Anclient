package com.vincent.filepicker.filter.entity;

import android.os.Parcel;
import android.os.Parcelable;

import java.io.IOException;

import io.oz.fpick.AndroidFile;

/**
 * Created by Vincent Woo
 * Date: 2016/10/12
 * Time: 14:45
 */

public class NormalFile extends AndroidFile implements Parcelable {
    private String mimeType;

    public String getMimeType() {
        return mimeType;
    }

    public void setMimeType(String mimeType) {
        this.mimeType = mimeType;
    }

    @Override
    public void writeToParcel(Parcel dest, int flags) {
        dest.writeLong(getId());
        dest.writeString(clientname());
        dest.writeString(fullpath());
        dest.writeLong(size);
        dest.writeString(getLocalDirId());
        dest.writeString(getLocalDirName());
        dest.writeLong(getDate());
        dest.writeByte((byte) (isSelected() ? 1 : 0));
        dest.writeString(getMimeType());
    }

    @Override
    public int describeContents() {
        return 0;
    }

    public static final Creator<NormalFile> CREATOR = new Creator<NormalFile>() {
        @Override
        public NormalFile[] newArray(int size) {
            return new NormalFile[size];
        }

        @Override
        public NormalFile createFromParcel(Parcel in) {
            NormalFile file = new NormalFile();
            file.setId(in.readLong());
            file.clientname(in.readString());
            file.clientpath = in.readString();
            file.size = in.readLong();
            file.setLocalDirId(in.readString());
            file.setLocalDirName(in.readString());
            file.setDate(in.readLong());
            file.setSelected(in.readByte() != 0);
            file.setMimeType(in.readString());
            return file;
        }
    };
}
