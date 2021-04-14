using io.oz.semantics.jserv;

namespace anclient.src.anclient
{
    public class AnsonClient
    {
        public SessionInf ssInf { get; }

        /// <summary>Session login response from server.</summary>
        /// <paramref name="sessionInfo"></paramref>
        AnsonClient(SessionInf sessionInfo)
		{
			this.ssInf = sessionInfo;
		}

	}
}