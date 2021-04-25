using io.odysz.semantic.jsession;

namespace io.odysz.anclient
{
    public class AnsonClient
    {
        public SessionInf ssInf { get; }

        /// <summary>Session login response from server.</summary>
        /// <paramref name="sessionInfo"></paramref>
        internal AnsonClient(SessionInf sessionInfo)
		{
			this.ssInf = sessionInfo;
		}

	}
}