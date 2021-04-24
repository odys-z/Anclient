using io.odysz.common;
using System;

namespace anclientTests.src.common
{
    class AESHelperTests
    {
		/// <summary>
		/// </summary>
		/// <param name="pB64">cipher in Base64</param>
		/// <param name="ivB64">iv</param>
		/// <returns>[cipher-base64, new-iv-base64]</returns>
		public String[] Dencrypt(String pB64, String ivB64)
		{
			try {
				return AESHelper.dencrypt(pB64, decryptK, ivB64, encryptK);
			} catch (Exception e) {
                //e.PrintStackTrace();
            }
        }

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
    }
}
