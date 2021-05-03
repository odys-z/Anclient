using System;
using System.Collections;
using System.Collections.Generic;

namespace io.odysz.common
{
    internal class Utils
    {
        internal static void Logi(IEnumerable rses)
        {
            Console.Out.Write("[");
            foreach(dynamic r in rses) {
                Console.Out.Write(r.ToString());
                Console.Out.WriteLine(",\n");
            }
            Console.Out.WriteLine("]");
        }
    }
}