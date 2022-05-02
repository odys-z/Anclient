using io.odysz.anson;
using io.odysz.semantic.jprotocol;
using io.odysz.tier;
using System.Collections;
using System.Collections.Generic;

namespace io.oz.album.tier
{
    public class AlbumResp : AnsonResp
    {
		protected string albumId;
		protected string ownerId;
		protected string owner;

		/** [Collect] */
		protected ArrayList collectRecords;

		/**[Photo[]] */
		protected ArrayList photos;
		public Photo[] Photos(int px) { return (Photo[])(photos?[px]); }

		Dictionary<string, object> clientPaths;
		public Dictionary<string, object> syncPaths() { return clientPaths; }

		Photo photo;
		public Photo Photo() { return photo; }

		// public Profiles profils;

		public AlbumResp()
		{
		}

	}
}
