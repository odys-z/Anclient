export const an: AnClient;
export * from "./protocol.js";
export * from "./semantier.js";
/**An client.js core API
 * Java equivalent of
 * io.odysz.jclient.Clients;
 * @property cfg the configurations,<br>
 * cfg.connId,<br>
 * cfg.defaultServ:<br>
 * where defaultserv is the serv root, will be concated with port name for different poert.
 */
export class AnClient {
    /**Check Response form jserv
     * @param {any} resp
     */
    static checkResponse(resp: any): false | "err_NA";
    /** Try change ajax error object to AnsonMsg<AnsonResp>
     * @param {object} ajaxResp
     * @return {AnsonMsg<AnsonResp>}
     */
    static fromAjaxError(ajaxResp: object): any;
    /**@param {string} serv serv path root, e.g. 'http://localhost/jsample'
     */
    constructor(urlRoot: any);
    cfg: {
        defaultServ: any;
    };
    /**Get port url of the port.
     * @param {string} port the port name
     * @return the url
     */
    servUrl(port: string): string;
    /** initialize with url and default connection id
     * @param {stirng} urlRoot root url
     * @param {string} connId @deprecated connection Id
     * @retun {An} this */
    init(urlRoot: any, connId: string): AnClient;
    /** Understand the prots' name of the calling app's.<br>
     * As jclient defined the basice ports, more ports extension shoould been understood by the API lib.
     * This function must been callded to extned port's names.
     * @param {string} new Ports
     * @return {An} this */
    understandPorts(newPorts: any): any;
    opts(options: any): void;
    port(name: any): any;
    /**Login to jserv
     * @param {string} usrId
     * @param {string} pswd
     * @param {function} onLogin on login ok handler
     * @param {function} on failed
     */
    login(usrId: string, pswd: string, onLogin: Function, onError: any): void;
    loginWait(usrId: any, pswd: any): Promise<any>;
    /**Create a user request AnsonMsg for no-ssession request (on connId can be specified).
     * @param {string} port
     * @param {Protocol.UserReq} bodyItem request body, created by like: new jvue.UserReq(conn, tabl).
     * @return {AnsonMsg<AnUserReq>} AnsonMsg */
    restReq(port: string, bodyItem: any): any;
    /**Post a request, using Ajax.
     * @param {AnsonMsg} jreq
     * @param {function} onOk
     * @param {function} onErr function (MsgCode, AnsonResp?)
     * @param {object} ajaxOpts */
    post(jreq: AnsonMsg, onOk: Function, onErr: Function, ajaxOpts: object): void;
    /**Async-await style posting a request, using Ajax.
     * @param {AnsonMsg} jreq
     * @param {object} [ajaxOpts] */
    postWait(jreq: AnsonMsg, ajaxOpts?: object): Promise<any>;
    /** Get the cols from jserv's rows
     * (response from port returning AnsonMsg&lt;AnsonResp&gt;)
     * @param {AnsonMsg<AnsonResp>} resp
     * @param {ix} the rs index
     * @return {array} array of column names */
    respCols(resp: any, ix: any): any[];
    /** Get the rows from jserv's rows.
     * (response from port returning AnsonMsg&lt;AnsonResp&gt;)
     * @deprecated
     * @param {AnsonMsg<AnsonResp>} resp
     * @param {ix} the rs index
     * @return {array} array of rows */
    respRows(resp: any, ix: any): any[];
    /** Get the objects from jserv's rows (response from port returning SResultsets)
     * @deprecated
     * @param {AnsonMsg<AnsonResp>} resp
     * @param {int} start start to splice
     * @param {int} len max length
     * @return {array} array of objects<br>
     * e.g [ [col1: cell1], ...] */
    respObjs(resp: any, start: any, len: any): any[];
}
/**Client with session logged in.
 * Equivalent of java io.odysz.jclient.SessionClient;
 */
export class SessionClient {
    static get ssInfo(): string;
    static loadStorage(): any;
    static persistorage(ssInf: any): void;
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
     * @param {object} [ssInf] login response form server: {ssid, uid}, if null, will try restore window.for localStorage
     * @param {byte[]} [iv] iv used for cipher when login.
     * @param {boolean} [dontPersist=false] don't save into local storage.
     */
    constructor(ssInf?: object, iv?: any[], dontPersist?: boolean);
    ssInf: any;
    an: AnClient;
    get userInfo(): any;
    consumeNotifies(): any;
    /**Get a header the jserv can verify successfully.
     * This method is not recommended used directly.
     * @param {Object} act user's action for logging<br>
     * {func, cate, cmd, remarks};
     * @return the logged in header */
    getHeader(act: any): AnHeader;
    setPswd(oldPswd: any, newPswd: any, opts: any): SessionClient;
    /**Encrypt text with ssInf token - the client side for de-encrypt semantics
     * @param {string} plain plain text
     * @return {object} {cipher, iv}
     */
    encryptoken(plain: string): object;
    /**Post the request message (AnsonMsg with body of subclass of AnsonBody).
     * @param {AnsonMsg} jmsg request message
     * @param {function} onOk
     * @param {function} onError
     */
    commit(jmsg: AnsonMsg, onOk: Function, onErr: any): void;
    /**Post the request message (AnsonMsg with body of subclass of AnsonBody) synchronously.
     * onOk, onError will be called after request finished.
     * @param {AnsonMsg} jmsg request message
     * @param {function} onOk
     * @param {function} onError
     */
    commitSync(jmsg: AnsonMsg, onOk: Function, onError: Function): void;
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
    query(uri: string, maintbl: string, alias: string, pageInf: any, act: any): AnsonMsg;
    update(uri: any, maintbl: any, pk: any, nvs: any): any;
    insert(uri: any, maintbl: any, nvs: any): any;
    delete(uri: any, maintbl: any, pk: any): any;
    getSks(port: any, onLoad: any): void;
    /**Use this to delete multiple records where pkn = pks[i]
     * @param {string} uri
     * @param {string} mtabl delete from the table
     * @param {string} pkn delete from the table
     * @param {array} pks delete from the table - pk values are automatically wrapped with ''.
     * @return {AnsonMsg<UpdateReq>} anson request
     */
    deleteMulti(uri: string, mtabl: string, pkn: string, pks: any[]): any;
    /**Create a user request AnsonMsg.
     * @param {string} uri component uri
     * @param {string} port
     * @param {Protocol.UserReq} bodyItem request body, created by like: new jvue.UserReq(uri, tabl).
     * @param {Object} act action, optional.
     * @return {AnsonMsg<AnUserReq>} AnsonMsg */
    userReq(uri: string, port: string, bodyItem: any, act: any): any;
    /**Set user's current action to be logged.
     * @param {string} funcId curent function id
     * @param {string} cate category flag
     * @param {string} cmd
     * @param {string} remarks
     * @return {SessionClient} this */
    usrAct(funcId: string, cate: string, cmd: string, remarks: string): SessionClient;
    currentAct: {};
    /** For name errata? */
    userAct(f: any, c: any, m: any, r: any): void;
    /**Set user's current action to be logged.
     * @param {string} cmd user's command, e.g. 'save'
     * @return {SessionClient} this */
    usrCmd(cmd: string): SessionClient;
    logout(onOk: any, onError: any): void;
}
/**Client without session information.
 * This is needed for some senarios like rigerstering new accounts.*/
export class Inseclient extends SessionClient {
    /**
     * @param {object} opts
     * @param {string} opts.urlRoot
     * @constructor
     */
    constructor(opts: {
        urlRoot: string;
    });
    userId: string;
}
/**The lower API of jclient/js
 * @module anclient/js/core
 * */
/**
 * AES instance
 * @type {AES}
 * */
export const aes: AES;
import { AnsonMsg } from "./protocol.js";
import { AnHeader } from "./protocol.js";
import AES from "./aes.js";
