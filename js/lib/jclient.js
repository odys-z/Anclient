import $ from 'jquery';
import AES from './aes.js';
import {Protocol, JMessage, JHeader, SessionReq, QueryReq, DatasetCfg} from './protocol.js';

/**AES lib instance*/
var aes;

  /**Jclient.js API
   * Java equivalent of
   * io.odysz.jclient.Clients;
   * io.odysz.jclient.SessionClient;
   */
class J {
	/**@param {string} serv serv path root, e.g. 'http://localhost/semantic-jserv'
	 */
	constructor (urlRoot) {
	 	this.cfg = {
			connId: null,
			verbose: true,
			defaultServ: urlRoot,
		}
		aes = new AES();
	}

	servUrl (port) {
		// Protocol can't visited when debugging, but working:
		console.log(Protocol.Port);
		console.log("Protocol.Port[" + port + "] : " + Protocol.Port[port]);

		if (Protocol.Port[port] !== undefined)
			return this.cfg.defaultServ + '/'
				+ Protocol.Port[port] + '?conn=' + this.cfg.connId;
		else
			return this.cfg.defaultServ + '/'
				+ port + '?conn=' + this.cfg.connId;
	}

	init (urlRoot, connId) {
		this.cfg.cconnId = connId;
		this.cfg.defaultServ = urlRoot;
	}

	understandPorts (newPorts) {
		Object.assign(Protocol.Port, newPorts);
	}

	port(name) {
		return Protocol.Port[name];
	}

	login (usrId, pswd, onLogin, onError) {
		// byte[] iv =   AESHelper.getRandom();
		// String iv64 = AESHelper.encode64(iv);
		// String tk64 = AESHelper.encrypt(uid, pswdPlain, iv);
		console.log('J.login(' + usrId + ', ' + pswd + ', ...)');

		var iv = aes.getIv128();
		var c = aes.encrypt(usrId, pswd, iv);
		// var qobj = formatLogin(logId, c, bytesToB64(iv));
		var req = Protocol.formatSessionLogin(usrId, c, aes.bytesToB64(iv));
		var J = this;

		this.post(req,
			/**@param {object} resp
			 * code: "ok"
			 * data: Object { uid: "admin", ssid: "3sjUJk2JszDm", "user-name": "admin" }
			 * port: "session"
			 */
			function(resp) {
				var sessionClient = new SessionClient(resp.data, iv, true);
				sessionClient.J = J;
				if (typeof onLogin === "function")
					onLogin(sessionClient);
				else console.log(sessionClient);
			},
			onError);
	}

	static checkResponse(resp) {
		if (typeof resp === "undefined" || resp === null || resp.length < 2)
			return "err_NA";
		else return false;
	}

	post (jreq, onOk, onErr) {
		var url = this.servUrl(jreq.port);

		$.ajax({type: 'POST',
				// url: this.cfg.defaultServ + "/query.serv?page=" + pgIx + "&size=" + pgSize,
				url: url,
				contentType: "application/json; charset=utf-8",
				crossDomain: true,
				//xhrFields: { withCredentials: true },
				data: JSON.stringify(jreq),
				success: function (resp) {
					// response Content-Type = application/json;charset=UTF-8
					// code != ok
					if (resp.code !== Protocol.MsgCode.ok)
						if (typeof onErr === "function")
							onErr(Protocol.MsgCode.exIo, resp);
						else console.error(resp);
					// code == ok
					else {
						if (typeof onOk === "function")
							onOk(resp);
						else console.log(resp);
					}
				},
				error: function (resp) {
					if (typeof onErr === "function")
						onErr(Protocol.MsgCode.exIo, resp);
					else {
						console.error("Accessing server failed.");
						console.error("Url: " + url);
						console.error("ajax error:");
						console.error(resp);
					}
				}
			});
	}

	// TODO moved to protocol.js?
	respCols(resp) {
		return resp !== null && resp !== undefined && resp.code === "ok"
			? resp.data.rs[0][0] : [];
	}

	respRows(resp) {
		return resp !== null && resp !== undefined && resp.code === "ok"
			? resp.data.rs[0].slice(1) : [];
	}
}

export const _J = new J();

/**Client with session logged in.*/
class SessionClient {
	static get ssInfo() { return "ss-info"; }

	/**Create SessionClient with credential information or load from localStorage.<br>
	 * Because of two senarios of login / home page integration, there are 2 typical useses:<br>
	 * Use Case 1 (persisted): logged in, then create a client with response,
	 * 		save in local storage, then load it in new page.<br>
	 * Use Case 1 (not persisted): logged in, then create a client with response,
	 * 		user's app handled the object, then provided to other functions,<br>
	 * 		typicall a home.vue component.<br>
	 * <p><b>Note</b></p>
	 * <p>Local storage may be sometimes confusing if not familiar with W3C standars.<br>
	 * The local storage can't be cross domain referenced. It's can not been loaded by home page
	 * if you linked from login page like this, as showed by this example in login.vue:</p>
	 * <p>window.top.location = response.home</p>
	 * <p>One recommended practice is initializing home.vue with login credential
	 * by login.vue, in app.vue.</p>
	 * <p>But this design makes home page and login component integrated. It's not
	 * friedly to application pattern like a port page with login which is independent
	 * to the system background home page.</p>
	 * <p>How should this pattern can be improved is open for discussion.
	 * If your are interested in this subject, leave any comments in wiki page please.</p>
	 * @param {object} ssInf login response form server: {ssid, uid}
	 * @param {byte[]} iv iv used for cipher when login.
	 * @param {boolean} dontPersist don't save into local storage.
	 */
	constructor (ssInf, iv, dontPersist) {
		if (ssInf) {
			// logged in, create from credential
			this.ssInf = ssInf;
			this.ssInf.iv = aes.bytesToB64(iv);
			if (!dontPersist) {
				var infStr = JSON.stringify(this.ssInf);
				localStorage.setItem(SessionClient.ssInfo, infStr);
			}
		}
		else {
			// jumped, create from local storage
			var sstr = localStorage.getItem(SessionClient.ssInfo);
			if (sstr) {
				this.ssInf = JSON.parse(sstr);
				this.ssInf.iv = aes.b64ToBytes(this.ssInf.iv);
			}
			else
				console.error("Can't find credential in local storage. SessionClient creating failed.");
		}

		this.J = _J;
	}

	commit(jmsg, onOk, onError) {
		this.J.post(jmsg, onOk, onError);
	}

	query (conn, t, alias, funcId, pageInf) {
		var qryItem = new QueryReq(conn, t, alias, pageInf);
		var header = Protocol.formatHeader(this.ssInf);
		header.userAct({func: 'func01',
						cmd: 'select',
						cate: 'test',
						remarks: 'test query.serv'});
		var jreq = new JMessage(Protocol.Port.query, header, qryItem);
		return jreq;
	}

	userReq(conn, t, port, bodyItem, act) {
		var header = Protocol.formatHeader(this.ssInf);
		// TODO make sure reading act can be null / undefined
		header.userAct = act;
		return new JMessage(port, header, bodyItem);
	}

	commit (jmsg, onOk, onErr) {
		_J.post(jmsg, onOk, onErr);
	}

	/**TODO move to jeasy-api.js
	 * load semantabl with records paged at server side.
	 * @param {object} query query object
	 * Use JProtocol to generate query object:<pre>
	var qobj = Protocol.query(tabl)
					.j()
					.expr()
					.where()
					.groupby()
					.orderby()
					.commit();</pre>
	 * @param {int} pgSize page size, -1 for no paging at server side.
	 * @param {int} pgIx page index, starting from 0. -1 for no paging at server side.
	 * @param {function} onSuccess on ajax success function: f(respons-data) {...}
	 * This function been called when http response is ok, can be called even when jserv throw an exception.
	 * Use JProtocol to parse the respons data.
	 * @param {function} onError on ajax error function: f(respons-data) {...}
	 * @param
	 */
	loadPage (query, pgSize, pgIx, onSuccess, onError) {
		if (typeof pgSize === "undefined")
			pgSize = -1;
		if (typeof pgIx === "undefined")
			pgIx = -1;

		$.ajax({type: "POST",
			//url: servUrl + "?t=" + t + "&page=" + (pageNumb - 1) + "&size=" + pageSize,
			url: this.cfg.defaultServ + "/query.serv?page=" + pgIx + "&size=" + pgSize,
			contentType: "application/json; charset=utf-8",
			data: JSON.stringify(query),
			success: function (data) {
				if (checkResponse(data)) {
					console.error("checking respons failed. response:")
					console.error(data);
				}
				if (typeof onSuccess === "function")
					onSuccess(data);
			},
			error: function (data) {
				if (typeof onError === "function")
					onError(data);
				else console.error(data);
			}
		});
	}

	upload (filename, fileDescpt) {

	}
}

/**Client without session information.
 * This is needed for some senarios like rigerstering new account.*/
class Inseclient {
}

export * from './protocol.js';
export * from './frames/cheapflow/cheap-client.js';
export {J, SessionClient, Inseclient};
