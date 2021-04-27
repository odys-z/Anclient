using System;
using System.Collections.Generic;

namespace io.odysz.common
{
    internal class Utils
    {
        internal static void logi(List<object> rses)
        {
            Console.Out.Write("[");
            foreach(object r in rses) {
                Console.Out.Write(r.ToString());
                Console.Out.WriteLine(",\n");
            }
            Console.Out.WriteLine("]");
        }
    }
}