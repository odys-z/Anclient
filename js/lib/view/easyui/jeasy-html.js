/** html handler
 * @module jclient/html */

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
	 * <b>Note:</b>The regex is used by both formatTablJoins() and easyTree.configWithArgs()
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
	expr = /\s*((\w+)\s*\s*\()?\s*((\w+)\s*\.)?\s*(\w+)\s*\)?\s*/i,

	/**regex for matching expr like "field:sqlAlias"*/
	alais: /field\s*:\s*\'(\w+)\'/i,

	/**
	 * [0] x.y.z.c
	 * [1] x
	 * [2] y.z.c
	 */
	vn: /\s*(\w+)\.(.*)/i;


}

/**html tag's attribute parser.
 * Parsing ir-expr="max(t.col)", etc.
 */
const tag = new function {
	constructor() {
		this.debug = true;
	},

	/**Format table-joins request object: [{tabl, t, on, as}]
	 * @param {string} t "b_articles, j:b_cate, l:b_author:a authorId=authorId and a.name like 'tom'"
	 * @return {Array} [{tabl, t, on, as}]
	 */
	joins: function (t) {
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
	}

	/**Find j-orderby tag and compose order-by request array:<br>
	 * [{"tabl": tabl, "field": column, "asc": "asc/desc"}, ...]
	 * @param {string} ordstr string in j-order="t.col asc/desc"
	 * @param {string} maintabl
	 */
	orders: function(ordstr, maintabl) {
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
	}

	/** Parse expr form "field: personName", ...
	 * @param {string} exp j-expr = "max(bas_person.PersonName)",
	 * @param {string} attrDataopt (alais in easyui "datat-options") field: personName,
	 * FIXME defining alias in data-options is not correct
	 */
	expr: function (exp, attrDataopt) {
		var expr = {};
		// alais = "field: personName"
		var alais = attr;
		// al = personName
		var al = tag.findAlais(attr);

		expr.alais = al;

		if(al_k[al]) {
			console.log("WARN - found duplicating alais: " + al + ". Ignoring...");
			continue;
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
	}

	/**Match expr in "target" with regexAlais.
	 * @param {string} target: string to be matched
	 * @return {string} alais name of sql expr
	 * */
	findAlais: function (target) {
		var match = regex.alais.exec(target);
		if(match)
			return match[1];
		else {
			console.log("ERROR - can't parsing field expression: " + target);
			return target;
		}
	}

	/**find var like x.y.z
	 * @param {string} vn var name */
	findVar: function (vn) {
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
	}


 }();
