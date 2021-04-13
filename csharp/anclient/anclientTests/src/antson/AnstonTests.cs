using Microsoft.VisualStudio.TestTools.UnitTesting;
using Newtonsoft.Json;

using io.oz.anson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace io.oz.anson.Tests
{
    [TestClass()]
    public class AnstonTests
    {
        [TestMethod()]
        public void AnstonTest()
        {
            // Assert.Fail();
            Antson a = new Antson();
            string jsn = JsonConvert.SerializeObject(a);
            StringAssert.Contains(jsn, "{}");
            Antson b = JsonConvert.DeserializeObject<Antson>(jsn);
            Console.WriteLine(b);
        }
    }
}