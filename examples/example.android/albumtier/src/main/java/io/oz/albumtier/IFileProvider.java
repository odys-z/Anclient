package io.oz.albumtier;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;

import io.odysz.semantic.tier.docs.SyncDoc;

/**
 * <p>A file accessor used by AlbumTier etc., for accessing files without visiting traditional file system.</p>
 *
 * This is a special bridge (interface) that semantiers can access file through Android content providers or so.
 */
public interface IFileProvider {
    /**
     * Default implementation example:<pre>
     * return Files.size(Paths.get(f.fullpath());</pre>
     * 
     * @return size
     * @throws IOException 
     */
    long meta(SyncDoc f) throws IOException;

    /**
     * <p>Open file input stream.</p>
     * Example for normal file system implementation:<pre>
     * new FileInputStream(new File(path));</pre>
     * 
     * @return readable stream
     */
    InputStream open(SyncDoc f) throws FileNotFoundException;
}
