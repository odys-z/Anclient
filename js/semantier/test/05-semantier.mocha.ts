
import { assert } from 'chai'
import { UpdateReq } from '../anclient';
import {Protocol, AnsonMsg, InsertReq} from '../protocol';
import { Semantier } from '../semantier';

const dstier1 = {
	"type": "io.odysz.semantic.jprotocol.AnsonMsg",
	"code": "ok",
	"opts": null,
	"port": "datasetier",
	"header": null,
	"body": [{
		"type": "io.odysz.semantic.tier.DatasetierResp",
		"rs": null,
		"parent": "io.odysz.semantic.jprotocol.AnsonMsg",
		"a": null,
		"sks": ["departs.org", "x.cube.vec3", "projects.ez", "nations.domain.jsample", "roles", "org.all", "sys.menu.jsample", "test.tree", "z.cube.vec3", "lvl1.domain.jsample", "trees.role_funcs", "max.cube.vec3", "legend.cube.vec3", "xv.indicators", "orgs", "xzy.cube.vec3"],
		"m": null,
		"map": null,
		"uri": null
	}],
	"version": "1.0",
	"seq": 0
};

const relationRoleFuncs = [
{ "type": "io.odysz.semantic.DA.DatasetCfg$AnTreeNode",
  "node": {
	"children": [
		{
			"type": "io.odysz.semantic.DA.DatasetCfg$AnTreeNode",
			"node": {
				"fullpath": "1 sys.1",
				"checked": true,
				"text": "Domain Settings",
				"sort": "1",
				"nodeId": "sys-domain",
				"parentId": "sys"
			},
			"parent": "sys",
			"level": 1,
			"id": "sys-domain"
		},
		{
			"type": "io.odysz.semantic.DA.DatasetCfg$AnTreeNode",
			"node": {
				"fullpath": "1 sys.2",
				"checked": true,
				"text": "Role Manage",
				"sort": "2",
				"nodeId": "sys-role",
				"parentId": "sys"
			},
			"parent": "sys",
			"level": 1,
			"id": "sys-role"
		},
		{
			"type": "io.odysz.semantic.DA.DatasetCfg$AnTreeNode",
			"node": {
				"fullpath": "1 sys.3",
				"checked": true,
				"text": "Orgnizations",
				"sort": "3",
				"nodeId": "sys-org",
				"parentId": "sys"
			},
			"parent": "sys",
			"level": 1,
			"id": "sys-org"
		},
		{
			"type": "io.odysz.semantic.DA.DatasetCfg$AnTreeNode",
			"node": {
				"fullpath": "1 sys.4",
				"checked": true,
				"text": "Uesr Manage",
				"sort": "4",
				"nodeId": "sys-uesr",
				"parentId": "sys"
			},
			"parent": "sys",
			"level": 1,
			"id": "sys-uesr"
		},
		{
			"type": "io.odysz.semantic.DA.DatasetCfg$AnTreeNode",
			"node": {
				"fullpath": "1 sys.5",
				"checked": true,
				"text": "Emotion Indicators",
				"sort": "5",
				"nodeId": "sys-inds",
				"parentId": "sys"
			},
			"parent": "sys",
			"level": 1,
			"id": "sys-inds"
		}
    ],
	"fullpath": "1 sys",
	"checked": true,
	"text": "Acadynamo",
	"sort": "1",
	"nodeId": "sys",
	"parentId": ""
  },
  "parent": "",
  "level": 0,
  "id": "sys"
},
{ "type": "io.odysz.semantic.DA.DatasetCfg$AnTreeNode",
  "node": {
		"children": [
			{
				"type": "io.odysz.semantic.DA.DatasetCfg$AnTreeNode",
				"node": {
					"fullpath": "2 n01.1",
					"checked": "0",
					"text": "North Dashboard",
					"sort": "1",
					"nodeId": "n-dash",
					"parentId": "n01"
				},
				"parent": "n01",
				"level": 1,
				"id": "n-dash"
			},
			{
				"type": "io.odysz.semantic.DA.DatasetCfg$AnTreeNode",
				"node": {
					"fullpath": "2 n01.2",
					"checked": "0",
					"text": "Quizzes",
					"sort": "2",
					"nodeId": "n-quizzes",
					"parentId": "n01"
				},
				"parent": "n01",
				"level": 1,
				"id": "n-quizzes"
			},
			{
				"type": "io.odysz.semantic.DA.DatasetCfg$AnTreeNode",
				"node": {
					"fullpath": "2 n01.3",
					"checked": "0",
					"text": "Polls Overview",
					"sort": "3",
					"nodeId": "n-polls",
					"parentId": "n01"
				},
				"parent": "n01",
				"level": 1,
				"id": "n-polls"
			},
			{
				"type": "io.odysz.semantic.DA.DatasetCfg$AnTreeNode",
				"node": {
					"fullpath": "2 n01.4",
					"checked": "0",
					"text": "My Students",
					"sort": "4",
					"nodeId": "n-mystud",
					"parentId": "n01"
				},
				"parent": "n01",
				"level": 1,
				"id": "n-mystud"
			},
			{
				"type": "io.odysz.semantic.DA.DatasetCfg$AnTreeNode",
				"node": {
					"fullpath": "2 n01.5",
					"checked": "0",
					"text": "GPA Records",
					"sort": "5",
					"nodeId": "n-gpas",
					"parentId": "n01"
				},
				"parent": "n01",
				"level": 1,
				"id": "n-gpas"
			},
			{
				"type": "io.odysz.semantic.DA.DatasetCfg$AnTreeNode",
				"node": {
					"fullpath": "2 n01.6",
					"checked": "0",
					"text": "Share Documents",
					"sort": "6",
					"nodeId": "n-docs",
					"parentId": "n01"
				},
				"parent": "n01",
				"level": 1,
				"id": "n-docs"
			}
		],
		"fullpath": "2 n01",
		"checked": "0",
		"text": "North Pole",
		"sort": "2",
		"nodeId": "n01",
		"parentId": ""
  },
  "parent": "",
  "level": 0,
  "id": "n01"
},
{ "type": "io.odysz.semantic.DA.DatasetCfg$AnTreeNode",
  "node": {
		"children": [
			{
				"type": "io.odysz.semantic.DA.DatasetCfg$AnTreeNode",
				"node": {
					"fullpath": "3 c01.1",
					"checked": "0",
					"text": "My Status",
					"sort": "1",
					"nodeId": "c-status",
					"parentId": "c01"
				},
				"parent": "c01",
				"level": 1,
				"id": "c-status"
			},
			{
				"type": "io.odysz.semantic.DA.DatasetCfg$AnTreeNode",
				"node": {
					"fullpath": "3 c01.2",
					"checked": "0",
					"text": "My Polls",
					"sort": "2",
					"nodeId": "c-mypolls",
					"parentId": "c01"
				},
				"parent": "c01",
				"level": 1,
				"id": "c-mypolls"
			},
			{
				"type": "io.odysz.semantic.DA.DatasetCfg$AnTreeNode",
				"node": {
					"fullpath": "3 c01.3",
					"checked": "0",
					"text": "My Docs",
					"sort": "3",
					"nodeId": "c-mydoc",
					"parentId": "c01"
				},
				"parent": "c01",
				"level": 1,
				"id": "c-mydoc"
			},
			{
				"type": "io.odysz.semantic.DA.DatasetCfg$AnTreeNode",
				"node": {
					"fullpath": "3 c01.4",
					"checked": "0",
					"text": "My Connection",
					"sort": "4",
					"nodeId": "c-myconn",
					"parentId": "c01"
				},
				"parent": "c01",
				"level": 1,
				"id": "c-myconn"
			}
		],
		"fullpath": "3 c01",
		"checked": "0",
		"text": "Center Me",
		"sort": "3",
		"nodeId": "c01",
		"parentId": ""
  },
  "parent": "",
  "level": 0,
  "id": "c01"
} ];

Protocol.registerBody(InsertReq.__type__, (jsonBd) => {
	return new InsertReq(jsonBd.uri, jsonBd.tabl);
});

describe('case: [05.0 dataset + s-tree]', () => {
	it('[semantics] checkTree -> relation records', () => {

		console.log(Protocol.ansonTypes);
		let semantier = new Semantier({uri: 'test'});
		semantier.rels = {a_role_func: relationRoleFuncs};

		let body = {type: InsertReq.__type__, uri: 'test-05'};
		let req = new AnsonMsg<InsertReq>({body: [body]});

		semantier.formatRel('test 05', req,
					{stree: {sk: 'fake-test', childTabl: 'a_role_func', fk: 'roleId', col: 'funcId', colProp: 'nodeId'}},
					{pk: 'roleId', v: 'r00'});

		let del = req.Body()?.postUpds[0] as UpdateReq;

		let ins = del.postUpds[0] as InsertReq;
		let nvss = ins.nvss;

		assert.equal(del.type, 'io.odysz.semantic.jserv.U.AnUpdateReq', 'del');
		assert.equal(del.a, 'D', 'del.a');

		assert.equal(ins.type, 'io.odysz.semantic.jserv.U.AnInsertReq', 'ins');
		assert.equal(ins.a, 'I', 'ins.a');

		assert.equal(nvss.length, 6, 'nvss');
		// [ [ 'funcId', 'sys-domain' ], [ 'roleId', 'r00' ] ] [ [ 'funcId', 'sys-role' ], [ 'roleId', 'r00' ] ]
		assert.equal(nvss[0][0][0], 'funcId');
		assert.equal(nvss[0][0][1], 'sys-domain');
		assert.equal(nvss[0][1][0], 'roleId');
		assert.equal(nvss[0][1][1], 'r00');

		assert.equal(nvss[1][0][0], 'funcId');
		assert.equal(nvss[1][0][1], 'sys-role');
		assert.equal(nvss[1][1][0], 'roleId');
		assert.equal(nvss[1][1][1], 'r00');
	});
});