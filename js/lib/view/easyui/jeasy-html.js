/** easyui html handler
 * <p>Easyui is html based api. All jclient integration is via html intervention.</p>
 * <p>This module is a helper for handling html tag attribute string parsing.</p>
 * @module jclient/html */

if (J === undefined)
	console.error("You need initialize J - include jeasy-api.js first.");

const regex = {
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
	 * test helper: http://www.regular-expressions.info/javascriptexample.html
	 * TEST1: [0]a.FullPath desc [1]a. [2]a [3]FullPath [4] desc [5]desc
	 * TEST2: [0]FullPath desc [1]undefined [2]undefined [3]FullPath [4] desc [5]desc
	 * TEST3: [0]FullPath [1]undefined [2]undefined [3]FullPath [4] undefined [5]undefined
	 */
	order: /\s*((\w+)\.){0,1}(\w+)(\s+(asc|desc){0,1}){0,1}\s*/i,

	/** [2] func name, [4] tabl, [5] field */
	expr: /\s*((\w+)\s*\s*\()?\s*((\w+)\s*\.)?\s*(\w+)\s*\)?\s*/i,

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
	 * @return {Array} [{tabl, t, on, as}]
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
			else
				tabls.push({"t": "main-table", "tabl": tss[i].trim()});
		}
		return tabls;
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
				if(typeof match[2] != "undefined")
					tabl = match[2];
				if(typeof match[3] == "undfined") {
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
	 */
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
			else return vn;
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
	this.parseTArgs = function (t, argBuff) {
		if ( t === null || typeof t === "undefined" )
			return [];

		var args = [];
		var tss = t.trim().split(" ");

		var sqlId = tss[0];
		var tk = sqlId.split('.');
		if (tk.length === 1) {
			tk[1] = tk[0];
			tk[0] = "cbb";
		}
		args.push( tk[0] ); // ds
		args.push( tk[1] ); // sql-key

		if (typeof argBuff !== "object")
			argBuff = [];

		// replace variables
		// var regexCbbArg = /{\@\s*(.+)\s*\}/g;
		for ( var ix = 1; ix < tss.length; ix++ ) {
			var mOnVar = regex.cbbArg.exec( tss[ix] );
			if ( mOnVar ) {
				// if there is variable in args clause, replace with value
				var v = tag.findVar( mOnVar[1] );
				argBuff.push( v );
			}
			else
				argBuff.push( argss[ix] );
		}
		args.push( argBuff );
		return args;
	};
};

const tag = new Tag(true);

/**Common handlers for easyui, like ir-t, ir-list etc.*/
const EasyHtml = new function() {
};

const EasyCbb = new function() {
}();

function EzTree(J) {
	this.J = J;

	this._aCheck = 'ir-checkexpr',
	this._aRoot = 'ir-sroot',
	this.log = true,
	this.alertOnErr = true,

	// bind cbb tree with data from s-tree.serv.
	// sk is specified by ir-sk
	// TODO this function don't need 't' because it can be found in semantics.
	this.cbbStree = function ( cbbId, t, sk, valueExpr, textExpr, onChangef, isSelect, onSuccessf) {
		if (cbbId.substring(0, 1) != "#")
			cbbId = "#" + cbbId;
		var cbb = $(cbbId);

		if (typeof t === "undefined" || t === null)
			t = cbb.attr(_aT);
		if (typeof sk === "undefined" || sk === null)
			sk = cbb.attr(_aSemantik);
		// if (typeof valueExpr === "undefined" || valueExpr === null)
		// 	valueExpr = cbb.attr(easyTree._aValue);
		// if (typeof textExpr === "undefined" || textExpr === null)
		// 	textExpr = cbb.attr(easyTree._aText);

		var exprs = new Array();
		// exprs.push( formatExpr( t, valueExpr, "id" ));
		// exprs.push( formatExpr( t, textExpr, "text" ));

		easyTree.cbbEx ( cbbId, t, sk, null, null, exprs, isSelect, onChangef, onSuccessf );
	};

	// bind cbb tree with results form s-tree.serv (data is filtered by rootId)
	this.cbbEx = function ( cbbtreeid, t, sk, rootId, conds, exprs, selectId, onselectf, onSuccessf,treeType,isMultiple) {

		var treeType = treeType || "combotree";
		if (cbbtreeid.substring(0, 1) != "#")
			cbbtreeid = "#" + cbbtreeid;
		if (typeof isMultiple == "undefined" || isMultiple == null || isMultiple == '')
        	isMultiple = false;//默认为单选
		var url = _servUrl + "s-tree.serv?t=any&sk=" + sk;
		//var conds = [formatCond("=", "orgId", orgId, "e_areas")];
		// semantics configured at server side: var order = formatOrders("fullpath");
		//var qobj = formatQuery(exprs, "e_areas", conds, null, order);
		var qobj = formatQuery(exprs, t, conds);

		$.ajax({type: "POST",
			url: url,
			data: JSON.stringify(qobj),
			contentType: "application/json; charset=utf-9",
			success: function (data) {
				if (irLog) console.log("Bind combotree success: " + data);
				var resp = JSON.parse(data);
				 //$("#"+cbbtree).combotree( {data: resp} );

				if (typeof resp.total != "undefined") {
					$(cbbtreeid)[treeType]({
						data: resp.rows,
						multiple:isMultiple,
						onSelect: typeof onselectf === "function" ? onselectf : dummy
					});
					if(typeof(selectId) != "undefined" && selectId != null)
						$(cbbtreeid)[treeType]('setValue', selectId);

					if (typeof onSuccessf === "function")
						onSuccessf(resp.rows);
				}
				else {
					console.log("ERROR - bind combotree " + cbbtreeid + " failed.");
					console.log(data);
					if (easyTree.alertOnErr)
						$.messager.alert({title: "提示", msg: "can't load s-tree for " + cbbtreeid, icon: "info"});
				}
			},
			error: function (data) {
				console.log("ERROR - bind combotree " + cbbtreeid + " failed.");
				console.log(data);
				if (easyTree.alertOnErr)
					$.messager.alert({title: "ERROR", msg: "can't load s-tree for " + cbbtreeid, icon: "info"});
			}
		});
	};

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

	/**Bind asyUI tree, with click/select function<br>
	 * Data is gotten from dataset.serv, with sk = 'sk'.
	 * - easyui treegrid must recursive looped to get all selected items.
	 * @param {string} idTree easy tree id:
	 * <ul class="easyui-tree" lines="true" style="margin-top: 3px;" data-options="animate:true,checkbox:true"
	 * id="irtree" ir-serv="tree" ir-t="role_funcs" ir-sql="trees.role_funcs" ir-argsfunc="getRoleId" ir-batchup="callback: jsonFormatSample('#irtree', 'a_role_funcs')" ></ul>
	 * @param {string} t target. for simple tree, t = table. for joined tables, t is a join clause, default = [ir-t]
	 * @param {string} sk semantics key, default = [ir-semantics]
	 * @param {string} checkExpr with checkbox
	 * @param {string} groupings grouping attr in "," seperated
	 * @param {string} rootId default null
	 * @param {Array} conds conditions
	 * @param {string/boolean} isSelect select the first or the selected id
	 * @param {string/function} onChangef on selection chaged callback, default = [ir-onchange]
	 * @param {function} onSuccessf on binding success callback
	 */
	this.stree = function ( treeId, t, sk, checkExpr, groupings, rootId, conds, isSelect, onChangef, onSuccessf, onClickf) {
		if (treeId.substring(0, 1) != "#")
			treeId = "#" + treeId;
		var tree = $(treeId);

		if (typeof t === "undefined" || t === null)
			t = tree.attr(_aT);
 		// {Array}: [{tabl, t, on, as}]
		var joins = formatTablJoins(t);
		var maintbl = joins[0].tabl;

		if (typeof sk === "undefined" || sk === null)
			sk = tree.attr(_aSemantik);
		// if (typeof valueExpr === "undefined" || valueExpr === null)
		// 	valueExpr = tree.attr(easyTree._aValue);
		// if (typeof textExpr === "undefined" || textExpr === null)
		// 	textExpr = tree.attr(easyTree._aText);
		if (typeof checkExpr === "undefined" || checkExpr === null)
			checkExpr = tree.attr(easyTree._aCheck);
		if (typeof rootId === "undefined" || rootId === null)
			rootId = tree.attr(easyTree._aRoot);

		var groupAttr = tree.attr(_aGroup);
		var groupings = findGroups(maintbl, groupAttr);

		if (typeof onChangef === "undefined" || onChangef === null)
			onChangef = tree.attr(_aOnchange);
		if (typeof onChangef === "string")
			onChangef = eval(onChangef);

		var exprs = new Array();
		// exprs.push( formatExpr( maintbl, valueExpr, "id" ));
		// exprs.push( formatExpr( maintbl, textExpr, "text" ));
		// if (checkExpr)
		// 	exprs.push( formatExpr( maintbl, checkExpr, "checked" ));
		if (checkExpr)
			exprs.push( parseExprReg ( maintbl, checkExpr, "checked" ));

		// "s-tree.serv" or "s-tree-secue.serv"
		var servId = tree.attr(_aServ);
		if (servId === "query") {
			servId = "s-tree";
			console.warn(" using s-tree.serv instead of query.serv for " + treeId);
		}
		else if (typeof servId === "undefined" )
			servId = "s-tree";
		var url = _servUrl + servId + ".serv?t=any&sk=" + sk;

		if (rootId)
			url += "&root=" + rootId;

		var qobj = formatQuery(exprs, t, conds, groupings);

		$.ajax({type: "POST",
			url: url,
			data: JSON.stringify(qobj),
			contentType: "application/json; charset=utf-8",
			success: function (message) {
				if(easyTree.log)
					console.log("easyTree.stree() on success callback: ack from server - " + message);
				if(message.length > 0) {
					tree.tree({
						data: JSON.parse(message).rows,
						onSelect: function(node) {
							if(typeof onChangef === "function")
								onChangef(node)
						},
						onCheck: function(node) {
							if(typeof onChangef === "function")
								onChangef(node)
						},
						onClick: function(node) {
							if(typeof onClickf === "function")
								onClickf(node)
						},
						onLoadSuccess: function(node, data) {
							if (typeof onSuccessf === "function")
								onSuccessf(node, data);
						},
						style: "height: 81px"
					});
				}
			},
			error: function (message) {
				console.log("easyTree.stree() on error callback: ack from server - " + message);
			}
		});
	};

	this.bind = function (treeId, json, onClick, onSelect, onLoad) {
		if (treeId.substring(0, 1) != "#")
			treeId = "#" + treeId;
		var tree = $(treeId);
		tree.tree({
			// data: JSON.parse(message).rows,
			data: json,
			onSelect: function(node) {
				if(typeof onChangef === "function")
					onSelect(node)
			},
			onCheck: function(node) {
				if(typeof onChangef === "function")
					onSelect(node)
			},
			onClick: function(node) {
				if(typeof onClickf === "function")
					onClick(node)
			},
			onLoadSuccess: function(node, data) {
				if (typeof onSuccessf === "function")
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
		easyTree.configWithArgs ( treeId, para.t, para.args, para.isSelect,
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
	 *  */
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

	this.retree = function (tabl, sk, root, onSuccessf) {
		var url = _servUrl + "s-tree" + _servSuffix + "?t=retree&sk=" + sk + "&root=" + root;
		var qobj = formatQuery(null, tabl);
		$.ajax({type: "POST",
			url: url,
			data: JSON.stringify(qobj),
			contentType: "application/json; charset=utf-8",
			success: function(msg) {
				if (msg) {
					var resp = JSON.parse(msg);
					if (easyTree.log) console.log( resp.msg );
					if (typeof onSuccessf === "function")
						onSuccessf(msg);
				}
				else {
					if (easyTree.alertOnErr)
						$.messager.alert("info", "retree failed for unkown reason.", "info");
				}
			},
			error: function(msg) {
				if (easyTree.alertOnErr)
					$.messager.alert("info", msg, "info");
			}
		});
	};

	this.reforest = function (tabl, sk,onSuccessf) {
		//var url = _servUrl + "s-tree" + _servSuffix + "?t=reforest&sk=easyui-treegrid-domain";
		var url = _servUrl + "s-tree" + _servSuffix + "?t=reforest&sk=" + sk;
		var qobj = formatQuery(null, tabl);
		$.ajax({type: "POST",
			url: url,
			data: JSON.stringify(qobj),
			contentType: "application/json; charset=utf-8",
			success: function(msg) {
				if (msg) {
					var resp = JSON.parse(msg);
					if (typeof resp.code === "string" && resp.code === "OK") {
						$.messager.alert("info", "树形结构加载成功！<br>" + resp.msg, "info");
						loadPage();
					}
					else
						$.messager.alert("info", "failed: \n" + resp.msg, "info");

					if (typeof onSuccessf === "function")
						onSuccessf(msg);
				}
				else
					$.messager.alert("info", "failed unkown", "info");
			},
			error: function(msg) {
				$.messager.alert("info", msg, "info");
			}
		});
	};
};
const EasyTree = new EzTree (J);

function EzGrid (J) {
};
const EasyGrid = new EzGrid(J);

function EzForm(J) {
};
const EasyForm = new EzForm(J);
