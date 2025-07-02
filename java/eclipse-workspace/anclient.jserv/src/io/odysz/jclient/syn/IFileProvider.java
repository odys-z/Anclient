package io.odysz.jclient.syn;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Paths;

import io.odysz.semantic.tier.docs.IFileDescriptor;

/**
 * <p>A file accessor used by AlbumTier etc., for accessing files without visiting traditional file system.</p>
 *
 * <h5>Note:</h5>
 * <p>Do not confused with IFileDescriptor in Semantic.jserv,
 * a bridge (interface) between semantic.jserv nodes and local file information,
 * which is different to Android file content between Activities, e. g. the ImageFile.</p>
 * 
 * This is a special bridge (interface) that semantiers can access file through Android content providers or so.
 * For JDK reference's implementation, e.g JDK SE 1.8 or OpenJDK 17, use the default implementation is enough:
 * <pre>new IFileProvider() {}</pre>
 */
public interface IFileProvider {
    /**
     * Default implementation example:
     * <pre>return Files.size(Paths.get(f.fullpath());</pre>
     * @return size
     */
    default long meta(IFileDescriptor f) throws IOException { return Files.size(Paths.get(f.fullpath())); };

    /**
     * <p>Open file input stream.</p>
     * Example for normal file system implementation:<pre>
     * new FileInputStream(new File(path));</pre>
     *
     * @return readable stream
     */
    default InputStream open(IFileDescriptor f) throws IOException { return (InputStream) new FileInputStream(new File(f.fullpath())); };

    /**
     * <p>Resolve the initial folder (with Policies).</p>
     * Currently, the save folder policy is simple last modified date for documents and creating date
     * for medias if API version later than Build.VERSION_CODES.O, otherwise use last modified.
     * (Audio file in Andriod is named with date string).
     *
     * @since 0.2.1 (Albumtier)
     * @return initial folder to save the file at server side
     */
    // String saveFolder();
}
