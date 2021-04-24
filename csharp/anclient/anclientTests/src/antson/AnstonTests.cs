using Microsoft.VisualStudio.TestTools.UnitTesting;
using Newtonsoft.Json;

using io.oz.anson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using io.odysz.anson;

namespace io.oz.anson.Tests
{
    [TestClass()]
    public class AnstonTests
    {
        [TestMethod()]
        public void AnstonTest()
        {
            Anson a = new Anson();
            string jsn = JsonConvert.SerializeObject(a);
            StringAssert.Contains(jsn, "{}");
            Anson b = JsonConvert.DeserializeObject<Anson>(jsn);
            Console.WriteLine(b);
        }
    }
}