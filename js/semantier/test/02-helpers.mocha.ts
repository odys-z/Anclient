import { Semantier, isEmpty, len } from '../semantier';
import { assert } from 'chai';

import {ErrorCtx, SessionClient, SessionInf} from '../anclient';

const checkBoxForest = [
  { "type":"io.odysz.semantic.DA.DatasetCfg$AnTreeNode",
	"node":{
		"children":[
		  { "type":"io.odysz.semantic.DA.DatasetCfg$AnTreeNode",
			"node":{"fullpath":"1 sys.1 domain","checked":"0","text":"Domain Settings","sort":"sys-domain","nodeId":"sys-domain","parentId":"sys"},"parent":"sys-domain","level":1,"id":"Domain Settings"},
		  { "type":"io.odysz.semantic.DA.DatasetCfg$AnTreeNode",
			"node":{"fullpath":"1 sys.2 role","checked":"0","text":"Role Manage","sort":"sys-role","nodeId":"sys-role","parentId":"sys"},"parent":"sys-role","level":1,"id":"Role Manage"},
		  { "type":"io.odysz.semantic.DA.DatasetCfg$AnTreeNode",
			"node":{"fullpath":"1 sys.3 org","checked":"0","text":"Orgnization Manage","sort":"sys-org","nodeId":"sys-org","parentId":"sys"},"parent":"sys-org","level":1,"id":"Orgnization Manage"},
		  { "type":"io.odysz.semantic.DA.DatasetCfg$AnTreeNode",
			"node":{"fullpath":"1 sys.4 user","checked":"0","text":"Uesr Manage","sort":"sys-uesr","nodeId":"sys-uesr","parentId":"sys"},"parent":"sys-uesr","level":1,"id":"Uesr Manage"},
		  { "type":"io.odysz.semantic.DA.DatasetCfg$AnTreeNode",
			"node":{"fullpath":"1 sys.5 wf","checked":"0","text":"Workflow Settings","sort":"sys-wf","nodeId":"sys-wf","parentId":"sys"},"parent":"sys-wf","level":1,"id":"Workflow Settings"}
		],
		"fullpath":"1 sys",
		"checked":true,"text":"System","sort":"sys","nodeId":"sys","parentId":""
	},
	"parent":"sys","level":0,"id":"System" },
  { "type":"io.odysz.semantic.DA.DatasetCfg$AnTreeNode",
	"node":{
		"children":[
		  { "type":"io.odysz.semantic.DA.DatasetCfg$AnTreeNode",
			"node":{"fullpath":"2 sys-1.1.4 user","checked":"0","text":"Uesr Manage","sort":"sys-uesr-1.1","nodeId":"sys-uesr-1.1","parentId":"sys-1.1"},"parent":"sys-uesr-1.1","level":1,"id":"Uesr Manage" }
		],
		"fullpath":"2 sys-1.1",
		"checked":true,"text":"System v1.1","sort":"sys-1.1","nodeId":"sys-1.1","parentId":""
	},
	"parent":"sys-1.1","level":0,"id":"System v1.1" }
];

const checkBoxResults = {
	"type":"io.odysz.semantic.jprotocol.AnsonMsg","version":"0.9","seq":695,"port":"update","opts":{},
	"header":{"type":"io.odysz.semantic.jprotocol.AnsonHeader","ssid":"000EMunZ","uid":"admin"},
	"body":[
	  { "type":"io.odysz.semantic.jserv.U.AnUpdateReq","a":"U","parent":"io.odysz.semantic.jprotocol.AnsonMsg","conn":null,
		"mtabl":"a_roles",
		"nvs":[["remarks","R.C. 1911-10-10"],["roleName","Funder"]],
		"where":[["=","roleId","'r001'"]],
		"postUpds":[
		  { "type":"io.odysz.semantic.jserv.U.AnUpdateReq","a":"D","conn":null,"mtabl":"a_role_func",
			"nvs":[],
			"where":[["=","roleId","'r001'"]],
			"postUpds":[
			  { "type":"io.odysz.semantic.jserv.U.AnInsertReq","a":"I","conn":null,"mtabl":"a_role_func",
				"nvs":[],"where":[],"cols":["funcId","roleId"],
				"nvss":[[["funcId","sys"],["roleId","r001"]],[["funcId","sys-1.1"],["roleId","r001"]]]
			  }]
		  }]
	  }]
};

const forest2 = [
  { "type": "io.odysz.semantic.DA.DatasetCfg$AnTreeNode",
    "node": {
        "children": [
          { "type": "io.odysz.semantic.DA.DatasetCfg$AnTreeNode",
            "node": { "fullpath": "1 sys.1 domain",
                "checked": true, "text": "Domain Settings", "sort": "sys-domain", "nodeId": "sys-domain", "parentId": "sys" },
            "parent": "sys-domain", "level": 1, "id": "Domain Settings"
          },
          { "type": "io.odysz.semantic.DA.DatasetCfg$AnTreeNode",
            "node": { "fullpath": "1 sys.2 role",
                "checked": true, "text": "Role Manage", "sort": "sys-role", "nodeId": "sys-role", "parentId": "sys" },
            "parent": "sys-role", "level": 1, "id": "Role Manage"
          },
          { "type": "io.odysz.semantic.DA.DatasetCfg$AnTreeNode",
            "node": { "fullpath": "1 sys.3 org", "checked": "0", "text": "Orgnization Manage", "sort": "sys-org", "nodeId": "sys-org", "parentId": "sys" },
            "parent": "sys-org", "level": 1, "id": "Orgnization Manage"
          },
          { "type": "io.odysz.semantic.DA.DatasetCfg$AnTreeNode",
            "node": {
                "fullpath": "1 sys.4 user",
                "checked": "0",
                "text": "Uesr Manage",
                "sort": "sys-uesr",
                "nodeId": "sys-uesr",
                "parentId": "sys"
            },
            "parent": "sys-uesr",
			"shareby": 'abc',
            "level": 1,
            "id": "Uesr Manage"
          },
          { "type": "io.odysz.semantic.DA.DatasetCfg$AnTreeNode",
            "node": {
                "fullpath": "1 sys.5 wf",
                "checked": "0",
                "text": "Workflow Settings",
                "sort": "sys-wf",
                "nodeId": "sys-wf",
                "parentId": "sys",
				"shareby": 'abc',
            },
            "parent": "sys-wf",
            "level": 1,
            "id": "Workflow Settings"
          }
        ],
        "fullpath": "1 sys",
        "checked": "1",
        "text": "System",
        "sort": "sys",
        "nodeId": "sys",
        "parentId": ""
    },
    "parent": "sys",
    "level": 0,
    "id": "System"
  },
  { "type": "io.odysz.semantic.DA.DatasetCfg$AnTreeNode",
    "node": {
        "children": [
          { "type": "io.odysz.semantic.DA.DatasetCfg$AnTreeNode",
            "node": {
                "fullpath": "2 sys-1.1.4 user",
                "checked": "0",
                "text": "Uesr Manage",
                "sort": "sys-uesr-1.1",
                "nodeId": "sys-uesr-1.1",
                "parentId": "sys-1.1"
            },
            "parent": "sys-uesr-1.1",
            "level": 1,
            "id": "Uesr Manage"
          }
        ],
        "fullpath": "2 sys-1.1",
        "checked": "1",
        "text": "System v1.1",
        "sort": "sys-1.1",
        "nodeId": "sys-1.1",
		"shareby": "abc",
        "parentId": ""
    },
    "parent": "sys-1.1",
    "level": 0,
    "id": "System v1.1"
  }
];

// for test, don't import Ancontext, which depends on "window"
const AnContext = {
	error: {} as ErrorCtx,
}

describe('case: [02.0 dataset + s-tree]', () => {
	it('[protocol] checkTree -> relation records', () => {
		debugger
		let ssInf = { "type": "io.odysz.semantic.jsession.SessionInf",
					  "jserv": undefined,
					  "uid": "admin", "roleId": undefined, "ssid": "001eysTj"
					} as SessionInf;
		let client = new SessionClient(ssInf, 'iv 3456789ABCDEF', true);

		let semantier = new Semantier({uri: 'test'});
		semantier.rels = {a_role_func: []};

		// 1.
		// using AnReact to collect role-func relation table's records
		// note 'nodeId' is not the same with DB as some fields are mapped in datase.xml
		let columnMap = {
			funcId: 'nodeId',
			roleId: 'r-001', // hard coded data, e.g. a pk value.
		};

		let rf = semantier.inserTreeChecked(
					checkBoxForest as any,
					{ table: 'a_role_func',
					  columnMap,
					  check: 'checked',
					  reshape: true  // middle nodes been corrected according to children
					} );

		assert.equal(rf.nvss, undefined, 'internal node deselected as no leaf node checked');

		let n = checkBoxForest[0].node.children[0].node as unknown as {checked: boolean}; //.checked = true;
		n.checked = true; // reshaped
		rf = semantier.inserTreeChecked(
					checkBoxForest as any,
					{ table: 'a_role_func',
					  columnMap,
					  check: 'checked',
					  reshape: true  // middle nodes been corrected according to children
					} );

		// [ [ [ 'funcId', 'sys' ], [ 'roleId', 'r-001' ] ],
		//   [ [ 'funcId', 'sys-1.1' ], [ 'roleId', 'r-001' ] ] ]
		assert.equal(rf.nvss.length, 2, 'records');
		assert.equal(rf.nvss[0].length, 2, '[ funcId, sys ]');
		assert.equal(rf.nvss[0][0][0], 'funcId', '[ funcId, ... ]');
		assert.equal(rf.nvss[1][1][1], 'r-001', '[ ..., r-001 ]');
	});

	it('[recursive] checkTree -> relation records', () => {
		let ssInf = { "type": "io.odysz.semantic.jsession.SessionInf",
					  "jserv": undefined,
					  "uid": "admin", "roleId": undefined, "ssid": "001eysTj"
					} as SessionInf;
		let semantier = new Semantier({uri: 'test'});

		let columnMap = {
			funcId: 'nodeId',
			roleId: 'r-001', // hard coded data, e.g. a pk value.
		};

		let rf = semantier.inserTreeChecked(
					forest2 as any,
					{ table: 'a_role_func',
					  columnMap,
					  check: 'checked',
					  reshape: true  // middle nodes been corrected according to children
					} );

		// [ [ [ 'funcId', 'sys-domain' ], [ 'roleId', 'r-001' ] ],
		//   [ [ 'funcId', 'sys-role' ], [ 'roleId', 'r-001' ] ],
		//   [ [ 'funcId', 'sys-1.1' ], [ 'roleId', 'r-001' ] ]
		//   [ [ 'funcId', 'sys' ], [ 'roleId', 'r-001' ] ] ],
		assert.equal(rf.nvss.length, 3, 'records');
		assert.equal(rf.nvss[0].length, 2, '[ funcId, sys ]');
		assert.equal(rf.nvss[0][0][0], 'funcId', '[ funcId, ... ]');
		assert.equal(rf.nvss[1][0][0], 'funcId', '[ funcId, ... ]');
		assert.equal(rf.nvss[1][0][1], 'sys-role', '[ funcId, ... ]');
		assert.equal(rf.nvss[1][1][1], 'r-001', '[ ..., r-001 ]');
	});


	it('[Helper] len()', () => {
		let m = new Map<string, any>();
		assert.equal(0, len(m), '1');

		m.set("v", 1);
		console.log(isEmpty(m), typeof m, Object.keys(m));
		assert.equal(1, m.size, '2a');
		assert.equal(1, len(m), '2');

		let s = new Set<string>();
		assert.equal(0, len(s), '3');

		s.add("")
		assert.equal(1, len(s), '4');

		assert.equal(0, len(""), '5');
		assert.equal(1, len("0"), '6');

		assert.equal(2, len({roleName: '', orgId: 'ap02'}), '7')
	});
});
