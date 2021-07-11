import { expect, assert } from 'chai'
import { Protocol, AnsonMsg, DatasetReq } from '../../lib/protocol.js'
import { SysComp } from '../../lib/frames/react/sys.jsx'

const dsTestResp = {
	"type": "io.odysz.semantic.jprotocol.test.AnsonMsg",
	"code": "ok", "opts": null,
	"port": "dataset", "header": null,
	"vestion": "1.0",
	"body": [{
		"type": "io.odysz.semantic.ext.AnDatasetResp",
		"rs": [{
			"type": "io.odysz.anson.AnsonResultset",
			"stringFormats": null, "total": 0, "rowCnt": 2, "colCnt": 2,
			"colnames": {"1": [1, "1"], "2": [2, "2"]},
			"rowIdx": 0,
			"results": [["0, 1", "0, 2"], ["1, 1", "1, 2"]]
		}],
		"parent": "io.odysz.semantic.jprotocol.test.AnsonMsg",
		"a": null,
		"forest": null, "conn": null, "m": "", "map": null
	}], "seq": 0
}

/** response for sk: sys.menu.jsample, without css and flags */
const dsMenu = {
	"type": "io.odysz.semantic.jprotocol.AnsonMsg",
	"code": "ok", "opts": null,
	"port": "menu.serv",
	"header": null,
	"body": [{
		"type": "io.odysz.semantic.ext.AnDatasetResp",
		"rs": null, "parent": "io.odysz.semantic.jprotocol.AnsonMsg", "a": null,
		"forest": [
		  {	"type": "io.odysz.semantic.DA.DatasetCfg$AnTreeNode",
			"node": {
				"children": [
				  {	"type": "io.odysz.semantic.DA.DatasetCfg$AnTreeNode",
					"node": { "fullpath": "1 sys.1 domain",
							  "id": "sys-domain",
							  "text": "Domain Settings",
							  "sort": "1",
							  "parentId": "sys",
							  "url": "views/sys/domain/domain.html" },
					"parent": "Domain Settings", "id": "sys"},
				  {	"type": "io.odysz.semantic.DA.DatasetCfg$AnTreeNode",
					"node": {"fullpath": "1 sys.2 role", "id": "sys-role", "text": "Role Manage", "sort": "2", "parentId": "sys", "url": "views/sys/role/roles.html"},
					"parent": "Role Manage", "id": "sys"},
				  {	"type": "io.odysz.semantic.DA.DatasetCfg$AnTreeNode",
					"node": {"fullpath": "1 sys.3 org", "id": "sys-org", "text": "Orgnization Manage", "sort": "3", "parentId": "sys", "url": "views/sys/org/orgs.html"},
					"parent": "Orgnization Manage", "id": "sys"},
				  {	"type": "io.odysz.semantic.DA.DatasetCfg$AnTreeNode",
					"node": {"fullpath": "1 sys.4 user", "id": "sys-uesr", "text": "Uesr Manage", "sort": "4", "parentId": "sys", "url": "views/sys/user/users.html"},
					"parent": "Uesr Manage", "id": "sys"},
				  {	"type": "io.odysz.semantic.DA.DatasetCfg$AnTreeNode",
					"node": {"fullpath": "1 sys.5 wf", "id": "sys-wf", "text": "Workflow Settings", "sort": "5", "parentId": "sys", "url": "views/sys/workflow/workflows.html"},
					"parent": "Workflow Settings", "id": "sys"}],
				"fullpath": "1 sys",
				"id": "sys", "text": "System",
				"sort": "1", "parentId": "", "url": ""},
			"parent": "System",
			"id": ""},
		  {	"type": "io.odysz.semantic.DA.DatasetCfg$AnTreeNode",
			"node": {"children": [
				{ "type": "io.odysz.semantic.DA.DatasetCfg$AnTreeNode",
				  "node": {"fullpath": "2 sys-1.1.4 user", "id": "sys-uesr-1.1", "text": "Uesr Manage", "sort": "4", "parentId": "sys-1.1", "url": "views/sys/user/users-1.1.html"},
				  "parent": "Uesr Manage", "id": "sys-1.1"}],
			"fullpath": "2 sys-1.1", "id": "sys-1.1", "text": "System v1.1", "sort": "2", "parentId": "", "url": ""},
			"parent": "System v1.1", "id": ""}],
		"conn": null, "m": null, "map": null
	}],
	"version": "1.0", "seq": 0
}

describe('case: [03.1 Jsample.menu]', () => {

	it('Convert to menu.serv requests', () => {
		let datasetCfg = {
				conn: 'con-1',
				sk: 'menu',
				mtabl: 's_funcs',
				args: ['admin'] };
		let mr = new DatasetReq(datasetCfg)
			.A('query');
		mr.args(['quizId', '000001']);

		console.log(mr.t);
        assert.equal(mr.conn, 'con-1', "1 ---");
        assert.equal(mr.mtabl, 's_funcs', "2 ---");
        assert.equal(mr.a, 'query', "3.1 ---");
        assert.equal(mr.sk, 'menu', "3.2 ---");

		// must keep consists as js/cs/java all denpends on this structure
		assert.equal(mr.sqlArgs[0], 'admin', "4 ---");
		assert.equal(mr.sqlArgs[1], 'quizId', "5 ---");
		assert.equal(mr.sqlArgs[2], '000001', "6 ---");

		let port = 'test1';
		let jreq = new AnsonMsg({
					port,
					header: null,
					dataset: datasetCfg,
					body: [mr]
				});

        assert.equal(jreq.port, 'test1', "8 ---");
	});

	it('Convert AnsonResp to menu', () => {
		let msg = new AnsonMsg(dsMenu);
		let forest = msg.Body().forest;

		assert.equal(msg.Body().type, "io.odysz.semantic.ext.AnDatasetResp", "1 ---");
		assert.equal(forest.length, 2, "2 ---");

		assert.equal(forest[0].id, '', "sys ---");
		assert.equal(forest[0].node.id, 'sys', "sys ---");
		assert.equal(forest[0].node.children.length, 5, "sys/* count ---");
		assert.equal(forest[0].node.children[0].node.id, 'sys-domain', "sys/domain ---");
		assert.equal(forest[1].id, '', "why ???");
		assert.equal(forest[1].node.id, 'sys-1.1', "sys 1.1 ???");
	});

	it("Parse Menu's lagacy format", () => {
		let msg = new AnsonMsg(dsMenu);
		let forest = msg.Body().forest;
		forest = SysComp.parseMenus(forest);

		assert.equal(msg.Body().type, "io.odysz.semantic.ext.AnDatasetResp", "1 ---");
		assert.equal(forest.length, 2, "2 ---");
		assert.equal(forest[0].node, undefined, "node ---");
		assert.equal(forest[0].id, undefined, "id ---");
		assert.equal(forest[0].funcId, 'sys', "sys ---");
		assert.equal(forest[0].children.node, undefined, "sys/node ---");
		assert.equal(forest[0].children[0].funcId, 'sys-domain', "sys/domain ---");
	});
});
