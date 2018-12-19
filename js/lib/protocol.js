var protocol = new function protocol() {
	this.code = {
		err: "err",
		/** Session exception */
		ssEx: "ss_err",
		/** Semantics exception */
		semanticEx: "??",

		/** Network failed */
		netEx: "net-err"
	}

	this.query = function (tbl, alias) {
		return new queryObj(this, tbl, alias);
	}

	/**formatQuery - format query.serv request object
	 * @param  {string} tabl  from table
	 * @return {object} fromatter to build request object
	 */
	this.query = function (tabl) {
		var hd = formatHeader();
		if (typeof froms == "string")
			return { header: hd, tabls: formatTablJoins(froms), exprs: expr, conds: cond, orders: order, group: groupings };
		else
			return { header: hd, tabls: froms, exprs: expr, conds: cond, orders: order, group: groupings};
	}

}

function queryObj(query, tabl, alias) {
	this.query = query;
	this.mtbl = tabl;
	this.malias = alias;

	this.page = function(size, idx) {
		this.page = idx;
		this.pgSize = size;
		return this;
	}

	/**add joins to the query request object
	 * @param{string} t example: "j:a_roles:r [r.roleId = mtbl.roleId and mtbl.flag={@varName}]"
	 * @return this query object
	 */
	this.join = function(t) {
		// parse "j:tbl:alias [conds]"
		return this;
	}

	this.j = function(tbl, alias, conds) {
		if (typeof this.joinings === "undefined" || this.joinings === null)
			this.joinings = [];
		this.joinings.push({tabl: tbl, alias: alias, conds: conds});
		return this;
	}

	this.commit = function() {
		return sql;
	}
}
