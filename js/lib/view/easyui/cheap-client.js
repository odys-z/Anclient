
/* */

function CheapClient (ssclient, cheaport) {
	this.connId = null;

	if (typeof cheaport === 'string')
		this.cheaport = cheaport;
	else this.cheaport = jvue.CheapReq.port;

	this.jclient = ssclient;
	this.cheapReq = jvue.chpEnumReq;

	this.conn = function (conn) {
		this.connId = conn;
	};

	/**Load a task's workflow nodes joined with instances.
	 * @param {string} wfId
	 * @param {object} opts<br>
	 * opts.taskId: task id<br>
	 */
	this.loadFlow = function (wfId, opts) {
		// this.cmdArgs = [wfId, taskId];
		var cheapReq = new jvue.CheapReq(wfId)
						.a(this.cheapReq.load)
						.taskId(opts.taskId);
		var jmsg = this.jclient.userReq(this.connId, engports.cheapflow, cheapReq);
		this.jclient.commit(jmsg, opts.onok, function (c, d) {
			if (typeof opts.onerror === 'function')
				opts.onerror(c, d);
			else EasyMsger.error(c, d);
		});
		return this;
	}

	/**Load commands
	 * @param {string} wfId
	 * @param {object} opts<br>
	 * opts.taskId: task id<br>
	 * opts.nodeId: node Id<br>
	 * opts.usrId: user Id<br>
	 */
	this.loadCmds = function (wfId, opts) {
		if (typeof wfId !== 'string' || typeof opts.nodeId !== 'string') {
			console.error('Parameters invalid: wfId, opts.nodeId',
				wfId, opts);
			return;
		}

		var cheapReq = new jvue.CheapReq(wfId)
						.a(this.cheapReq.nodeCmds)
						.nodeId(opts.nodeId)
						.usrId(opts.usrId)
						.taskId(opts.taskId); // optional - not used
		var jmsg = this.jclient.userReq(this.connId, engports.cheapflow, cheapReq);
		this.jclient.commit(jmsg, opts.onok, function (c, d) {
			if (typeof opts.onerror === 'function')
				opts.onerror(c, d);
			else EasyMsger.error(c, d);
		});
		return this;
	}

	/**Post a workflow starting request.
	 * @param {CheapReq} cheapReq the request body
	 * @param {object} opts options<br>
	 * opts.taskId {string}: (Optional) task id (bussiness form record id)<br>
	 * opts.onok {function}: on ok callback<br>
	 * @return {CheapClient} this
	 */
	this.start = function (cheapReq, opts) {
		cheapReq.a(this.cheapReq.start)	// this.cheapReq is the req enum
				.taskId(opts.taskId)
		var jmsg = this.jclient.userReq(this.connId, engports.cheapflow, cheapReq);
		this.jclient.commit(jmsg, opts.onok, function (c, d) {
			if (typeof opts.onerror === 'function')
				opts.onerror(c, d);
			else if (c === jvue.CheapCode.err_rights)
				EasyMsger.alert(EasyMsger.m.cheap_no_rights);
			else
				EasyMsger.error(c, d);
		});
		return this;
	}

	this.step = function (cheapBody, opts) {
		cheapBody.a(this.cheapReq.cmd);
		var jmsg = this.jclient.userReq(this.connId, engports.cheapflow, cheapBody);
		this.jclient.commit(jmsg, opts.onok, opts.onerror);
	}

	this.rights = function (wfid, taskId, currentNodeId, usrId, opts) {
		var req = new jvue.CheapReq(this.jclient, this.cheaport)
						.a(this.cheapReq.load)
						.arg('wfId', wfid)
						.arg('taskId', taskId)
						.arg('currentNode', currentNodeId)
						.arg('usrId', usrId);
		this.jclient.commit(req, opts.onok);
	}
}
