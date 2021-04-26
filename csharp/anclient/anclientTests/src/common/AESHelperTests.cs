using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;

namespace io.odysz.common.tests
{
    [TestClass()]
    public class AESHelperTests
    {
        [TestMethod()]
		public void Dencrypt()
		{
			try {
                string k1 = "0123456789ABCDEF";
                string k2 = "io.github.odys-z";
                string plain = "Plain Text";
                byte[] iv64 = AESHelper.getRandom();
                string iv = AESHelper.Encode64(iv64);
                string cypher = AESHelper.Encrypt(plain, k1, iv64);
                string[] cypherss = AESHelper.Dencrypt(cypher, k1, iv, k2);
                Assert.AreEqual(plain, AESHelper.Decrypt(cypherss[0], k2, AESHelper.Decode64(cypherss[1])));

                System.Diagnostics.Debug.WriteLine("Check this at server side:");
                System.Diagnostics.Debug.WriteLine(string.Format("Cypher:\n{0}", cypherss[0]));
                System.Diagnostics.Debug.WriteLine(string.Format("Key:\n{0},\nIV:\n{1}", k2, cypherss[1]));
                System.Diagnostics.Debug.WriteLine(string.Format("Expacting:\n{0}", plain));
            }
            catch (Exception e) {
                Assert.Fail(e.Message);
            }
        }
    }
}
