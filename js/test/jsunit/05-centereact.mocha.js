import { expect, assert } from 'chai'
import { Protocol, AnsonMsg, AnsonResp } from '../../lib/protocol.js'
import { CenterResp } from '../jsample/common/protocol.quiz.js'

const jsonResp = {
  "body": [{
	"a": null,
	"conn": null,
	"data": {
		"props": {
			"polls": {
				"colCnt": 15,
				"colnames": {
					"DCREATE": [8, "dcreate"],
					"DID": [11, "did"],
					"EXTRA": [10, "extra"],
					"LABEL": [14, "label"],
					"OPER": [2, "oper"],
					"OPTIME": [4, "optime"],
					"PARENT": [13, "parent"],
					"QID": [1, "qid"],
					"QOWNER": [7, "qowner"],
					"QUIZINFO": [6, "quizinfo"],
					"REMARKS": [15, "remarks"],
					"SUBJECT": [9, "subject"],
					"TAG": [12, "tag"],
					"TAGS": [5, "tags"],
					"TITLE": [3, "title"]
				},
				"results": [
					["000004", "admin", null, "2021-06-09 12:55:02", null, null, "admin", "2021-06-09T12:55:02.200Z", null, null, null, null, null, null, null],
					["000005", "admin", null, "2021-06-10 01:50:43", null, null, "admin", "2021-06-10T01:50:42.847Z", null, null, null, null, null, null, null],
					["000006", "admin", "", "2021-06-10 01:51:20", null, null, "admin", "2021-06-10T01:51:19.888Z", null, null, null, null, null, null, null],
					["000007", "admin", "zzzzzzzz", "2021-06-10 02:03:46", null, "ddddddddddddddd", "admin", "2021-06-10T02:03:46.032Z", null, null, null, null, null, null, null],
					["000008", "admin", "", "2021-06-10 02:19:39", null, null, "admin", "2021-06-10T02:19:39.062Z", null, null, null, null, null, null, null],
					["000009", "admin", "", "2021-06-10 02:26:33", null, null, "admin", "2021-06-10T02:26:33.569Z", null, null, null, null, null, null, null],
					["00000A", "admin", "", "2021-06-10 02:29:19", null, "tt", "admin", "2021-06-10T02:29:19.187Z", null, null, null, null, null, null, null]
				],
				"rowCnt": 7,
				"rowIdx": 0,
				"stringFormats": null,
				"total": 7,
				"type": "io.odysz.module.rs.AnResultset"
			},
			"total": [7]
		},
		"type": "io.odysz.semantics.SemanticObject"
	},
	"m": "list loaded",
	"map": null,
	"parent": "io.odysz.semantic.jprotocol.AnsonMsg",
	"rs": null,
	"type": "io.oz.ever.conn.CenterResp"
  }],
  "code": "ok",
  "header": null,
  "opts": null,
  "port": "quiz.serv",
  "seq": 0,
  "type": "io.odysz.semantic.jprotocol.AnsonMsg",
  "version": "1.0"
}

describe('case: [05 Protocol.CenterResp]', () => {

	it('5.1 [my-polls]', () => {

		Protocol.registerBody('io.oz.ever.conn.CenterResp', (jsonBd) => {
			return new CenterResp(jsonBd);
		});

		let centerResp = new CenterResp(jsonResp.body[0]);
		let {cols, rows} = centerResp.polls();

		assert.equal(rows.length, 7, "1 ---");

		let my = centerResp.my();
		assert.equal(my.rows.length, 7, "2 ---");
	});
});
