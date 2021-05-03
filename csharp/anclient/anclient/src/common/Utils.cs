using System;
using System.Collections.Generic;

namespace io.odysz.anclient
{
    internal class Utils
    {
        internal static void Logi(List<object> rses)
        {
            foreach(object r in rses) {
                Console.WriteLine(r.ToString());
            }
        }
    }
}