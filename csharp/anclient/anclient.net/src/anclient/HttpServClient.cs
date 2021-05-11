using io.odysz.anson;
using io.odysz.semantic.jprotocol;
using System;
using System.Diagnostics;
using System.IO;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using static io.odysz.semantic.jprotocol.AnsonMsg;

namespace io.odysz.anclient
{
    internal class HttpServClient
    {
        public HttpServClient()
        {
        }

        /// <summary>
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
                    HttpResponseMessage jresponse = await client.PostAsync(url, payload);
                    AnsonMsg resp = (AnsonMsg)Anson.FromJson(await jresponse.Content.ReadAsStringAsync());

                    // onResp(resp.code, resp);
                    return resp;
                }
                catch (Exception ex)
                {
                    throw new IOException(ex.Message);
                    Debug.WriteLine(ex.StackTrace);
                }
            }
        }
    }
}