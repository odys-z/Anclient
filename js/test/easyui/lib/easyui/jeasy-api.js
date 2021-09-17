/**<h6>jeasy API version 1.0</h6>
 * <p>This part comes with the open source jclient.js.easyui.*.</p>
 * <p>Because the current project is not using webpack, so these parts are merged
 * into some js file for business module's convenient.</p>
 * @module jclient.js.easyui */

/**************       Sample project section     *******************************
 * A sample project usually have common module to configure jeasy API like this:
 * NOTE: Replace all '* /' with end of block comments - without space.
 *
 * application config
 * @module jserv-sample/easui-demo * /
const jconsts = {
	// if your tomcat server.xml is configured like:
	// <Context docBase="engcosts" path="/your-path reloadable="true"
	// 		source="org.eclipse.jst.j2ee.server:..."/></Host>
	// serv: 'http://localhost:8080/jserv-sample',
	conn: '...',
	// datas.xml/sk, sk for ir-combobox, ir-cbbtree shouldn't be here.
	sk: {
		menu: 'sys.menu.ez-test',
	},

	/** Application Message Strings, a callback called when jeasy-html.js loaded.
	 * @param {EzMsger} msger easyUI messager wrapper
	 * /
	initMsg: function (msger) {
		msger.setM('saved', 'Overriding mssage in your favor!');
	}
}

const samports = {
	/** see semantic.jserv/io.odysz.jsample.SysMenu * /
	menu: "menu.serv",
	/** see semantic.jserv/io.odysz.jsample.cheap.CheapServ * /
	cheapflow: "cheapflow.sample"
}

var An = jvue.an;
An.init(jconsts.serv, jconsts.conn);
window.An = An;

// otherwise jclient can't understand business defined ports.
An.understandPorts(engports);
* *******************    project configure section end    *********************/

//////////////////////////      Example Section     ////////////////////////////
/*******   Example: general way of handling complex data at server sied   ******
var conn = jconsts.conn;
// This function is requsting tools.serv for function branch 'A'
function saveToolA() {
	var dat = {borrowId: 'borrow-001', items: []};
	dat.items.push(['item001', 3]); // return 3 of tiem001

	var usrReq = new jvue.UserReq(conn, "r_tools_borrows") // req.tabl
						// turn back tools - or any function branch tag handled by tools.serv
						.A("A")

						// or reaplace these 2 set() with data(dat)
						.set('borrowId', 'borrow-001')
						.set('items', [['item001', 3]]);

	var jmsg = ssClient
		// ssClient's current user action is handled by jeasy when loading menu
		.usrCmd('save') // return ssClient itself
		.userReq(conn, engports.tools, usrReq); // return the AnsonMsg<UserReq> object

	// You should get sqls at server side (tools.serv) like this:
	// delete from r_tools_borrows where borrowId = 'borrow-001'
	// insert into detailsTbl  (item001) values ('3.0')
	// update borrowTbl  set total= where borrowId = 'borrow-001'
	ssClient.commit(jmsg, function(resp) {
				EasyMsger.ok(EasyMsger.m.saved);
			}, EasyMsger.error);
}
***************************** end of example section **************************/


/**Gloable variable, key of localStorage
 * For W3C standard, see: https://www.w3.org/TR/webstorage/#the-storage-interface<br>
 * For ussage, see: https://hacks.mozilla.org/2009/06/localstorage/<br>
 * and https://stackoverflow.com/questions/19861265/getting-the-value-of-a-variable-from-localstorage-from-a-different-javascript-fi*/
var ssk = jvue.SessionClient.ssInfo;
var ssClient;

function jeasyAPI (an, log) {
	{	// for shorter sentence
		this.c = jvue.Protocol.CRUD.c;
		this.r = jvue.Protocol.CRUD.r;
		this.u = jvue.Protocol.CRUD.u;
		this.d = jvue.Protocol.CRUD.d;

		this.an = an;
		this.log = log === false ? false : true;
		this.mainRows = {};

		an.opts({noNull: true, noBoolean: false, doubleFormat: '.2f'});
	}

	/** Get rows from jclient response for easyui datagrid, etc.
	 * @param {AnsonMsg} resp jclient got response
	 <pre>body: Array(1)
	 0: {type: "io.odysz.semantic.ext.AnDatasetResp", rs: Array(1), parent: "io.odysz.semantic.jprotocol.AnsonMsg", a: null, forest: null, …}
	 length: 1
	 __proto__: Array(0)
	 code: "ok"
	 header: null
	 opts: null
	 port: "dataset"
	 seq: 0
	 type: "io.odysz.semantic.jprotocol.AnsonMsg"
	 vestion: "1.0"</pre>
	 * @param {int} ixRs resultset index */
	this.rows = function (resp, ixRs) {
		if (resp) {
			var cols = this.an.respCols(resp, ixRs);
			var rows = this.an.respRows(resp, ixRs);
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
			// return resp.data.total[rsIx];
			return resp.body[0].rs[rsIx].total;
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

	/**create request AnsonBody for adding post operation (no header etc.).
	 * @param {string} crud jeasy.c | r | u | d
	 * @param {Object} opts
	 * t: main table<br>
	 * pk: for where conditiong<br>
	 * nvs: for update values<br>
	 * cols: columns to be inserted<br>
	 * values: rows value for insert<br>
	 * @return {UpdateReq} with a = <i>crud</i>
	 */
	this.postBody = function (crud, opts) {
		if (crud === jeasy.c) {
			var ins = new jvue.InsertReq(null, opts.t);
			ins.a = crud;
			if (Array.isArray(opts.cols)) {
				ins.columns(opts.cols);
				ins.nvRows(opts.values);
			}
			else console.warn('WARN - inserting empty columns?', opts);
			return ins;
		}
		else {

			var upd = new jvue.UpdateReq(null, opts.t, opts.pk);
			upd.a = crud;
			upd.nv(opts.nvs);
			return upd;
		}
	}
}
/** API wrapper for EasyUI */
const jeasy = new jeasyAPI(an);
