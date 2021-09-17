
/* */

// import $ from 'jquery';
import {CheapReq, chpEnumReq, CheapCode} from './cheap-req.js'

class CheapClient {
	constructor (ssclient, cheaport) {
		this.connId = null;

		if (typeof cheaport === 'string')
			this.cheaport = cheaport;
		else this.cheaport = CheapReq.port;

		this.jclient = ssclient;
		this.cheapReq = chpEnumReq;

		this.conn = function (conn) {
			this.connId = conn;
		}
	}

	/**Load a task's workflow nodes joined with instances.
	 * @param {string} wfId
	 * @param {object} opts<br>
	 * opts.taskId: task id<br>
	 */
	loadFlow (wfId, opts) {
		// this.cmdArgs = [wfId, taskId];
		var cheapReq = new CheapReq(wfId)
						.A(this.cheapReq.load)
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
	loadCmds (wfId, opts) {
		if (typeof wfId !== 'string' || typeof opts.nodeId !== 'string') {
			console.error('Parameters invalid: wfId, opts.nodeId',
				wfId, opts);
			return;
		}

		var cheapReq = new CheapReq(wfId)
						.A(this.cheapReq.nodeCmds)
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
	start (cheapReq, opts) {
		cheapReq.A(this.cheapReq.start)	// this.cheapReq is the req enum
				.taskId(opts.taskId)
		var jmsg = this.jclient.userReq(this.connId, engports.cheapflow, cheapReq);
		this.jclient.commit(jmsg, opts.onok, function (c, d) {
			if (typeof opts.onerror === 'function')
				opts.onerror(c, d);
			else if (c === CheapCode.err_rights)
				EasyMsger.alert(EasyMsger.m.cheap_no_rights);
			else
				EasyMsger.error(c, d);
		});
		return this;
	}

	step (cheapBody, opts) {
		cheapBody.A(this.cheapReq.cmd);
		var jmsg = this.jclient.userReq(this.connId, engports.cheapflow, cheapBody);
		this.jclient.commit(jmsg, opts.onok, opts.onerror);
	}

	rights (wfid, taskId, currentNodeId, usrId, opts) {
		var req = new CheapReq(this.jclient, this.cheaport)
						.A(this.cheapReq.load)
						.arg('wfId', wfid)
						.arg('taskId', taskId)
						.arg('currentNode', currentNodeId)
						.arg('usrId', usrId);
		this.jclient.commit(req, opts.onok);
	}
}

export {CheapClient};
