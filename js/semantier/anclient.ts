
/**The lower API of jclient/js */

import $ from 'jquery';
import AES from './aes.js';
import {
	Protocol, AnsonMsg, AnHeader, AnsonResp, DatasetierReq,
	UserReq, AnSessionReq, QueryReq, UpdateReq, DeleteReq, InsertReq,
	DatasetReq,
	LogAct,
	AnsonBody
} from './protocol-v2';

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
 * cfg.defaultServ:<br>
 * where defaultserv is the serv root, will be concated with port name for different poert.
 */
class AnClient {
	cfg: {
		defaultServ: string;
	};

	/**@param {string} serv serv path root, e.g. 'http://localhost/jsample'
	 */
	constructor (urlRoot: string) {
	 	this.cfg = {
			// connId: null, // FIXME deprecated
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

		var ulr;
		if (Protocol.Port[port] !== undefined)
			ulr = this.cfg.defaultServ + '/'
				+ Protocol.Port[port];
		else {
			ulr = `${this.cfg.defaultServ}/${port}`;
			console.error("The url for the named port is probably not resolved. Call Anclient.understandPorts() or AnReactExt.extendPorts().",
					"prot: ", port, "url", ulr);
		}

		return ulr;
	}

    /** initialize with url and default connection id
     * @param urlRoot root url
     * @retun {An} this */
	init (urlRoot: string) {
		this.cfg.defaultServ = urlRoot;
        return this;
	}

    /** Understand the prots' name of the calling app's.<br>
     * As jclient defined the basice ports, more ports extension shoould been understood by the API lib.
     * This function must been callded to extned port's names.
     * @param {string} new Ports
     * @return {An} this */
	understandPorts (newPorts) {
		// Object.assign(Protocol.Port, newPorts);
		Protocol.extend(newPorts);
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
		let iv = aes.getIv128() as unknown as Int8Array;
		let cpwd = aes.encrypt(usrId, pswd, iv);
		let req = Protocol.formatSessionLogin(usrId, cpwd, aes.bytesToB64(iv));

		let servRoot = an.cfg.defaultServ;

		this.post(req,
			/**@param {object} resp
			 * code: "ok"
			 * data: Object { uid: "admin", ssid: "3sjUJk2JszDm", "user-name": "admin" }
			 * port: "session"
			 */
			function(resp) {
				let ssInf = resp.Body().ssInf;
				ssInf.servRoot = servRoot;
				let sessionClient = new SessionClient(resp.Body().ssInf, iv, true);
				sessionClient.an = this;
				if (typeof onLogin === "function")
					onLogin(sessionClient);
				else console.log(sessionClient);
			},
			onError, {});
	}

	loginWait(usrId, pswd) {
		let me = this;
		return new Promise((resolve, reject) => {
			me.login(usrId, pswd,
				(ssClient) => {resolve(ssClient);},
				(err) => {reject(err);})
		});
	}

	/**Create a user request AnsonMsg for no-ssession request (on connId can be specified).
	 * @param {string} port
	 * @param {Protocol.UserReq} bodyItem request body, created by like: new jvue.UserReq(conn, tabl).
	 * @return {AnsonMsg<AnUserReq>} AnsonMsg */
	restReq(port, bodyItem) {
		let header = Protocol.formatHeader({});
		return new AnsonMsg({ port, header, body: [bodyItem] });
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
     * @param {function} onErr function (MsgCode, AnsonResp?)
     * @param {object} ajaxOpts */
	post (jreq, onOk, onErr, ajaxOpts) {
		if (jreq === undefined) {
			console.error('jreq is null');
			return;
		}
		if (jreq.port === undefined || jreq.port == '') {
			// TODO docs...
			console.error('Port is null - you probably created a requesting AnsonMsg with "new [User|Query|...]Req()".\n',
				'Creating a new request message can mainly throught one of 2 ways:\n',
				'Way 1: Using a jclient helper, like those in jeasy-html.js/EasyModal.save() - deprecated.\n',
				'Way 2: Using a ssClient request API, e.g. ssClient.delete().',
				'For examples, see AnClient/js/test/react/* and AnClient/examples/examples.js/**.',
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
			// url: this.cfg.defaultServ + "/query.serv?page=" + pgIx + "&size=" + pgsize,
			url: url,
			contentType: "application/json; charset=utf-8",
			crossDomain: true,
            async: async,
			//xhrFields: { withCredentials: true },
			data: JSON.stringify(jreq),
			timeout: jreq.timeout || 18000,
			success: function (resp) {
				// response Content-Type = application/json;charset=UTF-8
				if (typeof resp === 'string') {
					// why?
					resp = JSON.parse(resp);
				}
				resp = new AnsonMsg(resp);

				// code != ok
				if (Protocol.verbose >= 5){
					console.debug(Protocol.MsgCode);
				}

				if (resp.code !== Protocol.MsgCode.ok)
					if (typeof onErr === "function")
						onErr(resp.code, resp);
					else if (onErr && typeof onErr.onError === "function"){
						// a special case of AnContext.error
						onErr.msg = resp.Body().msg();
						onErr.onError(resp.code, resp);
					}
					else console.error(resp);
				// code == ok
				else {
					if (typeof onOk === "function")
						onOk(resp);
					else console.log(resp);
				}
			},
			error: function (resp) {
				// JSON.stringify(resp):
				// {"readyState":0,"status":0,"statusText":"error"};

				if (typeof onErr === "function" || onErr && typeof onErr.onError === 'function') {
					if (resp.statusText) {
						resp.code = Protocol.MsgCode.exIo;
						resp.body = [ {
								type: 'io.odysz.semantic.jprotocol.AnsonResp',
								m: 'Network failed: ' + resp.statusText
							} ];
						let ansonResp = new AnsonMsg(resp);
						if (typeof onErr.onError === 'function') {
							onErr.msg = ansonResp.Body().msg();
							onErr.onError(Protocol.MsgCode.exIo, ansonResp);
						}
						else onErr(Protocol.MsgCode.exIo, ansonResp);
					}
					else {
						if (resp.code || resp.port || !resp.status)
							resp = new AnsonMsg({
								port: resp.port,
								header: resp.header,
								body: [ { type: 'io.odysz.semantic.jprotocol.AnsonResp',
										  m: 'Ajax: network failed: ' + resp.status } ]
							});
						else resp = AnClient.fromAjaxError(resp);

						if (typeof onErr.onError === 'function') {
							onErr.msg = resp.Body().msg();
							onErr.onError(Protocol.MsgCode.exIo, resp);
						}
						onErr(Protocol.MsgCode.exIo, resp);
					}
				}
				else {
					console.error("ajax error:", url);
					console.error("req", jreq);
					console.error("response", resp);
				}
			}
		});
	}

    /**Async-await style posting a request, using Ajax.
     * @param {AnsonMsg} jreq
     * @param {object} [ajaxOpts] */
	postWait(jreq, ajaxOpts = null) {
		let me = this;
		return new Promise((resolve, reject) => {
			me.post(jreq,
				resp => {resolve(resp);},
				(c, err) => {reject({c, err});},
				ajaxOpts)
		});
	}

	// TODO moved to semantic resultset?
	/** Get the cols from jserv's rows
	 * (response from port returning AnsonMsg&lt;AnsonResp&gt;)
	 * @param resp
	 * @param rs index
	 * @return column names */
	respCols(resp: AnsonMsg<AnsonResp>, ix?: number): Array<string> {
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
	 * @deprecated
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
	 * @deprecated
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

	/// helpers
	/** Try change ajax error object to AnsonMsg<AnsonResp>
	 * @param {object} ajaxResp
	 * @return {AnsonMsg<AnsonResp>}
	 */
	static fromAjaxError(ajaxResp) {
		let json;
		json.code = Protocol.MsgCode.exIo;
		json.body = [ {
				type: 'io.odysz.semantic.jprotocol.AnsonResp',
				m: 'Ajax: ' + ajaxResp.statusText,
			} ];
		json.ajax = {
			responseText: ajaxResp.responseText,
			statusText: ajaxResp.statusText,
			status: ajaxResp.status,
			readyState: ajaxResp.readyState
		};
		return new AnsonMsg( json );
	}
}

export const an = new AnClient(undefined);

export type SessionInf = {
	uid: string;
	iv: string;
	ssid: string;
	usrName?: string
}

/**Client with session logged in.
 * Equivalent of java io.odysz.jclient.SessionClient;
 */
class SessionClient {
	an: AnClient;
	ssInf: any;
	currentAct: LogAct;
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
	 * @param ssInf login response form server: {ssid, uid}, if null, will try restore window.for localStorage
	 * @param iv iv used for cipher when login.
	 * @param dontPersist don't save into local storage.
	 */
	constructor (ssInf: SessionInf, iv: Int8Array, dontPersist = false) {
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
			this.ssInf = SessionClient.loadStorage();
		}

		this.an = an;
	}

	static loadStorage() {
		// skipped, created from local storage instead
		let ssInf;
		if (window && localStorage) {
			var sstr = localStorage.getItem(SessionClient.ssInfo);
			// What about refesh if removed this?
			// localStorage.setItem(SessionClient.ssInfo, '');
			if (sstr && sstr !== '' && sstr !== 'null') {
				ssInf = JSON.parse(sstr);
				ssInf.iv = aes.b64ToBytes(ssInf.iv);
				an.init(ssInf.servRoot);
			}
			else
				console.error("Can't find credential in local storage. SessionClient deserializing failed.");
		} // else must be a test
		return ssInf;
	}

	static persistorage(ssInf) {
		if (window && localStorage) {
			var sstr = JSON.stringify(ssInf);
			localStorage.setItem(SessionClient.ssInfo, sstr);
		}
		else
			console.error("Can't find credential in local storage. SessionClient persisting failed.");
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
	getHeader(act: LogAct) {
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

	SsInf(ssInf: SessionInf) {
		throw new Error('Method not implemented.');
	}

	setPswd(oldPswd: string, newPswd : string, opts) {
		let usrId = this.ssInf.uid;
		let iv_tok = aes.getIv128();
		let iv_new = aes.getIv128();
		let iv_old = aes.getIv128();

		let tk = this.ssInf.ssid;
		let key = this.ssInf.ssid;

		newPswd = aes.encrypt(newPswd, key, iv_new);
		oldPswd = aes.encrypt(oldPswd, key, iv_old);

		let body = new AnSessionReq(usrId,
			tk, aes.bytesToB64(iv_tok)) //  tk and iv_tok shouldn't bee used
				.md('pswd', newPswd)
				.md('iv_pswd', aes.bytesToB64(iv_new))
				.md('oldpswd', oldPswd)
				.md('iv_old', aes.bytesToB64(iv_old))
				.A<AnSessionReq>('pswd');

		let jmsg = new AnsonMsg({
					// port: Protocol.Port.session,
					port: 'session',
					header: this.getHeader(undefined),
					body: [body] });

		if (opts === undefined) {
			opts = {};
		}

		this.an.post(jmsg, opts.onOk, opts.onError, undefined);
		return this;
	}

	/**Encrypt text with ssInf token - the client side for de-encrypt semantics
	 * @param plain plain text
	 * @return {cipher, iv: base64}
	 */
	encryptoken(plain: string): {cipher: string, iv: string} {
		let key = this.ssInf.ssid;
		let iv_ = aes.getIv128();
		let cipher = aes.encrypt(plain, key, iv_);
		let iv = aes.bytesToB64(iv_);
		return {cipher, iv}
	}

	/**Post the request message (AnsonMsg with body of subclass of AnsonBody).
	 * @param jmsg request message
	 * @param onOk
	 * @param onError
	 */
	commit (jmsg: AnsonMsg<any>, onOk: (resp: AnsonMsg<AnsonResp>) => void, onErr: ()=>void) {
		an.post(jmsg, onOk, onErr, undefined);
	}

	/**Post the request message (AnsonMsg with body of subclass of AnsonBody) synchronously.
	 * onOk, onError will be called after request finished.
	 * @param {AnsonMsg} jmsg request message
	 * @param {function} onOk
	 * @param {function} onError
	 */
	commitSync(jmsg, onOk, onError) {
		this.an.post(jmsg, onOk, onError, {async: false});
	}

	/**
	 * create a query message.
	 * @param {string} uri component uri
	 * @param {string} maintbl target table
	 * @param {string} alias target table alias
	 * @param {Object} pageInf<br>
	 * page: page index, -1 for no paging<br>
	 * size: page size, default 20, -1 for no paging
	 * @param {Object} act user's action for logging<br>
	 * {func, cate, cmd, remarks};
	 * @return {AnsonMsg} the request message
	 */
	query(uri, maintbl, alias, pageInf, act) {
		let qryItem = new QueryReq(uri, maintbl, alias, pageInf);

		// let header = Protocol.formatHeader(this.ssInf);
		if (typeof act === 'object') {
			this.usrAct(act.func, act.cate, act.cmd, act.remarks);
		}
		else {
			act = { func: 'query',
					cmd: 'select',
					cate: 'r',
					remarks: ''};
		}

		let header = this.getHeader(act);

		let jreq = new AnsonMsg({
					port: 'query', //Protocol.Port.query,
					header,
					body: [qryItem]
				});
		return jreq;
	}

	update(uri, maintbl, pk, nvs) {
		if (this.currentAct === undefined || this.currentAct.func === undefined)
			console.error("Anclient is designed to support user updating log natively. User action with function Id shouldn't be ignored.",
						"To setup user's action information, call ssClient.usrAct().");

		if (pk === undefined) {
			throw new Error("To update a table, {pk, v} must presented.");
		}

		var upd = new UpdateReq(uri, maintbl, pk);
		upd.a = Protocol.CRUD.u;
		this.currentAct.cmd = 'update';
		var jmsg = this.userReq(uri, 'update', upd, this.currentAct);

		if (nvs !== undefined) {
			if (Array.isArray(nvs))
				upd.nv(nvs, undefined);
			else if (typeof nvs === 'object')
				upd.record(nvs)
			else console.error("updating nvs must be an array of name-value.", nvs)
		}
		return jmsg;
	}

	insert(uri, maintbl, nvs) {
		if (this.currentAct === undefined || this.currentAct.func === undefined)
			console.error("jclient is designed to support user updating log natively, User action with function Id shouldn't ignored.",
						"To setup user's action information, call ssClient.usrAct().");

		var ins = new InsertReq(uri, maintbl);
		this.currentAct.cmd = 'insert';
		var jmsg = this.userReq(uri, 'insert', ins, this.currentAct);

		if (nvs !== undefined) {
			if (Array.isArray(nvs))
				ins.valus(nvs, undefined);
			else console.error("updating nvs must be an array of name-value.", nvs)
		}
		return jmsg;
	}

	delete(uri, maintbl, pk) {
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

		let upd = new UpdateReq(uri, maintbl, pk);
		upd.a = Protocol.CRUD.d;
		this.currentAct.cmd = 'delete';

		let jmsg = this.userReq(uri,
				'update', // Protocol.Port.update,
				upd, this.currentAct);
		return jmsg;
	}

	getSks(port, onLoad) {
		let req = this.userReq(null, 'datasetier',
					new DatasetierReq(undefined)
					.A(DatasetierReq.A.sks), undefined );

		this.commit(req,
			(resp) => {
				onLoad(resp.Body().sks);
			}, undefined );
	}

	/**Use this to delete multiple records where pkn = pks[i]
	 * @param {string} uri
	 * @param {string} mtabl delete from the table
	 * @param {string} pkn delete from the table
	 * @param {array} pks delete from the table - pk values are automatically wrapped with ''.
	 * @return {AnsonMsg<UpdateReq>} anson request
	 */
	deleteMulti(uri, mtabl, pkn, pks) {
		let upd = new UpdateReq(uri, mtabl)
			// .whereCond('in', pkn, pkvals);
			.whereIn(pkn, pks);
		upd.a = Protocol.CRUD.d;
		this.currentAct.cmd = 'delete';

		var jmsg = this.userReq(undefined,
				'update', // Protocol.Port.update,
				upd, this.currentAct);
		return jmsg;
	}

	/**Create a user request AnsonMsg.
	 * @param {string} uri component uri
	 * @param {string} port
	 * @param {Protocol.UserReq} bodyItem request body, created by like: new jvue.UserReq(uri, tabl).
	 * @param {Object} act action, optional.
	 * @return {AnsonMsg<AnUserReq>} AnsonMsg */
	userReq(uri, port, bodyItem, act) {
		let header = Protocol.formatHeader(this.ssInf);
		bodyItem.uri = uri || bodyItem.uri;
		if (typeof act === 'object') {
			// header.userAct = act;
			this.usrAct(act.func, act.cate, act.cmd, act.remarks);
		}
		return new AnsonMsg({ port, header, body: [bodyItem] });
	}

	/**Set user's current action to be logged.
	 * @param {string} funcId curent function id
	 * @param {string} cate category flag
	 * @param {string} cmd
	 * @param {string} remarks
	 * @return {SessionClient} this */
	usrAct(funcId, cate, cmd, remarks) {
		// if (this.currentAct === undefined)
		// 	this.currentAct = {};
		Object.assign(this.currentAct,
			{func: funcId, cate: cate, cmd: cmd, remarks: remarks});
		return this;
	}

	/** For name errata? */
	userAct(f, c, m, r) { this.usrAct(f, c, m, r); }

	/**Set user's current action to be logged.
	 * @param {string} cmd user's command, e.g. 'save'
	 * @return {SessionClient} this */
	usrCmd(cmd) {
		// if (this.currentAct === undefined)
		// 	this.currentAct = {};
		this.currentAct.cmd = cmd;
		return this;
	}

	logout(onOk, onError) {
		let header = Protocol.formatHeader(this.ssInf);
		let body = {type: "io.odysz.semantic.jsession.AnSessionReq", a: "logout"};
		let req = new AnsonMsg({port: 'session', header, body: [body]});

		an.post(req, function(c, r) {
        	localStorage.setItem(SessionClient.ssInfo, null);
			if (typeof onOk === 'function')
				onOk(c, r);
		}, function(c, e) {
        	localStorage.setItem(SessionClient.ssInfo, null);
			if (typeof onError === 'function')
				onError(c, e);
		}, undefined);
	}

}

/**Client without session information.
 * This is needed for some senarios like rigerstering new accounts.*/
class Inseclient extends SessionClient {
	// commit (jmsg, onOk, onErr) {
	// 	an.post(jmsg, onOk, onErr);
	// }
	userId = 'localhost';

	/**
	 * @param {object} opts
	 * @param {string} opts.urlRoot
	 * @constructor
	 */
	constructor(opts) {
		super(undefined, undefined, true);
		this.ssInf = {}
		this.an = an;
		an.init(opts.urlRoot);
	}

	/**Get a header the jserv can verify successfully.
	 * This method is not recommended used directly.
	 * @param {Object} act user's action for logging<br>
	 * {func, cate, cmd, remarks};
	 * @return the logged in header */
	getHeader(act) {
		var header = Protocol.formatHeader({ssid: undefined, uid: this.userId});

		return new AnHeader(this.ssInf.ssid, this.ssInf.uid);
		// if (typeof act === 'object') {
		// 	header.userAct(act);
		// }
		// else {
		// 	header.userAct(
		// 		{func: 'insecure',
		// 		 cmd: 'unknown',
		// 		 cate: 'sessionless',
		// 		 remarks: 'sessionless header'} );
		// }
		// return header;
	}
}

export * from './protocol-v2';
export * from './semantier-v2';
export {AnClient, SessionClient, Inseclient, aes};
