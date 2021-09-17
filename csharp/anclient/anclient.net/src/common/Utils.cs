using System;
using System.Collections;
using System.Collections.Generic;

namespace io.odysz.anclient
{
    public class Utils
    {
        public static void Logi(IList rses)
        {
            foreach(object r in rses)
                Console.WriteLine(r.ToString());
        }

        public static void Logi(List<string> rses)
        {
            foreach(object r in rses)
                Console.WriteLine(r);
        }

        public static void Logi(List<object> rses)
        {
            foreach(object r in rses)
                Console.WriteLine(r.ToString());
        }

        public static void Logi(string log)
        {
            Console.WriteLine(log);
        }


        public static void Warn(string info)
        {
            Console.Error.WriteLine(info);
        }
    }
}