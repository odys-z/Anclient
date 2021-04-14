using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace anclient.src.jserv
{
	public class EchoReq : AnsonBody
	{
        public EchoReq(AnsonMsg<AnsonBody> parent) : base(parent, null)
        { }
    }

}
