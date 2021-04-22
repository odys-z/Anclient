using Sharpen;

namespace io.odysz.semantics
{
	/// <summary>
	/// <p>The semantics data used internally by semantic-DA to handle semantics configuration.</p>
	/// <p>SemanticObject implement methods to write itself as a json value with a writer provided by the caller.
	/// </summary>
	/// <remarks>
	/// <p>The semantics data used internally by semantic-DA to handle semantics configuration.</p>
	/// <p>SemanticObject implement methods to write itself as a json value with a writer provided by the caller.
	/// This can be used to write the object into other structured object.</p>
	/// <p><b>Note:</b> The equivalent of JsonObject in a request is JMessage.
	/// <p>Question: If a json request object is handled by a port, e.g. SQuery,
	/// is their any property name not known by the port?</p>
	/// <p>If no such properties, then there shouldn't be put() and get().</p>
	/// </remarks>
	/// <author>odys-z@github.com</author>
	public class SemanticObject : io.odysz.anson.Anson
	{
		protected internal System.Collections.Generic.Dictionary<string, object> props;

		public virtual System.Collections.Generic.Dictionary<string, object> props()
		{
			return props;
		}

		/// <param name="prop"/>
		/// <returns>null if the property doesn't exists</returns>
		public virtual java.lang.Class getType(string prop)
		{
			if (prop == null || props == null || !props.Contains(prop))
			{
				return null;
			}
			object p = props[prop];
			return p == null ? Sharpen.Runtime.getClassForType(typeof(object)) : Sharpen.Runtime.getClassForObject
				(p);
		}

		// has key, no value
		public virtual bool has(string prop)
		{
			return props != null && props.Contains(prop) && props[prop] != null;
		}

		public virtual object get(string prop)
		{
			return props == null ? null : props[prop];
		}

		public virtual string getString(string prop)
		{
			return props == null ? null : (string)props[prop];
		}

		public virtual io.odysz.semantics.SemanticObject data()
		{
			return (io.odysz.semantics.SemanticObject)get("data");
		}

		public virtual io.odysz.semantics.SemanticObject data(io.odysz.semantics.SemanticObject
			 data)
		{
			return put("data", data);
		}

		public virtual string port()
		{
			return (string)get("port");
		}

		public virtual io.odysz.semantics.SemanticObject code(string c)
		{
			return put("code", c);
		}

		public virtual string code()
		{
			return (string)get("code");
		}

		public virtual io.odysz.semantics.SemanticObject port(string port)
		{
			return put("port", port);
		}

		public virtual string msg()
		{
			return (string)get("msg");
		}

		public virtual io.odysz.semantics.SemanticObject msg(string msg, params object[] 
			args)
		{
			if (args == null || args.Length == 0)
			{
				return put("msg", msg);
			}
			else
			{
				return put("msg", string.format(msg, args));
			}
		}

		/// <summary>Put resultset (SResultset) into "rs".</summary>
		/// <remarks>
		/// Put resultset (SResultset) into "rs".
		/// Useing this should be careful as the rs is a 3d array.
		/// </remarks>
		/// <param name="resultset"/>
		/// <param name="total"></param>
		/// <returns>this</returns>
		/// <exception cref="io.odysz.transact.x.TransException"/>
		public virtual io.odysz.semantics.SemanticObject rs(object resultset, int total)
		{
			add("total", total);
			return add("rs", resultset);
		}

		public virtual object rs(int i)
		{
			return ((System.Collections.Generic.List<object>)get("rs"))[i];
		}

		public virtual int total(int i)
		{
			if (get("total") == null)
			{
				return -1;
			}
			System.Collections.Generic.List<object> lst = ((System.Collections.Generic.List<object
				>)get("total"));
			if (lst == null || lst.Count <= i)
			{
				return -1;
			}
			object obj = lst[i];
			if (obj == null)
			{
				return -1;
			}
			return (int)obj;
		}

		/// <exception cref="io.odysz.transact.x.TransException"/>
		public virtual io.odysz.semantics.SemanticObject total(int rsIdx, int total)
		{
			// the total(int) returned -1
			if (total < 0)
			{
				return this;
			}
			System.Collections.Generic.List<int> lst = (System.Collections.Generic.List<int>)
				get("total");
			if (lst == null || lst.Count <= rsIdx)
			{
				throw new io.odysz.transact.x.TransException("No such index for rs; %s", rsIdx);
			}
			lst.set(rsIdx, total);
			return this;
		}

		public virtual string error()
		{
			return (string)get("error");
		}

		public virtual io.odysz.semantics.SemanticObject error(string error, params object
			[] args)
		{
			if (args == null || args.Length == 0)
			{
				return put("error", error);
			}
			else
			{
				return put("error", string.format(error, args));
			}
		}

		public virtual io.odysz.semantics.SemanticObject put(string prop, object v)
		{
			if (props == null)
			{
				props = new System.Collections.Generic.Dictionary<string, object>();
			}
			props[prop] = v;
			return this;
		}

		/// <summary>Add element 'elem' to array 'prop'.</summary>
		/// <param name="prop"/>
		/// <param name="elem"/>
		/// <returns>this</returns>
		/// <exception cref="io.odysz.transact.x.TransException"></exception>
		public virtual io.odysz.semantics.SemanticObject add(string prop, object elem)
		{
			if (props == null)
			{
				props = new System.Collections.Generic.Dictionary<string, object>();
			}
			if (!props.Contains(prop))
			{
				props[prop] = new System.Collections.Generic.List<object>();
			}
			if (props[prop] is System.Collections.IList)
			{
				((System.Collections.Generic.List<object>)props[prop]).add(elem);
			}
			else
			{
				throw new io.odysz.transact.x.TransException("%s seams is not an array. elem %s can't been added"
					, prop, elem);
			}
			return this;
		}

		/// <summary>Add int array.</summary>
		/// <param name="prop"/>
		/// <param name="ints"/>
		/// <returns>this</returns>
		/// <exception cref="io.odysz.transact.x.TransException"/>
		public virtual io.odysz.semantics.SemanticObject addInts(string prop, int[] ints)
		{
			foreach (int e in ints)
			{
				add(prop, e);
			}
			return this;
		}

		public virtual object remove(string prop)
		{
			if (props != null && props.Contains(prop))
			{
				return Sharpen.Collections.Remove(props, prop);
			}
			else
			{
				return null;
			}
		}

		/// <summary>Print for reading - string can't been converted back to object</summary>
		/// <param name="out"/>
		public virtual void print(System.IO.TextWriter @out)
		{
			if (props != null)
			{
				foreach (string k in props.Keys)
				{
					@out.Write(k);
					@out.Write(" : ");
					java.lang.Class c = getType(k);
					if (c == null)
					{
						continue;
					}
					else
					{
						if (c.isAssignableFrom(Sharpen.Runtime.getClassForType(typeof(io.odysz.semantics.SemanticObject
							))) || Sharpen.Runtime.getClassForType(typeof(io.odysz.semantics.SemanticObject)
							).isAssignableFrom(c))
						{
							((io.odysz.semantics.SemanticObject)get(k)).print(@out);
						}
						else
						{
							if (Sharpen.Runtime.getClassForType(typeof(System.Collections.ICollection)).isAssignableFrom
								(c) || Sharpen.Runtime.getClassForType(typeof(System.Collections.IDictionary)).isAssignableFrom
								(c))
							{
								System.Collections.Generic.IEnumerator<object> i = ((System.Collections.Generic.ICollection
									<object>)get(k)).GetEnumerator();
								@out.WriteLine("[" + ((System.Collections.Generic.ICollection<object>)get(k)).Count
									 + "]");
								while (i.MoveNext())
								{
									object ele = i.Current;
									c = Sharpen.Runtime.getClassForObject(ele);
									if (c.isAssignableFrom(Sharpen.Runtime.getClassForType(typeof(io.odysz.semantics.SemanticObject
										))) || Sharpen.Runtime.getClassForType(typeof(io.odysz.semantics.SemanticObject)
										).isAssignableFrom(c))
									{
										((io.odysz.semantics.SemanticObject)ele).print(@out);
									}
									else
									{
										@out.Write(get(k));
									}
								}
							}
							else
							{
								@out.Write(get(k));
							}
						}
					}
					@out.Write(",\t");
				}
			}
			@out.WriteLine(string.Empty);
		}
	}
}
