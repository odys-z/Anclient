using Sharpen;

namespace io.odysz.semantic.jsession
{
	/// <summary><p>1.</summary>
	/// <remarks>
	/// <p>1. Handle login-obj:
	/// <see cref="SessionReq"/>
	/// .<br />
	/// a: "login | logout | pswd | init | ping(touch)",<br />
	/// uid: "user-id",<br />
	/// pswd: "uid-cipher-by-pswd",<br />
	/// iv: "session-iv"</p>
	/// <p>2. Session verifying using session-header<br />
	/// uid: “user-id”,<br />
	/// ssid: “session-id-plain/cipher”,<br />
	/// sys: “module-id”</p>
	/// <p>Session object are required when login successfully, and removed automatically.
	/// When removing, the SUser object is removed via session lisenter.</p>
	/// <p><b>Note:</b></p>Session header is post by client in HTTP request's body other than in HTTP header.
	/// It's HTTP body payload, understood by semantic-jserv as a request header semantically.</p>
	/// <p>Also don't confused with servlet session - created via getSessionId(),
	/// <br />and you'd better
	/// <a href='https://stackoverflow.com/questions/2255814/can-i-turn-off-the-httpsession-in-web-xml'>turn off it</a>.</p>
	/// </remarks>
	/// <author>odys-z@github.com</author>
	[System.Serializable]
	public class AnSession : io.odysz.semantic.jserv.ServPort<io.odysz.semantic.jsession.AnSessionReq
		>, io.odysz.semantic.jsession.ISessionVerifier
	{
		public AnSession()
			: base(io.odysz.semantic.jprotocol.AnsonMsg.Port.session)
		{
		}

		private const long serialVersionUID = 1L;

		public enum Notify
		{
			changePswd,
			todo
		}

		/// <summary>[session-id, SUser]</summary>
		internal static System.Collections.Generic.Dictionary<string, io.odysz.semantics.IUser
			> users;

		private static java.util.concurrent.ScheduledExecutorService scheduler;

		/// <summary>session pool reentrant lock</summary>
		public static java.util.concurrent.locks.ReentrantLock Lock;

		private static java.util.concurrent.ScheduledFuture<object> schedualed;

		internal static io.odysz.semantic.DATranscxt sctx;

		private static string usrClzz;

		private static io.odysz.semantic.jsession.JUser.JUserMeta usrMeta;

		internal io.odysz.semantics.IUser jrobot = new io.odysz.semantic.jserv.JRobot();

		/// <summary>
		/// Initialize semantext, schedule tasks,
		/// load root key from tomcat context.xml.
		/// </summary>
		/// <remarks>
		/// Initialize semantext, schedule tasks,
		/// load root key from tomcat context.xml.
		/// To configure root key in tomcat, in context.xml, <pre>
		/// &lt;Context&gt;
		/// &lt;Parameter name="io.oz.root-key" value="*************" override="false"/&gt;
		/// &lt;/Context&gt;</pre>
		/// </remarks>
		/// <param name="daSctx"/>
		/// <param name="ctx">context for loading context.xml/resource</param>
		/// <exception cref="org.xml.sax.SAXException">something wrong with configuration files
		/// 	</exception>
		/// <exception cref="System.IO.IOException">file accessing failed</exception>
		/// <exception cref="io.odysz.semantics.x.SemanticException">semantics error</exception>
		/// <exception cref="java.sql.SQLException">database accessing error</exception>
		public static void init(io.odysz.semantic.DATranscxt daSctx, javax.servlet.ServletContext
			 ctx)
		{
			sctx = daSctx;
			Lock = new java.util.concurrent.locks.ReentrantLock();
			string conn = daSctx.basiconnId();
			io.odysz.common.Utils.logi("Initializing session based on connection %s, basic session tables, users, functions, roles, should located here"
				, conn);
			io.odysz.semantic.DATranscxt.loadSemantics(conn, io.odysz.semantic.jserv.JSingleton
				.getFileInfPath("semantic-log.xml"));
			users = new System.Collections.Generic.Dictionary<string, io.odysz.semantics.IUser
				>();
			// see https://stackoverflow.com/questions/34202701/how-to-stop-a-scheduledexecutorservice
			scheduler = java.util.concurrent.Executors.newScheduledThreadPool(1);
			try
			{
				usrClzz = "class-IUser";
				io.odysz.semantics.IUser tmp = createUser(usrClzz, "temp", "pswd", null, "temp user"
					);
				usrMeta = (io.odysz.semantic.jsession.JUser.JUserMeta)tmp.meta();
			}
			catch (System.Exception ex)
			{
				io.odysz.common.Utils.warn("SSesion: Implementation class of IUser doesn't configured correctly in: config.xml/t[id=cfg]/k=%s, check the value."
					, usrClzz);
				Sharpen.Runtime.printStackTrace(ex);
			}
			int m = 20;
			try
			{
				m = int.Parse(io.odysz.common.Configs.getCfg("ss-timeout-min"));
			}
			catch (System.Exception)
			{
			}
			io.odysz.common.Utils.warn("[ServFlags.session] SSession debug mode true (ServFlage.session)"
				);
			schedualed = scheduler.scheduleAtFixedRate(new io.odysz.semantic.jsession.SessionChecker
				(users, m), 0, 1, java.util.concurrent.TimeUnit.MINUTES);
		}

		/// <summary>Stop all threads that were scheduled by SSession.</summary>
		/// <param name="msDelay">delay in milliseconds.</param>
		public static void stopScheduled(int msDelay)
		{
			io.odysz.common.Utils.logi("cancling session checker ... ");
			schedualed.cancel(true);
			scheduler.shutdown();
			try
			{
				if (!scheduler.awaitTermination(msDelay, java.util.concurrent.TimeUnit.MILLISECONDS
					))
				{
					scheduler.shutdownNow();
				}
			}
			catch (System.Exception)
			{
				scheduler.shutdownNow();
			}
		}

		/// <summary>FIXME where is token verification?</summary>
		/// <param name="anHeader"/>
		/// <returns>
		/// 
		/// <see cref="JUser"/>
		/// if succeed, which can be used for db logging
		/// - use this to load functions, etc.
		/// </returns>
		/// <exception cref="io.odysz.semantic.jserv.x.SsException">Session checking failed.</exception>
		/// <exception cref="java.sql.SQLException">Reqest payload header.usrAct is null (TODO sure?)
		/// 	</exception>
		public virtual io.odysz.semantics.IUser verify(io.odysz.semantic.jprotocol.AnsonHeader
			 anHeader)
		{
			if (anHeader == null)
			{
				throw new io.odysz.semantic.jserv.x.SsException("session header is missing");
			}
			string ssid = (string)anHeader.ssid();
			if (users.Contains(ssid))
			{
				io.odysz.semantics.IUser usr = users[ssid];
				string slogid = (string)anHeader.logid();
				if (slogid != null && slogid.Equals(usr.uid()))
				{
					usr.touch();
					return usr;
				}
				else
				{
					throw new io.odysz.semantic.jserv.x.SsException("session token is not matching");
				}
			}
			else
			{
				throw new io.odysz.semantic.jserv.x.SsException("session info is missing or timeout"
					);
			}
		}

		public static io.odysz.semantics.IUser getUser(io.odysz.semantics.SemanticObject 
			jheader)
		{
			return users[jheader.get("ssid")];
		}

		/// <exception cref="javax.servlet.ServletException"/>
		/// <exception cref="System.IO.IOException"/>
		/// <exception cref="io.odysz.anson.x.AnsonException"/>
		/// <exception cref="io.odysz.semantics.x.SemanticException"/>
		protected internal override void onGet(io.odysz.semantic.jprotocol.AnsonMsg<io.odysz.semantic.jsession.AnSessionReq
			> msg, javax.servlet.http.HttpServletResponse resp)
		{
			jsonResp(msg, resp);
		}

		/// <exception cref="System.IO.IOException"/>
		protected internal override void onPost(io.odysz.semantic.jprotocol.AnsonMsg<io.odysz.semantic.jsession.AnSessionReq
			> msg, javax.servlet.http.HttpServletResponse resp)
		{
			jsonResp(msg, resp);
		}

		/// <exception cref="System.IO.IOException"/>
		protected internal virtual void jsonResp(io.odysz.semantic.jprotocol.AnsonMsg<io.odysz.semantic.jsession.AnSessionReq
			> msg, javax.servlet.http.HttpServletResponse response)
		{
			try
			{
				string connId = io.odysz.semantic.DA.Connects.defltConn();
				if (connId == null || connId.Trim().Length == 0)
				{
					connId = io.odysz.semantic.DA.Connects.defltConn();
				}
				// find user and check login info 
				// request-obj: {a: "login/logout", uid: "user-id", pswd: "uid-cipher-by-pswd", iv: "session-iv"}
				if (msg != null)
				{
					io.odysz.semantic.jsession.AnSessionReq sessionBody = msg.body(0);
					string a = sessionBody.a();
					if ("login".Equals(a))
					{
						io.odysz.semantics.IUser login = loadUser(sessionBody, connId);
						if (login.login(sessionBody))
						{
							Lock.Lock();
							users[login.sessionId()] = login;
							Lock.unlock();
							io.odysz.semantic.jsession.SessionInf ssinf = new io.odysz.semantic.jsession.SessionInf
								(login.sessionId(), login.uid());
							io.odysz.semantic.jsession.AnSessionResp bd = new io.odysz.semantic.jsession.AnSessionResp
								(null, ssinf);
							io.odysz.semantic.jprotocol.AnsonMsg<io.odysz.semantic.jsession.AnSessionResp> rspMsg
								 = ok(bd);
							write(response, rspMsg, msg.opts());
						}
						else
						{
							throw new io.odysz.semantic.jserv.x.SsException("Password doesn't match! Expecting token encrypted."
								 + Sharpen.Runtime.lineSeparator() + "Additional Details: %s", login.notifies() 
								!= null && login.notifies().Count > 0 ? login.notifies()[0] : string.Empty);
						}
					}
					else
					{
						// FIXME why doesn't work?
						if ("logout".Equals(a))
						{
							io.odysz.semantic.jprotocol.AnsonHeader header = msg.header();
							try
							{
								verify(header);
							}
							catch (io.odysz.semantic.jserv.x.SsException)
							{
							}
							// logout anyway if session check is failed
							// {uid: “user-id”,  ssid: “session-id-plain/cipher”, vi: "vi-b64"<, sys: “module-id”>}
							string ssid = (string)header.ssid();
							Lock.Lock();
							io.odysz.semantics.IUser usr = Sharpen.Collections.Remove(users, ssid);
							Lock.unlock();
							if (usr != null)
							{
								io.odysz.semantics.SemanticObject resp = usr.logout();
								write(response, io.odysz.semantic.jprotocol.AnsonMsg.ok(p, resp.msg()), msg.opts(
									));
							}
							else
							{
								write(response, io.odysz.semantic.jprotocol.AnsonMsg.ok(p, "But no such session exists."
									), msg.opts());
							}
						}
						else
						{
							if ("pswd".Equals(a))
							{
								// change password
								io.odysz.semantic.jprotocol.AnsonHeader header = msg.header();
								io.odysz.semantics.IUser usr = verify(header);
								// dencrypt field of a_user.userId: pswd, encAuxiliary
								if (!io.odysz.semantic.DATranscxt.hasSemantics(connId, usrMeta.tbl, io.odysz.semantic.DASemantics.smtype
									.dencrypt))
								{
									throw new io.odysz.semantics.x.SemanticException("Can't update pswd, because data entry %s is not protected by semantics %s"
										, usrMeta.tbl, io.odysz.semantic.DASemantics.smtype.dencrypt.ToString());
								}
								// client: encrypt with ssid, send cipher with iv
								// FIXME using of session key, see bug of verify()
								string ssid = (string)header.ssid();
								string iv64 = sessionBody.md("iv_pswd");
								string newPswd = sessionBody.md("pswd");
								usr.sessionId(ssid);
								io.odysz.common.Utils.logi("new pswd: %s", io.odysz.common.AESHelper.decrypt(newPswd
									, usr.sessionId(), io.odysz.common.AESHelper.decode64(iv64)));
								sctx.update(usrMeta.tbl, usr).nv(usrMeta.pswd, newPswd).nv(usrMeta.iv, iv64).whereEq
									(usrMeta.pk, usr.uid()).u(sctx.instancontxt(sctx.basiconnId(), usr));
								// ok, logout
								Lock.Lock();
								Sharpen.Collections.Remove(users, ssid);
								Lock.unlock();
								write(response, ok("You must relogin!"));
							}
							else
							{
								if ("init".Equals(a))
								{
									// reset password
									io.odysz.semantic.jprotocol.AnsonHeader header = msg.header();
									if (!io.odysz.semantic.DATranscxt.hasSemantics(connId, usrMeta.tbl, io.odysz.semantic.DASemantics.smtype
										.dencrypt))
									{
										throw new io.odysz.semantics.x.SemanticException("Can't update pswd, because data entry %s is not protected by semantics %s"
											, usrMeta.tbl, io.odysz.semantic.DASemantics.smtype.dencrypt.ToString());
									}
									string ssid = (string)header.ssid();
									string iv64 = sessionBody.md("iv_pswd");
									string newPswd = sessionBody.md("pswd");
									// check his IV
									io.odysz.semantics.SemanticObject s = sctx.select(usrMeta.tbl, "u").col(usrMeta.iv
										, "iv").where_("=", "u." + usrMeta.pk, sessionBody.uid()).rs(sctx.instancontxt(sctx
										.basiconnId(), jrobot));
									io.odysz.module.rs.AnResultset rs = (io.odysz.module.rs.AnResultset)s.rs(0);
									if (rs.beforeFirst().next())
									{
										string iv = rs.getString("iv");
										if (!io.odysz.common.LangExt.isEmpty(iv))
										{
											throw new io.odysz.semantics.x.SemanticException("Can't update pswd, because it is not allowed to change."
												);
										}
									}
									// set a new pswd
									string pswd2 = io.odysz.common.AESHelper.decrypt(newPswd, jrobot.sessionId(), io.odysz.common.AESHelper
										.decode64(iv64));
									io.odysz.common.Utils.logi("intialize pswd: %s", pswd2);
									sctx.update(usrMeta.tbl, jrobot).nv(usrMeta.pswd, pswd2).nv(usrMeta.iv, iv64).whereEq
										(usrMeta.pk, header.logid()).u(sctx.instancontxt(sctx.basiconnId(), jrobot));
									// remove session if logged in
									if (users.Contains(ssid))
									{
										// This happens when log on users IV been reset
										Lock.Lock();
										Sharpen.Collections.Remove(users, ssid);
										Lock.unlock();
										write(response, ok("You must re-login!"));
									}
									else
									{
										write(response, ok("Initializing password successed."));
									}
								}
								else
								{
									if (a != null)
									{
										a = a.ToLower().Trim();
									}
									if ("ping".Equals(a) || "touch".Equals(a))
									{
										io.odysz.semantic.jprotocol.AnsonHeader header = msg.header();
										verify(header);
										write(response, io.odysz.semantic.jprotocol.AnsonMsg.ok(p, string.Empty), msg.opts
											());
									}
									else
									{
										throw new io.odysz.semantic.jserv.x.SsException("Session Request not supported: a=%s"
											, a);
									}
								}
							}
						}
					}
				}
				else
				{
					throw new io.odysz.semantic.jserv.x.SsException("Session request not supported: request body is null"
						);
				}
			}
			catch (System.Exception e)
			{
				write(response, err(io.odysz.semantic.jprotocol.AnsonMsg.MsgCode.exSession, e.Message
					));
			}
			catch (System.Exception e)
			{
				Sharpen.Runtime.printStackTrace(e);
				write(response, err(io.odysz.semantic.jprotocol.AnsonMsg.MsgCode.exGeneral, e.Message
					));
			}
			finally
			{
			}
		}

		/// <summary>
		/// Load user instance form DB table (name =
		/// <see cref="UserMeta#tbl"/>
		/// ).
		/// </summary>
		/// <param name="sessionBody"/>
		/// <param name="connId"/>
		/// <returns>
		/// new IUser instance loaded from database (from connId), see
		/// <see cref="createUser(string, string, string, string, string)"/>
		/// </returns>
		/// <exception cref="io.odysz.transact.x.TransException"/>
		/// <exception cref="java.sql.SQLException"/>
		/// <exception cref="io.odysz.semantic.jserv.x.SsException"/>
		/// <exception cref="java.lang.ReflectiveOperationException"/>
		/// <exception cref="System.IO.IOException"></exception>
		/// <exception cref="java.security.GeneralSecurityException"></exception>
		private io.odysz.semantics.IUser loadUser(io.odysz.semantic.jsession.AnSessionReq
			 sessionBody, string connId)
		{
			io.odysz.semantics.SemanticObject s = sctx.select(usrMeta.tbl, "u").col(usrMeta.pk
				, "uid").col(usrMeta.uname, "uname").col(usrMeta.pswd, "pswd").col(usrMeta.iv, "iv"
				).where_("=", "u." + usrMeta.pk, sessionBody.uid()).rs(sctx.instancontxt(sctx.basiconnId
				(), jrobot));
			// .col(UserMeta.urlField, "url")
			io.odysz.module.rs.AnResultset rs = (io.odysz.module.rs.AnResultset)s.rs(0);
			if (rs.beforeFirst().next())
			{
				string uid = rs.getString("uid");
				io.odysz.semantics.IUser obj = createUser(usrClzz, uid, rs.getString("pswd"), rs.
					getString("iv"), rs.getString("uname"));
				if (obj is io.odysz.semantics.SemanticObject)
				{
					return obj;
				}
				throw new io.odysz.semantics.x.SemanticException("IUser implementation must extend SemanticObject."
					);
			}
			else
			{
				throw new io.odysz.semantic.jserv.x.SsException("User Id not found: ", sessionBody
					.uid());
			}
		}

		/// <summary>Create a new IUser instance, where the class name is configured in config.xml/k=class-IUser.
		/// 	</summary>
		/// <remarks>
		/// Create a new IUser instance, where the class name is configured in config.xml/k=class-IUser.
		/// For the sample project, jserv-sample coming with this lib, it's configured as <a href='https://github.com/odys-z/semantic-jserv/blob/master/jserv-sample/src/main/webapp/WEB-INF/config.xml'>
		/// io.odysz.jsample.SampleUser</a>
		/// </remarks>
		/// <param name="clsNamekey">class name</param>
		/// <param name="uid">user id</param>
		/// <param name="pswd"></param>
		/// <param name="iv">auxiliary encryption field</param>
		/// <param name="userName"></param>
		/// <returns>
		/// new IUser instance, if the use's IV is empty, will create a notification of
		/// <see cref="Notify.changePswd"/>
		/// .
		/// </returns>
		/// <exception cref="java.lang.ReflectiveOperationException"></exception>
		/// <exception cref="System.IO.IOException"></exception>
		/// <exception cref="java.security.GeneralSecurityException"></exception>
		/// <exception cref="io.odysz.transact.x.TransException">notifying message failed</exception>
		/// <exception cref="System.ArgumentException"></exception>
		private static io.odysz.semantics.IUser createUser(string clsNamekey, string uid, 
			string pswd, string iv, string userName)
		{
			if (!io.odysz.common.Configs.hasCfg(clsNamekey))
			{
				throw new io.odysz.semantics.x.SemanticException("No class name configured for creating user information, check config.xml/k=%s"
					, clsNamekey);
			}
			string clsname = io.odysz.common.Configs.getCfg(clsNamekey);
			if (clsname == null)
			{
				throw new io.odysz.semantics.x.SemanticException("No class name configured for creating user information, check config.xml/k=%s"
					, clsNamekey);
			}
			java.lang.Class cls = (java.lang.Class)java.lang.Class.forName(clsname);
			java.lang.reflect.Constructor<io.odysz.semantics.IUser> constructor = null;
			try
			{
				constructor = cls.getConstructor(Sharpen.Runtime.getClassForType(typeof(string)), 
					Sharpen.Runtime.getClassForType(typeof(string)), Sharpen.Runtime.getClassForType
					(typeof(string)));
			}
			catch (System.MissingMethodException)
			{
				throw new io.odysz.semantics.x.SemanticException("Class %s needs a consturctor like JUser(String uid, String pswd, String usrName)."
					, "clsname");
			}
			try
			{
				if (!io.odysz.common.LangExt.isblank(iv))
				{
					// still can be wrong with messed up data, e.g. with iv and plain pswd
					try
					{
						pswd = io.odysz.common.AESHelper.decrypt(pswd, io.odysz.semantic.DATranscxt.key("user-pswd"
							), io.odysz.common.AESHelper.decode64(iv));
					}
					catch
					{
						io.odysz.common.Utils.warn("Decrypting user pswd failed. cipher: %s, iv %s, rootkey: *(%s)"
							, pswd, iv == null ? null : io.odysz.common.AESHelper.decode64(iv), io.odysz.semantic.DATranscxt
							.key("user-pswd") == null ? null : io.odysz.semantic.DATranscxt.key("user-pswd")
							.Length);
					}
					return (io.odysz.semantics.IUser)constructor.newInstance(uid, pswd, userName);
				}
				else
				{
					return (io.odysz.semantics.IUser)constructor.newInstance(uid, pswd, userName).notify
						(io.odysz.semantic.jsession.AnSession.Notify.changePswd.ToString());
				}
			}
			catch (java.lang.reflect.InvocationTargetException ie)
			{
				Sharpen.Runtime.printStackTrace(ie);
				throw new io.odysz.semantics.x.SemanticException("create IUser instance failed: %s"
					, ie.getTargetException() == null ? string.Empty : ie.getTargetException().Message
					);
			}
		}
	}
}
