import chai from 'chai';
import { expect, assert } from 'chai';

import {Protocol, AnsonMsg, UpdateReq} from '../../semantier/protocol';
import {AnClient, SessionClient} from '../../semantier/anclient';
import {AnReact} from '../../anreact/src/react/anreact.jsx';

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
                "parentId": "sys"
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
        "parentId": ""
    },
    "parent": "sys-1.1",
    "level": 0,
    "id": "System v1.1"
  }
];

// for test, don't import Ancontext, which depends on "window"
const AnContext = {
	error: {}
}

describe('case: [02.0 anreact]', () => {
	it('[protocol] checkTree -> relation records', () => {
		let ssInf = { "type": "io.odysz.semantic.jsession.SessionInf",
					  "uid": "admin", "roleId": null, "ssid": "001eysTj" };
		let client = new SessionClient(ssInf, 'iv 3456789ABCDEF', {dontPersist: true});
		let anReact = new AnReact(client, AnContext.error);

		// 1.
		// using AnReact to collect role-func relation table's records
		// note 'nodeId' is not the same with DB as some fields are mapped in datase.xml
		let columnMap = {
			funcId: 'nodeId',
			roleId: 'r-001', // hard coded data, e.g. a pk value.
		};

		let rf = anReact.inserTreeChecked(
					checkBoxForest,
					{ table: 'a_role_func',
					  columnMap,
					  check: 'checked',
					  reshape: true  // middle nodes been corrected according to children
					} );

		assert.equal(rf.nvss, undefined, 'internal node deselected as no leaf node checked');

		checkBoxForest[0].node.children[0].node.checked = true; // reshaped
		rf = anReact.inserTreeChecked(
					checkBoxForest,
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
					  "uid": "admin", "roleId": null, "ssid": "001eysTj" };
		let client = new SessionClient(ssInf, 'iv 3456789ABCDEF', {dontPersist: true});
		let anReact = new AnReact(client, AnContext.error);

		let columnMap = {
			funcId: 'nodeId',
			roleId: 'r-001', // hard coded data, e.g. a pk value.
		};

		let rf = anReact.inserTreeChecked(
					forest2,
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
});
