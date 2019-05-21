
import $ from 'jquery';
import {Protocol, JMessage, JHeader, QueryReq, UserReq} from '../../protocol.js';


/**See semantic.workflow/io.odysz.sworkflow.EnginDesign.Req */
const chpEnumReq = {
	heartbeat: "ping",
	load: "load",
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
		if (cmdArgs === undefined)
			cmdArgs = [];
		cmdArgs.concat([n, v]);
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
	}

	post (jbody) {
		if (this.childInserts === undefined || this.childInserts === null)
			this.childInserts = [];
		else this.childInserts.push(jbody);
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

export {CheapReq, chpEnumReq};
