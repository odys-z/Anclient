
namespace io.odysz.semantic.tier.docs {

/**This interface is for java client collect local file information and requesting
 * file information at server side. So no record Id can present here.
 *  
 * @author ody
 *
 */
public interface IFileDescriptor {
	string fullpath();
	IFileDescriptor fullpath(string clientpath);

	string clientname();

	// string mime(); // { return null; }

	// string doctype(); // { return null; }

	string Cdate();
} }
