using System;
using System.Text;

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
        //		internal static java.util.Properties randomProperties = new java.util.Properties();

        //		/// <summary>
        //		/// Deprecating static final String transform = "AES/CBC/PKCS5Padding";<br />
        //		/// Apache Common Crypto only support PKCS#5 padding, but most js lib support PKCS#7 padding,
        //		/// This makes trouble when negotiation with those API.
        //		/// </summary>
        //		/// <remarks>
        //		/// Deprecating static final String transform = "AES/CBC/PKCS5Padding";<br />
        //		/// Apache Common Crypto only support PKCS#5 padding, but most js lib support PKCS#7 padding,
        //		/// This makes trouble when negotiation with those API.
        //		/// Solution: using no padding here, round the text to 16 or 32 ASCII bytes.
        //		/// </remarks>
        //		internal const string transform = "AES/CBC/NoPadding";

        //		internal static org.apache.commons.crypto.cipher.CryptoCipher encipher;

        //		static AESHelper()
        //		{
        //			randomProperties[org.apache.commons.crypto.random.CryptoRandomFactory.CLASSES_KEY
        //				] = org.apache.commons.crypto.random.CryptoRandomFactory.RandomProvider.JAVA.getClassName
        //				();
        //			java.util.Properties cipherProperties = new java.util.Properties();
        //			// causing problem for different environment:
        //			// cipherProperties.setProperty(CryptoCipherFactory.CLASSES_KEY, CipherProvider.JCE.getClassName());
        //			try
        //			{
        //				encipher = org.apache.commons.crypto.utils.Utils.getCipherInstance(transform, cipherProperties
        //					);
        //			}
        //			catch (System.IO.IOException e)
        //			{
        //				//decipher = Utils.getCipherInstance(transform, properties);
        //				Sharpen.Runtime.printStackTrace(e);
        //			}
        //		}

        //		/// <summary>TODO move to test</summary>
        //		/// <param name="args"/>
        //		public static void Main(string[] args)
        //		{
        //			string s = "plain text 1";
        //			byte[] iv = getRandom();
        //			try
        //			{
        //				System.Console.Out.WriteLine("iv:\t\t" + java.util.Base64.getEncoder().encodeToString
        //					(iv));
        //				string cipher = encrypt(s, "infochange", iv);
        //				System.Console.Out.WriteLine("cipher:\t\t" + cipher);
        //				string plain = decrypt(cipher, "infochange", iv);
        //				System.Console.Out.WriteLine("plain-text:\t" + plain);
        //			}
        //			catch (System.Exception e)
        //			{
        //				Sharpen.Runtime.printStackTrace(e);
        //			}
        //		}
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
        /// <exception cref="java.security.GeneralSecurityException"/>
        /// <exception cref="System.IO.IOException"/>
        /// <returns>string[b64(cipher), b64(iv)]</returns>
        public static string[] dencrypt(string cypher, string decryptK, string decryptIv, string encryptK)
		{
			byte[] iv = AESHelper.decode64(decryptIv);
			//byte[] input = io.odysz.common.AESHelper.decode64(cypher);
			//byte[] dkb = getUTF8Bytes(pad16_32(decryptK));
			//byte[] plain = decryptEx(input, dkb, iv);
			//byte[] eiv = getRandom();
			//byte[] ekb = getUTF8Bytes(pad16_32(encryptK));
			//byte[] output = encryptEx(plain, ekb, eiv);
			//string b64 = java.util.Base64.getEncoder().encodeToString(output);
			return new string[] { b64, encode64(eiv) };
		}

        /// <exception cref="java.security.GeneralSecurityException"/>
        /// <exception cref="System.IO.IOException"/>
        public static string encrypt(string plain, string key, byte[] iv)
        {
            key = pad16_32(key);
            plain = pad16_32(plain);
            byte[] input = getUTF8Bytes(plain);
            byte[] kb = getUTF8Bytes(key);
            byte[] output = encryptEx(input, kb, iv);
            string b64 = java.util.Base64.getEncoder().encodeToString(output);
            return b64;
        }

        //		/// <exception cref="java.security.GeneralSecurityException"/>
        //		/// <exception cref="System.IO.IOException"/>
        //		internal static byte[] encryptEx(byte[] input, byte[] key, byte[] iv)
        //		{
        //			//System.out.println("txt: " + plain);
        //			//System.out.println("key: " + key);
        //			javax.crypto.spec.SecretKeySpec keyspec = new javax.crypto.spec.SecretKeySpec(key
        //				, "AES");
        //			javax.crypto.spec.IvParameterSpec ivspec = new javax.crypto.spec.IvParameterSpec(
        //				iv);
        //			//Initializes the cipher with ENCRYPT_MODE, key and iv.
        //			try
        //			{
        //				encipher.init(javax.crypto.Cipher.ENCRYPT_MODE, keyspec, ivspec);
        //				byte[] output = new byte[((input.Length) / 16 + 2) * 16];
        //				// + 1 will throw exception
        //				// int finalBytes = encipher.doFinal(input, 0, input.length, output, 0);
        //				// above code is incorrect (not working with PKCS#7 padding),
        //				// check Apache Common Crypto User Guide:
        //				// https://commons.apache.org/proper/commons-crypto/userguide.html
        //				// Usage of Byte Array Encryption/Decryption, CipherByteArrayExample.java
        //				int updateBytes = encipher.update(input, 0, input.Length, output, 0);
        //				//System.out.println("updateBytes " + updateBytes);
        //				int finalBytes = encipher.doFinal(input, 0, 0, output, updateBytes);
        //				//System.out.println("finalBytes " + finalBytes);
        //				output = java.util.Arrays.copyOf(output, updateBytes + finalBytes);
        //				encipher.close();
        //				return output;
        //			}
        //			catch (java.security.GeneralSecurityException e)
        //			{
        //				throw new java.security.GeneralSecurityException(e.Message);
        //			}
        //		}

        //		/// <exception cref="java.security.GeneralSecurityException"/>
        //		/// <exception cref="System.IO.IOException"/>
        //		public static string decrypt(string cypher, string key, byte[] iv)
        //		{
        //			byte[] input = java.util.Base64.getDecoder().decode(cypher);
        //			byte[] kb = getUTF8Bytes(pad16_32(key));
        //			byte[] output = decryptEx(input, kb, iv);
        //			string p = setUTF8Bytes(output);
        //			//return p.trim();
        //			return p.Replace("-", string.Empty);
        //		}

        //		/// <exception cref="java.security.GeneralSecurityException"/>
        //		/// <exception cref="System.IO.IOException"/>
        //		internal static byte[] decryptEx(byte[] input, byte[] key, byte[] iv)
        //		{
        //			//key = pad16_32(key);
        //			//cypher = pad16_32(cypher);
        //			//byte[] input = Base64.getDecoder().decode(cypher);
        //			javax.crypto.spec.SecretKeySpec keyspec = new javax.crypto.spec.SecretKeySpec(key
        //				, "AES");
        //			javax.crypto.spec.IvParameterSpec ivspec = new javax.crypto.spec.IvParameterSpec(
        //				iv);
        //			encipher.init(javax.crypto.Cipher.DECRYPT_MODE, keyspec, ivspec);
        //			byte[] output = new byte[((input.Length) / 16 + 2) * 16];
        //			int finalBytes = encipher.doFinal(input, 0, input.Length, output, 0);
        //			encipher.close();
        //			return java.util.Arrays.copyOf(output, finalBytes);
        //		}

        //		//return setUTF8Bytes(Arrays.copyOf(output, finalBytes));
        //		/// <exception cref="java.security.GeneralSecurityException"/>
        //		private static string pad16_32(string s)
        //		{
        //			int l = s.Length;
        //			if (l <= 16)
        //			{
        //				return string.format("%1$16s", s).Replace(' ', '-');
        //			}
        //			else
        //			{
        //				if (l <= 32)
        //				{
        //					return string.format("%1$32s", s).Replace(' ', '-');
        //				}
        //				else
        //				{
        //					throw new java.security.GeneralSecurityException("Not supported block length(16B/32B): "
        //						 + s);
        //				}
        //			}
        //		}

        /// <summary>Converts String to UTF8 bytes</summary>
        /// <param name="input">the input string</param>
        /// <returns>UTF8 bytes</returns>
        private static byte[] getUTF8Bytes(string input)
        {
            // return Sharpen.Runtime.getBytesForString(input);
            return (byte[])input.ToCharArray();
        }

        //		/// <summary>Converts UTF8 bytes to String</summary>
        //		/// <param name="input"/>
        //		/// <returns/>
        //		private static string setUTF8Bytes(byte[] input)
        //		{
        //			return new string(input, java.nio.charset.StandardCharsets.UTF_8);
        //		}

        public static string encode64(byte[] bytes)
        {
            return Convert.ToBase64String(bytes); 
        }

        public static byte[] decode64(string str)
        {
            return Convert.FromBase64String(str);
        }

        //		/// <summary>Is encrypt(plain, k, v) == cipher?</summary>
        //		/// <param name="plain"/>
        //		/// <param name="cipher"/>
        //		/// <param name="k"/>
        //		/// <param name="iv"/>
        //		/// <returns>true: yes the same</returns>
        //		/// <exception cref="System.Exception"/>
        //		public static bool isSame(string cipher, string plain, string k, string iv)
        //		{
        //			string enciphered = encrypt(plain, k, decode64(iv));
        //			return enciphered.Equals(cipher);
        //		}
    }
}
