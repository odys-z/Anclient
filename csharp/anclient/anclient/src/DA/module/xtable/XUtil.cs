using Sharpen;

namespace io.odysz.module.xtable
{
	/// <summary>* @author odysseus.edu@gmail.com</summary>
	public class XUtil
	{
		/// <summary>
		/// Construct instance of class specified in classRecs,
		/// return object instantiated with constructorParas.<br/>
		/// For ex.:<br/>
		/// Object[] p = new Object[2];<br/>
		/// p[0] = res;<br/>
		/// p[1] = skinid;<br/>
		/// skin = (IMetronomeSkin) XUtil.getClassInstance(st, "class", p);<br/>
		/// </summary>
		/// <param name="classRecs">xtable for class config.</param>
		/// <param name="classField">class name field's name</param>
		/// <param name="constructorParas">paras for constructing new instance.</param>
		/// <returns>new class instance</returns>
		/// <exception cref="System.Exception"/>
		public static object getClassInstance(io.odysz.module.xtable.XMLTable classRecs, 
			string classField, object[] constructorParas)
		{
			string clsname = classRecs.getString(classField);
			java.lang.Class cls = java.lang.Class.forName(clsname);
			java.lang.Class[] constructorTypes;
			if (constructorParas != null)
			{
				constructorTypes = new java.lang.Class[constructorParas.Length];
				for (int i = 0; i < constructorParas.Length; i++)
				{
					constructorTypes[i] = Sharpen.Runtime.getClassForObject(constructorParas[i]);
				}
			}
			else
			{
				constructorTypes = new java.lang.Class[0];
			}
			//		Constructor<?> constor = cls.getConstructor(constructorTypes[0], constructorTypes[1], constructorTypes[2], constructorTypes[3], constructorTypes[4]);
			//		return constor.newInstance(constructorParas);
			java.lang.reflect.Constructor<object> contor = cls.getConstructor(constructorTypes
				);
			return contor.newInstance(constructorParas);
		}
	}
}
