/**@module jeasy*/

//////////////////   jeasy API version 1.0    //////////////////////////////////
// This part comes from the open source jclient.js/easyui.
// Because the current project is not using webpack, so the two parts is merged
// into one js file for business module's convenient avoiding including 2 files.
////////////////////////////////////////////////////////////////////////////////
/** project utils
 * @module eng-cost/utils */
const jconsts = {
	serv: 'http://localhost:8080/semantic.jserv',
	conn: 'inet',
	/**datas.xml/sk */
	sk: {
		menu: 'sys.menu.ez-test',
	}
}

const samports = {
	/** see semantic.jserv/io.odysz.jsample.SysMenu */
	menu: "menu.sample",
	/** see semantic.jserv/io.odysz.jsample.cheap.CheapServ */
	cheapflow: "cheapflow.sample"
}

var J = jvue._J;
J.init(jconsts.serv, jconsts.conn);

// otherwise server can't understand business defined ports.
J.understandPorts(samports);


/**Login Utility.<br>
 * requesting login.serv with login-obj: <br>
 * {a: "login/logout", uid: "user-id", pswd: "uid-cipher-by-pswd", iv: "session-iv"}
 * @param {string} userId user id in plain
 * @param {string} pswd password in plain
 * @param {function} onLogin callback on logged in
 * @param {string} home main page url. default = index.html
 * @param {function} robotOnFailed callback if logId == 'robot' and failed on pswd or uid
 */
function login(logId, pswd, onLogin, home, onError) {
    var checkEasyUI = false;
    checkEasyUI = checkDevice(navigator.userAgent||navigator.vendor||window.opera);
	if (checkLogInput(logId, pswd))
		return;
	logId = logId.trim();

	localStorage.setItem(ssk, null);
	$.cookie(ssk, null, {path: "/", expires: 3000});
	J.login(logId, pswd,
			function(client) {
				ssClient = client;
				if (typeof onLogin === "function") {
					var ss = JSON.stringify(client.ssInf);
					localStorage.setItem(ssk, ss);
					$.cookie(ssk, ss, {path: "/", expires: 10000});
					onLogin(client);
				}
				else {
					console.error("onLogin is not a function");
				}
			},
			onError);
}

function loadSessionInf() {
	var ssinf = localStorage.getItem(ssk);
	if (ssinf)
		return JSON.parse(ssinf);

	ssinf = $.cookie(ssk);
	if (ssinf)
		ssinf = JSON.parse(client.ssInf);
	return ssinf;
}

/**Check user's input
 * @param {string} logId
 * @param {string} pswd
 * @return {boolean} true = error()
 */
function checkLogInput(logId, pswd) {
	var checkEasyUI = false;
	// check user inputs
}

//////////////////   jeasy API version 1.0    //////////////////////////////////
// This part comes from the open source jclient.js/easyui.
// Because the current project is not using webpack, so the two parts is merged
// into one js file for business module's convenient avoiding including 2 files.
////////////////////////////////////////////////////////////////////////////////
/** html tag ids and supported ir-attrs
 * @module jeasy/session */

/**Gloable variable, key of localStorage
 * For W3C standard, see: https://www.w3.org/TR/webstorage/#the-storage-interface<br>
 * For ussage, see: https://hacks.mozilla.org/2009/06/localstorage/<br>
 * and https://stackoverflow.com/questions/19861265/getting-the-value-of-a-variable-from-localstorage-from-a-different-javascript-fi*/
var ssk = jvue.SessionClient.ssInfo;
var ssClient;

/** Set by initFunctree.onSelect();
 * consumed by formatHeader().
 */
function setUserAction (funcId, funcName, url, cmd) {
	var sstr = localStorage.getItem(ssk);
	if(sstr != null && typeof sstr != "undefined" && sstr.length > 0) {
		var ssinf = JSON.parse(sstr);
		if (funcId === null)
			funcId = ssinf.userAct.funcId;
		if (funcName === null)
			funcName = ssinf.usrAct.funcName;
		if (url === null)
			url = ssinf.usrAct.url;
		ssinf.usrAct = {
			funcId: funcId,
			funcName: funcName,
			url: url,
			cmd: cmd
		};
		localStorage.setItem(ssk, JSON.stringify(ssinf));
	}
}

function setUserActionCmd(cmd) {
	var sstr = localStorage.getItem(ssk);
	if(sstr != null && typeof sstr != "undefined" && sstr.length > 0) {
		var ssinf = JSON.parse(sstr);
		ssinf.usrAct.cmd = cmd;
		localStorage.setItem(ssk, JSON.stringify(ssinf));
	}
}
