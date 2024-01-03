
using io.odysz.anson;

namespace io.odysz.semantic.tier.docs {
public class SyncingPage : Anson {
	public string device;
    public int taskNo = 0;
    public int start;
    public int end;
    
    public SyncingPage() {}

    public SyncingPage(int begin, int afterLast) {
        start = begin;
        end = afterLast;
    }

    public SyncingPage nextPage(int size) {
        start = end;
        end += size;
        return this;
    }
} }
