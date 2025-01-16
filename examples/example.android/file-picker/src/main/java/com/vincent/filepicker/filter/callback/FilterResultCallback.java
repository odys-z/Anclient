package com.vincent.filepicker.filter.callback;

import com.vincent.filepicker.filter.entity.Directory;

import java.io.File;
import java.util.List;

import io.oz.fpick.AndroidFile;

/**
 * Created by Vincent Woo
 * Date: 2016/10/11
 * Time: 11:39
 */

public interface FilterResultCallback<T extends AndroidFile> {
    void onResult(List<Directory<T>> directories);
}
