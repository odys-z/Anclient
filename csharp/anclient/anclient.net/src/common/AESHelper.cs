using System;
using System.Text;
using System.Security.Cryptography;
using System.IO;
using io.odysz.anson.common;

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

        /// <summery>
        ///    AES/CBC/NoPadding, as the same to java side (Apache default)
        /// </summery>
        /// <param name="plain">Base64</param>
        /// <param name="key">plain key string</param>
        /// <param name="iv">Base64, length = 16</param>
        /// <returns>cipher-base64</returns>
        public static string Encrypt(string plain, string key, byte[] iv)
        {
            //if (plain.Length != 16 || key.Length != 16)
            //    throw new NotImplementedException("TODO length padding != 16");
            if (plain.Trim() != plain)
                throw new Exception("Plain text to be encrypted can not begin or end with space.");


            byte[] encrypted;

            // Create an Aes object
            // with the specified key and IV.
            using (Aes aesAlg = Aes.Create())
            {
                aesAlg.Padding = PaddingMode.None; // understandable at java side
                aesAlg.Mode = CipherMode.CBC;
                aesAlg.BlockSize = 128;

                // aesAlg.Key = Encoding.Unicode.GetBytes(key);
                aesAlg.Key = pad16_32(key);
                aesAlg.IV = iv;
                // PaddingMode p = aesAlg.Padding;

                // Create an encryptor to perform the stream transform.
                ICryptoTransform encryptor = aesAlg.CreateEncryptor(aesAlg.Key, aesAlg.IV);

                // Create the streams used for encryption.
                using (MemoryStream msEncrypt = new MemoryStream())
                {
                    using (CryptoStream csEncrypt = new CryptoStream(msEncrypt, encryptor, CryptoStreamMode.Write))
                    {
                        //using (StreamWriter swEncrypt = new StreamWriter(csEncrypt))
                        //{
                        //    //Write all data to the stream.
                        //    swEncrypt.Write(plain);
                        //}
                        byte[] bayraktar = pad16_32(plain);
                        csEncrypt.Write(bayraktar, 0, bayraktar.Length);

                        encrypted = msEncrypt.ToArray();
                    }
                }
            }

            return Encode64(encrypted);
        }

        /// <summary>Use a special char to padd up to AES block.
        /// TODO upgrade the java side
        /// Reference:
        /// \u2020, ? , a char not easy to be keyed in
        /// https://www.unicode.org/charts/PDF/Unicode-3.2/U32-2000.pdf
        /// \u0000, Nil
        /// https://www.unicode.org/charts/PDF/U0000.pdf
        /// </summary>
        /// <param name="s"></param>
        /// <returns> 16 / 32 byte string
        /// </returns>
        /// <exception cref="Exception"></exception>
        private static byte[] pad16_32(string s)
        {
            int l = Encoding.Unicode.GetByteCount(s);
            if (l <= 16)
                l = 16;
            else if (l <= 32)
                l = 32;
            else
                throw new Exception("Not supported block length(16B/32B): " + s);

            byte[] buf = new byte[l];

            LangExt.Fill<byte>(buf, 0);

            Encoding.Unicode.GetBytes(s, 0, s.Length, buf, 0);
            return buf;
        }

        private static string depad16_32(string s) 
        {
            return s.Replace("\u0000", string.Empty);
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
                aesAlg.Padding = PaddingMode.None;
                aesAlg.Mode = CipherMode.CBC;
                aesAlg.BlockSize = 128;

                aesAlg.Key = Encoding.Unicode.GetBytes(key);
                aesAlg.IV = iv;

                // Create a decryptor to perform the stream transform.
                ICryptoTransform decryptor = aesAlg.CreateDecryptor(aesAlg.Key, aesAlg.IV);

                // Create the streams used for decryption.
                using (MemoryStream msDecrypt = new MemoryStream(cipher))
                {
                    using (CryptoStream csDecrypt = new CryptoStream(msDecrypt, decryptor, CryptoStreamMode.Read))
                    {
                        using (StreamReader srDecrypt = new StreamReader(csDecrypt, Encoding.Unicode))
                        {
                            // Read the decrypted bytes from the decrypting stream
                            // and place them in a string.
                            plaintext = srDecrypt.ReadToEnd();
                        }
                    }
                }
            }

            // return plaintext.Replace("\u0000", string.Empty);
            return depad16_32(plaintext);
        }

        /// <summary>Converts String to unicode bytes</summary>
        /// <param name="str">the input string</param>
        /// <returns>utf16 bytes</returns>
        //public static byte[] getUTF16Bytes(string str)
        //{
        //    return Encoding.Unicode.GetBytes(str);
        //}

        public static string Encode64(byte[] bytes)
        {
            return Convert.ToBase64String(bytes); 
        }

        /// <summary>Encode base 64 in block chain mode.
        /// </summary>
        /// <param name="ifs"></param>
        /// <param name="blockSize">default 3 * 1024 * 1024</param>
        /// <returns></returns>
        /// <exception cref="IOException"></exception>
        public static string Encode64(Stream ifs, int blockSize) 
        {
            blockSize = blockSize > 0 ? blockSize : 3 * 1024 * 1024;

            if ((blockSize % 12) != 0)
                throw new IOException("Block size must be multple of 12.");


            byte[] chunk = new byte[blockSize];
            int pos = 0;

            int len = ifs.Read(chunk, pos, blockSize);

            if (len >= 0)
                return Convert.ToBase64String(chunk);
            else return null;
        }

        public static byte[] Decode64(string str)
        {
            return Convert.FromBase64String(str);
        }
    }
}
