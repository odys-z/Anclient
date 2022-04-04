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
        public static void Warn(string info, object arg1, object arg2 = null)
        {
            Console.Error.WriteLine(string.Format(info, arg1, arg2));
        }

        public static void Warn(string info, object arg1, object arg2, object arg3, object arg4 = null)
        {
            Console.Error.WriteLine(string.Format(info, arg1, arg2, arg3, arg4));
        }
    }
}