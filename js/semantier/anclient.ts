
/**The lower API of jclient/js */

import * as $ from 'jquery';
import AES from './aes';
import {
	Protocol, AnsonMsg, AnHeader, AnsonResp, DatasetierReq, AnSessionReq, QueryReq,
	UpdateReq, InsertReq, AnsonBody, DatasetierResp, JsonOptions, LogAct, PageInf,
	OnCommitOk, OnLoadOk, CRUD, PkVal, NV, NameValue, isNV, OnLoginOk
} from './protocol';
import { ErrorCtx, Tierec, isEmpty, len } from './semantier';

export * from './stree-tier';

export interface AjaxOptions {async?: boolean; timeout?: number}

interface AjaxReport {
	statusText: string;
	responseText: string;
	status: number;
	readyState: number;
}

/**
 * AESLib instance
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

	/**
	 * @param urlRoot serv path root, e.g. 'http://localhost/jsample'
	 */
	constructor (urlRoot: string | undefined) {
	 	this.cfg = {
			defaultServ: urlRoot || '',
		}
	}

    /**Get port url of the port.
     * @param port the port name
     * @return the url
     */
	servUrl (port: string) : string {
		// This is a common error in jeasy frame
		if (port === undefined || port === null) {
			console.error("Port is null!");
			return;
		}

		let ulr: string;
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
     * @retun this */
	init (urlRoot: string) : this {
		this.cfg.defaultServ = urlRoot;
		console.info("AnClient initialized with url-root:", urlRoot);
        return this;
	}

    /** Understand the prots' name of the calling app's.<br>
     * As jclient defined the basice ports, more ports extension shoould been understood by the API lib.
     * This function must been callded to extned port's names.
     * @param newPorts
     * @return this */
	understandPorts (newPorts: { [p: string]: string; }) : this {
		Protocol.extend(newPorts);
        return this;
	}

	opts(options : JsonOptions) : this {
		Protocol.opts(options);
		return this;
	}

	port(name: string) {
		return Protocol.Port[name];
	}

    /**Login to jserv
     * @param usrId
     * @param pswd
     * @param onLogin on login ok handler
     * @param onError error handler
     */
	login (usrId: string, pswd: string,
		onLogin: OnLoginOk,
		onError: ErrorCtx): this {

		let iv = aes.getIv128() as unknown as Uint8Array;
		let cpwd = aes.encrypt(usrId, pswd, iv);
		let req = Protocol.formatSessionLogin(usrId, cpwd, aes.bytesToB64(iv));

		let that = this;
		this.post(req,
			/**@param {object} resp
			 * code: "ok"
			 * data: Object { uid: "admin", ssid: "3sjUJk2JszDm", "user-name": "admin" }
			 * port: "session"
			 */
			(resp: AnsonMsg<AnsonResp>) => {
				let ssInf = resp.Body().ssInf;
				ssInf.jserv = an.cfg.defaultServ;
				let sessionClient = new SessionClient(resp.Body().ssInf, iv, true);
				sessionClient.an = that;
				if (typeof onLogin === "function")
					onLogin(sessionClient);
				else
					console.log(sessionClient);
			},
			onError);
		return this;
	}

	loginWait(usrId : string, pswd : string) {
		let me = this;
		return new Promise((resolve, reject) => {
			me.login(usrId, pswd,
				(ssClient: SessionClient) => {resolve(ssClient);},
				{ onError: (err) => {reject(err);} })
		});
	}

	/**
	 * Create a user request AnsonMsg for no-ssession request
	 * (create header and link body.parent, and no connId can be specified).
	 * 
	 * For request with session header, use {@link SessionClient#userReq()}.
	 * 
	 * @param port
	 * @param bodyItem request body, created by like: new jvue.UserReq(conn, tabl).
	 * @return AnsonMsg<T extends UserReq>
	 */
	getReq<T extends AnsonBody>(port: string, bodyItem: T): AnsonMsg<T> {
		let header = Protocol.formatHeader({});
		return new AnsonMsg({ port, header, body: [bodyItem] });
	}

    /**Post a request, using Ajax.
     * @param jreq
     * @param onOk
     * @param onErr must present. since 0.9.32, Anclient won't handle error anymore, and data accessing errors should be handled by App singleton.
     * @param ajaxOpts */
	post<T extends AnsonBody> (jreq: AnsonMsg<T>, onOk: OnCommitOk | undefined, onErr: ErrorCtx, ajaxOpts? : AjaxOptions) {
		if (!onErr || !onErr.onError) {
			console.error("Since 0.9.32, this global error handler must present - error handling is supposed to be the app singleton's responsiblity.")
		}

		if (jreq === undefined) {
			console.error('jreq is null');
			return;
		}
		// if (jreq.port === undefined || jreq.port == '') {
		if (isEmpty(jreq.port)) {
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

		var async = true;
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
			data: JSON.stringify(jreq),
			timeout: ajaxOpts?.timeout || 18000,
			success: function (resp: AnsonMsg<AnsonResp>) {
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
					if (onErr && typeof onErr.onError === "function"){
						// a special case of AnContext.error
						onErr.msg = resp.Body().msg();
						onErr.onError(resp.code, resp);
					}
					else console.error(resp);
				// code == ok
				else {
					if (typeof onOk === "function")
						onOk(resp);
					else console.error("A successful response ignored for no handler is provided.", resp);
				}
			},
			error: function (resp: any) {
				if (typeof onErr === "function" || onErr && typeof onErr.onError === 'function') {
					if (resp.statusText) {
						resp.code = Protocol.MsgCode.exIo;
						resp.body = [ {
								type: 'io.odysz.semantic.jprotocol.AnsonResp',
								m: `Network failed: ${url}`
							} ];
						let ansonResp = new AnsonMsg<AnsonResp>(resp);
						if (typeof onErr.onError === 'function') {
							onErr.msg = ansonResp.Body().msg();
							onErr.onError(Protocol.MsgCode.exIo, ansonResp);
						}
						else throw Error("In anreact for typescript, onErr must be an ErrorCtx.")
					}
					else {
						if (resp.code || resp.port || !resp.status)
							resp = new AnsonMsg({
								port: resp.port,
								header: resp.header,
								body: [{type: 'io.odysz.semantic.jprotocol.AnsonResp',
										m: `Network failed: ${url}` } ]
							});
						else resp = AnClient.fromAjaxError(resp);

						if (typeof onErr.onError === 'function') {
							onErr.msg = resp.Body().msg();
							onErr.onError(Protocol.MsgCode.exIo, resp);
						}
						else throw Error("In anreact for typescript, onErr must be an ErrorCtx.")
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
     * @param jreq
     * @param ajaxOpts */
	postWait(jreq: AnsonMsg<AnsonBody>, ajaxOpts : AjaxOptions) {
		let me = this;
		return new Promise((resolve, reject) => {
			me.post(jreq,
				resp => {resolve(resp);},
				{ onError: (c, err) => {reject({c, err});} },
				ajaxOpts)
		});
	}

	// TODO moved to semantic resultset?
	/** Get the cols from jserv's rows
	 * (response from port returning AnsonMsg&lt;AnsonResp&gt;)
	 * @param resp
	 * @param ix index
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
     * @param resp
     * @param ix rs index
     * @return array of rows */
	respRows(resp: AnsonMsg<AnsonResp>, ix: number) {
		if (ix === null || ix === undefined )
			ix = 0;
		return resp !== null && resp !== undefined && resp.code === "ok"
			? resp.body[0].rs[0].results : [];
	}

    /** Get the objects from jserv's rows (response with AnResultset)
	 * @deprecated
     * @param resp
     * @param start start to splice
     * @param len max length
     * @return array of objects<br>
     * e.g [ [col1: cell1], ...] */
	respObjs(resp: AnsonMsg<AnsonResp>, start: number, len: number): Array<any> {
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
	 * @param ajaxResp
	 * @return a fake resposne built from ajax report
	 */
	static fromAjaxError(ajaxResp: AjaxReport): AnsonMsg<AnsonResp> {
		let json = {
			code: Protocol.MsgCode.exIo,
			body: [ {
				type: 'io.odysz.semantic.jprotocol.AnsonResp',
				m: 'Ajax: ' + ajaxResp.statusText,
			} ],
			ajax: {
				responseText: ajaxResp.responseText,
				statusText: ajaxResp.statusText,
				status: ajaxResp.status,
				readyState: ajaxResp.readyState
			} };
		return new AnsonMsg( json );
	}
}

export const an = new AnClient(undefined);

export type SessionInf = {
	type: "io.odysz.semantic.jsession.SessionInf";
	jserv: string | undefined;
	uid: string;
	usrName?: string;
	iv?: string;
	ssid: string;

	roleId?: string;
	roleName?: string
}

/**Client with session logged in.
 * Equivalent of java io.odysz.jclient.SessionClient;
 */
class SessionClient {
	an: AnClient;
	ssInf: SessionInf;

	currentAct: LogAct = {
		func: '',
		cmd: '',
		remarks: '',
		cate: ''
	};
	static get ssInfo() { return "ss-info"; }

	/**Create SessionClient with credential information or load from localStorage.
	 * Because of two senarios of login / home page integration, there are 2 typical useses:
	 *
	 * Use Case 1 (persisted):
	 *
	 * logged in, then create a client with response, save in local storage, then load it in new page.
	 *
	 * Use Case 2 (not persisted):
	 *
	 * logged in, then create a client with response, user's app handled the object,
	 * then provided to other functions, typicall a home.vue component.
	 *
	 * Note
	 *
	 * Local storage may be sometimes confusing if not familiar with W3C standars.
	 *
	 * The local storage can't be cross domain referenced. It's can not been loaded by home page
	 * if you linked from login page like this, as showed by this example in login.vue:
	 *
	 * window.top.location = response.home
	 *
	 * One recommended practice is initializing home.vue with login credential
	 * by login.vue, in app.vue.
	 *
	 * But this design makes home page and login component integrated. It's not
	 * friedly to application pattern like a port page with login which is independent
	 * to the system background home page.
	 *
	 * How should this pattern can be improved is open for discussion.
	 * If your are interested in this subject, leave any comments in wiki page please.
	 *
	 * @param ssInf login response form server: {ssid, uid}, if null, will try restore window.for localStorage
	 * @param iv iv used for cipher when login.
	 * @param dontPersist don't save into local storage.
	 */
	constructor (ssInf?: SessionInf, iv?: string | Uint8Array, dontPersist = false) {
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
		else if (!dontPersist) {
			this.ssInf = SessionClient.loadStorage();
		}

		this.an = an;
	}

	static loadStorage() {
		// skipped, created from local storage instead
		let ssInf: SessionInf;
		if (window && localStorage) {
			var sstr = localStorage.getItem(SessionClient.ssInfo);
			// What about refesh if removed this?
			// localStorage.setItem(SessionClient.ssInfo, '');
			if (sstr && sstr !== '' && sstr !== 'null') {
				ssInf = JSON.parse(sstr);
				ssInf.iv = aes.b64ToBytes(ssInf.iv);
				an.init(ssInf.jserv);
			}
			else
				console.error("Can't find credential in local storage. SessionClient deserializing failed.");
		} // else must be a test
		return ssInf;
	}

	static persistorage(ssInf: SessionInf) {
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

	/**
	 * Get a header the jserv can verify successfully.
	 * This method is not recommended used directly.
	 * @param {Object} act user's action for logging<br>
	 * {func, cate, cmd, remarks};
	 * @return the logged in header */
	getHeader(act: LogAct) {
		let header = Protocol.formatHeader(this.ssInf);
		/* FIXME
		 * FIXME Album can not be published without fixing this
		 * see AnSession.verify()
		let ssid = this.ssInf.ssid;
		let uid = aes.tokenize(ssInf, this.ssInf.uid);
		let header = Protocol.formatHeader({ssid, uid});
		*/
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

	// SsInf(ssInf: SessionInf) {
	// 	throw new Error('Method not implemented.');
	// }

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

	/**
	 * Encrypt text with ssInf token - the client side for de-encrypt semantics
	 *
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
	 * @param errCtx error handler of singleton. Since 0.9.32, this arg is required.
	 */
	commit (jmsg: AnsonMsg<AnsonBody>, onOk: OnCommitOk | undefined, errCtx: ErrorCtx) {
		an.post(jmsg, onOk, errCtx, undefined);
	}

	/**Post the request message (AnsonMsg with body of subclass of AnsonBody) synchronously.
	 * onOk, onError will be called after request finished.
	 * @param jmsg request message
	 * @param onOk
	 * @param onError
	 */
	commitSync(jmsg: AnsonMsg<AnsonBody>, onOk: OnCommitOk, onError: ErrorCtx) {
		this.an.post(jmsg, onOk, onError, {async: false});
	}

	/**
	 * create a query message.
	 * @param uri component uri
	 * @param maintbl target table
	 * @param alias target table alias
	 * @param pageInf<br>
	 * page: page index, -1 for no paging<br>
	 * size: page size, default 20, -1 for no paging
	 * @param act user's action for logging<br>
	 * {func, cate, cmd, remarks};
	 * @return the request message
	 */
	query ( uri: string, maintbl: string, alias: string, pageInf?: PageInf,
			act?: {func: string, cate: string, cmd: string, remarks: string} ) : AnsonMsg<QueryReq> {
		let qryItem = new QueryReq(uri, maintbl, alias, pageInf);

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
		return jreq as AnsonMsg<QueryReq>;
	}

	update(uri: string, maintbl: string, pk: PkVal, nvs: [string, string][] | NV[] | NameValue[] | Tierec) {
		if (this.currentAct === undefined || this.currentAct.func === undefined)
			console.error("Anclient is designed to support user updating log natively. User action with function Id shouldn't be ignored.",
						"To setup user's action information, call ssClient.usrAct().");

		if (pk === undefined) {
			throw new Error("To update a table, {pk, v} must presented.");
		}

		var upd = new UpdateReq(uri, maintbl, pk);
		upd.a = CRUD.u;
		this.currentAct.cmd = 'update';
		var jmsg = this.userReq(uri, 'update', upd, this.currentAct);

		if (nvs !== undefined) {
			if (Array.isArray(nvs))
				// FIXME no bugs here!
				if (len(nvs) > 0 && isNV(nvs[0]))
					upd.addNvrow(nvs as NV[]);
				else ;
			else if (typeof nvs === 'object')
				upd.record(nvs)
			else console.error("Updating nvs must be an array of name-value.", nvs)
		}
		return jmsg;
	}

	insert(uri: string | undefined, maintbl: string, nvs: Array<[string, string]> | Array<NV> | Array<NameValue>) {
		if (this.currentAct === undefined || this.currentAct.func === undefined)
			console.error("jclient is designed to support user updating log natively, User action with function Id shouldn't ignored.",
						"To setup user's action information, call ssClient.usrAct().");

		var ins = new InsertReq(uri, maintbl);
		this.currentAct.cmd = 'insert';
		var jmsg = this.userReq(uri, 'insert', ins, this.currentAct);

		if (nvs !== undefined) {
			if (Array.isArray(nvs) && nvs.length > 0 && Array.isArray(nvs[0]))
				ins.addArrow(nvs as Array<[string, string]>);
			else if (Array.isArray(nvs) && nvs.length > 0 && isNV(nvs[0]))
				ins.addNvrow(nvs as NV[] | NameValue[]);
			else console.error("Inserting row must be an array of name-value.", nvs)
		}
		return jmsg;
	}

	inserts(uri: string | undefined, maintbl: string, nvss: Array<Array<[string, string]>> | Array<NV[]> | Array<NameValue[]>) {
		debugger
		if (this.currentAct === undefined || this.currentAct.func === undefined)
			console.error("jclient is designed to support user updating log natively, User action with function Id shouldn't ignored.",
						"To setup user's action information, call ssClient.usrAct().");

		let ins = new InsertReq(uri, maintbl);
		this.currentAct.cmd = 'insert';
		let jmsg = this.userReq(uri, 'insert', ins, this.currentAct);

		nvss.forEach ((nvs: Array<[string, string]> | NV[] | NameValue[]) => {
			if (Array.isArray(nvs) && nvs.length > 0 && Array.isArray(nvs[0]))
				ins.addArrow(nvs as Array<[string, string]>);
			else if (Array.isArray(nvs) && nvs.length > 0 && isNV(nvs[0]))
				ins.addNvrow(nvs as NV[] | NameValue[]);
			else console.error("Rows must be an array of name-values' array.", nvs)
		});
		return jmsg;
	}

	delete(uri: string, maintbl: string, pk: PkVal | string[]) {
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
		upd.a = CRUD.d;
		this.currentAct.cmd = 'delete';

		let jmsg = this.userReq(uri,
				'update', // Protocol.Port.update,
				upd, this.currentAct);
		return jmsg;
	}

	getSks<T extends Tierec>(onLoad: OnLoadOk<T>, errCtx: ErrorCtx) {
		let req = this.userReq(null, 'datasetier',
					new DatasetierReq(undefined)
					.A(DatasetierReq.A.sks), undefined );

		this.commit(req,
			(resp: AnsonMsg<DatasetierResp>) => {
				// let {cols, rows} = AnsonResp.rs2arr(resp.Body().sks);
				let cols = resp.Body().sks;
				onLoad(cols, []);
			}, errCtx );
	}

	/**Use this to delete multiple records where pkn = pks[i]
	 * @param uri
	 * @param mtabl delete from the table
	 * @param pkn delete from the table
	 * @param pks delete from the table - pk values are automatically wrapped with ''.
	 * @return anson request
	 */
	deleteMulti(uri: string, mtabl: string, pkn: string, pks: Array<any>): AnsonMsg<UpdateReq> {
		let upd = new UpdateReq(uri, mtabl, undefined)
			.whereIn(pkn, pks);
		upd.a = CRUD.d;
		this.currentAct.cmd = 'delete';

		var jmsg = this.userReq(uri,
				'update', // Protocol.Port.update,
				upd, this.currentAct);
		return jmsg;
	}

	/**Create a user request AnsonMsg.
	 * @param uri component uri
	 * @param port
	 * @param bodyItem request body, created by like: new jvue.UserReq(uri, tabl).
	 * @param act action, optional.
	 * @return AnsonMsg */
	userReq<T extends AnsonBody>(uri: string, port: string, bodyItem: T, act?: LogAct): AnsonMsg<T> {
		if (!port)
			throw Error('AnsonMsg<UserReq> needs port explicitly specified.');

		let header = Protocol.formatHeader(this.ssInf);
		bodyItem.uri = uri || bodyItem.uri;
		if (typeof act === 'object') {
			// header.userAct = act;
			this.usrAct(act.func, act.cate, act.cmd, act.remarks);
		}
		return new AnsonMsg({ port, header, body: [bodyItem] });
	}

	/**Set user's current action to be logged.
	 * @param funcId curent function id
	 * @param cate category flag
	 * @param cmd
	 * @param remarks
	 * @return this */
	usrAct(funcId: string, cate: string, cmd: string, remarks?: string): this {
		Object.assign({}, this.currentAct,
			{func: funcId, cate: cate, cmd: cmd, remarks: remarks});
		return this;
	}

	/**Set user's current action to be logged.
	 * @param cmd user's command, e.g. 'save'
	 * @return this */
	usrCmd(cmd: string) : this {
		this.currentAct.cmd = cmd;
		return this;
	}

	logout(onOk: OnCommitOk, onError: ErrorCtx) {
		let header = Protocol.formatHeader(this.ssInf);
		let body = {type: "io.odysz.semantic.jsession.AnSessionReq", a: "logout"};
		let req = new AnsonMsg({port: 'session', header, body: [body]});

		an.post(req, function(r: AnsonMsg<AnsonResp>) {
        	localStorage.setItem(SessionClient.ssInfo, null);
			if (typeof onOk === 'function')
				onOk(r);
		},
		{ onError: (c, e) => {
        	localStorage.setItem(SessionClient.ssInfo, null);
		} });
	}
}

/**Client without session information.
 * This is needed for some senarios like rigerstering new accounts.*/
class Inseclient extends SessionClient {
	userId = 'localhost';

	/**
	 * @param opts
	 * @param opts.urlRoot jserv root
	 * @constructor
	 */
	constructor(opts: { urlRoot: string; }) {
		super(undefined, undefined, true);
		this.ssInf = {} as SessionInf;
		this.an = an;
		an.init(opts.urlRoot);
	}

	/**
	 * Get a header the jserv can verify successfully.
	 * This method is not recommended used directly.
	 * @param {Object} act user's action for logging<br>
	 * {func, cate, cmd, remarks};
	 * @return the logged in header */
	getHeader(act: LogAct) {
		let header = Protocol.formatHeader({ssid: this.ssInf.ssid, uid: this.ssInf.uid});
		return header;
		// return new AnHeader(this.ssInf.ssid, this.ssInf.uid);
	}
}

export * from './helpers';
export * from './protocol';
export * from './semantier';
export * from './stree-tier';
export {AnClient, SessionClient, Inseclient, aes};
