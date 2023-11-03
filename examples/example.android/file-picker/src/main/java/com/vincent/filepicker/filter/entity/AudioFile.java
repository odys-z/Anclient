package com.vincent.filepicker.filter.entity;

import android.os.Parcel;
import android.os.Parcelable;

import io.oz.fpick.AndroidFile;

/**
 * Created by Vincent Woo
 * Date: 2016/10/11
 * Time: 15:52
 */

public class AudioFile extends AndroidFile implements Parcelable {
    private long duration;

    public long getDuration() {
        return duration;
    }

    public void setDuration(long duration) {
        this.duration = duration;
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
        dest.writeLong(getDuration());
    }

    @Override
    public int describeContents() {
        return 0;
    }

    public static final Creator<AudioFile> CREATOR = new Creator<AudioFile>() {
        @Override
        public AudioFile[] newArray(int size) {
            return new AudioFile[size];
        }

        @Override
        public AudioFile createFromParcel(Parcel in) {
            AudioFile file = new AudioFile();
            file.setId(in.readLong());
            file.clientname(in.readString());
            file.clientpath = in.readString();
            file.size = in.readLong();
            file.setLocalDirId(in.readString());
            file.setLocalDirName(in.readString());
            file.setDate(in.readLong());
            file.setSelected(in.readByte() != 0);
            file.setDuration(in.readLong());
            return file;
        }
    };
}
