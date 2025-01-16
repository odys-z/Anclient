package com.vincent.filepicker.filter.entity;

import android.os.Parcel;
import android.os.Parcelable;

import io.oz.fpick.AndroidFile;

/**
 * Modified by Ody Zhou
 *
 * Created by Vincent Woo
 * Date: 2016/10/10
 * Time: 17:44
 */

public class ImageFile extends AndroidFile implements Parcelable {
    /** 0, 90, 180, 270 */
    private int orientation;

    public int getOrientation() {
        return orientation;
    }

    public void setOrientation(int orientation) {
        this.orientation = orientation;
    }

    @Override
    public void writeToParcel(Parcel dest, int flags) {
        super.writeToParcel(dest, flags);
        dest.writeInt(orientation);
    }

    @Override
    public int describeContents() {
        return 0;
    }

    public static final Creator<ImageFile> CREATOR = new Creator<ImageFile>() {
        @Override
        public ImageFile[] newArray(int size) {
            return new ImageFile[size];
        }

        @Override
        public ImageFile createFromParcel(Parcel in) {
            ImageFile file = new ImageFile();
            file.setId(in.readLong());
            file.clientname(in.readString());
            file.clientpath = in.readString();
            file.size = in.readLong();
            file.setLocalDirId(in.readString());
            file.setLocalDirName(in.readString());
            file.date(in.readLong());
            file.shareflag(in.readString());
            file.setSelected(in.readByte() != 0, file.shareflag);
            file.folder(in.readString());

            file.setOrientation(in.readInt());
            return file;
        }
    };
}
