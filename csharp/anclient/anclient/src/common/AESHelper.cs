using System;
using System.Text;
using System.Security.Cryptography;
using System.IO;

namespace io.odysz.common
{
    /// <summary>Static helpers for encrypt/decipher string.</summary>
    /// <remarks>
    /// Static helpers for encrypt/decipher string.
    /// <table>
    /// <tr><td></td><td></td></tr>
    /// </trable>
    /// </remarks>
    /// <author>ody</author>
    public class AESHelper
    {
        static Random _random;
        static Random random { get
            {
                if (_random == null)
                    _random = new Random();
                return _random;
            } }

        public static byte[] getRandom()
        {
            byte[] iv = new byte[16];
            try
            {
                    
                random.NextBytes(iv);
                return iv;
            }
            catch (Exception ex)
            {
			    Console.WriteLine (ex);
                return null;
            }
        }

        /// <summary>Decrypt then encrypt.</summary>
        /// <param name="cypher">Base64</param>
        /// <param name="decryptK">plain key string</param>
        /// <param name="decryptIv">Base64</param>
        /// <param name="encryptK">plain key string</param>
        /// <returns>[cipher-base64, new-iv-base64]</returns>
        /// <returns>string[b64(cipher), b64(iv)]</returns>
        public static string[] Dencrypt(string cypher, string decryptK, string decryptIv, string encryptK)
		{
			byte[] iv = AESHelper.Decode64(decryptIv);
			byte[] eiv = getRandom();
            string plain = Decrypt(cypher, decryptK, iv);
            return new string[] { Encrypt(plain, encryptK, eiv), Encode64(eiv) };
		}

        /// <param name="plain">Base64</param>
        /// <param name="key">plain key string</param>
        /// <param name="iv">Base64, length = 16</param>
        /// <returns>cipher-base64</returns>
        public static string Encrypt(string plain, string key, byte[] iv)
        {
            byte[] encrypted;

            // Create an Aes object
            // with the specified key and IV.
            using (Aes aesAlg = Aes.Create())
            {
                aesAlg.Key = Encoding.UTF8.GetBytes(key);
                aesAlg.IV = iv;

                // Create an encryptor to perform the stream transform.
                ICryptoTransform encryptor = aesAlg.CreateEncryptor(aesAlg.Key, aesAlg.IV);

                // Create the streams used for encryption.
                using (MemoryStream msEncrypt = new MemoryStream())
                {
                    using (CryptoStream csEncrypt = new CryptoStream(msEncrypt, encryptor, CryptoStreamMode.Write))
                    {
                        using (StreamWriter swEncrypt = new StreamWriter(csEncrypt))
                        {
                            //Write all data to the stream.
                            swEncrypt.Write(plain);
                        }
                        encrypted = msEncrypt.ToArray();
                    }
                }
            }

            return Encode64(encrypted);
        }

        /// <param name="cypher64">Cypher in Base64</param>
        /// <param name="key">plain key string</param>
        /// <param name="iv">Base64</param>
        /// <returns>plain text</returns>
        public static string Decrypt(string cypher64, string key, byte[] iv)
        {
            // Declare the string used to hold
            // the decrypted text.
            string plaintext = null;

            byte[] cipher = Convert.FromBase64String(cypher64);
            // Create an Aes object
            // with the specified key and IV.
            using (Aes aesAlg = Aes.Create())
            {
                aesAlg.Key = Encoding.UTF8.GetBytes(key);
                aesAlg.IV = iv;

                // Create a decryptor to perform the stream transform.
                ICryptoTransform decryptor = aesAlg.CreateDecryptor(aesAlg.Key, aesAlg.IV);

                // Create the streams used for decryption.
                using (MemoryStream msDecrypt = new MemoryStream(cipher))
                {
                    using (CryptoStream csDecrypt = new CryptoStream(msDecrypt, decryptor, CryptoStreamMode.Read))
                    {
                        using (StreamReader srDecrypt = new StreamReader(csDecrypt))
                        {

                            // Read the decrypted bytes from the decrypting stream
                            // and place them in a string.
                            plaintext = srDecrypt.ReadToEnd();
                        }
                    }
                }
            }

            return plaintext;
        }

        /// <summary>Converts String to UTF8 bytes</summary>
        /// <param name="str">the input string</param>
        /// <returns>UTF8 bytes</returns>
        public static byte[] getUTF8Bytes(string str)
        {
            return Encoding.ASCII.GetBytes(str);
        }

        public static string Encode64(byte[] bytes)
        {
            return Convert.ToBase64String(bytes); 
        }

        public static byte[] Decode64(string str)
        {
            return Convert.FromBase64String(str);
        }
    }
}
