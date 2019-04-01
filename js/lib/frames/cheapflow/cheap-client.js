
import $ from 'jquery';
import {Protocol, JMessage, JHeader, QueryReq} from '../../protocol.js';


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

	constructor (wftype) {
		this.wftype = wftype;
	}

	nodeDesc (descpt) {
		this.ndescpt = descpt;
		return this;
	}

	taskNv (n, v) {
		if (this.taskNvs === undefined || this.taskNvs === null)
			tthis.askNvs = [];
		this.taskNvs.push([n, v]);
		return this;
	}

	newChildInstRow () {
		if (this.childInserts === undefined || this.childInserts === null)
			this.childInserts = [];
		else this.childInserts.push([]);
	}

	childInsert (n, v) {
		this.childInserts[this.childInserts.length - 1].push([n, v]);
		return this;
	}

	req (r) {
		this.a = r;
		return this;
	}

	reqCmd (cmd) {
		this.cmdArgs = [cmd];
		return req(chpEnumReq.cmd);
	}

	cmdsRight (nodeId, usrId, taskId) {
		this.cmdArgs = [nodeId, usrId, taskId];
		return req(chpEnumReq.cmdsRight);
	}

	loadFlow (wfId, taskId) {
		this.cmdArgs = [wfId, taskId];
		return this.req(chpEnumReq.load);
	}
}

export {CheapReq, chpEnumReq};
