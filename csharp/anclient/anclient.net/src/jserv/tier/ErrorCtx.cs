
using static io.odysz.semantic.jprotocol.AnsonMsg;

namespace anclient.net.jserv.tier
{
    public abstract class ErrorCtx
    {
        public string msg() { return ""; }

        virtual public void onError(MsgCode code, string msg, string[] args = null)
        {
        }

        public ErrorCtx setSignal(string signal) { return this; }
        public ErrorCtx notifySignal() { return this; }
    }
}
