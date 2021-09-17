using System;
using System.Collections;

namespace io.odysz.common
{
    public class Utils
    {
        public static void Logi(IEnumerable rses)
        {
            Console.Out.Write("[");
            foreach(dynamic r in rses) {
                Console.Out.Write(r.ToString());
                Console.Out.WriteLine(",\n");
            }
            Console.Out.WriteLine("]");
        }

        public static void Logi(string info)
        {
            Console.Out.WriteLine(info);
        }

        public static void Warn(string info)
        {
            Console.Error.WriteLine(info);
        }
    }
}