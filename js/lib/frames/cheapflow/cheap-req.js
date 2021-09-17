
import $ from 'jquery';
import {Protocol, AnsonMsg, AnHeader, QueryReq, UserReq} from '../../protocol.js';

/**See semantic.workflow/io.odysz.sworkflow.EnginDesign.Req */
const chpEnumReq = {
	heartbeat: "ping",
	/** load workflow list */
	load: "load",
	/** load a node's commnads */
	nodeCmds: 'nodeCmds',
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

	err_competation: 'wf_err_competing',

	err_internal: "wf_err_internal",

	err_config: "wf_err_config",
}

///////////////// io.odysz.sworkflow ///////////////////////////////////////////
class CheapReq {
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

	cmd(c) {
		this.cmd = c;
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

	/**Add descriptiong to node instance (e.g. task_nodes.descpt)
	 * @param {string} descript descriptions
	 * @return {CheapReq} this*/
	instDesc (descpt) {
		this.instDescpt = descpt;
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

	usrId (uid) {
		return this.arg('usrId', uid);
	}

	// /**Add a post update request to the transact batch operations
	//  * @param {UpdateReq | InsertReq} jbody post request
	//  * @return {CheapReq} this*/
	// post (jbody) {
	// 	// FIXME there is no such thing in CheapReq.java
	// 	if (this.childInserts === undefined || this.childInserts === null)
	// 		this.childInserts = [];
	// 	else this.childInserts.push(jbody);
	// 	return this;
	// }

	/**Add post operation
	 * @param {UpdateReq | InsertReq} pst post request
	 * @return {UpdateReq} this */
	post (pst) {
		if (pst === undefined) {
			console.warn('You really wanna an undefined post operation?');
			return this;
		}
		else if (typeof pst.version === 'string' && typeof pst.seq === 'number')
			console.warn('You pobably adding a AnsonMsg as post operation? It should only be AnsonBody(s).');

		if (this.postUpds === undefined) {
			this.postUpds = [];
		}
		if (Array.isArray(pst)) {
			this.postUpds = this.postUpds.concat(pst);
		}
		else {
			this.postUpds.push(pst);
		}
		return this;
	}

	// FIXME
	childInsert (n, v) {
		// FIXME call post() instead
		this.childInserts[this.childInserts.length - 1].push([n, v]);
		return this;
	}
}

export {CheapReq, chpEnumReq, CheapCode};
