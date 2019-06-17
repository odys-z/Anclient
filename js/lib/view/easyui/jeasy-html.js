
/** easyui html handler
 * <p>Easyui is html based api. All jclient integration is via html intervention.</p>
 * <p>This module is a helper for handling html tag attribute string parsing.</p>
 * @module jeasy/html */

if (J === undefined)
	console.error("You need initialize J - use <script>jeasy-api.js</script> first.");

/**This port instance should arleady understand application's prots
 * - initialized in project's frame */
const Port = jvue.Protocol.Port;

/** attribute names in html tag defining attres for handling by jeasy-html frame */
const ir = {
	/** target name, pager use ir-grid, grid use ir-t*/
	t: "ir-t",
	/** e.g. ds.sql-key in dataset.xml, shouldn't used in html in jeasy v1.0
	 * TODO Planning to support client defined query. */
	sk: 'ir-sk',

	root: 'ir-root',
	/** grid item on select handler name (according easyUI document, there is not 'onChange')*/
	onselect: "ir-onselect",
	onchange: "ir-onchange",

	oncheck: "ir-oncheck",
	onload: "ir-onload",
	oncheckAll: "ir-oncheck-all",

	/**EasyUI grid can be configured with sk.
	 * a.k.a. ir-grid, used by pager to specify grid id. */
	grid: 'ir-grid',

	/**EasyUI treegrid can be configured with sk.
	 * a.k.a. TODO ir-treegrid, used by pager to specify grid id. */
	treegrid: 'ir-treegrid',

	/* easyui "data-options", alias is defined here, e.g. alais = "field: personName" */
	ezDataopts: 'data-options',

	expr: 'ir-expr',
	/** Field name in form, which is to be loaded as record's alias, like "field" of easyui datagrid data-options*/
	field: 'ir-field',

	orderby: 'ir-orderby',

	groupby: 'ir-groupby',

	/** intial page size, later will using easyui pagination's size (by EzGrid.page()) */
	pagesize: 'ir-size',

	/** ? ? */
	checkexpr: 'ir-checkexpr',

	/** combobox */
	combobox: 'ir-cbb',

	/**EasyUI tree can be configured with sk. */
	tree: 'ir-tree',

	/**EasyUI combotree can be configured with sk. */
	cbbtree: 'ir-cbbtree',

	/** query from */
	query: 'ir-query',

	all: 'ir-all',

	/**The row in a grid/tree/cbb to be selected:
	 * ir-select = "field-name: variable" */
	select: 'ir-select',

	/** Modal dialog form tag, value = callback-name: ir-modal='onModal' */
	modal: 'ir-modal',

	deflt: {
		gridId: 'irlist',
		treeId: 'irtree',
		cbbtreeId: 'cbbirtree',
		pagerId: 'irpager',
		queryId: 'irquery',
		modalId: 'irmodal',
		cbbId: 'ircbb',
		_All_: '-- ALL --',
	},
};

/* test helper:
 * http://www.regular-expressions.info/javascriptexample.html
 */
const regex = {
	/**reqex for ir-t maintable
	 * [0] aUser:b
	 * [1] aUser
	 * [2] :b
	 * [3] b */
	maintbl: /\s*(\w+)\s*(:\s*(\w+))?/i,

	// deprecated join: /\s*([jJrRlL])\s*:\s*(\w+)(\s*:\s*(\w+)){0,1}\s+(.+)\s*/i,
	/**regex for matching join definition is html.<br>
	 * deprecated :<br>
	 * [0] j:b_cates:t1   person=b_cates.persId 'v' % t1.col <br>
	 * [1] j <br>
	 * [2] b_cates <br>
	 * [3]  : t1 <br>
	 * [4] t1 <br>
	 * [5] person=b_cates.persId 'v' % t1.col <br>

	 * [0] j:{@tb}:a a.x=b.y <br>
	 * [1] j <br>
	 * [2] {@ <br>
	 * [3] tb <br>
	 * [4] } <br>
	 * [5] :a <br>
	 * [6] a <br>
	 * [7] a.x=b.y <br>

	 * [0] j:tb :a a.x=b.y and a.z=c.w <br>
	 * [1] j <br>
	 * [2] undefined <br>
	 * [3] tb <br>
	 * [4] undefined  <br>
	 * [5] :a <br>
	 * [6] a <br>
	 * [7] a.x=b.y and a.z=c.w <br>
	 */
	join: /\s*([jJrRlL])\s*:\s*(\{\@)?\s*(\w+)\s*(\})?(\s*:\s*(\w+)){0,1}\s+(.+)\s*/i,

	/**Regex for replacing variable in joining's ON condition.<br>
	 * [0] abc = {@ x.y} devi=ccd
	 * [1] abc =
	 * [2] x.y
	 * [3] devi=ccd
	 * FIXME V0.2 we can parsing multiple variable expression. Here is an example:
	 * [0] abc = {@ x.y} devi=ccd abc = {@ x.y} devi=ccd
	 * [1] abc = {@ x.y} devi=ccd abc =
	 * [2] x.y
	 * [3] devi=ccd
	 * */
	onCondParm: /\s*(.*)\{\@\s*(.+)\s*\}(.*)/i,

	/* e.g. b_articles.pubDate desc
	 * TEST1: [0]a.FullPath desc [1]a. [2]a [3]FullPath [4] desc [5]desc
	 * TEST2: [0]FullPath desc [1]undefined [2]undefined [3]FullPath [4] desc [5]desc
	 * TEST3: [0]FullPath [1]undefined [2]undefined [3]FullPath [4] undefined [5]undefined
	 */
	order: /\s*((\w+)\.){0,1}(\w+)(\s+(asc|desc|ASC|DESC){0,1}){0,1}\s*/i,

	/**regex for matching expr like "field:sqlAlias"*/
	alais: /field\s*:\s*\'(\w+)\'/i,

	/**
	 * [0] x.y.z.c
	 * [1] x
	 * [2] y.z.c
	 */
	vn: /\s*(\w+)\.(.*)/i,

	/** Parse string like "ds.sql-key arg1, {@obj.var1}, arg2, ..."*/
	cbbArg: /\{\@\s*(.+)\s*\}/i,

	/**Add # at start if none
	 * @param {string} str
	 * @param {string} defltStr default if  str is undefined or null
	 * @return {string} "#str" */
	sharp_: function (str, defltStr) {
		if (str === undefined || str === null )
			str = defltStr;
		if (typeof str === "string" && str.substring(0, 1) !== '#')
			return '#' + str;
		return str;
	},

	/**Add # at start if none
	 * @param {string} str string with or without a starting '#'
	 * @return {string} "str" without starting '#' */
	desharp_: function (str) {
		if (typeof str === "string" && str.substring(0, 1) === '#')
			return str.substring(1);
		return str;
	},

	/**split target with <i>separator</i> then the the ith element
	 * @param {string} target
	 * @param {string} separator
	 * @param {int} ith optinal.<br>If undefined, return all splitted array
	 * @return {Array|string} the ith element or all the array.
	 */
	split: function (target, separator, ith) {
		if (target === undefined) { return; }

		if (separator === undefined) {
			console.error('can not separate', separator, target);
			return;
		}

		target = target.trim();

		if (separator != ',') {
			console.error('Your separator not supported yet...', separator);
		}

		var ss = target.split(/\s*,\s*/);

		if (ith !== undefined) { return ss[ith]; }
		else { return ss; }
	},

	/** t.col won't match */
	col_without_tbl: /^\s*(\w+)\s*$/i,

	isblank: jvue.Jregex.isblank,
};

/**[Internal API] html tag's attribute parser.
 * Parsing ir-expr="max(t.col)", etc.
 */
function Tag (debug) {
	this.debug = debug;

	/**Try supplement jsvar with html tag's attributes
	 * @param {any} jsvar
	 * @param {string} targId html tag id.
	 * @param {string} attr html attribute name */
	this.merge = function(jsvar, tagId, attr) {
		if (jsvar !== undefined && jsvar !== null)
			return jsvar;
		if (typeof tagId === 'string' && typeof attr === 'string') {
			tagId = regex.sharp_(tagId);
			return $(tagId).attr(attr);
		}
	};

	/**<p>Try merge arg references in sk string into opts.sqlArgs, rethrn the splited sk.</p>
	 * Output: opts.sqlArgs<br>
	 * Input: opts.args, sk string<br>
	 * That means this function also change data in opts.
	 * @param {Object} opts
	 * @param {string} sk string like that from ir-tree, ir-cbb, etc.
	 * @return {Array} sk (first splited string in parameter sk) */
	this.mergargs = function(opts, sk) {
		// if (sk === undefined || sk === null)
		// 	console.error(ir.cbbtree + " attr in " + treeId + " is undefined. In jeasy v1.0, only configurd combobox is suppored (must have ir-sk).");
		// else {
		// 	var parsed = tag.parseSk(sk, opts.args);
		// 	sk = parsed.shift();
		// 	if (sqlArgs === undefined)
		// 		sqlArgs = [];
		// 	sqlArgs = sqlArgs.concat(parsed);
		// }

		// if (sk === undefined || sk === null)
		// 	console.error("sk attr in is undefined. In jeasy v1.0, only configurd dataset is suppored - must have sk in ir-tree, ir-combbox etc.",
		// 			opts, sk);
		// else {
			var parsed = tag.parseSk(sk, opts.args);
			sk = parsed.shift();
			if (opts.sqlArgs === undefined)
				opts.sqlArgs = [];
			else if (typeof opts.sqlArgs === 'string')
				opts.sqlArgs = [opts.sqlArgs];
			opts.sqlArgs = opts.sqlArgs.concat(parsed);
			return sk;
		// }
	};

	/**Format table-joins request array: [{tabl, t, on, as}], used for QueryReq.join(...).
	 * @param {string} t "b_articles, j:b_cate, l:b_author:a authorId=authorId and a.name like 'tom'"
	 * @return {Array} [{tabl, t, on, as}], where t = main-table | j | r | l
	 */
	this.joins = function (t, joins) {
		var tss = t.split(','); // [t1, j:b_cates[:alais] cateId=cateId, ...]
		var tabls = new Array();

		for(var i = 0; i < tss.length; ++i) {
			var m = regex.join.exec(tss[i]);
			if(m) {
				// [0] j:{@tb}:a a.x=b.y[1] j
				// [2] {@  (undefined)	[3] tb		[4] } (undefined)
				// [5] :a				[6] a		[7] a.x=b.y

				// try match variable in ON condition
				var oncond = m[7];
				// mOnVar = x.y
				var mOnVar = regex.onCondParm.exec(m[7]);
				if (mOnVar) {
					// if there is variable in on condtion clause, replace with value
					// No need to parse all logic condition to array
					var v = this.findVar(mOnVar[2]);
					if (typeof v !== "undefined") {
						// if (typeof v.length === "number")
						if (Array.isArray(v))
							oncond = mOnVar[1] + this.concatArray(v);
						else
							oncond = mOnVar[1] + "'" + v + "'";
					}
					else {
						if (this.debug) console.log('WARN - found parameter condition '
								+ m[7] + ' in table joining, but no variable can be used to replace the variable.' )
						oncond = mOnVar[1] + "'" + mOnVar[2] + "'";
					}
					if (mOnVar.length > 2)
						oncond = oncond + mOnVar[3];
				}

				//tabls.push({"t": m[1], "tabl": m[2], "as": m[4], "on": m[5]});
				if (m[2] === '{@' && m[4] === '}') {
					// sub select joining
					if (joins === undefined || typeof joins[m[3]] !== 'object') {
						console.error('You sepcified using sub query as joining table, but can not found the definition',
										m, joins);
					}
					else {
						var subselect = joins[m[3]];
						tabls.push({"t": m[1], "tabl": subselect, "as": m[6], "on": oncond});
					}
				}
				else
					tabls.push({"t": m[1], "tabl": m[3], "as": m[6], "on": oncond});
			}
			else {
				var mt = regex.maintbl.exec(tss[i]);
				// " aUser:b" = aUser:b, aUser, :b, b
				if (mt[1] === undefined)
					console.error("Can't parse main table: " + tss[i]);
				else
					tabls.push({"t": "main-table", "tabl": mt[1], "as": mt[3]});
			}
		}
		return tabls;
	};

	/** Convert js array into stirng quoted with "'"
	 * @param {array} arr
	 * @return {string} ('el1', ...)
	 */
	this.concatArray = function (arr) {
		var buf = "(";
		for (var ix = 0; ix < arr.length; ix++) {
			if (buf !== "(")
				buf += ", ";
			buf += "'" + arr[ix] + "'";
		}
		return buf + ")";
	};

	/**Find j-orderby tag and compose order-by request array:<br>
	 * [{"tabl": tabl, "field": column, "asc": "asc/desc"}, ...]
	 * @param {string} ordstr string in j-order="t.col asc/desc"
	 * @param {string} maintabl
	 */
	this.orders = function(ordstr, maintabl) {
		if (typeof ordstr !== 'string')
			return;

		var orders = new Array();
		var ordss = ordstr.split(',');
		for(var i = 0; i < ordss.length; ++i) {
			var match = regex.order.exec(ordss[i]);
			if (match) {
				var asc = "asc";
				if(typeof match[5] != "undefined" && match[5] == "desc")
					asc = "desc";
				var tabl = maintabl;
				if(match[2] !== undefined)
					tabl = match[2];
				if(match[3] === undefined) {
					// col can't be null
					alert("Someting wrong in html: " + ordstr);
					return orders;
				}
				// orders.push({"tabl": tabl, "col": match[3], "asc": asc });
				orders.push( [tabl + "." + match[3], asc] );
			}
		}
		return orders;
	};

	this.groups = function(grpstr) {
		if (typeof grpstr !== 'string')
			return;

		var grps = new Array();
		var grpss = grpstr.split(',');
		return grpss;
	};

	/**Match expr in "target" with regexAlais.
	 * @param {string} target: string to be matched
	 * @return {string} alais name of sql expr
	 * */
	this.findAlais = function (target) {
		var match = regex.alais.exec(target);
		if(match)
			return match[1];
		else {
			console.log("ERROR - can't parsing field expression: " + target);
			return target;
		}
	};

	/**find var from string like "x.y.z"
	 * If not found, the vn will be returned, no error reported.
	 * This is for auto form bounding, where this is common for many widgets.
	 * @param {string} vn var name
	 * @param {Object} argPool args buffer for looking varialbkles, if not found, try in window globaly.
	 * @return {Object} value represented by vn, e.g. "x.y.z" */
	this.findVar = function (vn, argPool) {
		// vn is a global variable
		if (window[vn] !== undefined)
			return window[vn];
		// vn is a variable in argPool
		if (argPool !== undefined && argPool[vn] !== undefined)
			return argPool[vn];

		// now vn must has at least one "."
		var v = window;
		var field;

		var vnss = regex.vn.exec(vn);
		// found a null value
		if (vnss === null)
			// return null;
			return vn;

		// does arg pool has the variable?
		if (argPool !== undefined && argPool[vnss[1]] !== undefined) {
			v = argPool[vnss[1]];
			field = vnss[2];
			vnss = regex.vn.exec(vnss[2]);
		}

		while (vnss) {
			if (v[vnss[1]]) {
				v = v[vnss[1]];
				field = vnss[2];
				vnss = regex.vn.exec(vnss[2]);
			}
			else break;
		}

		if (v === window) {
			if (window[vn])
				return window[vn];
			else {
				// console.error("Can't find variable for " + vn);
				return vn;
			}
		}
		else if (typeof v === "object") {
			if (typeof v[field] === "function")
				return v[field]();
			else return v[field];
		}
		else return v;
	};

	/** Parse String like "ds.sql-key arg1, {@obj.var1}, arg2, ..."
	 * @param {string} irsk
	 * @param {Object} argBuff
	 * @return {Array} [0] ds, [1] sql-key, [2] argBuff + [arg1, var1, arg2, ...]
	 */
	this.parseSk = function (irsk, argBuff) {
		if ( irsk === null || typeof irsk === "undefined" )
			return [];

		var args = [];
		var skss = irsk.trim().split(",");

		var sk = skss[0];
		if (sk.substring(0, 4) === "cbb.") {
			// fault tolerance to old version
			console.warn("sk's table name (cbb) ignored. In jeasy v1.0, there is only 1 xml table configued in dataset.xml.")
			sk = sk.substring(4);
		}
		args.push( sk );

		// replace variables
		// var regexCbbArg = /{\@\s*(.+)\s*\}/g;
		for ( var ix = 1; ix < skss.length; ix++ ) {
			var mOnVar = regex.cbbArg.exec( skss[ix] );
			if ( mOnVar ) {
				var v = tag.findVar( mOnVar[1], argBuff );
				args.push (v);
			}
			else
				args.push (skss[ix]);
		}
		return args;
	};

	/** Does the col name (ir-expr) don't have an alias ?
	 * @param {string} tblCol
	 * @return {boolean} true: yes, has an alias or table name.*/
	this.colHasTblAlias = function(tblCol) {
		if (regex.col_without_tbl.exec(tblCol))
			return false;
		else return true;
	};

	/** Parse String like "ds.sql-key arg1, {@obj.var1}, arg2, ..."
	 * @param {string} irselect e.g. "roleId: {@roleId}, ...", or "roleId: {@role.roleId}"
	 * @param {Object} argBuff e.g. {roleId: 'aaa'}
	 * @return {Array} e.g. {roleId: roleId's value('aaa'), ...}
	this.parseSelect = function (irselect, argBuff) {
		if ( irselect === null || irselect === undefined )
			return {};

		var args = {};
		var nvss = irselect.trim().split(",");

		// replace variables
		// var regex.cbbArg = /\{\@\s*(.+)\s*\}/g;
		for ( var ix = 1; ix < nvss.length; ix++ ) {
			var nvs = nvss[ix].split(":");
			var mOnVar = regex.cbbArg.exec( nvs[1] );
			var nv = {}	// found selecting n-v
			if ( mOnVar ) {
				var v = tag.findVar( mOnVar[1], argBuff );
				nv[nvs[0].trim()] = v;
			}
			else
				nv[nvs[0].trim()] = nvss[ix];
			Object.assign(args, nv);
		}
		return args;
	}
	 */
};
const tag = new Tag(jeasy.log);

/**[Internal API] Common handlers for ir attributes, like ir-t, ir-list etc.*/
function EzHtml (J) {
	/**Get attr value from tag-id */
	this.ir = function (tagId, atr) {
		// if (tagId.substring(0, 1) != "#")
		// 	tagId = "#" + tagId;
		tagId = regex.sharp_(tagId);
		var a = $(tagId).attr(atr);
		return a;
	};

	this.has = function (tagId, atr) {
		var a = this.ir(tagId, atr);
		return a !== undefined;
	};

	/**@deprecated: as all options using opts() merging attributes, this function should deprecated.
	 * Parse table and joinning definition in html
	 * @param {string} pagerId pager id. default "irpager"
	 * @return {Array} [{t: "main-table/j/r/l", tabl: "table-1", as: "alais", on: cond-string}]<br>
	 * where cond-string = "col1=col2"
	 */
	this.tabls = function (gridId, extJoins) {
		var t = this.ir(gridId, ir.t);
		if (t === undefined)
			console.error("In jeasy api v1.0, pager's t is moved to list/grid/details-form's tag - must presented there.");
		else
			return tag.joins(t, extJoins);
	}

	/**Find th-expr definitons in easyui list/grid head.
	 * @param {string} gridId list id to be bind
	 * @param {string} defltabl main table name, used as html ignored table name
	 * @return {Array} [{expr: col, gfunc, tabl, as: c1}, ...]
	 */
	this.thExprs = function (gridId, defltabl) {
		if (defltabl) defltabl = defltabl.trim();

		var ths = $(gridId + " th");
		var exprs = new Array();

		var al_k = {}; // for checking duplicated alais

		for(var i = 0; i < ths.length; ++i) {
			var expr = {};
			var th = ths[i];
			var al = tag.findAlais($(th).attr(ir.ezDataopts));
			expr.alais = al;

			if(al_k[al]) {
				console.log("WARN - found duplicating alais: " + al + ". Ignoring...");
				continue;
			} else al_k[al] = true;

			// can handle raw expr (user specified expression)
			var exp = $(th).attr(ir.expr);
			if (typeof exp === "string")
				exprs.push({exp: exp, as: al});
			else
				exprs.push({exp: al, as: al});
		}
		return exprs;
	};

	/**Find field-expr definitons in easyui list/grid head.
	 * @param {string} gridId list id to be bind
	 * @param {string} defltabl main table name, used as html ignored table name
	 * @return {Array} [{expr: col, gfunc, tabl, as: c1}, ...]
	 */
	this.formExprs = function (formId, defltTabl) {
		var exprs = [];
		$(formId + " ["+ ir.field + "]").each( function(key, domval) {
			var as = this.attributes[ir.field] === undefined ?
						undefined : this.attributes[ir.field].value;
			var expr = this.attributes[ir.expr] === undefined ?
						undefined : this.attributes[ir.expr].value;
			if (expr === undefined)
				expr = as;
			if (defltTabl) {
				if (tag.colHasTblAlias(expr)) {
					exprs.push({exp: expr, as: as});
				}
				else {
					exprs.push({exp: defltTabl + "." + expr, as: as});
				}
			}
			else {
				exprs.push({exp: expr, as: as});
			}
		} );
		return exprs;
	};

	/**Collect all cheched items from easyui treee.
	 * @param {string} treeId
	 * @param {Object} opts options:<br>
	 * cols: {p1: v1, p2: v2, ...}<br>
	 * 		p: the DB field name, v: the easy tree item's propterty where the value will be got.<br>
	 * append: {p1: v1, ...} appending values, e.g. {role: '0101'} is used to get all functions of role 0101.<br>
	 * check: checked column name, OPTIONAL<br>
	 * @return {Array} columns to be insert / update, etc.<br>
	 *	 [ [ [ "funcId", "1A"   ],		- value-row 0, col 0 (funcId)<br>
	 *	     [ "roleId", "0101" ],		- value-row 0, col 1 (this.roleId == '0101')<br>
	 *	   ],<br>
	 *	   [ [ "funcId", "0101" ],		- value-row 1, col 0 (funcId)<br>
	 *	     [ "roleId", "0101" ],		- value-row 1, col 1 (this.roleId == '0101')<br>
	 *	 ]<br>
	 *	 this means two records will be inserted like<br>
	 *	 insert a_role_funcs (funId, roleId) values ('1A', '0101'), ('0101', '0101')<br>
	 * TODO may be we can support ir-checkTreeItem ="field: value, ..."?, but user must know easyUI item's properties?
	 */
	this.checkedTreeItem = function (treeId, opts) {
		var nodes;
		if (opts !== undefined && typeof opts.eztype === 'string')
		 	nodes = $(regex.sharp_(treeId, ir.deflt.treeId))[opts.eztype]('getChecked');
		else
			// use tree as default
		 	nodes = $(regex.sharp_(treeId, ir.deflt.treeId)).tree('getChecked');

		if (nodes === undefined) {
		 	if (jconsts.verbose < 3) {
				console.error('can not collect checked items. ', treeId, opts);
			}
			return [];
		}

		var eaches = new Array();
		var colnames = new Array();
		var first = true;
		for (var i = 0; i < nodes.length; i++) {
			var r = [];

			if (opts.cols) {
				Object.keys(opts.cols).forEach(function (k, ix) {
					// opts.cols.k = ez-name, so r.k <= node[i].name's value
					r.push([k, nodes[i][opts.cols[k]]]);
					if (first) {
						colnames.push(k);
					}
				});
			}

			if (opts.append) {
				Object.keys(opts.append).forEach(function (k, ix) {
					r.push([k, opts.append[k]]);
					if (first) {
						colnames.push(k);
					}
				});
			}
			first = false;
			// Object.assign(r, opts.append);

			// TODO if supporting ir-checkTreeItem, we need handling variables
		    eaches.push(r);
		}
		return [colnames, eaches];
	};

	/**Merget js arg (opts) with html tag(#tagId)'s attributes,
	 * with the js args ovrriding html attributes
	 * - except arrays like sqlArgs, they are concated.
	 * @param {string} tagId tag id that alredy sharped
	 * @param {Object} opts options to be merged (overriding tag attributes)<br>
	 * Options of sqlArgs, args and select are not handled.<br>
	 * opts.conn: connection id. if not defined, using jconsts.conn from jeasy-api.<br>
	 * opts.t: ir-t value, a function branch tag. in jeasy v1.0, only used by stree.serv<br>
	 * opts.maintabl: target db table. If undefined, try split from first of ir-t<br>
	 * opts.sk: semantic key string with parameters, like roels.ez, {@obj1.var1}<br>
	 * opts.all: add an "-- ALL --" item<br>
	 * opts.query: query form id, ir-query<br>
	 * opts.root: ree root ID<br>
	 * opts.cbb: combobox sk<br>
	 * opts.cbbtree: combotree sk<br>
	 * opts.tree: tree sk<br>
	 * opts.grid: TODO<br>
	 * opts.treegrid: treegrid sk<br>
	 * opts.pagesize: page size, if parameter is -1 or undefined, will be overriden by tag attribute<br>
	 * opts.select: selected id <br>
	 * opts.onclick: on click function or function name<br>
	 * opts.onselect: on item select function or function name<br>
	 * opts.onload: on load function or function name<br>
	 * opts.oncheck: on check function or function name<br>
	 * opts.oncheckAll: on check all function or function name<br>
	 * opts.onerror: on error call back, merged with EasyMsger.error(m.fail)<br>
	 * opts.onok: on ok call back, merged with EasyMsger.info(m.ok)<br>
	 * opts.joins: UserReq | QueryReq, user defined sub-query used as joining table.
	 * <b>note</b>: pk is not handled here
	 * @return {Object} merged options
	 */
	this.opts = function (tagId, opts) {
		if (typeof opts !== 'object')
			opts = {};
		if (opts) {
			opts.conn = tag.merge(opts.conn, tagId, ir.conn);
			if (opts.conn === undefined || opts.conn === null) {
				opts.conn = jconsts.conn;
			}

			opts.t = tag.merge(opts.t, tagId, ir.t);
			// try find maintable
			if (typeof opts.maintabl !== 'string' && typeof opts.t === 'string') {
				var tbls = tag.joins(opts.t, opts.joins);
				opts.maintabl = tbls[0].tabl;
			}

			opts.sk = tag.merge(opts.sk, tagId, ir.sk);
			opts.all = opts.all || EasyHtml.has(tagId, ir.all);
			opts.query = tag.merge(opts.query, tagId, ir.query);
			opts.root = tag.merge(opts.root, tagId, ir.root);
			opts.orderby = tag.merge(opts.orderby, tagId, ir.orderby);
			opts.groupby = tag.merge(opts.groupby, tagId, ir.groupby);

			opts.select = tag.merge(opts.select, tagId, ir.select);
			if (typeof opts.select === 'string') {
				opts.select = tag.findVar(opts.select, opts.args);
			}

			opts.cbb = tag.merge(opts.cbb, tagId, ir.combobox);
			opts.cbb = tag.mergargs(opts, opts.cbb);

			opts.grid = tag.merge(opts.grid, tagId, ir.grid);
			opts.grid = tag.mergargs(opts, opts.grid);

			opts.treegrid = tag.merge(opts.treegrid, tagId, ir.treegrid);
			opts.treegrid = tag.mergargs(opts, opts.treegrid);

			opts.cbbtree = tag.merge(opts.cbbtree, tagId, ir.cbbtree);
			opts.cbbtree = tag.mergargs(opts, opts.cbbtree);

			opts.tree = tag.merge(opts.tree, tagId, ir.tree);
			opts.tree = tag.mergargs(opts, opts.tree);

			if (opts.pagesize < 0) {
				opts.pagesize = undefined;
			}
			opts.pagesize = tag.merge(opts.pagesize, tagId, ir.pagesize);
			if (opts.pagesize === undefined) opts.pagesize = -1;

			opts.onclick = tag.merge(opts.onclick, tagId, ir.onclick);
			if (typeof opts.onclick === 'string') {
				opts.onclick = eval(opts.onclick);
			}

			opts.onselect = tag.merge(opts.onselect, tagId, ir.onselect);
			if (typeof opts.onselect === 'string')
				opts.onselect = eval(opts.onselect);

			opts.onchange = tag.merge(opts.onchange, tagId, ir.onchange);
			if (typeof opts.onchange === 'string')
				opts.onchange = eval(opts.onchange);

			opts.onload = tag.merge(opts.onload, tagId, ir.onload);
			if (typeof opts.onload === 'string')
				opts.onload = eval(opts.onload);

			opts.oncheck = tag.merge(opts.oncheck, tagId, ir.oncheck);
			if (typeof opts.oncheck === 'string')
				opts.oncheck = eval(opts.oncheck);

			opts.oncheckAll = tag.merge(opts.oncheckAll, tagId, ir.oncheckAll);
			if (typeof opts.oncheckAll === 'string')
				opts.oncheckAll = eval(opts.oncheckAll);

			// opts.onerror = tag.merge(opts.onerror, tagId, ir.onerror);
			if (typeof opts.onerror === 'string') {
				opts.onerror = eval(opts.onerror);
			}
			else if (typeof opts.onerror === undefined) {
				opts.onerror = EasyMsger.error;
			}

			if (typeof opts.onok === 'string') {
				opts.onok = eval(opts.onok);
			}
			else if (typeof opts.onok === undefined) {
				opts.onok = EasyMsger.ok;
			}
		}

		Object.keys(opts).forEach(function (k, ix) {
			if(k === undefined || opts[k] === undefined || opts[k] === null)
				delete opts[k];
		});

		return opts;
	};

	/** bind easy ui objects, replacing EzGrid.bindPage(), EzTree.bind().
	 * @param {string} eztype, 'treegrid' | 'datagrid' | 'tree' | 'combotree'
	 * @param {string} tagId
	 * @param {object} opts. See EzHtml#opts(), in addition of
	 * opts.style: addint style to easy object, e.g. height: 81px.
	 * @return {any} any of the selected easyUI function returned, e.g. return of 'datagird()'
	 */
	this.ez = function (eztype, tagId, json, opts) {
		var ezOpts = { data: json, }
		jeasy.mainRow(tagId, undefined);
		if (typeof opts === 'object')
			// ezOpts = Object.assign(ezOpts, opts);
			ezOpts = Object.assign(ezOpts, {
				onSelect: function(ix, nn) {
					if (typeof ix === 'number')
						node = nn;
					else if (typeof ix === 'object')
						node = ix;
					else console.error('TODO ............');

					jeasy.mainRow(tagId, node);
					if(typeof opts.onselect === "function")
						opts.onselect(ix, node)
			},
			onCheck: function(ix, nn){
				if (typeof ix === 'number')
						node = nn;
					else if (typeof ix === 'object')
						node = ix;
					else console.error('TODO ............');

					jeasy.mainRow(tagId, node);
				if(typeof opts.oncheck === "function")
						opts.oncheck(ix, node)
			},

			onClick:function(ix, nn) {
				if (typeof ix === 'number')
						node = nn;
					else if (typeof ix === 'object')
						node = ix;
					else console.error('TODO ............');

				jeasy.mainRow(tagId, node);

				if(typeof opts.onclick === "function")
						opts.onclick(ix, node)
			},
			onLoadSuccess: function(node, data) {
				//jeasy.mainRow(tagId, node);
				if(typeof opts.onload === "function")
						opts.onload(node, data)
			},
			style: "height: 81px"
			});

		return $(regex.sharp_(tagId))[eztype](ezOpts);
	};
};
const EasyHtml = new EzHtml(J);

function EzCbb (J) {
	/**bind combobox
	 * @param {string} cbbId combobox id
	 * @param {Object} opts<br>
	 * sk: semantic key string with parameters, like roels.ez, {@obj1.var1}<br>
	 * args: arguments buffer where to find variables needed by sk<br>
	 * sqlArgs: arguments directly provided and send back to server - needed by sk<br>
	 * select: selected id<br>
	 * all: add an "-- ALL --" item<br>
	 * onselect: onselect function or function name<br>
	 */
	this.combobox = function(cbbId, opts) {
		// this.combobox = function(cbbId, sk, argbuff, selectId, _All_, onChangef) {
		cbbId = regex.sharp_(cbbId, ir.deflt.cbbId);
		opts = EasyHtml.opts(cbbId, opts);
		var cbb = $(cbbId);

		var sk = opts.cbb;

		// request JMessage body
		var req = new jvue.DatasetCfg(	// s-tree.serv (SemanticTree) uses DatasetReq as JMessage body
					jconsts.conn,		// connection id in connexts.xml
					sk);				// sk in dataset.xml
		req.args(opts.sqlArgs);

		// all request are created as user reqs except query, update, insert, delete and ext like dataset.
		// DatasetReq is used as message body for semantic tree.
		// Port.stree is port of SemanticTree.
		// t=load/reforest/retree
		// user act is ignored for reading
		var jmsg = ssClient.userReq(jconsts.conn, Port.dataset, req);

		// get data, then bind easyui combotree
		ssClient.commit(jmsg, function(resp) {
			if (jconsts.verbose > 5) console.log(resp);
			var cbb = $(cbbId);
			// var rows = resp.data;
			var rows = jeasy.rows(resp);
			if (opts.all)
				rows.unshift({text: ir.deflt._All_, value: ir.deflt._All_});
			cbb.combobox({
				data: rows,
				multiple: opts.multi !== undefined && opts.multi !== null && opts.multi === true,
				onSelect: typeof opts.onselect === "function" ? opts.onselect : function(e) {
					if (jeasy.log) console.log(e);
				},
				onChange: typeof opts.onchange === "function" ? opts.onchange : function(e) {
					if (jeasy.log) console.log(e);
				}
			});
			if(typeof(opts.select) === "string")
				cbb.combobox('setValue', opts.select);
			else if(typeof(opts.select) === "number")
				cbb.combobox('setValue', opts.select);
			//select is true,default first row
			else if(opts.select === true)
				cbb.combobox('setValue', rows[0].value);
		});
	};

	this.getValue = function(cbbId) {
		var cbb = $(regex.sharp_(cbbId));
		if (cbb)
			return cbb.combobox('getValue');
	};
};
const EasyCbb = new EzCbb(J);

function EzTree(J) {
	this.J = J;

	this.log = true,
	this.alertOnErr = true,

	/**Bind configured dataset to easyui combotree.
	 * @param {string} treeId
	 * @param {Object} opts<br>
	 * sk: semantic key string with parameters, like roels.ez, {@obj1.var1}<br>
	 * args: arguments buffer where to find variables needed by sk<br>
	 * sqlArgs: arguments directly provided and send back to server - needed by sk<br>
	 * select: selected id<br>
	 * all: add an "-- ALL --" item<br>
	 * rootId: root id <br>
	 * multi: is multiple selected<br>
	 * onselect: onselect function or function name<br>
	 */
	this.combotree = function(treeId, opts) {
		treeId = regex.sharp_(treeId, ir.deflt.cbbtreeId);
		var tree = $(treeId);
		opts = EasyHtml.opts(treeId, opts);
		var sk = opts.cbbtree;
		var sqlArgs = opts.sqlArgs;

		if (sk === undefined || sk === null)
			console.error(ir.cbbtree + " attr in " + treeId + " is undefined. In jeasy v1.0, only configurd combobox is suppored (must have an sk from dataset.xml).");

		// request JMessage body
		var req = new jvue.DatasetCfg(	// s-tree.serv (SemanticTree) uses DatasetReq as JMessage body
					jconsts.conn,		// connection id in connexts.xml
					sk,					// sk in dataset.xml
					'sqltree');			// ask for configured dataset as tree
		req.rootId = opts.rootId;
		req.args(opts.sqlArgs);

		// all request are created as user reqs except query, update, insert, delete and ext like dataset.
		// DatasetReq is used as message body for semantic tree.
		// Port.stree is port of SemanticTree.
		// t=load/reforest/retree
		// user act is ignored for reading
		var jmsg = ssClient.userReq(jconsts.conn, Port.stree, req);

		// get data, then bind easyui combotree
		ssClient.commit(jmsg, function(resp) {
			console.log(resp);
			var tree = $(treeId);
			if (opts.all)
				resp.data.unshift({text: ir.deflt._All_, id: ir.deflt._All_, value: ir.deflt._All_});
			tree.combotree({
				data: resp.data,
				multiple: opts.multi !== undefined && opts.multi !== null && opts.multi === true,
				onSelect: typeof opts.onselect === "function" ? opts.onselect : function(e) {
					if (jeasy.log) console.log(e);
				},
				onChange: typeof opts.onchange === "function" ? opts.onchange : function(e) {
					if (jeasy.log) console.log(e);
				}
			});
			if(typeof(opts.select) != "undefined" && opts.select != null)
				tree.combotree('setValue', opts.select);
		});
	};

	/**Bind easyUI tree, with click/select function.<br>
	 * Data is gotten from s-tree.serv, with sk = 'sk'.
	 * - easyui treegrid must recursive looped to get all selected items.<br>
	 * @param {string} idTree easy tree id:
	 * @param {Object} opts<br>
	 * sk: semantic key string with parameters, like roels.ez, {@obj1.var1}<br>
	 * args: arguments buffer where to find variables needed by sk<br>
	 * sqlArgs: arguments directly provided and send back to server - needed by sk<br>
	 * select: selected id<br>
	 * all: add an "-- ALL --" item<br>
	 * rootId: root id <br>
	 * multi: is multiple selected<br>
	 * onselect: onselect function or function name<br>
	 * onload: on load callback<br>
	 * onClick: on item click event handler<br>
	 */
	this.stree = function ( treeId, opts ) {
		treeId = regex.sharp_(treeId, ir.deflt.treeId);
		var tree = $(treeId);

		opts = EasyHtml.opts(treeId, opts);
		var sk = opts.tree;

		if (sk === undefined || sk === null || sk === '')
			console.error(ir.tree + " attr in " + treeId + " is undefined. In jeasy v1.0, only configurd semantic tree is suppored (must have an sk from dataset.xml).");

		// request JMessage body
		var req = new jvue.DatasetCfg(	// s-tree.serv (SemanticTree) uses DatasetReq as JMessage body
					jconsts.conn,		// connection id in connexts.xml
					sk,					// sk in datast.xml
					'sqltree')	// TODO sk != undefined, delete and test
					.args(opts.sqlArgs);

		// all request are created as user reqs except query, update, insert, delete and 'ext' class like dataset.
		// DatasetReq is used as message body for semantic tree.
		// Port.stree is port of SemanticTree.
		// t=load/reforest/retree
		// user act is ignored for reading
		var jmsg = ssClient.userReq(jconsts.conn, jvue.Protocol.Port.stree, req);

		// get data, then bind easyui tree
		// ssClient is created after logged in.
		ssClient.commit(jmsg, function(resp) {
			// resp.data.forEach(function (v, i) {
			// 	v.checked = false;
			// });
			console.log(resp);
			EasyTree.bind(treeId,	// id
					resp.data,		// forest,
					'tree',			// easyui tree()
					opts.onclick,
					opts.onselect,
					opts.oncheck,
					opts.onload);
		});
	};

	/**[Internal API] Bind easyui tree with data from serv.
	 * @param {string} treeId html tag id
	 * @param {array} json rows
	 * @param {string} treeType tree | treegrid
	 * @param {function} onClick on click callback
	 * @param {function} onSelect on selection changed callback
	 * @param {function} onCheck on selection changed callback
	 * @param {function} onLoad on binding success callback
	 */
	this.bind = function (treeId, json, treeType, onClick, onSelect, onCheck, onLoad) {

		var ezOpts = {
			onclick:onClick,
			onselect:onSelect,
			oncheck:onCheck,
			onload:onLoad
		}
		EasyHtml.ez(treeType, treeId, json, ezOpts);
		EasyMsger.close();
	};

	/**Ask server (SemanticTree) travel throw sub-tree from rootId, re-organize fullpath.
	 * This is a helper in case client bugs, competetions, etc. that makes a tree's fullpath incorrect.
	 * @param {string} tabl,
	 * @param {string} sk semantic sk in dataset/xml/s-trre
	 * @param {string} rootId
	 * @param {string} onSuccessf success callback
	 */
	this.retree = function (tabl, sk, root, onSuccess) {
		this.semanticRetree (tabl, sk, 'retree', {root: root}, null, null, onSucess);
	};

	this.reforest = function (tabl, sk, onSuccess) {
		this.semanticRetree (tabl, sk, 'reforest', null, null, null, onSucess);
	};

	this.semanticRetree = function (tabl, sk, t, args, act, onSucess) {
		if (treeId.substring(0, 1) != "#")
			treeId = "#" + treeId;

		if (typeof sk === "undefined" || sk === null)
			sk = tree.attr(_aSemantik);

		var req = new jvue.DatasetCfg(	// s-tree.serv (SemanticTree) uses DatasetReq as JMessage body
					jconsts.conn,		// connection id in connexts.xml
					sk);				// sk in datast.xml
		var jmsg = ssClient.userReq(jconsts.conn, 'retree', jvue.Protocol.Port.stree, req, act);

		// ssClient is created after logged in.
		ssClient.commit(jmsg, onSuccess);
	};
};
const EasyTree = new EzTree (J);

function EzGrid (J) {
	this.pageInfo = {};

	/**This method is used to bind CRUD main list.
	 * Data (rows) are paged at server sied.
	 * @param {string} pagerId the easyui pager's id
	 * @param {Object} opts<br>
	 * opts.args: arguments buffer where to find variables needed by sk sql <br>
	 * opts.sqlArgs: arguments directly provided and send back to server - needed by sk <br>
	 * See also EzHtml.opts().
	 *
	 */
	this.pager = function (pagerId, opts) {
		// this.pager = function (pagerId, qformId, onLoad, onSelect, onCheck, onCheckAll) {
		if(pagerId === null || pagerId === undefined || typeof pagerId !== 'string') {
			console.error("pager id is not valid");
			return;
		}
		else pagerId = regex.sharp_(pagerId, ir.deflt.pagerId);

		var gridId = $(pagerId).attr(ir.grid);
		if (gridId === undefined || gridId === null || gridId.trim() === '') {
			console.error("gird/list id defined in pager is not valid. A " + ir.grid + " in pager tag must defined.");
			return;
		}
		gridId = regex.sharp_(gridId, ir.deflt.gridId);

		opts = EasyHtml.opts(gridId, opts);
		opts = EasyHtml.opts(pagerId, opts);

		// semantics key (config.xml/semantics)
		var semantik = opts.sk;

		// Remember some variabl for later calling onPage()
		if (this.pageInfo[pagerId] === undefined) {
			this.pageInfo[pagerId] = {
				queryId: opts.query,
				total: 0,
				page: 0,
				size: opts.pagesize,
			};
			$(pagerId).pagination({
				pageSize: opts.pagesize,
				onSelectPage: opts.onchangepage==undefined?this.onPage:opts.onchangepage,
			});
		}

		var req;
		if (semantik !== undefined)
			// dataset way
			req = new jvue.DatasetCfg(	// SysMenu.java (menu.sample) uses DatasetReq as JMessage body
						jconsts.conn,	// connection id in connexts.xml
						semantik);		// sk in datast.xml
		else {
			// try query.serv way
			// TODO change to tag.joins(opts.t)
			var tbls = EasyHtml.tabls(gridId, opts.joins);
			if (tbls !== undefined) {
				// create a query request
				var maint = tbls[0].tabl;
				var mainAlias = tbls[0].as;
				req = ssClient.query(null,	// let the server find connection
							maint,			// main table
							mainAlias,		// main alias
							this.pageInfo[pagerId]); // this.pageInfo, saving page ix for consequent querying
				var q = req.body[0];

				// handle query defined in grid attrs
				// [{exp: t.col as: c}, ...]
				var exprs = EasyHtml.thExprs(gridId, mainAlias);
				q.exprss(exprs);

				// joins ( already parsed )
				q.joinss(tbls.splice(1, tbls.length - 1));

				// where clause
				var wheres = EasyQueryForm.conds(opts.query, mainAlias);
				// q.wheres("=", "u.userId", "'" + uid + "'");
				q.whereCond(wheres);

				// order by
				q.orderbys(tag.orders(opts.orderby));

				// group by
				q.groupbys(tag.groups(opts.groupby));


			}
			else console.error('Grid can support both ir-grid or ir-t, but none of them can be found.', opts);
		}
		// post request, handle response
		EasyMsger.progress();
		ssClient.commit(req, function(resp) {
			var rows = jeasy.rows(resp);
			var total = jeasy.total(resp, 0);
			EasyGrid.bindPage (gridId, rows, total, opts);

			var pgInf = EasyGrid.pageInfo[pagerId];
			pgInf.total = total;
			EasyGrid.bindPager(pagerId, total, pgInf.page, pgInf.size, opts.onpagechange);
		}, EasyMsger.error);
	};

	/**Load grid without a pager
	 * @param {string} gridId
	 * @param {Object} opts
	 * t: ir-t string (override html ir-t)
	 * queryId: query form Id<br>
	 * rowpk: row's pk<br>
	 * select: select an item when load<br>
	 */
	this.grid = function (gridId, opts) {
		gridId = regex.sharp_(gridId, ir.deflt.gridId);

		opts = EasyHtml.opts(gridId, opts);

		// var semantik = $(gridId).attr(ir.sk);
		var semantik = opts.sk;
		// var pgSize = opts.pagesize;

		// Remember some variabl for later calling onPage()
		if (this.pageInfo[gridId] === undefined) {
			this.pageInfo[gridId] = {
				queryId: opts.queryId,
				total: 0,
				page: opts.page,
				size: opts.pagesize,
			};
		}

		var req;
		if (semantik !== undefined)
			// dataset way
			req = new jvue.DatasetCfg(	// SysMenu.java (menu.sample) uses DatasetReq as JMessage body
						jconsts.conn,	// connection id in connexts.xml
						semantik);		// sk in datast.xml
		else {
			// try query.serv way
			// var tbls = opts.t;
			var tbls = tag.joins(opts.t, opts.joins);
			// if (tbls === undefined || (typeof tbls === 'string' && tbls.trim().length < 2))
			// 	tbls = EasyHtml.tabls(gridId);

			if (tbls !== undefined) {
				// create a query request
				var maint = tbls[0].tabl;
				var mainAlias = tbls[0].as;
				req = ssClient.query(null,	// let the server find connection
							maint,			// main table
							mainAlias,		// main alias
							this.pageInfo[gridId]); // this.pageInfo, saving page ix for consequent querying
				var q = req.body[0];

				// handle query defined in grid attrs
				// [{exp: t.col as: c}, ...]
				var exprs = EasyHtml.thExprs(gridId, mainAlias);
				q.exprss(exprs);

				// joins ( already parsed )
				q.joinss(tbls.splice(1, tbls.length - 1));

				// where clause
				var wheres = EasyQueryForm.conds(opts.query, mainAlias);
				// q.wheres("=", "u.userId", "'" + uid + "'");
				q.whereCond(wheres);

				// order by
				q.orderbys(tag.orders(opts.orderby));

				// group by
				q.groupbys(tag.groups(opts.groupby));
			}
			else console.error('Grid can support both ir-grid or ir-t, but none of them can be found.', opts);
		}
		// post request, handle response
		EasyMsger.progress();
		ssClient.commit(req, function(resp) {
			var rows = jeasy.rows(resp);
			var total = jeasy.total(resp, 0);
			// EasyGrid.bindPage (gridId, rows, total, opts.onSelect, opts.onCheck, opts.onCheckAll, opts.onLoad);
			EasyGrid.bindPage (gridId, rows, total, opts);
		}, EasyMsger.error);
	};

	this.treegrid = function (gridId, opts) {
		gridId = regex.sharp_(gridId, ir.deflt.gridId);
		opts = EasyHtml.opts(gridId, opts);
		console.log(opts);
		// Remember some variabl for later calling onPage()
		if (this.pageInfo[gridId] === undefined) {
			this.pageInfo[gridId] = {
				queryId: opts.queryId,
				total: 0,
				page: opts.page,
				size: opts.pagesize,
			};
		}

		var req;
		if (opts.t == undefined && opts.treegrid !== undefined) {
			// dataset way

			// req = new jvue.DatasetCfg(	// SysMenu.java (menu.sample) uses DatasetReq as JMessage body
			// 			jconsts.conn,	// connection id in connexts.xml
			// 			opts.sk);		// sk in datast.xml
			req = new jvue.DatasetCfg(	// s-tree.serv (SemanticTree) uses DatasetReq as JMessage body
						jconsts.conn,	// connection id in connexts.xml
						opts.treegrid,	// sk in datast.xml
						'sqltree')
						.args(opts.sqlArgs);
			req = ssClient.userReq(jconsts.conn, jvue.Protocol.Port.stree, req);
		}
		else {
			// try query.serv way
			// var tbls = opts.t;
			var tbls = tag.joins(opts.t, opts.joins);

			if (tbls !== undefined) {
				// create a query request
				var maint = tbls[0].tabl;
				var mainAlias = tbls[0].as;

				var q = new jvue.DatasetCfg(	// s-tree.serv (SemanticTree) uses DatasetReq as JMessage body
							jconsts.conn,		// connection id in connexts.xml
							opts.treegrid,      // sk in datast.xml
							'',					// a()
							opts.sqlArgs,
							maint,              // main table - used when sk is null
							mainAlias) ;
					console.log(this.pageInfo[gridId].page);
					// debug ?
					//q.page(20,0);
							// main alias - used when sk is null

				// all request are created as user reqs except query, update, insert, delete and 'ext' class like dataset.
				// DatasetReq is used as message body for semantic tree.
				// Port.stree is port of SemanticTree.
				// t=load/reforest/retree
				// user act is ignored for reading
				req = ssClient.userReq(jconsts.conn, jvue.Protocol.Port.stree, q);

				// handle query defined in grid attrs
				// [{exp: t.col as: c}, ...]
				var exprs = EasyHtml.thExprs(gridId, mainAlias);
				q.exprss(exprs);

				// joins ( already parsed )
				q.joinss(tbls.splice(1, tbls.length - 1));

				// where clause
				var wheres = EasyQueryForm.conds(opts.query, mainAlias);
				// q.wheres("=", "u.userId", "'" + uid + "'");
				q.whereCond(wheres);

				// order by
				q.orderbys(tag.orders(opts.orderby));
			}
			else console.error('Treegrid can support both ir-grid or ir-t, but none of them can be found.', opts);
		}
		// post request, handle response
		EasyMsger.progress();
		ssClient.commit(req, function(resp) {
			//EasyGrid.bindPage (gridId, rows, total, opts);
			console.log(resp);

			EasyMsger.close();
			EasyTree.bind(gridId,	// id
					resp.data,		// forest,
					'treegrid',
					opts.onclick,
					opts.onselect,
					opts.oncheck,
					opts.onload);
		}, EasyMsger.error);
	}

	/**call easyui $(pagerId).pagination("refresh", ...
	 * @param {string} pagerId
	 * @param {int} total
	 * @param {int} page
	 * @param {int} size
	 */
	this.bindPager = function (pagerId, total, page, size, onpagechange) {
		// Design Notes: How to implement jeasy based on easyUI with keeping component design in mind?
		if (jconsts.verbose >= 2) console.warn('Debug Notes (verbose 2):\n',
			'If you see this error message from easyUI:\n',
			'TypeError: _c0 is undefined[Learn More]\n',
			'You probably run into a jeasy api bug.\n',
			'You must be careful because those following js code may not executed normally.\n',
			'Cause:\n',
			'EzGrid#bindPage() can not been called more than once because the pageInfo have a ' +
			'record of a pager which prevent a new pager been created in the same main page. See #pager() pageInfo section.\n',
			'This is an OOP issue - all modal component accessing a shared global data failed.\n',
			'We will handle this later.\n',
			'To temporarily detour this problem, you must set EasyGrid.pageInfo.' + pagerId + ' = undefined.',
			'See example jsample/user.js/Role#initRole().');
		$(pagerId).pagination("refresh", {
			total: total,
			pageNumber: page + 1,
			pageSize: size,
			'pagechange': onpagechange
		});
	};

	/** Helper function to load page on pager's event. */
	this.onPage = function (pageNumb, size) {
		// onPage is pagination's onSelectPage handler, so this.id = pager-id
		var pgInf = EasyGrid.pageInfo['#' + this.id];
		pgInf.page = pageNumb - 1;
		pgInf.size = size;
		EasyGrid.pager(this.id, {query: pgInf.queryId});
	};

	/**Bind json data to easyUI datagrid or treegrid.<br>
	 * @param {string} gridId
	 * @param {Array} json rows / forest to be bound
	 * @param {number} total total rows
	 * @param {object} opts options: select, oncheck, onselect, oncheckAll
	 * @param {boolean} ezTreegrid is treegrid?
	 */
	this.bindPage = function (gridId, json, total, opts, ezTreegrid) {

		EasyHtml.ez('datagrid', gridId, json, opts);
		EasyMsger.close();
		return;

		// FIXME this not correct!
		// FIXME this not correct!
		// FIXME this not correct!

		// var ezfunc = g[ezTreegrid];	// ezTreegrid = 'treegrid', 'datagrid', 'tree', ...
		// ezfunc("loadData", json);	// now ezfunc is a function

		// FIXME this not correct!
		// FIXME this not correct!
		// FIXME this not correct!
		// FIXME this not correct!
		if (ezTreegrid) {
			g.treegrid(opts);
			if (opts != undefined && opts.onCheckAll) {
				g.treegrid({ onCheckAll: opts.oncheckAll,
					onUncheckAll: opts.oncheckAll});
			}
			g.treegrid("loadData", json);
		}
		else {
			g.datagrid(opts);
			if (opts !== undefined && opts.onCheckAll) {
				g.datagrid({ onCheckAll: opts.oncheckAll,
					onUncheckAll: opts.oncheckAll});
			}
			g.datagrid("loadData", json);
		}
		if (opts.onCheckAll)
			g.datagrid({ onCheckAll: opts.onCheckAll,
				onUncheckAll: opts.onCheckAll});
		if(opts.onload)
			g.datagrid({ onLoadSuccess: opts.onload});
		g.datagrid("loadData", json);

		if (typeof opts.select === 'object') {
			var ix = jeasy.findRowIdx(json, opts.select)
			if (ezTreegrid) {
				g.treegrid("selectRow", ix);
			}
			else {
				g.datagrid("selectRow", ix);
			}
		}
		// if(typeof isSelectFirst === "undefined" || isSelectFirst != false) {
		// 	// select row 1
		// 	g.datagrid("selectRow", 0);
		// }

		EasyMsger.close();
//		if (typeof opts.onload === "function")
//			opts.onload ( json, total );
	};

	/** delete selected row.
	 * If no row is selected, call opts.onalert, or EzMsger.alert(m.none_selected);
	 * @param {string} gridId easy grid in whiche the selected row to be deleted
	 * @param {Object} opts
	 * opts.maintable: target table.<br>
	 * opts.pk: pk condition for sql where clause.<br>
	 * opts.select the selected record id overriding auto retrieved selected row's id.<br>
	 * opts.onload: the success callback, default: EasyMsger.ok<br>
	 * opts.onerror: the error handle, default: EasyMsger.error.<br>
	 * @param {UpdateReq} the delete request (a = 'D')
	 */
	this.delrow = function(gridId, opts) {
		gridId = regex.sharp_(gridId, ir.deflt.gridId);
		opts = EasyHtml.opts(gridId, opts);

		var rw = jeasy.getMainRow(gridId);
		if (rw === undefined || rw === null) {
			if (typeof opts.onerror === 'function')
				opts.onerror(EasyMsger.m.none_selected);
			else
				EasyMsger.alert(EasyMsger.m.none_selected);
			return;
		}

		$.messager.confirm('删除', '确定删除吗?', function(r){

    		if (r){

		    	var pkv = rw[opts.pk];
				var rq = ssClient.delete(opts.conn, opts.maintabl,
					{pk: opts.pk, v: pkv}, opts.posts);
				ssClient.commit(rq, opts.onok, opts.onerror);
	    	}
   	 });

//		var pkv = rw[opts.pk];
//		var rq = ssClient.delete(opts.conn, opts.maintabl,
//					{pk: opts.pk, v: pkv}, opts.posts);
//		ssClient.commit(rq, opts.onok, opts.onerror);
	};
};
const EasyGrid = new EzGrid(J);

////////////////////////  Easy API for Basic CRUD   ////////////////////////////
//
function EzQueryForm(J) {
	//bug easyui <input>  id ? success:faliure.
	this.load = function(formId) {
		// 1. load ir-combobox
		$(formId + " ["+ ir.combobox + "]").each(function(key, domval) {
			EasyCbb.combobox(domval.id);
		});

		// 2. combotree
		$(formId + " ["+ ir.cbbtree + "]").each(function(key, domval) {
			EasyTree.combotree(domval.id);
		});
	};

	/**Find condition array from query form, in fields with name attribute
	 * - can be serialized by jquery serializeArray().
	 * @param {} queryid
	 * @param {} defltTabl
	 * @return {array} [{field, v, logic}]
	 */
	this.conds = function (queryid, deftTabl) {
		// if(queryid !== null && queryid !== undefined && queryid.substring(0, 1) != "#")
		// 	queryid = "#" + queryid;
		// else if (typeof queryid === "undefined")
		// 	queryid = _query;
		queryid = regex.sharp_(queryid, ir.deflt.queryId);

		var conds;
		var fields = $( queryid ).serializeArray();
		if (!fields || fields.length <= 0) {
			console.log("No query condition form found in " + queryid);
			return ;
		}
		return this.formatConds(deftTabl, fields);
	}

	/**Format query condition according to "name" attr in tag of form (form-id=queryId).
	 * name="t.col", where t can be alais (handled by serv)
	 * @param {string} defltTabl main table
	 * @param {fields} fields condition fields like that selected by $(".name")
	 * @return {array} [{op: logic, l: "tabl"."col", r: val} ...]
	 */
	this.formatConds = function (defltTabl, fields) {
		// [{field: "recId", v: "rec.001", logic: "=", tabl: "b_articles"}, ...]
		var conds = new Array();
		$.each( fields, function( i, field ) {
			// Ignore items like "-- ALL --" in combobox
			if (field.value === ir.deflt._All_) return;
			if (field.value === undefined || field.value === '' || field.value === ir.deflt._All_)
				return;

			// $( ).append( field.value + " " );
			var n = field.name.replace(/\s\s+/g, ' ');
			var namess = n.split(' '); // table.column >/=

			// is constant of expression? default: false. value will be quoted (as constants)
	 		var asExpr = false;

			if (namess.length < 2) {
				console.log("WARN - name attr in form (id=irquery) must indicating logic operand: " + n);
				return;
			}
			else if (namess.length === 3 && namess[2].trim().toLowerCase() === 'expr') {
				asExpr = true;
			}

			if (asExpr) {
				conds.push([namess[1].trim(), namess[0],
					field.value]);
			}
			else  {
				conds.push([namess[1].trim(), namess[0],
					"'" + field.value + "'"]);	// FIXME: what about \' ?
			}
		});
		return conds;
	}
};
const EasyQueryForm = new EzQueryForm(J);

function EzModal() {
	/**add details */
	this.addDetails = function (src, title, h, w, init, isUeditor, modalId, gridId) {
		ssClient.usrCmd("insert");

		// try to find the row
		var row;
		if (gridId)
		 	row = jeasy.mainRow(gridId);
		else row = jeasy.getMainRow(ir.deflt.gridId);

		this.showDialog(jeasy.c, src, title, h, w, init, isUeditor, modalId, row);
	};

	/**popping a dialog for edit details
	 * @param src
	 * @param title
	 * @param h
	 * @param w
	 * @param init
	 * @param isUeditor
	 * @param modalId
	 * @param listId
	 * */
	this.editDetails = function (src, title, h, w, init, isUeditor, modalId, listId) {
		var row = null;

		listId = regex.sharp_(listId, ir.deflt.gridId);

		var row = jeasy.getMainRow(listId);
		if(row === undefined) {
			EasyMsger.info(EasyMsger.m.none_selected);
			return;
		}

		ssClient.usrCmd("edit");

		this.showDialog(jeasy.u, src, title, h, w, init, isUeditor, modalId, row);
	};

	/**
	 * @param {string} src html
	 * @param {string} title
	 * @param {number} h
	 * @param {number} w
	 * @param {string} init handler
	 * @param {bool} isUeditor is u editer
	 * @param {string} modalId div id for modal
	 * @param {Object} row data
	 * @param {Object} pkvals pk
	 */
	this.showDialog = function (crud, src, title, h, w, init, isUeditor, modalId, row) {
		if (modalId === undefined)
			modalId = ir.deflt.modalId;
		modalId = regex.sharp_(modalId);

		console.log(src);

		var win_options = {
			resizable: false,
			modal: true,
			width: w,
			height: h,
			collapsible: false,
			minimizable: false,
			maximizable: false,
			title: title
		};

		var _modalId = regex.desharp_(modalId);
		var newWin = $('<div>').attr('id', _modalId);
		$(modalId).append(newWin);
		// console.log($(modalId, $('iframe').get(0).contentWindow.document));

		if(!('top' in win_options)) {
			win_options.top = 5;
		}
		newWin.window(win_options);
		newWin.window({
			href: src,
			id: _modalId,
			onMove: function(left, top) {
				var position = {
					left: left,
					top: top
				};
				if(top <= 0) {
					position.top = 5;
					$(this).window('move', position);
				}
				if(left + win_options.width <= 20) {
					position.left = left + 50;
					$(this).window('move', position);
				}
				if(top >= $(window).height()) {
					position.top = $(window).height() - 30;
					$(this).window('move', position);
				}
				if(left >= $(window).width() - 20) {
					position.left = $(window).width() - 30;
					$(this).window('move', position);
				}
			},
			onClose: function() {
				// dispose Ueditor, to be removed
				if(typeof(isUeditor) != "undefined" && isUeditor == true) {
					if(typeof(UE.getEditor('container')) != 'undefined') {
						UE.getEditor('container').destroy();
					}
				}
				newWin.remove();
			},
			onLoad: function() {
				// EasyModal.callInit(init, row, pkvals)
				// load details form, call user's onload handler (in ir-modal)
				EasyModal.callInit(crud, modalId, init, row);
			}
		});

		if(win_options.height < $(window).height()) {
			newWin.window('center');
		}
	};

	this.callInit = function (crud, formId, fn, row) {
		var f;
		if (typeof fn === 'function')
			f = fn;
		else if (typeof fn === 'string')
			f = eval(fn);
		if (f) {
			f(crud, formId, ssClient, row);
		}
		else
			console.error("can't find function " + fn);
	};

	/**Details form loading, a helper called by user onModal() to load a CRUD details form.<br>
	 * @param {string} modalId: optional form id, default "irform".
	 * @param {Object} opts options:
	 * t: serv target (at least main table),<br>
	 * 		can be configured from $(formId)[ir-t] (set the parameter as null)
	 * pk: Value(s) will be appended to query's where clause.
	 * 		1. Object: {pk, v} pk value for quering record. (only pk for main table, on table name)<br>
	 * 		2. Array: [{condt}] conditions returned by EasyQeuryForm.conds();
	 * onload: event handler<br>
	 * 		Functions that for special tasks, e.g. loading svg should done here.
	 */
	this.load = function (modalId, opts) {
		// this.load = function (formId, irt, pk, callback) {
		modalId = regex.sharp_(modalId, ir.deflt.modalId);
		opts = EasyHtml.opts(modalId, opts);
		// find sql "from" clause
		var joins = tag.joins(opts.t, opts.joins);

		var mainAlias = joins[0].as;
		var exprs = EasyHtml.formExprs(modalId, mainAlias);
		var wheres = EasyQueryForm.conds(modalId, mainAlias);

		var req = ssClient.query(null,	// let the server find connection
					joins[0].tabl,		// main table
					joins[0].as);		// main alias

		var q = req.body[0];
		var pk = opts.pk;
		q.exprss(exprs)
			.joinss(joins.splice(1, joins.length - 1))
			.whereCond(wheres);
		if (pk !== undefined && Array.isArray(pk))
			q.whereCond(pk);
		else if (typeof pk === "object" && pk.pk !== undefined) {
			// some times user's code use 'this' in callback, makes arguments wrong
			if (pk.v === undefined)
				console.warn('pk may not correct', pk);
			q.whereCond("=", pk.pk, "'" + pk.v + "'");
		}

		// post request, handle response
		EasyMsger.progress();
		ssClient.commit(req, function(resp) {
			var rows = jeasy.rows(resp);
			EasyModal.bindWidgets (modalId, rows[0], opts.onload);
		}, EasyMsger.error);
	};

	this.bindWidgets = function(formId, rec, callback) {
		$(formId + " ["+ ir.field + "]").each( function(key, domval) {
			// value is a DOM, see http://api.jquery.com/each/
			var f = this.attributes[ir.field].value;
			var v = rec ? rec[f] : undefined;

			var opts = EasyHtml.opts(domval.id, {args: rec, select: v});

			// ir-field presented, this widget  needing been auto bound
			if ( this.attributes[ir.field].name !== undefined ) {
				// set value like a text input
				// case 1: bind ir-combobox
				if (this.attributes[ir.combobox]) {
					if (this.attributes[ir.combobox].name !== undefined) {
						// an ir-combobox from configured dataset
						// this.value = v;
						// EasyCbb.combobox(domval.id, null, {row: rec}, v);
						// EasyCbb.combobox(domval.id, {args: rec, select: v, onselect: onChange});
						EasyCbb.combobox(domval.id, opts);
					}
					else console.log("EasyModal.bindWidgets(): ignoring combobox " + domval.id + " " + domval.name);
				}
				// case 2: bind ir-cbbtree
				else if (this.attributes[ir.cbbtree]) {
					// EasyTree.combotree( domval.id, {args: rec, select: v, onselect: onChange});
					EasyTree.combotree( domval.id, opts);
				}
				// case 1.1: bind easyui-combobox no ir-cbb
				else if (this.classList && (this.classList.contains('easyui-combobox') )) {
					if ( v !== undefined && v!== null && v.trim().length > 0) {
						try {
							$('#' + domval.id).combobox('setValue', v);
						} catch ( ex ) {
							console.log("loadSimpleForm(): Value " + v + " can't been set to combobox " + domval.id);
						}
					}
				}
				// case 3: bind easyui-datebox/datetimebox
				else if (this.classList && (this.classList.contains('easyui-datetimebox')
										|| this.classList.contains('easyui-datebox')   ) ) {
					//$("#installDate").datebox("setValue", row.installDate);
					if ( v !== undefined && v!== null && v.trim().length > 0) {
						try {
							var dt = new Date(v);
							$('#' + domval.id).datebox('setValue', v);
						} catch ( ex ) {
							console.log("loadSimpleForm(): Value " + v + " can't been set to datebox " + domval.id);
						}
					}
				}
				// case 4: bind easyui-numberbox
				else if (this.classList && (this.classList.contains('easyui-numberbox') )) {
					//$("#installDate").datebox("setValue", row.installDate);
					if ( v !== undefined && v!== null && v.trim().length > 0) {
						try {
							$('#' + domval.id).numberbox('setValue', v);
						} catch ( ex ) {
							console.log("loadSimpleForm(): Value " + v + " can't been set to numberbox " + domval.id);
						}
					}
				}
				// case 5: bind easyui-numberspinner
				else if (this.classList && (this.classList.contains('easyui-numberspinner')))
					try {
						$('#' + domval.id).numberspinner('setValue', v);
					} catch ( ex ) {
						console.log("loadSimpleForm(): Value " + v +
							" can't been set to easyui numberspinner " + domval.id);
					}
				// case 6.1: datagrid pager
				else if (this.attributes[ir.grid]) {
					// merge grid's attributes, with pager's attributes overriding gird's
					var gridId = EasyHtml.ir(this.id, ir.grid);
					opts = EasyHtml.opts(gridId, opts);

					EasyGrid.pager(this.id, opts);
				}
				// case 6.2: datagrid
				else if  (this.classList && (this.classList.contains('easyui-datagrid'))) {
					if (jeasy.log)
						console.log('Trying bind datagrid automatically, ir-field: ', f, v);
					// EasyGird.datagrid(this.id, {select: v, onselect: onChange});
					EasyGird.datagrid(this.id, opts);
				}
				// case 7: bind img to base64 string
				// https://stackoverflow.com/questions/20756042/javascript-how-to-display-image-from-byte-array-using-javascript-or-servlet
				else if (this.nodeName == 'IMG') {
					// $(regex.sharp_(this.id)).attr('src', `data:image/png;base64,${v}`)
					if (!regex.isblank(v)) {
						$(this).attr('src', `data:image/png;base64,${v}`)
					}
				}
				// case x: bind text input - should this moved to the first?
				else if (this.nodeName != 'TEXTAREA' && this.classList
						&& (this.classList.contains('easyui-textbox') || this.classList.contains('textbox'))) {
					$(regex.sharp_(this.id)).textbox({value: v});
				}
				else {
					if(v !== undefined && v!== null && v.trim().length > 0)
						this.value = v;
				}
			}
		});

		EasyMsger.close();
		if (typeof callback === "function") {
			if (jeasy.log)
				console.log("EzModal.bindWidgets() doesn't calling callback on all task finished, "
					+ "but called when all autobinding fields are iterated while waiting response from serv.")
			callback();
		}
	}

	/** close dialog
	 * @param {string} dlgId dialog id
	 */
	this.close = function (dlgId) {
		dlgId = regex.sharp_(dlgId, ir.deflt.modalId);
		$(dlgId).window('close');

		if (typeof this.onclose === 'function')
			this.onclose();
	};

	/**Get a save-form request.
	 * Any form element with 'name' attribute will be saved into tabl.
	 * @param {stirng} crud jeasy.c | u | d
	 * @param {string} dlgid formId to be packaged
	 * @param {string} tabl target table
	 * @param {string} pk {pk, v} for update condition, ignored when crud = jeasy.c
	 * @param {string} regexExclude exclude expressiong<br>
	 * <p>This function uses jquery.serializeArray() to serialize all tag's value with attribute 'name'.
	 * But this introduce a problem with easyUI checkbox in treegrid or datagride. When a checkbox is
	 * checked, the juery serializeArray() will include it's value, this is not expected when serialize a form.
	 * So an exlude expression is used to exclude checked value from datagride, etc.
	 * E.g. $(dlgId + ' [name]').not('.datagrid [name]').serializeArray() where exlcude check box value in datagrid and treegrid.</p>
	 * So, if you want to exlude it, set regexExclude = '.datagrid [name]'
	 * This is what easyUI not that easy like the first look.
	 * @return {UpdateReq} request {a = c | u | d} formatted according to form's html.
	 */
	this.save = function (conn, crud, dlgId, tabl, pk, regexExclude) {
		dlgId = regex.sharp_(dlgId, ir.deflt.modalId);

		var nvs = $(dlgId + ' [name]').not(regexExclude).serializeArray();

		if (nvs === undefined || nvs.length === 0)
			console.warn("No saving values found in form: " + dlgId,
						"Only children with name attribute of " + dlgId + " can be serrialized.");

		if (crud === jeasy.c) {
			return ssClient.insert(conn, tabl, nvs);
		}
		else {
			return ssClient.update(conn, tabl, pk, nvs);
		}
	}
};
const EasyModal = new EzModal(J);

function EzMsger() {
	this.init = function(code) {
		if (code === undefined) {
			this.msg = {};
			this.progressing = false;
		}
		else {
			this.msg[code] = undefined;
		}
	};

	this.init();

	this.progress = function() {
		if (EasyMsger.progressing === false) {
			$.messager.progress();
			EasyMsger.progressing = true;
		}
	};

	this.close = function() {
		$.messager.progress('close');
		this.progressing = false;
	};

	/** Report error to user only once. Flags are refreshed by init()
	 * Don't change this into Chinese, set another message-popping function to replace this if like to.
	 */
	this.error = function(code, resp) {
		if (EasyMsger.progressing === true) {
			EasyMsger.close();
		}

		if (EasyMsger.msg[code] === null || EasyMsger.msg[code] === undefined) {
			EasyMsger.msg[code] = code;
			console.error(resp);
			if (code === jvue.Protocol.MsgCode.exSession)
				//$.messager.alert('warn', 'Session Error! Please re-login.');
				$.messager.alert('warn', resp.error);
			else if (code === jvue.Protocol.MsgCode.exIo)
				$.messager.alert('warn', 'Network Problem!');
			else $.messager.alert('warn', resp.error);
		}
		else {
			console.warn('Error message ignored:', resp,
				'Call EasyMsger.init("' + code + '") to enable error message again.');
		}
	};

	/**easyui messager.alert('info')
	 * @param {string} code alerting code to supress duplicated alarm.
	 * @param {function} m message code, one of EzMsger.m.
	 * Function type is checked here to prevent users send string parameter anywhere when they want to.
	 */
	this.info = function (m, style) {
		if (style === undefined)
			style = 'info';
		if (typeof m === 'function') {
			$.messager.alert(style, m(), style);
			return;
		}
		else {
			console.warn("Your message is not found.", m,
				"We check m's existence in EzMsger.m because including message string anywhere is not encouraged in jeasy.",
				"You can replace EasyMsger.m with your m object to update and extend messages, in one place.");
		}
	};

	/**See info()
	 * @param {function} m
	 */
	this.alert = function (m) {
		this.info(m, 'warn');
	};

	this.ok = function (mcode) {
		if (mcode)
			this.info(mcode);
		else
			this.info(this.m.ok);
	};

	/**Replace/extend an individual message.
	 * You'd better replace the entire m if switching to another language other than English.
	 * @param {string} code
	 * @param {string} msg message
	 */
	this.setM = function (code, msg) {
		var mf = {};
		mf[code] = () => msg;
		Object.assign(this.m, mf);
	};

	/**Message strings.
	 * Use EzMsger.setM to setup application's message strings.
	 * NO CHINESE HERE for m!
	 * Replace m with your varialbe or call setM(msg-func) if you'd like to,
	 * in ir-jeasy-engcost.js
	 */
	this.m = {
		ok: () => "OK!",
		fail: () => "Operation Failed!",
		// NO CHINESE HERE !
	 	// Replace m with your variable or call setM(msg-func) if you'd like to,
		// in ir-jeasy-engcost.js/jconsts.initMsg (or jeasy-api.js sample project config section)
		saved: () => "Saved Successfully!",
		none_selected: () => "Please select a record!",
		deleted: () => "Delete Successfully!",

		cheap_started: () => "Workflow Started.",
		cheap_no_rights: () => "You don't have the command rights.",
		cheap_competation: () => "Can't step to target nodes. Already exists?",
	};
};
const EasyMsger = new EzMsger(J);
// call message initializer
jconsts.initMsg(EasyMsger);
