package io.oz.albumtier;

import java.io.FileNotFoundException;
import java.io.InputStream;

import io.odysz.semantic.tier.docs.SyncDoc;

/**
 * A file accessor used by AlbumTier etc., for accessing files without visiting traditional file system.
 *
 * This is a special bridge that tiers can access file through Android content providers or so.
 */
public interface IFileProvider {
    /**
     * Default implementation example: return Files.size(Paths.get(f.fullpath());
     * @return size
     */
    long meta(SyncDoc f);

    /**
     * Example for normal file system implementation:
     * <pre>new FileInputStream(new File(path));</pre>
     * @return readable stream
     */
    InputStream open(Object pathUri) throws FileNotFoundException;
}
