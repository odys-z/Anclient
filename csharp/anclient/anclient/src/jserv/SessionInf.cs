using io.oz.anson;

namespace io.oz.semantics.jserv
{
    public class SessionInf : Antson
    {
        public string ssid { get; }
        public string uid { get; }
        public string roleId { get; }

        public SessionInf() { }

        public SessionInf(string ssid, string uid, string roleId = null) {
            this.ssid = ssid;
            this.uid = uid;
            this.roleId = roleId;
        }
    }
}