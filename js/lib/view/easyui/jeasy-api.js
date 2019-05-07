/**************       Sample project section     *******************************
 * A sample project usually have common module to configure jeasy API like this:
 * NOTE: Replace all '* /' with end of block comments - without space.
const jconsts = {
	serv: 'http://localhost:8080/semantic.jserv',
	conn: 'inet',
	/**datas.xml/sk * /
	sk: {
		menu: 'sys.menu.ez-test',
	}
}

const samports = {
	/** see semantic.jserv/io.odysz.jsample.SysMenu * /
	menu: "menu.serv",
	/** see semantic.jserv/io.odysz.jsample.cheap.CheapServ * /
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
 * /
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
					// store session info temperary locally - window url will be changed
					// a more secure way is using a certification.
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

	// A better way is using a certificate
	ssinf = $.cookie(ssk);
	if (ssinf)
		ssinf = JSON.parse(client.ssInf);
	return ssinf;
}

/**Check user's input
 * @param {string} logId
 * @param {string} pswd
 * @return {boolean} true = error()
 * /
function checkLogInput(logId, pswd) {
	var checkEasyUI = false;
	// check user inputs
}
******************       Sample project section end     ***********************/

///////////////////////   jeasy API version 1.0    /////////////////////////////
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
	{	// for shorter sentence
		this.c = jvue.Protocol.CRUD.c;
		this.r = jvue.Protocol.CRUD.r;
		this.u = jvue.Protocol.CRUD.u;
		this.d = jvue.Protocol.CRUD.d;

		this.J = J;
		this.log = log === false ? false : true;
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
	};

	/**
	 * @return {object} row found row or new set row.
	 */
	this.getMainRow = function(listId) {
		var p = regex.desharp_(listId);
		return this.mainRows[ p ];
	};

	/**Select row if row[idName] === selectId
	 * @param {Array} rows
	 * @param {Object} select {n, v}
	 * n: the field in row to be compared
	 * v: the value to be compared
	 * @return {Number} index in rows if found, or -1
	 */
	this.findRowIdx = function (rows, select) {
		if (typeof select === 'object') {
			var valName = Object.getOwnPropertyNames(select)[0];
			var val = select[valName];
			for (var ix = 0; ix < rows.length; ix++) {
				if (rows[ix][valName] == val) {
					return ix;
				}
			}
		}
		return -1;
	};

	/**create request JBody for adding post operation (no header etc.).
	 * @param {string} crud jeasy.c | r | u | d
	 * @param {Object} opts
	 * t: main table<br>
	 * pk: for where conditiong<br>
	 * nvs: for update values<br>
	 * cols: columns to be inserted<br>
	 * values: rows value for insert<br>
	 * @return {UpdateReq} with a = crud
	 */
	this.postBody = function (crud, opts) {
		if (crud === jeasy.c) {
			var ins = new jvue.InsertReq(null, opts.t);
			ins.a = crud;
			if (Array.isArray(opts.cols)) {
				ins.columns(opts.cols);
				ins.valus(opts.values);
			}
			else console.warn('WARN - inserting empty columns?', opts);
			return ins;
		}
		else {
			var upd = new jvue.UpdateReq(null, opts.t, opts.pk);
			upd.a = crud;
			upd.nv(opts.nvs)
			return upd;
		}
	}
}
const jeasy = new jeasyAPI(J);
