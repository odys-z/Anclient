using io.odysz.anson;
using io.odysz.semantic.jprotocol;
using io.odysz.semantics.x;
using System;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using static io.odysz.semantic.jprotocol.AnsonMsg;

namespace io.odysz.anclient
{
    public class HttpServClient
    {
        protected const string USER_AGENT = "Anclient.c#/1.0";

        public HttpServClient()
        {
        }

        /// <summary>
        /// Js equivalent: Ajax.
        /// We use HttpClient, see https://stackoverflow.com/a/4015346/7362888
        /// </summary>
        /// <param name="url"></param>
        /// <param name="req"></param>
        /// <param name="onResp"></param>
        internal async Task<AnsonMsg> Post(string url, AnsonMsg req)
        {
            using (var client = new HttpClient())
            {
                try
                {
                    // what about http stream?
                    MemoryStream s = new MemoryStream();
                    req.ToBlock(s);
                    StringContent payload = new StringContent(anson.Utils.ToString(s),
                                                Encoding.UTF8, "application/json");
                    HttpResponseMessage jresponse = await client.PostAsync(url, payload).ConfigureAwait(false);
                    AnsonMsg resp = (AnsonMsg)Anson.FromJson(await jresponse.Content.ReadAsStringAsync());

                    // onResp(resp.code, resp);
                    return resp;
                }
                catch (Exception ex)
                {
                    Debug.WriteLine(ex.StackTrace);
                    // throw new IOException(ex.Message);
                    return new AnsonMsg(req.port, new MsgCode(MsgCode.exIo))
                            .Body(new AnsonResp(null, ex.Message), null);
                }
            }
        }
		public string streamdown(string url, AnsonMsg jreq, string localpath) {
            HttpWebRequest req = (HttpWebRequest)WebRequest.Create(url);
            HttpWebResponse con = (HttpWebResponse)req.GetResponse();
            // Stream stream = con.GetResponseStream();

            //add reuqest header
            req.Method = "POST"; //.setRequestMethod("POST");
            req.UserAgent = USER_AGENT; // .setRequestProperty("User-Agent", USER_AGENT);
            // req.setRequestProperty("Accept-Language", "en-US,en;q=0.5");
            req.Headers.Add("Accept-Language", "fr,fr-FR;q=0.8,en-US;q=0.5,en;q=0.3");
            // con.setRequestProperty("Content-Type", "text/plain"); 
            req.ContentType = "text/plain";
            // con.setRequestProperty("charset", "utf-8");
            req.TransferEncoding = "utf-8";

            // Send post request
            // con.setDoOutput(true);
            using (Stream stream = req.GetResponse().GetResponseStream())
            {
                jreq.ToBlock(stream);
            }

            if (AnClient.verbose) Utils.Logi(url);

            Stream ins = con.GetResponseStream();
            FileStream ofs = new FileStream(localpath, FileMode.OpenOrCreate);
            ins.CopyTo(ofs);
            ofs.Close();

            AnsonMsg s = null;
            string type = null; 
            try {
                // FileInputStream ifs = new FileInputStream(localpath);
                // type = detector.detect(ifs);
                // ifs.close();
                if (localpath.EndsWith(".json"))
                    type = "json";
            }
            catch (Exception e) {
                return localpath;
            }

            if (type != null && type.StartsWith("json"))
            {
                FileStream ifs = new FileStream(localpath, FileMode.OpenOrCreate);
                try
                {
                    s = (AnsonMsg)Anson.FromJson(ifs);
                }
                catch (Exception e)
                {
                    return localpath;
                }
                finally { ifs.Close(); }
                throw new SemanticException("Code: %s\nmsg: %s", s.code, ((AnsonResp)s.Body(0)).Msg());
            }

            return localpath;
	    }
    }
}