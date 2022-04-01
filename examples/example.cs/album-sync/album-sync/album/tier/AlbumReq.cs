using io.odysz.common;
using io.odysz.semantic.jprotocol;
using io.odysz.semantic.jsession;
using io.odysz.semantic.tier.docs;
using io.odysz.tier;
using System.IO;

namespace io.oz.album.tier
{
    public class AlbumReq : DocsReq
    {
        static public class A
        {
            public const string records = "r/collects";
            public const string collect = "r/photos";
            public const string rec = "r/photo";
            public const string download = "r/download";
            public const string update = "u";
            public const string insertPhoto = "c/photo";
            public const string insertCollect = "c/collect";
            public const string insertAlbum = "c/album";
            public const string del = "d";
            public const string selectSyncs = "r/syncflags";
            public const string getPrefs = "r/prefs";
        }

        string albumId;
        string collectId;
        Photo photo;

        public string device;
        public AlbumReq Device(string device)
        {
            this.device = device;
            return this;
        }

        public AlbumReq() : base (null, null)
        {
        }

        public AlbumReq(string funcUri) : base(null, funcUri)
        {
        }

        protected AlbumReq(AnsonMsg parent, string uri) : base(parent, uri)
        {
        }

        public AlbumReq CollectId(string cid)
        {
            this.collectId = cid;
            return this;
        }

        /**Create download request with photo record.
         * @param photo
         * @return request
         */
        public AlbumReq download(Photo photo)
        {
            this.albumId = photo.albumId;
            this.collectId = photo.collectId;
            this.docId = photo.recId;
            this.photo = photo;
            this.a = A.download;
            return this;
        }

        /**Create request for inserting new photo.
         * <p>FIXME: introducing stream field of Anson?</p>
         * @param collId
         * @param fullpath
         * @return request
         * @throws IOException 
         */
        public AlbumReq createPhoto(string collId, string fullpath) 
        {
            // File p = Paths.get(fullpath);
            byte[] f = File.ReadAllBytes(fullpath);
            string b64 = AESHelper.Encode64(f);

            this.photo = new Photo();
            this.photo.collectId = collId;
            this.photo.clientpath = fullpath;
            this.photo.uri = b64;
            this.photo.pname = Path.GetFileName(fullpath);

            this.a = A.insertPhoto;

            return this;
        }

        public AlbumReq photoId(string pid)
        {
            if (photo == null)
                photo = new Photo();
            photo.recId = pid;
            return this;
        }

        public AlbumReq photoName(string name)
        {
            photo.pname = name;
            return this;
        }

        /**Create a photo. Use this for small file.
         * @param file
         * @param usr
         * @return album request
         * @throws IOException
         * @throws SemanticException
         */
        public AlbumReq createPhoto(IFileDescriptor file, SessionInf usr)
        {
            return createPhoto(null, file.fullpath());
        }

        public AlbumReq selectPhoto(string docId)
        {
            this.docId = docId;
            this.photo = new Photo();
            this.photo.recId = docId;
            this.a = A.rec;

            return this;
        }

        public AlbumReq del(string device, string clientpath)
        {
            this.photo = new Photo();
            this.device = device;
            this.clientpath = clientpath;
            this.a = A.del;
            return this;
        }
    }
}
