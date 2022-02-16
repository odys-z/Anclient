package io.oz.albumtier;

/**
 * Client User type, which is diffenret from IUser.
 */
public class PhotoUser {
    public PhotoUser(String usrid) {
        this.uid = usrid;
    }

    String device;
    public String device() { return device; }
    public PhotoUser device(String d) {
        device = d;
        return this;
    }

    String uid;
    public String uid() { return uid; }
    public PhotoUser uid(String userId) {
        uid = userId;
        return this;
    }

    String pswd;
    public String pswd() {return pswd; }
    public PhotoUser pswd(String psword) {
        pswd = psword;
        return this;
    }
}
