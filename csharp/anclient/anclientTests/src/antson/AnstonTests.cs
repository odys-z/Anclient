using Microsoft.VisualStudio.TestTools.UnitTesting;
using Newtonsoft.Json;

using System;

namespace io.odysz.anson.tests
{
    [TestClass()]
    public class AnstonTests
    {
        [TestMethod()]
        public void AnstonTest()
        {
            Anson a = new();
            string jsn = JsonConvert.SerializeObject(a);
            StringAssert.Contains(jsn, "{}");
            Anson b = JsonConvert.DeserializeObject<Anson>(jsn);
            Console.WriteLine(b);
        }
    }
}