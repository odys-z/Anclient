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

import java.text.ParseException;
import java.util.Date;

import io.odysz.anson.x.AnsonException;
import io.odysz.common.DateFormat;
import io.odysz.semantic.tier.docs.ExpSyncDoc;
import io.oz.album.peer.ShareFlag;

public class AndroidFile extends ExpSyncDoc implements Parcelable {
    public ShareFlag syncFlag;

    /** The File id in Android, which is different from rec-id in docsync.jserv. */
    private long id;
    private String localDirId;  //Directory ID
    private String localDirName;//Directory Name
    private long date;          //Added Date
    private boolean isSelected;
    private Uri contUri;

    /**
     * Create a server side understandable object.
     * @param template for new instance, can be null
     * @return the doc object
     */
    @Override
    public ExpSyncDoc syndoc (ExpSyncDoc template) {
        Date d;
        try { d = date == 0 && template != null ? DateFormat.parse(template.cdate()) : new Date(date); }
        catch (ParseException e) { d = new Date(date); }

        return template == null ?
            new ExpSyncDoc(entMeta, org)
                .recId(recId)
                .device(device)
                .clientpath(clientpath)

                .share(this.shareby, this.shareflag, this.sharedate)
                .sharedate(new Date())
                .cdate(new Date(date))
                .folder(folder())
                .clientname(pname)
                .uri64(uri64)
                .mime(mime) :

           new ExpSyncDoc(entMeta == null ? template.entMeta : entMeta, isblank(org) ? template.org : org)
                .recId(recId)
                .device(isblank(device) ? template.device() : device)
                .clientpath(clientpath)

                .shareby(isblank(this.shareby) ? template.shareby : this.shareby)
                .shareflag(isblank(this.shareflag) ? template.shareflag : this.shareflag)
                .sharedate(isblank(this.shareflag) ? template.sharedate : this.sharedate)
                .sharedate(new Date())
                .cdate(d)
                .folder(isblank(this.folder) ? template.folder() : folder())
                .clientname(pname)
                .uri64(uri64)
                .mime(mime)
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
        dest.writeString(folder());
    }

    @Override
    public int describeContents() { return 0; }

    public static final Creator<AndroidFile> CREATOR = new Creator<AndroidFile>() {
        @Override
        public AndroidFile[] newArray(int size) {
            return new AndroidFile[size];
        }

        /**
         * Implementation sample:<pre>
         BaseFile file = new BaseFile();
         file.id = in.readLong();
         file.name = in.readString();
         file.clientpath = in.readString();
         file.size = in.readLong();
         file.localDirId = in.readString();
         file.localDirName = in.readString();
         file.date = in.readLong();
         file.isSelected = in.readByte() != 0;
         return file;
         * </pre>
         * @param in The Parcel to read the object's data from.
         * @return
         */
        @Override
        public AndroidFile createFromParcel(Parcel in) {
            throw new AnsonException(0, "No overriding?");
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
