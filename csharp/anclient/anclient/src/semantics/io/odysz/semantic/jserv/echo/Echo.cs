using Sharpen;

namespace io.odysz.semantic.jserv.echo
{
	[System.Serializable]
	public class Echo : io.odysz.semantic.jserv.ServPort<io.odysz.semantic.jserv.echo.EchoReq
		>
	{
		public Echo()
			: base(io.odysz.semantic.jprotocol.AnsonMsg.Port.echo)
		{
		}

		/// <summary>*</summary>
		private const long serialVersionUID = 1L;

		/// <exception cref="javax.servlet.ServletException"/>
		/// <exception cref="System.IO.IOException"/>
		protected internal override void onGet(io.odysz.semantic.jprotocol.AnsonMsg<io.odysz.semantic.jserv.echo.EchoReq
			> req, javax.servlet.http.HttpServletResponse resp)
		{
			resp(req, resp);
		}

		/// <exception cref="javax.servlet.ServletException"/>
		/// <exception cref="System.IO.IOException"/>
		protected internal override void onPost(io.odysz.semantic.jprotocol.AnsonMsg<io.odysz.semantic.jserv.echo.EchoReq
			> req, javax.servlet.http.HttpServletResponse resp)
		{
			resp(req, resp);
		}

		/// <exception cref="System.IO.IOException"/>
		private void resp(io.odysz.semantic.jprotocol.AnsonMsg<io.odysz.semantic.jserv.echo.EchoReq
			> req, javax.servlet.http.HttpServletResponse resp)
		{
			try
			{
				resp.setCharacterEncoding("UTF-8");
				write(resp, ok(req.ToString()), req.opts());
				resp.flushBuffer();
			}
			catch (System.IO.IOException e)
			{
				write(resp, err(io.odysz.semantic.jprotocol.AnsonMsg.MsgCode.exGeneral, e.Message
					));
				Sharpen.Runtime.printStackTrace(e);
			}
		}
	}
}
