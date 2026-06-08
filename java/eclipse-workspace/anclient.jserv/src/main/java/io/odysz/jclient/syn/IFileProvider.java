package io.odysz.jclient.syn;

import static io.odysz.common.Regex.startsVolume;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import io.odysz.semantic.tier.docs.IFileDescriptor;
import io.odysz.transact.sql.parts.ExtFilePaths;

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
     * Default implementation can usable on a Synode:
     * figure f.uri64's physical file size first, then return f.fullpath().size.
     * 
     * <h4>Implementation Example on client node:</h4>
     * <pre>return Files.size(Paths.get(f.fullpath());</pre>
     * @return size
     */
    default long meta(IFileDescriptor f) throws IOException {
    	return Files.size(pysicalPath(f));
    };

    /**
     * <p>Open file input stream.</p>
     * Example for normal file system implementation:<pre>
     * new FileInputStream(new File(path));</pre>
     *
     * @return readable stream
     */
    default InputStream open(IFileDescriptor f) throws IOException {
    	return (InputStream) new FileInputStream(pysicalPath(f).toFile());
    };
    
    default Path pysicalPath(IFileDescriptor f) {
    	String uri64 = f.uri64();
    	return startsVolume(uri64) ?
    		Paths.get(ExtFilePaths.decodeUriPath(uri64)) :
    		Paths.get(f.fullpath());
    }
}
