function Japi () {
	this.cfg = {
		verbose: true
	}

	this.init = function (servId, urlRoot) {
		if (typeof this.servs === "undefined")
			this.servs = {};
		this.servs[servId] = urlRoot;
		this.defaultUrl = urlRoot;
	}

	/**load records paged at server side.
	 * @param {object} query query object
	 * Use JProtocol to generate query object:<pre>
	var qobj = protocol.query(tabl)
					.j()
					.expr()
					.where()
					.groupby()
					.orderby()
					.commit();</pre>
	 * @param {int} pgSize page size
	 * @param {int} pgIx page index, starting from 0
	 * @param {function} onSuccess on ajax success function: f(respons-data) {...}
	 * This function been called when http response is ok, can be called even when jserv throw an exception.
	 * Use JProtocol to parse the respons data.
	 * @param {function} onError on ajax error function: f(respons-data) {...}
	 * @param
	 */
	this.loadPage = function (query, pgSize, pgIx, onSuccess, onError) {
		$.ajax({type: "POST",
			//url: servUrl + "?t=" + t + "&page=" + (pageNumb - 1) + "&size=" + pageSize,
			url: this.defaultUrl + "&page=" + pgIx + "&size=" + pgSize,
			contentType: "application/json; charset=utf-8",
			data: JSON.stringify(query),
			success: function (data) {
				if (this.cfg.verbose)
					console.log(data);
				if (typeof onSuccess === "function")
					onSuccess(data);
			},
			error: function (data) {
				if (typeof onError === "function")
					onError(data);
				else console.error(data);
			}
		});
	}
}
