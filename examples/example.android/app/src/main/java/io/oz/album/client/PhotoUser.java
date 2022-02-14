package io.oz.album.client;

import io.odysz.semantics.IUser;

/**
 * Client User type, which is diffenret from IUser.
 */
public class PhotoUser {
    public PhotoUser(String usrid) {
        this.uid = usrid;
    }

    String uid;
    public String uid() { return uid; }
    String pswd;
    public String pswd() { return pswd; }
}
