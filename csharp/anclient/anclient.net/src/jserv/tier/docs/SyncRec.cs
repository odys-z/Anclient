using io.odysz.anson;

namespace io.odysz.semantic.tier.docs {

/**
 * Query results of synchronizing data.
 * 
 * <p>To query a file's synchronizing state, without client DB, the way to match
 * a file at server side is match device name and client path. So no db record Id
 * can be used here. </p>
 * @author ody
 *
 */
public class SyncRec : Anson, IFileDescriptor {

	private string clientpath;
	private string filename;
	private string cdate;

	public SyncRec() { }

	public SyncRec(IFileDescriptor p) {
		this.clientpath = p.fullpath();
		this.filename = p.clientname();
		this.cdate = p.Cdate();
	}

	public string fullpath() {
		return clientpath;
	}

	public string clientname() {
		return filename;
	}

    public IFileDescriptor fullpath(string path)
    {
		this.clientpath = path;
		return this;
    }

    public string Cdate() { return cdate; }

} }
