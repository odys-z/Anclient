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
                string decryptK = "io.github.odys-z";
                string encryptK = "0123456789ABCDEF";
                string plain = "Plain Text";
                string iv = AESHelper.Encode64(AESHelper.getRandom());
                Assert.Equals(plain, AESHelper.Dencrypt(plain, decryptK, iv, encryptK));
			} catch (Exception e) {
                Assert.Fail(e.Message);
            }
        }

        /*
        public static void Main()
        {
            string original = "Here is some data to encrypt!";

            // Create a new instance of the Aes
            // class.  This generates a new key and initialization
            // vector (IV).
            using (Aes myAes = Aes.Create())
            {

                // Encrypt the string to an array of bytes.
                byte[] encrypted = EncryptStringToBytes_Aes(original, myAes.Key, myAes.IV);

                // Decrypt the bytes to a string.
                string roundtrip = DecryptStringFromBytes_Aes(encrypted, myAes.Key, myAes.IV);

                //Display the original data and the decrypted data.
                Console.WriteLine("Original:   {0}", original);
                Console.WriteLine("Round Trip: {0}", roundtrip);
            }
        }
        */
    }
}
