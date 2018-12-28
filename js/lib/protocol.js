/**Json protocol handler to support Japi */
var Protocol = new function () {
	this.cfg = {
		ssInfo: "ss-k",
	};

	this.code = {
		err: "err",
		/** Session exception */
		ssEx: "ss_err",
		/** Semantics exception */
		semanticEx: "??",

		/** Network failed */
		netEx: "net-err"
	};


	/**formatQuery - format query.serv request object
	 * @param  {string} tabl  from table
	 * @param  {string} alias
	 * @return {object} fromatter to build request object
	 */
	this.query = function (tbl, alias) {
		return new queryObj(this, tbl, alias);
	}

}

function queryObj(query, tabl, alias) {
	this.query = query;
	this.mtbl = tabl;
	this.malias = alias;
	this.exprs = [];
	this.joinings = [];

	this.page = function(size, idx) {
		this.page = idx;
		this.pgSize = size;
		return this;
	}

	/**add joins to the query request object
	 * @param {string} jt join type, example: "j" for inner join, "l" for left outer join
	 * @param {string} t table, example: "a_roles"
	 * @param {string} a alias, example: "r"
	 * @param {string} on on conditions, example: "r.roleId = mtbl.roleId and mtbl.flag={@varName}"
	 * Variables are replaced at client side (by js)
	 * @return this query object
	 */
	this.join = function(jt, t, a, on) {
		// parse "j:tbl:alias [conds]"
		// if (typeof this.joinings === "undefined")
		// 	this.joinings = new Array();
		this.joinings.push({t: jt, tabl: t, alias: a, on: on});
		return this;
	}

	this.j = function(tbl, alias, conds) {
		// if (typeof this.joinings === "undefined" || this.joinings === null)
		// 	this.joinings = [];
		// this.joinings.push({type: "j", tabl: tbl, alias: alias, conds: conds});
		// return this;
		return this.join("j", tabl, alias, conds);
	}

	this.l = function(tbl, alias, conds) {
		return this.join("l", tabl, alias, conds);
	}

	this.expr = function(exp, as) {
		exprs.push({expr: exp, as: as});
	}

	this.commit = function() {
		var hd = this.formatHeader();
		// return { header: hd, tabls: froms, exprs: expr, conds: cond, orders: order, group: groupings};
		return {header: hd,
				body: [{a: "R",
						exprs: this.exprs,
						f: this.mtbl,
						j: this.joinings,
						conds: this.cond,
						orders: this.order,
						group: this.groupings}]};
	}

	this.formatHeader = function() {
		var sstr = localStorage.getItem(Protocol.cfg.ssInfo);
		if(sstr != null && typeof sstr != "undefined" && sstr.length > 0) {
			var ssinf = JSON.parse(sstr);
			// return {md: ssinf.md, ssid: ssinf.ssid, uid: ssinf.uid, iv: ssinf.iv};
			return ssinf;
		}
	}
}
