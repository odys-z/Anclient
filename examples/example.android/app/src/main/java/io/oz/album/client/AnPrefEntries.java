package io.oz.album.client;

import static io.odysz.common.LangExt.*;
import static io.odysz.common.LangExt.isblank;

import io.odysz.anson.Anson;
import io.oz.albumtier.AlbumContext;

/**
 * @since 0.3.0
 */
public class AnPrefEntries extends Anson {
    /** current selected index */
    public int ix = -1;
    public String[] entries;
    public String[] entVals;

    public AnPrefEntries() {
    }

    public AnPrefEntries(String[] entries, String[] entvals) {
        this.entries = entries;
        this.entVals = entvals;
    }

//    public String select(AlbumContext singleton, int ix) {
    public String select(int ix) {
        if (ix >= 0 && ix < entries.length) {
            this.ix = ix;
            // singleton.jserv(entryVal());
            // return entries[ix];
            return entryVal();
        }
        return null;

    }

    public String select(String val) {
        return select(indexOf(entVals, val));
    }

    /**
     * Insert a new name-url pair, if the entry is already exist, swap it to the first.
     *
     * @param jserv 0.3.0: name\nurl
     * @return true if content seems usable
     * @since 0.3.0
     */
    public boolean insert(String jserv) {
        String[] jss = jserv.split("\n");
        if (jss != null && jss.length >= 2 && !isblank(jss[0]) && !isblank(jss[1])) {
            int i = indexOf(entVals, jss[1]);
            if (i > 0) {
                swap(entVals, 0, i);
                swap(entries, 0, i);
                ix = 0;
            }
            else if (i < 0) {
                entries = insertAt(entries, jss[0], 0);
                entVals = insertAt(entVals, jss[1], 0);
                ix = 0;
            }
            return true;
        }
        return false;
    }

    /** Get current entry.
     * @since 0.7.1, this is the current synode ID. */
    public String entry() {
        return entries != null && ix >= 0 && ix < entries.length ?
                entries[ix] : "";
    }

    /** get current entry value, the default jserv url */
    public String entryVal() {
        return entVals != null && ix >= 0 && ix < entVals.length ?
                entVals[ix] : "";
    }
}
