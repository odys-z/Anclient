package io.oz.album.client;

import static io.odysz.common.LangExt.eq;
import static io.odysz.common.LangExt.isblank;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import io.odysz.anson.Anson;

/**
 * @since 0.3.0
 */
public class AnPrefEntries extends Anson {
    /** current selected index */
    int ix = -1;
    public String[] entries;
    public String[] entVals;

    public AnPrefEntries(String[] entries, String[] entvals) {
        this.entries = entries;
        this.entVals = entvals;
    }


    /**
     * Using for-loop to find the index.
     * @param arr array
     * @param target
     * @return index
     * @param <T>
     */
    static <T> int indexOf(T[] arr, T target) {
        for (int index = 0; index < arr.length; index++) {
            if (arr[index] == target
                    || target instanceof String && eq((String)arr[index], (String) target)) {
                return index;
            }
        }
        return -1;
    }

    static <T> void swap(T[] arr, int a, int b) {
        if (arr != null && 0 <= a && a < arr.length && 0 <= b && b <= arr.length) {
            T x = arr[b];
            arr[b] = arr[a];
            arr[a] = x;
        }
    }

    static <T> T[] insertAt(T[] arr, T element, int position) {
        List<T> list = new ArrayList<>(Arrays.asList(arr));
        list.add(position, element);
        return list.toArray(arr);
    }


    public String select(String val) {
        ix = indexOf(entVals, val);
        if (ix >= 0 && ix < entries.length)
            return entries[ix];
        return null;
    }

    /**
     * Insert a new name-url pair, if already exists, swap to the first
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

    /** get current entry */
    public String entry() {
        return entries != null && ix >= 0 && ix < entries.length ?
                entries[ix] : null;
    }
}
