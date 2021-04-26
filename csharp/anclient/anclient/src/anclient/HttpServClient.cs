using io.odysz.semantic.jprotocol;
using Newtonsoft.Json;
using System;
using System.Net.Http;
using System.Text;
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
        internal async void Post(string url, AnsonMsg req, Action<MsgCode, object> onResp)
        {
            using (var client = new HttpClient())
            {
                var jresponse = await client.PostAsync(
                    url,
                    new StringContent(JsonConvert.SerializeObject(req),
                        Encoding.UTF8, "application/json"));

                string jresp = await jresponse.Content.ReadAsStringAsync();
                AnsonMsg resp = (AnsonMsg)JsonConvert.DeserializeObject(jresp);
                onResp(resp.code, resp);
            }
        }
    }
}