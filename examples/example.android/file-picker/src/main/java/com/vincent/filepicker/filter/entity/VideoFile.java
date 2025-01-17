package com.vincent.filepicker.filter.entity;

import android.os.Parcel;
import android.os.Parcelable;

import io.oz.fpick.AndroidFile;

/**
 * Created by Vincent Woo
 * Date: 2016/10/11
 * Time: 15:23
 */

public class VideoFile extends AndroidFile implements Parcelable {
    private long duration;
    private String thumbnail;

    public long getDuration() {
        return duration;
    }

    public void setDuration(long duration) {
        this.duration = duration;
    }

    public String getThumbnail() {
        return thumbnail;
    }

    public void setThumbnail(String thumbnail) {
        this.thumbnail = thumbnail;
    }

//    @Override
//    public void writeToParcel(Parcel dest, int flags) {
//        dest.writeLong(getId());
//        dest.writeString(clientname());
//        dest.writeString(fullpath());
//        dest.writeLong(size);
//        dest.writeString(getLocalDirId());
//        dest.writeString(getLocalDirName());
//        dest.writeLong(date());
//        dest.writeString(shareflag);
//        dest.writeByte((byte) (isSelected() ? 1 : 0));
//        dest.writeLong(getDuration());
//        dest.writeString(getThumbnail());
//    }

//    @Override
//    public int describeContents() {
//        return 0;
//    }

//    public static final Creator<VideoFile> CREATOR = new Creator<VideoFile>() {
//        @Override
//        public VideoFile[] newArray(int size) {
//            return new VideoFile[size];
//        }
//
//        @Override
//        public VideoFile createFromParcel(Parcel in) {
//            VideoFile file = new VideoFile();
//            file.setId(in.readLong());
//            file.clientname(in.readString());
//            file.clientpath = in.readString();
//            file.size = in.readLong();
//            file.setLocalDirId(in.readString());
//            file.setLocalDirName(in.readString());
//            file.date(in.readLong());
//            file.shareflag(in.readString());
//            file.setSelected(in.readByte() != 0, file.shareflag);
//            file.setDuration(in.readLong());
//            file.setThumbnail(in.readString());
//            return file;
//        }
//    };
}
