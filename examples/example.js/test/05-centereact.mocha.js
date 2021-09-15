import { expect, assert } from 'chai'
// import { Protocol, AnsonMsg, AnsonResp } from '../node_modules/anclient/lib/protocol.js'
import { Protocol, AnsonMsg, AnsonResp } from '@anclient/semantier';
import { CenterResp } from '../north-star/common/protocol.quiz.js'

import { GPAResp, GPAReq } from '../north-star/views/n/gpa-tier'

const jsonResp = {
  "body": [{
	"a": null,
	"conn": null,
	"data": {
		"props": {
			"polls": {
				"colCnt": 15,
				"colnames": {
					"DCREATE": [8, "dcreate"], "DID": [11, "did"], "EXTRA": [10, "extra"], "LABEL": [14, "label"],
					"OPER": [2, "oper"], "OPTIME": [4, "optime"], "PARENT": [13, "parent"], "QID": [1, "qid"],
					"QOWNER": [7, "qowner"], "QUIZINFO": [6, "quizinfo"], "REMARKS": [15, "remarks"], "SUBJECT": [9, "subject"],
					"TAG": [12, "tag"], "TAGS": [5, "tags"], "TITLE": [3, "title"] },
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

const myStatusResp = {
  "type": "io.odysz.semantic.jprotocol.AnsonMsg",
  "code": "ok", "opts": null,
  "port": "center.serv", "header": null,
  "body": [ {
      "type": "io.oz.ever.conn.c.CenterResp",
      "parent": "io.odysz.semantic.jprotocol.AnsonMsg",
      "rs": null, "a": null,
      "data": {
        "type": "io.odysz.semantics.SemanticObject",
        "props": {
          "connects": {
            "type": "io.odysz.module.rs.AnResultset", "stringFormats": null,
            "total": 0, "rowCnt": 0, "colCnt": 8,
            "colnames": {
              "TOID": [ 2, "toId" ], "OPTIME": [ 6, "optime" ], "EXTRA": [ 8, "extra" ],
              "HELLO": [ 7, "hello" ], "STATE": [ 4, "state" ], "OPER": [ 5, "oper" ],
              "FROMID": [ 3, "fromId" ], "CID": [ 1, "cid" ] }, "rowIdx": 0, "results": [] },
          "polls": {
            "type": "io.odysz.module.rs.AnResultset",
            "stringFormats": null,
            "total": 1,
            "rowCnt": 1,
            "colCnt": 5,
            "colnames": {
              "MSG": [ 5, "msg" ], "USERID": [ 3, "userId" ], "SUBJECT": [ 4, "subject" ],
              "QID": [ 2, "qid" ], "CHECKED": [ 1, "checked" ] },
            "rowIdx": 0,
            "results": [ [ 1, "000007", "georgy", null, "{\"msg\": \"georgy\"}" ] ]
          }
        }
      },
      "m": null, "map": null, "uri": null
    } ],
  "version": "1.0", "seq": 0
}

const myQuiz = {
    "type": "io.oz.ever.conn.c.CenterResp",
    "parent": "io.odysz.semantic.jprotocol.AnsonMsg",
    "uri": null, "a": null, "m": null, "map": null, "rs": null,
    "data": {
        "type": "io.odysz.semantics.SemanticObject",
        "props": {
            "questions": {
                "type": "io.odysz.module.rs.AnResultset",
                "stringFormats": null,
                "total": 13,
                "rowCnt": 13,
                "colCnt": 13,
                "colnames": {
                    "ANSWER": [ 7, "answer" ],
                    "EXTRA": [ 13, "extra" ],
                    "QORDER": [ 8, "qorder" ],
                    "PROMPT": [ 9, "prompt" ],
                    "QID": [ 1, "qid" ],
                    "QUESTION": [ 4, "question" ],
                    "SHORTDESC": [ 10, "shortDesc" ],
                    "IMAGE": [ 11, "image" ],
                    "INDID": [ 3, "indId" ],
                    "HINTS": [ 12, "hints" ],
                    "QTYPE": [ 6, "qtype" ],
                    "QUIZID": [ 2, "quizId" ],
                    "ANSWERS": [ 5, "answers" ]
                },
                "rowIdx": 0,
                "results": [
                    [ "000001", "000001", null, "/sys/domain", "A. 1\nB. 5", "s", null, 1, null, null, null, null, null ],
                    [ "000002", "000001", null, "/sys/roles", "A\nB\nC", "s", null, 2, null, null, null, null, null ],
                    [ "000003", "000001", null, "/sys/orgs", "A\nB\nC", "s", null, 3, null, null, null, null, null ],
                    [ "000004", "000001", null, "/sys/users", "A\nB\nC", "s", null, 4, null, null, null, null, null ],
                    [ "000005", "000001", null, "/n/indicators", "A\nB\nC", "s", null, 5, null, null, null, null, null ],
                    [ "000006", "000001", null, "/n/dashboard", "A\nB\nC", "s", null, 1, null, null, null, null, null ],
                    [ "000007", "000001", null, "Computer Science A", "A\nB\nC", "n", null, 1, null, null, null, null, null ],
                    [ "000008", "000001", null, "/c/status", "A\nB\nC", "n", null, 2, null, null, null, null, null ],
                    [ "000009", "000001", null, "/c/myconn", "A\nB\nC", "n", null, 3, null, null, null, null, null ],
                    [ "00000A", "000001", null, "/c/mypolls", "A\nB\nC", "n", null, 4, null, null, null, null, null ],
                    [ "00000B", "000001", null, "/n/quizzes", "A\nB\nC", "s", null, 2, null, null, null, null, null ],
                    [ "00000C", "000001", null, "/n/polls", "A\nB\nC", "s", null, 2, null, null, null, null, null ],
                    [ "00000D", "000001", null, "/n/my-students", "A\nB\nC", "s", null, 3, null, null, null, null, null ]
                ]
            },
            "polls": {
                "type": "io.odysz.module.rs.AnResultset",
                "stringFormats": null,
                "total": 1,
                "rowCnt": 1,
                "colCnt": 18,
                "colnames": {
                    "DCREATE": [ 16, "dcreate" ],
                    "EXTRA": [ 7, "extra" ],
                    "STATE": [ 5, "state" ],
                    "PID": [ 1, "pid" ],
                    "OPER": [ 10, "oper" ],
                    "PUBTIME": [ 17, "pubTime" ],
                    "QID": [ 8, "qid" ],
                    "OPTIME": [ 11, "optime" ],
                    "USERINFO": [ 6, "userInfo" ],
                    "QOWNER": [ 14, "qowner" ],
                    "USERID": [ 4, "userId" ],
                    "QUIZID": [ 2, "quizId" ],
                    "SUBJECT": [ 15, "subject" ],
                    "QUIZINFO": [ 13, "quizinfo" ],
                    "TITLE": [ 9, "title" ],
                    "TAGS": [ 12, "tags" ],
                    "ISSUERID": [ 3, "issuerId" ]
                },
                "rowIdx": 1,
                "results": [
                    [ "000001", "000001", "becky", "george", "wait", null, "{\"msg\": \"george\"}", "000001", "New Quizggg", "becky", "2021-08-21 01:59:26", null, null, "becky", null, "2021-08-21T01:59:25.157Z", null, null ]
                ]
            }
        }
    }
}

const gpaResp = {
  "type": "io.odysz.semantic.jprotocol.AnsonMsg",
  "code": "ok", "opts": null, "port": "gpa.tier",
  "header": null,
  "body": [
    { "type": "io.oz.ever.conn.n.gpa.GPAResp",
      "rs": null,
      "parent": "io.odysz.semantic.jprotocol.AnsonMsg",
      "a": null,
      "gpas": {
        "type": "io.odysz.module.rs.AnResultset",
        "stringFormats": null,
        "total": 0, "rowCnt": 3, "colCnt": 8,
        "colnames": {
          "FV": [ 4, "fv" ],
          "VV": [ 8, "vv" ],
          "GDAY": [ 1, "gday" ],
          "ODY": [ 6, "ody" ],
          "V": [ 7, "v" ],
          "GEORGE": [ 5, "george" ],
          "ALICE": [ 2, "alice" ],
          "BECKY": [ 3, "becky" ]
        },
        "rowIdx": 0,
        "results": [
          [ "2021-09-13", "03", "0", "4", "0", "0", "0", "0" ],
          [ "2021-09-14", "2", "0", "4", "0", "0", "0", "0" ],
          [ "2021-09-15", "01", "03", "4", "03", "04", "05", "0" ] ]
      },
      "cols": { "fv": 4, "vv": 8, "gday": 1, "ody": 6, "v": 7, "alice": 2, "george": 5, "becky": 3 },
      "m": null, "map": null, "uri": null,
      "kids": {
        "type": "io.odysz.module.rs.AnResultset",
        "stringFormats": null,
        "total": 7, "rowCnt": 7, "colCnt": 3,
        "colnames": {
          "AVG": [ 1, "avg" ],
          "KID": [ 3, "kid" ],
          "USERNAME": [ 2, "userName" ]
        },
        "rowIdx": 0,
        "results": [
          [ 2, "Alice", "alice" ],
          [ 1, "Becky Du", "becky" ],
          [ 4, "v", "fv" ],
          [ 1, "George", "george" ],
          [ 1.3333333333333333, "Ody", "ody" ],
          [ 1.6666666666666667, "v", "v" ],
          [ 0, "vc", "vv" ]
        ]
      }
    }
  ],
  "version": "1.0",
  "seq": 0
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
		assert.equal(my.polls.length, 7, "2 ---");
	});

	it('5.2 [my-status]', () => {
		Protocol.registerBody('io.oz.ever.conn.c.CenterResp', (jsonBd) => {
			return new CenterResp(jsonBd);
		});

		let status = new AnsonMsg(myStatusResp).Body();
		let my = status.my();
		assert.equal(my.tasks, 0, "waiting polls returned by jserv");
		assert.equal(my.polls.length, 1, "polls' list");

		assert.equal(my.polls[0].qid, "000007", "1 ---");
	});

	it('5.3 [carouselQuiz]', () => {
		let status = new CenterResp(myQuiz);
		let { poll, questions } = status.carouselQuiz();
		assert.equal(poll.title, "New Quizggg", "1 ---");

		assert.equal(questions[0].qid, "000001", "2 ---");
		assert.equal(questions[0].question, "/sys/domain", "3 ---");
		assert.equal(questions[0].question, "/sys/domain", "3 ---");
	});

});

describe('case: [05 GPA Respons] AnsonMsg Instantiate', () => {
    it('5.4 GPAResp', () => {

		Protocol.registerBody('io.oz.ever.conn.n.gpa.GPAResp', (jsonBd) => {
			return new GPAResp(jsonBd);
		});

		let resp = new AnsonMsg(gpaResp);
		let rp = resp.Body();
		let {cols, rows} = AnsonResp.rs2arr(rp.gpas);
		assert.equal(cols.length, 8, "1 ---");
		assert.equal(rows.length, 3, "2 ---");
		assert.equal(rows[0].gday, '2021-09-13', "3 ---");
		assert.equal(rows[2].gday, '2021-09-15', "4 ---");
	} );
});
