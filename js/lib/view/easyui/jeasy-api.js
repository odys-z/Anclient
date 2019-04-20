////////////////     engineering-costs project common      /////////////////////
// This part include a project configurations for jeasy-api, and an API which
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
window.J = J;

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
			typeof onError === "function" ? onError : EasyMsger.error);
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

function jeasyAPI (J, log) {
	{	this.c = 'I';
		this.r = 'R';
		this.u = 'U';
		this.d = 'D';

		this.J = J;
		this.log = log;
		this.mainRows = {};
	}

	/** Get rows from jclient response for easyui datagrid, etc.
	 * @param {object} resp jclient got response */
	this.rows = function (resp) {
		if (resp) {
			var cols = this.J.respCols(resp);
			var rows = this.J.respRows(resp);
			if (cols !== undefined && rows != undefined) {
				var rows2 = [];
				for (var rx = 0; rx < rows.length; rx++) {
					var ri = {};
					for (var cx = 0; cx < cols.length; cx++)
						ri[cols[cx]] = rows[rx][cx];
					rows2[rx] = ri;
				}
				return rows2
			}
		}
		return [];
	};

	/** get "total" from jclient response */
	this.total = function (resp, rsIx) {
		if (resp !== undefined && rsIx >= 0) {
			return resp.data.total[rsIx];
		}
	};


	/**Set main row when user selected a row in main list of a CRUD typical case.
	 * @param {string} listId easyui list id
	 * @param {object} easyui datagrid row that user selected
	 * @return {object} row found row or new set row.
	 */
	this.mainRow = function (listId, row) {
		var p = regex.desharp_(listId);
		this.mainRows[ p ] = row;
	}

	/**
	 * @return {object} row found row or new set row.
	 */
	this.getMainRow = function(listId) {
		var p = regex.desharp_(listId);
		return this.mainRows[ p ];
	}
}
