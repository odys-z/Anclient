package io.oz.album.client;

import static io.odysz.common.LangExt.eq;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class AnPrefEntries {
    /** current selected index */
    int ix = -1;
    public String[] entries;
    public String[] entVals;

    public AnPrefEntries(String[] entries, String[] entvals) {
        this.entries = entries;
        this.entVals = entvals;
    }

    static <T> int forLoopIndex(T[] numbers, T target) {
        for (int index = 0; index < numbers.length; index++) {
            if (numbers[index] == target
                    || target instanceof String && eq((String)numbers[index], (String) target)) {
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

    private static <T> T[] insertAt(T[] arr, T element, int position) {
        List<T> list = new ArrayList<>(Arrays.asList(arr));
        list.add(position, element);
        return list.toArray(arr);
    }


    public String select(String val) {
        ix = forLoopIndex(entVals, val);
        if (ix >= 0 && ix < entries.length)
            return entries[ix];
        return null;
    }

    /**
     * Insert a new name-url pair, if already exists, swap to the first
     *
     * @param jserv name\nurl
     */
    public void insert(String jserv) {
        String[] jss = jserv.split("\n");
        if (jss != null && jss.length >= 2) {
            int i = forLoopIndex(entVals, jss[1]);
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
        }
    }

    /** get current entry */
    public String entry() {
        return entries != null && ix >= 0 && ix < entries.length ?
                entries[ix] : null;
    }
}
