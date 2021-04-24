//using Sharpen;
//using System.Text;

//namespace io.odysz.common
//{
//	/// <summary>Radix 64 (String) v.s.</summary>
//	/// <remarks>Radix 64 (String) v.s. int converter</remarks>
//	/// <version>'=' is replaced by '-' for easyui compatibility (last '=' in id makes trouble).
//	/// 	</version>
//	/// <author>ody</author>
//	public class Radix64
//	{
//		/// <summary>
//		/// The same table as in db table ir_radix64 <br />
//		/// Any modification must been synchronized.
//		/// </summary>
//		internal static char[] radchar = new char[] { '0', '1', '2', '3', '4', '5', '6', 
//			'7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 
//			'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 
//			'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 
//			't', 'u', 'v', 'w', 'x', 'y', 'z', '+', '-' };

//		/// <summary>convert v to Radix64 integer.</summary>
//		/// <remarks>convert v to Radix64 integer. Chars are same to Base64 except '/', which is replaced by '-'
//		/// 	</remarks>
//		/// <param name="v">fix 6 bytes Base64 chars.</param>
//		/// <returns>String representation in radix 64.</returns>
//		public static string toString(int v)
//		{
//			byte[] buf = new byte[6];
//			for (int i = 0; i < 6; i++)
//			{
//				int idx = v & unchecked((int)(0x3f));
//				byte digit = (byte)radchar[idx];
//				buf[5 - i] = digit;
//				v = (int)(((uint)v) >> 6);
//			}
//			return Encoding.UTF8.GetString(buf);
//		}

//		public static string toString(int v, int digits)
//		{
//			byte[] buf = new byte[digits];
//			for (int i = 0; i < digits; i++)
//			{
//				int idx = v & unchecked((int)(0x3f));
//				byte digit = (byte)radchar[idx];
//				buf[digits - 1 - i] = digit;
//				v = (int)(((uint)v) >> 6);
//			}
//			return Encoding.UTF8.GetString(buf);
//		}
//	}
//}
