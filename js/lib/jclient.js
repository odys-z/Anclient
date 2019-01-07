/**Java equivalent of
 * io.odysz.jclient.Clients;
 * io.odysz.jclient.SessionClient;
 */
function $J () {
	this.cfg = {
		connId: null,
		verbose: true,
		defaultServ: null,
	}

	this.servUrl = function (port) {
		return this.cfg.defaultServ + '/' + port + '?conn=' + this.cfg.connId;
	}

	this.init = function (connId, urlRoot) {
		this.cfg[connId] = urlRoot;

		if (this.cfg.defaultServ === null)
			this.cfg.defaultServ = urlRoot;
	}

	this.login = function (usrId, pswd, onLogin, onError) {
		// byte[] iv =   AESHelper.getRandom();
		// String iv64 = AESHelper.encode64(iv);
		// String tk64 = AESHelper.encrypt(uid, pswdPlain, iv);

		var aes = new AES();
		var iv = aes.getIv128();
		var c = aes.encrypt(usrId, pswd, iv);
		// var qobj = formatLogin(logId, c, bytesToB64(iv));
		var req = Protocol.formatSessionLogin(usrId, c, aes.bytesToB64(iv));
		var url = $J.servUrl(Protocol.Port.session);

		$.ajax({type: 'POST',
				// url: this.cfg.defaultServ + "/query.serv?page=" + pgIx + "&size=" + pgSize,
				url: url,
				contentType: "application/json; charset=utf-8",
				data: JSON.stringify(req),
				success: function (resp) {
					// response Content-Type = application/json;charset=UTF-8
					// code != ok
					if (resp.code !== Protocol.MsgCode.ok)
						if (typeof onError === "function")
							onError(Protocol.MsgCode.exIo, resp);
						else console.error(resp);
					// code == ok
					else {
						var sessionClient = new SessionClient(resp.msg);
						if (typeof onLogin === "function")
							onLogin(sessionClient);
						else console.log(sessionClient);
					}
				},
				error: function (data) {
					if (typeof onError === "function")
						onError(Protocol.MsgCode.exIo, data);
					else {
						console.error("Accessing server failed.");
						console.error("Url: " + url);
						console.error("respons:");
						console.error(data);
					}
				}
			});
	}
}

function SessionClient (ssInf) {
	this.ssInf = ssInf;

	/**load records paged at server side.
	 * @param {object} query query object
	 * Use JProtocol to generate query object:<pre>
	var qobj = Protocol.query(tabl)
					.j()
					.expr()
					.where()
					.groupby()
					.orderby()
					.commit();</pre>
	 * @param {int} pgSize page size, -1 for no paging at server side.
	 * @param {int} pgIx page index, starting from 0. -1 for no paging at server side.
	 * @param {function} onSuccess on ajax success function: f(respons-data) {...}
	 * This function been called when http response is ok, can be called even when jserv throw an exception.
	 * Use JProtocol to parse the respons data.
	 * @param {function} onError on ajax error function: f(respons-data) {...}
	 * @param
	 */
	this.loadPage = function (query, pgSize, pgIx, onSuccess, onError) {
		if (typeof pgSize === "undefined")
			pgSize = -1;
		if (typeof pgIx === "undefined")
			pgIx = -1;

		$.ajax({type: "POST",
			//url: servUrl + "?t=" + t + "&page=" + (pageNumb - 1) + "&size=" + pageSize,
			url: this.cfg.defaultServ + "/query.serv?page=" + pgIx + "&size=" + pgSize,
			contentType: "application/json; charset=utf-8",
			data: JSON.stringify(query),
			success: function (data) {
				if (checkResponse(data)) {
					console.error("checking respons failed. response:")
					console.error(data);
				}
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

function checkResponse(resp) {
	if (typeof resp === "undefined" || resp === null || resp.length < 2)
		return "err_NA";
	else return false;
}
