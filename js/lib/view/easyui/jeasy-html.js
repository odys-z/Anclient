/** easyui html handler
 * <p>Easyui is html based api. All jclient integration is via html intervention.</p>
 * <p>This module is a helper for handling html tag attribute string parsing.</p>
 * @module jclient/html */

if (J === undefined)
	console.error("You need initialize J - use <script>jeasy-api.js</script> first.");

/**This port instance should arleady understand application's prots
 * - initialized in project's frame */
const Port = jvue.Protocol.Port;

/** Globale args' buffer used resolving args defined in html tags.
 * Resolved and referenced args are refreshed here.
 * Each time a new CRUD senario is reloaded, this args should refreshed.
 * TODO move to jeasy API.*/
var globalArgs = {};

/** attribute names in html tag defining attres for handling by jeasy-html frame */
const ir = {
	/** target name */
	t: "ir-t",
	/** e.g. ds.sql-key in dataset.xml */
	sk: 'ir-sk',
	root: 'ir-sroot',
	/** tree item on change handler name */
	onchange: "ir-onchange",

	/** a.k.a. ir-grid, used by pager to specify grid id. */
	grid: 'ir-grid',
	/* easyui "data-options", alias is defined here, e.g. alais = "field: personName" */
	ezDataopts: 'data-options',

	expr: 'ir-expr',

	/** intial page size, later will using easyui pagination's size (by EzGrid.page()) */
	pagesize: 'ir-size',

	/** ? ? */
	checkexpr: 'ir-checkexpr',

	/** combobox */
	combobox: 'ir-cbb',

	cbbtree: 'ir-cbbtree',

	deflt: {
		gridId: 'irlist',
	},

	ignored: {
		cond: ' -- ALL -- ',
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
	/**regex for matching join definition is html.<br>
	 * [0] j:b_cates:t1   person=b_cates.persId 'v' % t1.col<br>
	 * [1] j<br>
	 * [2] b_cates<br>
	 * [3]  : t1<br>
	 * [4] t1<br>
	 * [5] person=b_cates.persId 'v' % t1.col<br>
	 */
	join: /\s*([jJrRlL])\s*:\s*(\w+)(\s*:\s*(\w+)){0,1}\s+(.+)\s*/i,

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
	order: /\s*((\w+)\.){0,1}(\w+)(\s+(asc|desc){0,1}){0,1}\s*/i,

	/** [2] func name, [4] tabl, [5] field */
	// expr: /\s*((\w+)\s*\s*\()?\s*((\w+)\s*\.)?\s*(\w+)\s*\)?\s*/i,

	/**regex for matching expr like "field:sqlAlias"*/
	alais: /field\s*:\s*\'(\w+)\'/i,

	/**
	 * [0] x.y.z.c
	 * [1] x
	 * [2] y.z.c
	 */
	vn: /\s*(\w+)\.(.*)/i,

	/** Parse String like "ds.sql-key arg1, {@obj.var1}, arg2, ..."*/
	cbbArg: /{\@\s*(.+)\s*\}/i,
};

/**html tag's attribute parser.
 * Parsing ir-expr="max(t.col)", etc.
 */
function Tag (debug) {
	this.debug = debug;

	/**Format table-joins request object: [{tabl, t, on, as}]
	 * @param {string} t "b_articles, j:b_cate, l:b_author:a authorId=authorId and a.name like 'tom'"
	 * @return {Array} [{tabl, t, on, as}], where t = main-table | j | r | l
	 */
	this.joins = function (t) {
		var tss = t.split(','); // [t1, j:b_cates[:alais] cateId=cateId, ...]
		var tabls = new Array();

		for(var i = 0; i < tss.length; ++i) {
			var m = regex.join.exec(tss[i]);
			if(m) {
				var tAls = m[4];
				if(typeof m[4] == "undefined")
					tAls = "";
				// try match variable in ON condition
				var oncond = m[5];
				// mOnVar = x.y
				var mOnVar = regex.onCondParm.exec(m[5]);
				if (mOnVar) {
					// if there is variable in on condtion clause, replace with value
					// No need to parse all logic condition to array
					var v = this.findVar(mOnVar[2]);
					if (typeof v !== "undefined") {
						if (typeof v.length === "number")
							oncond = mOnVar[1] + this.concatArray(v);
						else
							oncond = mOnVar[1] + "'" + v + "'";
					}
					else {
						if (this.debug) console.log('WARN - found parameter condition '
								+ m[5] + ' in table joining, but no variable can be used to replace the variable.' )
						oncond = mOnVar[1] + "'" + mOnVar[2] + "'";
					}
					if (mOnVar.length > 2)
						oncond = oncond + mOnVar[3];
				}

				//tabls.push({"t": m[1], "tabl": m[2], "as": m[4], "on": m[5]});
				tabls.push({"t": m[1], "tabl": m[2], "as": m[4], "on": oncond});
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

	/** Conver js array into stirng quoted with "'"
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
				orders.push({"tabl": tabl, "field": match[3], "asc": asc });
			}
		}
		return orders;
	};

	/** Parse expr form "field: personName", ...
	 * @param {string} exp j-expr = "max(bas_person.PersonName)",
	 * @param {string} attrDataopt (alais in easyui "datat-options") field: personName,
	 * FIXME defining alias in data-options is not correct
	this.expr = function (exp, attrDataopt) {
		var expr = {};
		// alais = "field: personName"
		var alais = attr;
		// al = personName
		var al = tag.findAlais(attr);

		expr.alais = al;

		if(al_k[al]) {
			console.log("WARN - found duplicating alais: " + al + ". Ignoring...");
		} else al_k[al] = true;

		// var exp = $(th).attr(_aExpr);
		if (typeof exp != "undefined") {
			// j-expr = "max(bas_person.PersonName)"
			var match = regex.expr.exec(exp);
			if (match) {
				if (typeof match[2] != "undefined")
					expr.gfunc = match[2];
				if (typeof match[4] != "undefined")
					expr.tabl = match[4];
				if (typeof match[5] != "undefined") {
					if (typeof match[2] != "undefined")
						expr.expr = exp;
					else expr.expr = match[5];
				}
				// exprs.push(expr);
			} else
				console.log("Can't parse expr: " + exp);
		} else {
			// j-expr = null
			// exprs.push({"tabl": deftTabl, "expr": al, "alais": al});
			expr = {"tabl": deftTabl, "expr": al, "alias": al};
		}
		return expr;
	};
	 */

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
	 * @param {string} vn var name
	 * @return {object} value represented by vn, e.g. "x.y.z" */
	this.findVar = function (vn) {
		var v = window;
		var field;
		var vnss = regex.vn.exec(vn);
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
				console.error("Can't find variable for " + vn);
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
	 * @param {string} t
	 * @param {Array} argBuff args that alread has arguments setting by caller.
	 * @return {Array} [0] ds, [1] sql-key, [2] argBuff + [arg1, var1, arg2, ...]
	 */
	this.parseSk = function (t, argBuff) {
		if ( t === null || typeof t === "undefined" )
			return [];

		var args = [];
		var tss = t.trim().split(" ");

		var sqlId = tss[0];
		var tk = sqlId.split('.');
		if (tk.length === 1) {
			tk[1] = tk[0];
			tk[0] = "ds"; // default table name in datset.xml
		}
		args.push( tk[0] ); // ds
		args.push( tk[1] ); // sql-key

		// if (typeof argBuff !== "object")
		// 	argBuff = [];

		// replace variables
		// var regexCbbArg = /{\@\s*(.+)\s*\}/g;
		for ( var ix = 1; ix < tss.length; ix++ ) {
			var mOnVar = regex.cbbArg.exec( tss[ix] );
			if ( mOnVar ) {
				// if there is variable in args clause, replace with value
				var v = tag.findVar( mOnVar[1] );
				// argBuff.push( v );
			}
			// else
			// 	argBuff.push( argss[ix] );
		}
		// args.push( argBuff );
		return args;
	};
};
const tag = new Tag(true);

/**Common handlers for ir attributes, like ir-t, ir-list etc.*/
function EzHtml (J) {
	/**Parse table and joinning definition in html
	 * @param {string} pagerId pager id. default "irpager"
	 * @return {Array} [{t: "main-table/j/r/l", tabl: "table-1", as: "alais", on: cond-string}]<br>
	 * where cond-string = "col1=col2"
	 */
	this.tabls = function (gridId) {
		var t = $(gridId).attr(ir.t);
		if (t === undefined)
			console.error("In jeasy api v1.0, pager's t is moved to list/grid's tag - must presented there.");
		else
			return tag.joins(t);
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
	}
};
const EasyHtml = new EzHtml(J);

function EzCbb (J) {
	this.configWithArgs = function(cbbId) {
	}
};
const EasyCbb = new EzCbb(J);

function EzTree(J) {
	this.J = J;

	this.log = true,
	this.alertOnErr = true,

	// TODO @deprecated
	// bind cbb tree with data from s-tree.serv.
	// sk is specified by ir-sk
	this.cbbStree = function ( cbbId, sk, valueExpr, textExpr, onChangef, isSelect, onSuccessf) {
		this.combotree (cbbId, sk, null, onChangef);
		// if (cbbId.substring(0, 1) != "#")
		// 	cbbId = "#" + cbbId;
		// var cbb = $(cbbId);
		//
		// if (typeof t === "undefined" || t === null)
		// 	t = cbb.attr(_aT);
		// if (typeof sk === "undefined" || sk === null)
		// 	sk = cbb.attr(_aSemantik);
		//
		// var exprs = new Array();
		// easyTree.cbbEx ( cbbId, t, sk, null, null, exprs, isSelect, onChangef, onSuccessf );
	};

	// TODO @deprecated
	// bind cbb tree with results form s-tree.serv (data is filtered by rootId)
	this.cbbEx = function ( cbbtreeid, t, sk, rootId, conds, exprs, selectId, onselectf, onSuccessf, treeType, isMultiple) {
		this.combotree(cbbtreeid, sk, rootId, selectId, onselectf, isMultiple);
		// var treeType = treeType || "combotree";
		// if (cbbtreeid.substring(0, 1) != "#")
		// 	cbbtreeid = "#" + cbbtreeid;
		// if (typeof isMultiple == "undefined" || isMultiple == null || isMultiple == '')
		// 	isMultiple = false;//default: single check
		// var url = _servUrl + "s-tree.serv?t=any&sk=" + sk;
		// //var conds = [formatCond("=", "orgId", orgId, "e_areas")];
		// // semantics configured at server side: var order = formatOrders("fullpath");
		// //var qobj = formatQuery(exprs, "e_areas", conds, null, order);
		// var qobj = formatQuery(exprs, t, conds);
		//
		// $.ajax({type: "POST",
		// 	url: url,
		// 	data: JSON.stringify(qobj),
		// 	contentType: "application/json; charset=utf-9",
		// 	success: function (data) {
		// 		if (irLog) console.log("Bind combotree success: " + data);
		// 		var resp = JSON.parse(data);
		// 		 //$("#"+cbbtree).combotree( {data: resp} );
		//
		// 		if (typeof resp.total != "undefined") {
		// 			$(cbbtreeid)[treeType]({
		// 				data: resp.rows,
		// 				multiple: isMultiple,
		// 				onSelect: typeof onselectf === "function" ? onselectf : function() {}
		// 			});
		// 			if(typeof(selectId) != "undefined" && selectId != null)
		// 				$(cbbtreeid)[treeType]('setValue', selectId);
		//
		// 			if (typeof onSuccessf === "function")
		// 				onSuccessf(resp.rows);
		// 		}
		// 		else {
		// 			console.error("ERROR - bind combotree " + cbbtreeid + " failed.");
		// 			console.error(data);
		// 		}
		// 	},
		// 	error: function (data) {
		// 		console.log("ERROR - bind combotree " + cbbtreeid + " failed.");
		// 		console.log(data);
		// 		if (easyTree.alertOnErr)
		// 			$.messager.alert({title: "ERROR", msg: "can't load s-tree for " + cbbtreeid, icon: "info"});
		// 	}
		// });
	};

	// TODO to be deleted
	//easyTree.treegridEx( treegrid, t, sk, rootId, exprs, selectId, onselectf );
	this.treegridEx = function( treegrid, t, sk, rootId, exprs, selectId, onselectf ) {
		if (treegrid.substring(0, 1) != "#")
			treegrid = "#" + treegrid;
		var url = _servUrl + "s-tree.serv?t=" + t
			+ "&sk=" + sk + "&root=" + rootId;
		//var conds = [formatCond("=", "orgId", orgId, "e_areas")];
		// semantics configured at server side: var order = formatOrders("fullpath");
		var qobj = formatQuery( exprs, t );

		$.ajax({type: "POST",
			url: url,
			data: JSON.stringify(qobj),
			contentType: "application/json; charset=utf-9",
			success: function (data) {
					if (easyTree.log) console.log("Bind treegrid msg : " + data);
					var resp = JSON.parse(data);

					if (typeof resp.total != "undefined") {
						if (typeof onselectf === "function")
							$(treegrid).treegrid({ onSelect: onselectf });
						$(treegrid).treegrid("loadData", resp);
					}
					else {
						$.messager.alert({title: "提示", msg: "不能加载区域", icon: "info"});
					}
				},
			error: function (data) {
				console.log("ERROR - bind combotree " + treegrid + " failed.");
				console.log(data);
				if (easyTree.alertOnErr)
					$.messager.alert({title: "ERROR", msg: "can't load s-tree", icon: "info"});
			}
		});
	};

	/**Bind configured dataset to easyui combotree.
	 * @param {string} treeId
	 * @param {string} sk if not provide, will find from $('#treeId') ir-cbbtree.
	 * 		<br>format:<br>
	 * 		ir-sk = "xml-tbl.dataset-key, {@obj1.prop1}, const-arg2, ..."
	 * @param {array} sqlArgs [{name: value}], if not provided, will find from  $('#treeId') ir-cbbtree
	 * @param {string} selectId default selection
	 * @param {function} onChangef callback
	 * @param {boolean} isMultple multi-select
	 */
	this.combotree = function(treeId, sk, sqlArgs, rootId, selectId, onChangef, isMultiple) {
		if (treeId.substring(0, 1) != "#")
			treeId = "#" + treeId;
		var tree = $(treeId);

		if (typeof sk === "undefined" || sk === null) {
			// ir-sk = "xml-tbl.dataset-key, {@obj1.prop1}, const-arg2, ..."
			sk = tree.attr(ir.cbbtree);
		}
		// get sk from ir-sk attr
		// get args from ir-sk attr
		if (sk === undefined || sk === null)
			console.error(ir.sk + " attr in " + treeId + " is undefined. In jeasy v1.0, only configurd combobox is suppored (must have ir-sk).");
		else {
			var parsed = tag.parseSk(sk);
			sk = parsed[0];
			if (sqlArgs === undefined)
				sqlArgs = {};
			Object.assign(sqlArgs, parsed[1]);
		}

		if (typeof onChangef === "undefined" || onChangef === null)
			onChangef = tree.attr(ir.onchange);
		if (typeof onChangef === "string")
			onChangef = eval(onChangef);

		// request JMessage body
		var req = new jvue.DatasetCfg(	// s-tree.serv (SemanticTree) uses DatasetReq as JMessage body
					jconsts.conn,		// connection id in connexts.xml
					sk);				// sk in dataset.xml
		req.rootId = rootId;

		req.sqlArgs = sqlArgs;

		// all request are created as user reqs except query, update, insert, delete and ext like dataset.
		// DatasetReq is used as message body for semantic tree.
		// Port.stree is port of SemanticTree.
		// t=load/reforest/retree
		// user act is ignored for reading
		var jmsg = ssClient.userReq(jconsts.conn, 'load', Port.stree, req);

		// get data, then bind easyui combotree
		ssClient.commit(jmsg, function(resp) {
			console.log(resp);
			var tree = $(treeId);
			tree.combotree({
				data: resp.rows,
				multiple: isMultiple,
				onSelect: typeof onChangef === "function" ? onChangef : function() {}
			});
			if(typeof(selectId) != "undefined" && selectId != null)
				tree.combotree('setValue', selectId);
		});
	};

	/**Bind asyUI tree, with click/select function.<br>
	 * Data is gotten from s-tree.serv, with sk = 'sk'.
	 * - easyui treegrid must recursive looped to get all selected items.
	 * @param {string} idTree easy tree id:
	 * <ul class="easyui-tree" lines="true" style="margin-top: 3px;" data-options="animate:true,checkbox:true"
	 * id="irtree" ir-serv="tree" ir-t="role_funcs" ir-sql="trees.role_funcs" ir-argsfunc="getRoleId" ir-batchup="callback: jsonFormatSample('#irtree', 'a_role_funcs')" ></ul>
	 * @param {string} sk semantics key, default = [ir-semantics]
	 * @param {string[]} sqlArgs default null
	 * @param {function} onClick on selection chaged callback, default = [ir-onchange]
	 * @param {function} onChange on selection chaged callback, default = [ir-onchange]
	 * @param {function} onSuccess on binding success callback
	 */
	this.stree = function ( treeId, sk, sqlArgs, onClick, onChange, onSuccess) {
		if (treeId.substring(0, 1) != "#")
			treeId = "#" + treeId;
		var tree = $(treeId);

		if (typeof sk === "undefined" || sk === null)
			sk = tree.attr(_aSemantik);

		if (typeof onChangef === "undefined" || onChangef === null)
			onChangef = tree.attr(ir.onchange);
		if (typeof onChangef === "string")
			onChangef = eval(onChangef);

		// request JMessage body
		var req = new jvue.DatasetCfg(	// s-tree.serv (SemanticTree) uses DatasetReq as JMessage body
					jconsts.conn,		// connection id in connexts.xml
					sk);				// sk in datast.xml
		req.args = sqlArgs;

		// all request are created as user reqs except query, update, insert, delete and ext like dataset.
		// DatasetReq is used as message body for semantic tree.
		// Port.stree is port of SemanticTree.
		// t=load/reforest/retree
		// user act is ignored for reading
		var jmsg = ssClient.userReq(jconsts.conn, 'load', jvue.Protocol.Port.stree, req);

		// get data, then bind easyui tree
		// ssClient is created after logged in.
		ssClient.commit(jmsg, function(resp) {
			console.log(resp);
			EasyTree.bind(treeId,	// id
					'tree',			// easyui tree()
					resp.data,		// forest,
					onClick,
					onChange,
					onSuccess);
		});
	};

	this.bind = function (treeId, json, treeType, onClick, onSelect, onCheck, onLoad) {
		if (treeId.substring(0, 1) != "#")
			treeId = "#" + treeId;
		var tree = $(treeId);
		tree[treeType]({
			// data: JSON.parse(message).rows,
			data: json,
			onSelect: function(node) {
				if(typeof onSelect === "function")
					onSelect(node)
			},
			onCheck: function(node) {
				if(typeof onCheck === "function")
					onCheck(node)
			},
			onClick: function(node) {
				if(typeof onClick === "function")
					onClick(node)
			},
			onLoadSuccess: function(node, data) {
				if (typeof onLoad === "function")
					onLoad(node, data);
			},
			style: "height: 81px"
		});
	};

	/**load configured tree
	 * @param {string} idTree easy tree id:
	 * <ul class="easyui-tree" lines="true" style="margin-top: 3px;" data-options="animate:true,checkbox:true"
	 * id="irtree" ir-serv="tree" ir-t="role_funcs" ir-sql="trees.role_funcs" ir-argsfunc="getRoleId" ir-batchup="callback: jsonFormatSample('#irtree', 'a_role_funcs')" ></ul>
	 * @param {object} para {t, args, isSelected, onChangef, onClickf, onSuccessf }, where<br>
	 * t: sql dataset key, default using ir-t="ds.sql-key":<br>
	 * args: args for configured sql<br>
	 * isSelect: select the first or the selected id<br>
	 * onChangef: on selection chaged callback, default = [ir-onchange]<br>
	 * onClickf: on selection chaged callback, default = [ir-onchange]<br>
	 * onSuccessf: on binding success callback<br>
	 *  */
	this.configWithArgs2 = function ( treeId, para ) {
		this.stree ( treeId, para.t, para.args, para.isSelect,
			para.onChangef, para.onClickf, para.onSuccessf );
	},

	/**load configured tree
	 * @param {string} idTree easy tree id:
	 * <ul class="easyui-tree" lines="true" style="margin-top: 3px;" data-options="animate:true,checkbox:true"
	 * id="irtree" ir-serv="tree" ir-t="role_funcs" ir-sql="trees.role_funcs" ir-argsfunc="getRoleId" ir-batchup="callback: jsonFormatSample('#irtree', 'a_role_funcs')" ></ul>
	 * @param {string} t sql dataset key, default using ir-t="ds.sql-key":
	 * @param {Array} args args for configured sql
	 * @param {string/boolean} isSelect select the first or the selected id
	 * @param {string/function} onChangef on selection chaged callback, default = [ir-onchange]
	 * @param {string/function} onClickf on selection chaged callback, default = [ir-onchange]
	 * @param {function} onSuccessf on binding success callback
	this.configWithArgs = function ( treeId, t, args, isSelect, onChangef, onClickf, onSuccessf ) {
		if (treeId.substring(0, 1) != "#")
			treeId = "#" + treeId;

		var tree = $(treeId);

		// ir-t= ... {@obj.prop}
		if (typeof args === "undefined")
			args = [];
		else if (typeof args === "string")
			args = args.split(",");

		if (typeof t === "undefined" || t === null)
			t = tree.attr(_aT);
		t = tree.attr(_aT);

		if (typeof t === "undefined") {
			// TODO we need a more considerable design (a new tag?)
			alert ("Current Semantics API needing t (ir-t) to load configured sql and s-tree semantics.\nThis tag will be replaced later.");
			return;
		}

		args = irUtils.parseTArgs(t, args);

		// FIXME &ds=... is not supported yet
		var url = _servUrl + "s-tree.serv?t=sql&ds=" + args[0] + "&sk=" + args[1];

		for ( var i = 0; args[2] != null && typeof args[2] != "undefined" && i < args[2].length; i++ )
			url += "&args=" + args[2][i];

		var conn = tree.attr(_aConn);
		if(typeof conn !== "undefined")
			url += "&conn=" + conn;

		// header
		var qobj = formatQuery();

		$.ajax({type: "POST",
			// TODO let's support paging:
			// url: url + "&page=" + (pageNumb - 1) + "&size=" + pageSize,
			url: url + "&page=-1",
			contentType: "application/json; charset=utf-8",
			data: JSON.stringify(qobj),
			success: function (message) {
				if(easyTree.log)
					console.log("easyTree.configWithArgs() on success callback: ack from server - " + message);
				if(message.length > 0) {
					tree.tree({
						data: JSON.parse(message).rows,
						onSelect: function(node) {
							if (typeof onChangef === "string")
								onChangef = eval(onChangef);
							if(typeof onChangef === "function")
								onChangef(node)
						},
						onCheck: function(node) {
							if (typeof onChangef === "string")
								onChangef = eval(onChangef);
							if(typeof onChangef === "function")
								onChangef(node)
						},
						onClick: function(node) {
							if (typeof onClickf === "string")
								onClickf = eval(onClickf);
							if(typeof onClickf === "function")
								onClickf(node)
						},

						// not understood
						onLoadSuccess: function(node, data) {
							if(data.length > 0) {
								var n = tree.tree('find', data[0].id);
								tree.tree('select', n.target);
							}
						},
						// onLoadSuccess: function(node, data) {
						// 	if (typeof onSuccessf === "string")
						// 		onSuccessf = eval(onSuccessf);
						// 	if (typeof onSuccessf === "function")
						// 		onSuccessf(node, data);
						// },
					});

					if (typeof onSuccessf === "string")
						onSuccessf = eval(onSuccessf);
					if (typeof onSuccessf === "function")
						onSuccessf(node, data);
				}
			},
			error: function (message) {
				console.log("easyTree.configWithArgs() on error callback: ack from server - " + message);
			}
		});
	};
	 *  */

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
	 * @param {string} qformId the query form that can be used as condition to generate sql where clause.
	 * TODO documentation
	 */
	this.page = function (pagerId, qformId, onLoad, onSelect, onCheck, onCheckAll) {
		if(pagerId === null || pagerId === undefined || typeof pagerId !== 'string') {
			console.error("pager id is not valid");
			return;
		}
		else if(pagerId.substring(0, 1) != "#")
			pagerId = "#" + pagerId;

		var listId = $(pagerId).attr(ir.grid);
		if (listId === undefined || listId === null || listId.trim() === '') {
			console.error("gird/list id defined in pager is not valid. A " + ir.grid + " in pager tag must defined.");
			return;
		}
		listId = '#' + listId;

		// semantics key (config.xml/semantics)
		var semantik = $(pagerId).attr(ir.sk);

		var pgSize = $(pagerId).attr(ir.pagesize);
		if (pgSize === undefined)
			pgSize = -1;
		// Remember some variabl for later calling onPage()
		if (this.pageInfo[pagerId] === undefined) {
			this.pageInfo[pagerId] = {
				queryId: qformId,
				total: 0,
				page: 0,
				size: pgSize,
			};
			$(pagerId).pagination({
				pageSize: pgSize,
				onSelectPage: this.onPage,
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
			var tbls = EasyHtml.tabls(listId);
			if (tbls !== undefined) {
				// create a query request
				var maint = tbls[0].tabl;
				var mainAlias = tbls[0].as;
				req = ssClient.query(null,	// let the server finde connection
							maint,			// main table
							mainAlias,		// main alias
							this.pageInfo[pagerId]); // this.pageInfo, saving page ix for consequent querying
				var q = req.body[0];

				// handle query defined in grid attrs
				// [{exp: t.col as: c}, ...]
				var exprs = EasyHtml.thExprs(listId, mainAlias);
				q.exprss(exprs);

				// joins ( already parsed )
				q.joinss(tbls.splice(1, tbls.length - 1));

				// where clause
				var wheres = EasyQueryForm.conds(qformId, mainAlias);
				// q.wheres("=", "u.userId", "'" + uid + "'");
				q.wheres(wheres);
			}
		}
		// post request, handle response
		ssClient.commit(req, function(resp) {
			EasyMsger.progress();
			// var users = J.respObjs(resp, 0, 1);
			// var rows = resp.data.rs[0].splice(1);
			var rows = jeasy.rows(resp);
			EasyGrid.bindPage (listId, rows, onSelect, onCheck, onCheckAll, onLoad);

			var total = jeasy.total(resp, 0);
			var pgInf = EasyGrid.pageInfo[pagerId];
			pgInf.total = total;
			EasyGrid.bindPager(pagerId, total, pgInf.page, pgInf.size);
		}, EasyMsger.error);
	};

	this.bindPager = function (pagerId, total, page, size) {
		$(pagerId).pagination("refresh", {
			total: total,
			pageNumber: page + 1,
			pageSize: size,
		});
	};

	/** Helper function to load page on pager's event. */
	this.onPage = function (pageNumb, size) {
		// onPage is pagination's onSelectPage handler, so this.id = pager-id
		var pgInf = EasyGrid.pageInfo['#' + this.id];
		pgInf.page = pageNumb - 1;
		pgInf.size = size;
		EasyGrid.page(this.id, pgInf.queryId);
	}

	this.bindPage = function (gridId, json, onSelect, onCheck, onCheckAll, onLoad) {
		if (gridId.substring(0, 1) != "#")
			gridId = "#" + gridId;
		var g = $(gridId);

		if (onSelect)
			g.datagrid({ onSelect: onSelect });

		if (onCheck)
			g.datagrid({ onCheck: onCheck,
				onUncheck: onCheck});
		if (onCheckAll)
			g.datagrid({ onCheckAll: onCheckAll,
				onUncheckAll: onCheckAll});

		g.datagrid("loadData", json);
		if(typeof isSelectFirst === "undefined" || isSelectFirst != false) {
			// select row 1
			g.datagrid("selectRow", 0);
		}

		EasyMsger.close();
		if (typeof onLoad === "function")
			onLoad ( resp.rows, resp.total );
	};
};
const EasyGrid = new EzGrid(J);

function EzQueryForm(J) {
	this.load = function(formId) {
		// 1. load ir-combobox
		$(formId + " ["+ ir.combobox + "]").each(function(key, domval) {
			EasyCbb.configWithArgs(domval.id);
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
		if(typeof queryid != "undefined" && queryid.substring(0, 1) != "#")
			queryid = "#" + queryid;
		else if (typeof queryid === "undefined")
			queryid = _query;

		var conds;
		// if (typeof getQueryConds != "undefined") {
		// 	conds = getQueryConds();
		// 	if (conds) return conds;
		// }

		var fields = $( queryid ).serializeArray();
		if (!fields || fields.length <= 0) {
			console.log("ERROR - No query condition form found in " + queryid);
			return null;
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
			if (field.value === ir.ignored.cond) return;
			if (field.value === undefined || field.value === '') return;

			// $( ).append( field.value + " " );
			var n = field.name.replace(/\s\s+/g, ' ');
			var namess = n.split(' '); // table.column >/=

			if (namess.length < 2) {
				console.log("WARN - name attr in form (id=irquery) must indicating logic operand: " + n);
				return;
			}
			conds.push({op: namess[1].trim(), l: namess[0],
					r: "'" + field.value + "'"});	// FIXME: what about \' ?
		});
		return conds;
	}
};
const EasyQueryForm = new EzQueryForm(J);

function EzModalog() {
};
const EasyModalog = new EzModalog(J);

function EzMsger() {
	this.init = function() {
		this.msg = {};
		this.progressing = false;
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

	/** Report error to user only once. Flags are refreshed by init() */
	this.error = function(code, resp) {
		// Don't change this into Chinese, set another function here.
		if (EasyMsger.msg[code] === null || EasyMsger.msg[code] === undefined) {
			EasyMsger.msg[code] = code;
			console.error(resp)
			if (code === jvue.Protocol.MsgCode.exSession)
				$.messager.alert('warn', 'Session Error! Please re-login');
			else if (code === jvue.Protocol.MsgCode.exIo)
				$.messager.alert('warn', 'Network Problem!');
		}
		else {
			console.warn('Error message ignored:')
			console.warn(resp);
		}
	}
};
const EasyMsger = new EzMsger(J);
