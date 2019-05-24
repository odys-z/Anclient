
import $ from 'jquery';
import {Protocol, JMessage, JHeader, QueryReq, UserReq} from '../../protocol.js';


/**See semantic.workflow/io.odysz.sworkflow.EnginDesign.Req */
const chpEnumReq = {
	heartbeat: "ping",
	/** load workflow list */
	load: "load",
	/** load a node's commnads */
	nodeCmds: 'node-cmds',
	TgetDef: "get-def",
	findRoute: "findroute",
	cmdsRight: "right",
	/** client use this to ask plausible operation using 't' */
	Ttest: "test",
	start: "start",
	/**request stepping according to cmds configured in oz_wfcmds */
	cmd: "cmd",
	close: "close",
	timeout: "timeout",
}

/** @See io.odysz.sworkflow.CheapException */
const CheapCode = {
	ok: 'ok',
	err: 'wf_err',
	err_rights: 'wf_err_rights',
}

///////////////// io.odysz.sworkflow ///////////////////////////////////////////
class CheapReq {
	// a (req.name)
	// protected String wftype;
	// protected String[] cmdArgs;
	// protected String ndescpt;
	// protected String childTbl;
	// protected ArrayList<String[]> taskNvs;
	// protected ArrayList<ArrayList<String[]>> childInserts

	constructor (wftype, port) {
		this.wftype = wftype;
		if (port === undefined)
			this.port = 'cheapflow.sample';
		else this.port = port;
	}

	/**set a.<br>
	 * a() can only been called once.
	 * @param {string} a
	 * @return {UserReq} this */
	a(a) {
		this.a = a;
		return this;
	}

	arg(n, v) {
		if (v !== undefined) { // getting
			if (this.cmdArgs === undefined)
				this.cmdArgs = {};
			// this.cmdArgs = Object.assign(this.cmdArgs, {n, v});
			this.cmdArgs[n] = v;
			return this;
		}
		else {
			if (this.cmdArgs === undefined) return;
			// for (var ix = 0; ix < this.cmdArgs.length; ix++) {
			// 	if (this.cmdArgs[ix][0] === n)
			// 		return this.cmdArgs[ix][1];
			// }
			return this.cmdArgs[n];
		}
	}

	nodeDesc (descpt) {
		this.ndescpt = descpt;
		return this;
	}

	taskNv (n, v) {
		if (this.taskNvs === undefined || this.taskNvs === null)
			this.taskNvs = [];
		this.taskNvs.push([n, v]);
		return this;
	}

	taskRow (row) {
		if (Array.isArray(row)) {
			for (var ix = 0; ix < row.length && Array.isArray(row[ix]); ix++) {
				this.taskNv(row[ix][0], row[ix][1]);
			}
		}
		else {
			console.error('CheapReq.taskRow(row) argument format:\n',
						'[[n, v], ...]\n',
						row);
		}
		return this;
	}

	taskId (tid) {
		return this.arg('taskId', tid);
	}

	nodeId (nid) {
		return this.arg('nodeId', nid);
	}

	instId (iid) {
		return this.arg('instId', iid);
	}

	post (jbody) {
		if (this.childInserts === undefined || this.childInserts === null)
			this.childInserts = [];
		else this.childInserts.push(jbody);
		return this;
	}

	childInsert (n, v) {
		this.childInserts[this.childInserts.length - 1].push([n, v]);
		return this;
	}

	// req (r) {
	// 	this.a = r;
	// 	return this;
	// }

	// use ssClient.usrCmd() instead
	// reqCmd (cmd) {
	// 	this.cmdArgs = [cmd];
	// 	return req(chpEnumReq.cmd);
	// }

	// cmdsRight (nodeId, usrId, taskId) {
	// 	this.cmdArgs = [nodeId, usrId, taskId];
	// 	return req(chpEnumReq.cmdsRight);
	// }
}

export {CheapReq, chpEnumReq, CheapCode};
