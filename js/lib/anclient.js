import $ from 'jquery';
import AES from './aes.js';
import {Protocol, AnsonMsg, AnHeader, UserReq, SessionReq, QueryReq, UpdateReq, DeleteReq, InsertReq, DatasetCfg} from './protocol.js';

/**The lower API of jclient/js
 * @module jclient/js/core
 * */

/**
 * AES instance
 * @type {AES}
 * */
const aes = new AES();

/**An client.js core API
 * Java equivalent of
 * io.odysz.jclient.Clients;
 * @property cfg the configurations,<br>
 * cfg.connId,<br>
 * cfg.verbose,<br>
 * cfg.defaultServ:<br>
 * where defaultserv is the serv root, will be concated with port name for different poert.
 */
class An {
	/**@param {string} serv serv path root, e.g. 'http://localhost/jsample'
	 */
	constructor (urlRoot) {
	 	this.cfg = {
			connId: null,
			verbose: 5,
			defaultServ: urlRoot,
		}
		// aes = new AES();
	}

    /**Get port url of the port.
     * @param {string} port the port name
     * @return the url
     */
	servUrl (port) {
		// This is a common error in jeasy frame
		if (port === undefined || port === null) {
			console.error("Port is null!");
			return;
		}

		// Protocol can't visited when debugging, but working:
		// console.log(Protocol.Port);
		// console.log("Protocol.Port[" + port + "] : " + Protocol.Port[port]);

		var ulr;
		if (Protocol.Port[port] !== undefined)
			ulr = this.cfg.defaultServ + '/'
				+ Protocol.Port[port]; // + '?conn=' + this.cfg.connId;
		else
			ulr = this.cfg.defaultServ + '/'
				+ port; // + '?conn=' + this.cfg.connId;

		if (this.cfg.connId)
			ulr += '?conn=' + this.cfg.connId;

		return ulr;
	}

    /** initialize with url and default connection id
     * @param {stirng} urlRoot root url
     * @param {string} connId connection Id
     * @retun {An} this */
	init (urlRoot, connId) {
		this.cfg.cconnId = connId;
		this.cfg.defaultServ = urlRoot;
        return this;
	}

    /** Understand the prots' name of the calling app's.<br>
     * As jclient defined the basice ports, more ports extension shoould been understood by the API lib.
     * This function must been callded to extned port's names.
     * @param {string} new Ports
     * @return {An} this */
	understandPorts (newPorts) {
		Object.assign(Protocol.Port, newPorts);
        return this;
	}

	opts(options) {
		Protocol.opts(options);
	}

	port(name) {
		return Protocol.Port[name];
	}

    /**Login to jserv
     * @param {string} usrId
     * @param {string} pswd
     * @param {function} onLogin on login ok handler
     * @param {function} on failed
     */
	login (usrId, pswd, onLogin, onError) {
		// byte[] iv =   AESHelper.getRandom();
		// String iv64 = AESHelper.encode64(iv);
		// String tk64 = AESHelper.encrypt(uid, pswdPlain, iv);
		console.log('An.login(' + usrId + ', ' + pswd + ', ...)');

		var iv = aes.getIv128();
		var c = aes.encrypt(usrId, pswd, iv);
		// var qobj = formatLogin(logId, c, bytesToB64(iv));
		var req = Protocol.formatSessionLogin(usrId, c, aes.bytesToB64(iv));

		var An = this;

		this.post(req,
			/**@param {object} resp
			 * code: "ok"
			 * data: Object { uid: "admin", ssid: "3sjUJk2JszDm", "user-name": "admin" }
			 * port: "session"
			 */
			function(resp) {
				// var sessionClient = new SessionClient(resp.data, iv, true);
				var sessionClient = new SessionClient(resp.body[0].ssInf, iv, true);
				sessionClient.An = An;
				if (typeof onLogin === "function")
					onLogin(sessionClient);
				else console.log(sessionClient);
			},
			onError);
	}

    /**Check Response form jserv
     * @param {any} resp
     */
	static checkResponse(resp) {
		if (typeof resp === "undefined" || resp === null || resp.length < 2)
			return "err_NA";
		else return false;
	}

    /**Post a request, using Ajax.
     * @param {AnsonMsg} jreq
     * @param {function} onOk
     * @param {function} onErr
     * @param {object} ajaxOpts */
	post (jreq, onOk, onErr, ajaxOpts) {
		if (jreq === undefined) {
			console.error('jreq is null');
			return;
		}
		if (jreq.port === undefined || jreq.port == '') {
			// TODO docs...
			console.error('Port is null - you probably created a requesting AnsonMsg with "new [User|Query|...]Req()".\n',
				'Creating a new request message can mainly throught one of 2 way:\n',
				'Way 1: Using a jclient helper, like those in jeasy-html.js/EasyModal.save().\n',
				'Way 2: Using a ssClient request API, e.g. ssClient.delete().',
				'TODO docs...');
			return;
		}
		var url = this.servUrl(jreq.port);

		var async =  true;
		if (ajaxOpts !== undefined && ajaxOpts !== null) {
			async = ajaxOpts.async !== false;
		}

		var self = this;
		$.ajax({type: 'POST',
			// url: this.cfg.defaultServ + "/query.serv?page=" + pgIx + "&size=" + pgSize,
			url: url,
			contentType: "application/json; charset=utf-8",
			crossDomain: true,
            async: async,
			//xhrFields: { withCredentials: true },
			data: JSON.stringify(jreq),
			success: function (resp) {
				// response Content-Type = application/json;charset=UTF-8
				if (typeof resp === 'string') {
					// why?
					resp = JSON.parse(resp);
				}
				// code != ok
				if (self.cfg.verbose >= 5){
					console.debug(Protocol.MsgCode);
				}

				if (resp.code !== Protocol.MsgCode.ok)
					if (typeof onErr === "function")
						onErr(resp.code, resp);
					else console.error(resp);
				// code == ok
				else {
					if (typeof onOk === "function")
						onOk(resp);
					else console.log(resp);
				}
			},
			error: function (resp) {
				if (typeof onErr === "function") {
					console.error("ajax error:", url);
					onErr(Protocol.MsgCode.exIo, resp);
				}
				else {
					console.error("ajax error:", url);
					console.error("req", jreq);
					console.error("response", resp);
				}
			}
		});
	}

	// TODO moved to protocol.js?
    /** Get the cols from jserv's rows
     * (response from port returning AnsonMsg&lt;AnsonResp&gt;)
     * @param {AnsonMsg<AnsonResp>} resp
     * @param {ix} the rs index
     * @return {array} array of column names */
	respCols(resp, ix) {
		if (ix === null || ix === undefined )
			ix = 0;
		// colnames: {TEXT: [2, "text"], VALUE: [1, "value"]}
		var colIx = resp !== null && resp !== undefined && resp.code === "ok"
			? resp.body[0].rs[0].colnames : [];

		var cols = new Array(colIx.length);
		Object.keys(colIx).forEach(function (k, ix) {
			// Design Memo: java Resultset index start from 1.
			cols[colIx[k][0] - 1] = colIx[k][1];
		})
		return cols;
	}

    /** Get the rows from jserv's rows.
     * (response from port returning AnsonMsg&lt;AnsonResp&gt;)
     * @param {AnsonMsg<AnsonResp>} resp
     * @param {ix} the rs index
     * @return {array} array of rows */
	respRows(resp, ix) {
		if (ix === null || ix === undefined )
			ix = 0;
		return resp !== null && resp !== undefined && resp.code === "ok"
			// ? resp.data.rs[ix].slice(1) : [];
			? resp.body[0].rs[0].results : [];
	}

    /** Get the objects from jserv's rows (response from port returning SResultsets)
     * @param {AnsonMsg<AnsonResp>} resp
     * @param {int} start start to splice
     * @param {int} len max length
     * @return {array} array of objects<br>
     * e.g [ [col1: cell1], ...] */
	respObjs(resp, start, len) {
		var cols = this.respCols(resp);

		// start from 0
		if (typeof start !== 'number')
			start = 0;

		if (typeof len !== 'number')
			// len = resp.data.rs[0].length - 1;
			len = resp.body[0].rs[0].results.length;
		else
			len = Math.min(len, resp.body[0].rs[0].results.length);

		if (resp.body[0].rs[0].results) {
			return resp.body[0].rs[0].results.splice(start, len)
		}
	}
}

export const an = new An();

/**Client with session logged in.
 * Equivalent of java io.odysz.jclient.SessionClient;
 */
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
			// try tolerate easyUI trouble
			if (typeof iv === 'string') {
				// really not expected
				;
			}
			else {
				this.ssInf.iv = aes.bytesToB64(iv);
			}

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

		this.an = an;
	}

	get userInfo() { return this.ssInf; }

	consumeNotifies() {
		if (this.ssInf) {
			return this.ssInf['_notifies_'];
		}
	}

	/**Get a header the jserv can verify successfully.
	 * This method is not recommended used directly.
	 * @param {Object} act user's action for logging<br>
	 * {func, cate, cmd, remarks};
	 * @return the logged in header */
	getHeader(act) {
		var header = Protocol.formatHeader(this.ssInf);
		if (typeof act === 'object') {
			header.userAct(act);
		}
		else {
			header.userAct(
				{func: 'ext',
				 cmd: 'unknow',
				 cate: 'ext',
				 remarks: 'raw header'} );
		}
		return header;
	}

	setPswd(oldPswd, newPswd, opts) {
		var usrId = this.ssInf.uid;
		var iv_tok = aes.getIv128();
		var iv_new = aes.getIv128();
		var iv_old = aes.getIv128();

		// var tk = aes.encrypt(usrId, pswd, iv_tok);
		var tk = this.ssInf.ssid;
		var key = this.ssInf.ssid; // FIXME

		var newPswd = aes.encrypt(newPswd, key, iv_new);
		var oldPswd = aes.encrypt(oldPswd, key, iv_old);

		var body = new SessionReq(usrId,
			tk, aes.bytesToB64(iv_tok)) //  tk and iv_tok shouldn't bee used
				.a('pswd')
				.md('pswd', newPswd)
				.md('iv_pswd', aes.bytesToB64(iv_new))
				.md('oldpswd', oldPswd)
				.md('iv_old', aes.bytesToB64(iv_old));
		var jmsg = new AnsonMsg(Protocol.Port.session, this.getHeader(), body);

		if (opts === undefined) {
			opts = {};
		}

		this.an.post(jmsg, opts.onok, opts.onerror);
		return this;
	}

	/**Post the request message (AnsonMsg with body of subclass of AnsonBody).
	 * @param {AnsonMsg} jmsg request message
	 * @param {function} onOk
	 * @param {function} onError
	 */
	commit(jmsg, onOk, onError) {
		this.an.post(jmsg, onOk, onError);
	}

	/**Post the request message (AnsonMsg with body of subclass of AnsonBody) synchronously.
	 * @param {AnsonMsg} jmsg request message
	 * @param {function} onOk
	 * @param {function} onError
	 */
	commitSync(jmsg, onOk, onError) {
		this.an.post(jmsg, onOk, onError, {async: false});
	}

	/**
	 * create a query message.
	 * @param {string} conn connection id
	 * @param {string} maintbl target table
	 * @param {string} alias target table alias
	 * @param {Object} pageInf<br>
	 * page: page index, -1 for no paging<br>
	 * size: page size, default 20, -1 for no paging
	 * @param {Object} act user's action for logging<br>
	 * {func, cate, cmd, remarks};
	 * @return {AnsonMsg} the request message
	 */
	query(conn, maintbl, alias, pageInf, act) {
		var qryItem = new QueryReq(conn, maintbl, alias, pageInf);

		var header = Protocol.formatHeader(this.ssInf);
		if (typeof act === 'object') {
			this.usrAct(act.func, act.cate, act.cmd, act.remarks);
		}
		else {
			act = { func: 'query',
					cmd: 'select',
					cate: 'r',
					remarks: 'session query'};
		}

		var header = this.getHeader(act);

		var jreq = new AnsonMsg(Protocol.Port.query, header, qryItem);
		return jreq;
	}

	update(conn, maintbl, pk, nvs) {
		if (this.currentAct === undefined || this.currentAct.func === undefined)
			console.error("jclient is designed to support user updating log natively, User action with function Id shouldn't ignored.",
						"To setup user's action information, call ssClient.usrAct().");

		if (pk === undefined) {
			console.error("To update a table, {pk, v} must presented.", pk);
			return;
		}

		var upd = new UpdateReq(conn, maintbl, pk);
		upd.a = Protocol.CRUD.u;
		this.currentAct.cmd = 'update';
		var jmsg = this.userReq(conn, Protocol.Port.update, upd, this.currentAct);

		if (nvs !== undefined) {
			if (Array.isArray(nvs))
				upd.nv(nvs);
			else console.error("updating nvs must be an array of name-value.", nvs)
		}
		return jmsg;
	}

	insert(conn, maintbl, nvs) {
		if (this.currentAct === undefined || this.currentAct.func === undefined)
			console.error("jclient is designed to support user updating log natively, User action with function Id shouldn't ignored.",
						"To setup user's action information, call ssClient.usrAct().");

		var ins = new InsertReq(conn, maintbl);
		// ins.a = Protocol.CRUD.c;
		this.currentAct.cmd = 'insert';
		var jmsg = this.userReq(conn, Protocol.Port.insert, ins, this.currentAct);

		if (nvs !== undefined) {
			if (Array.isArray(nvs))
				ins.valus(nvs);
			else console.error("updating nvs must be an array of name-value.", nvs)
		}
		return jmsg;
	}

	delete(conn, maintbl, pk) {
		if (this.currentAct === undefined || this.currentAct.func === undefined)
			console.error("jclient is designed to support user updating log natively, User action with function Id shouldn't ignored.",
						"To setup user's action information, call ssClient.usrAct().");
		if (pk === undefined) {
			console.error("To delete a table, {pk, v} must presented.", pk);
			return;
		}
		if (maintbl === undefined || maintbl === null || maintbl === "") {
			console.error("To delete a table, maintbl must presented.");
			return;
		}

		var upd = new UpdateReq(conn, maintbl, pk);
		upd.a = Protocol.CRUD.d;
		this.currentAct.cmd = 'delete';

		var jmsg = this.userReq(conn,
				// port = update, it's where the servlet handling this.
				Protocol.Port.update,
				upd, this.currentAct);
		return jmsg;
	}

	/**Create a user request AnsonMsg.
	 * @param {string} conn connection id
	 * @param {string} port
	 * @param {Protocol.UserReq} bodyItem request body, created by like: new jvue.UserReq(conn, tabl).
	 * @param {Object} act action, optional.
	 * @return {AnsonMsg<AnUserReq>} AnsonMsg */
	userReq(conn, port, bodyItem, act) {
		var header = Protocol.formatHeader(this.ssInf);
		if (typeof act === 'object') {
			header.userAct = act;
			this.usrAct(act.func, act.cate, act.cmd, act.remarks);
		}
		return new AnsonMsg(port, header, bodyItem);
	}

	/**Set user's current action to be logged.
	 * @param {string} funcId curent function id
	 * @param {string} cate category flag
	 * @param {string} cmd
	 * @param {string} remarks
	 * @return {SessionClient} this */
	usrAct(funcId, cate, cmd, remarks) {
		if (this.currentAct === undefined)
			this.currentAct = {};
		Object.assign(this.currentAct,
			{func: funcId, cate: cate, cmd: cmd, remarks: remarks});
		return this;
	}

	/**Set user's current action to be logged.
	 * @param {string} cmd user's command, e.g. 'save'
	 * @return {SessionClient} this */
	usrCmd(cmd) {
		if (this.currentAct === undefined)
			this.currentAct = {};
		this.currentAct.cmd = cmd;
		return this;
	}

	commit (jmsg, onOk, onErr) {
		an.post(jmsg, onOk, onErr);
	}
}

/**Client without session information.
 * This is needed for some senarios like rigerstering new account.*/
class Inseclient {
	commit (jmsg, onOk, onErr) {
		an.post(jmsg, onOk, onErr);
	}
}

export * from './protocol.js';
export * from './frames/cheapflow/cheap-req.js';
export * from './frames/cheapflow/cheap-client.js';
export {An, SessionClient, Inseclient, aes};
