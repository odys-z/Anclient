import { expect, assert } from 'chai'
import { Protocol, AnsonMsg, AnsonResp } from '../../lib/protocol.js'
// import { QuizResp, QuizReq } from '../../../examples/example.js/lib/protocol.quiz.js'
import { QuizResp, QuizReq } from '../jsample/common/protocol.quiz.js'

const jsonResp = {
"body": [{
	"a": null,
	"conn": null,
	"data": {
		"props": {
			"rs": [{
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
			}],
			"total": [7]
		},
		"type": "io.odysz.semantics.SemanticObject"
	},
	"m": "list loaded",
	"map": null,
	"parent": "io.odysz.semantic.jprotocol.AnsonMsg",
	"rs": null,
	"type": "io.odysz.jquiz.QuizResp"
}],
"code": "ok",
"header": null,
"opts": null,
"port": "quiz.serv",
"seq": 0,
"type": "io.odysz.semantic.jprotocol.AnsonMsg",
"version": "1.0" }

const jsonNochild = {
	"type": "io.odysz.semantic.jprotocol.AnsonMsg",
	"code": "ok",
	"opts": null,
	"port": "quiz.serv",
	"header": null,
	"body": [{
		"type": "io.odysz.jquiz.QuizResp",
		"rs": null,
		"parent": "io.odysz.semantic.jprotocol.AnsonMsg",
		"a": null,
		"conn": null,
		"data": {
			"type": "io.odysz.semantics.SemanticObject",
			"props": {
				"rs": [{
					"type": "io.odysz.module.rs.AnResultset",
					"stringFormats": null,
					"total": 0,
					"rowCnt": 0,
					"colCnt": 10,
					"colnames": {
						"DCREATE": [8, "dcreate"],
						"OPTIME": [4, "optime"],
						"EXTRA": [10, "extra"],
						"QOWNER": [7, "qowner"],
						"SUBJECT": [9, "subject"],
						"QUIZINFO": [6, "quizinfo"],
						"TITLE": [3, "title"],
						"OPER": [2, "oper"],
						"QID": [1, "qid"],
						"TAGS": [5, "tags"]
					},
					"results": [
						["000007", "admin", "zzzzzzzz", "2021-06-10 02:03:46", null, "ddddddddddddddd", "admin", "2021-06-10T02:03:46.032Z", null, null, null, null, null, null, null]
					],
					"rowCnt": 1,
					"rowIdx": 0,
				}],
				"total": [1],
				"questions": {
					"type": "io.odysz.module.rs.AnResultset",
					"stringFormats": null,
					"total": 0,
					"rowCnt": 0,
					"colCnt": 10,
					"colnames": {
						"SHORTDESC": [3, "shortDesc"],
						"ANSWER": [7, "answer"],
						"HINTS": [8, "hintS"],
						"EXTRA": [10, "extra"],
						"QORDER": [5, "qorder"],
						"QTYPE": [6, "qtype"],
						"QUIZID": [2, "quizid"],
						"ADDITIONAL": [9, "additional"],
						"QID": [1, "qid"],
						"QUESTION": [4, "question"]
					},
					"rowIdx": 0,
					"results": []
				}
			}
		},
		"m": "quiz loaded",
		"map": null
	}],
	"version": "1.0",
	"seq": 0
}

const resp1Question = {
	"type": "io.odysz.semantic.jprotocol.AnsonMsg",
	"code": "ok",
	"opts": null,
	"port": "quiz.serv",
	"header": null,
	"body": [{
		"type": "io.odysz.jquiz.QuizResp",
		"rs": null,
		"parent": "io.odysz.semantic.jprotocol.AnsonMsg",
		"a": null,
		"conn": null,
		"data": {
			"type": "io.odysz.semantics.SemanticObject",
			"props": {
				"rs": [{
					"type": "io.odysz.module.rs.AnResultset",
					"stringFormats": null,
					"total": 1,
					"rowCnt": 1,
					"colCnt": 10,
					"colnames": {
						"DCREATE": [8, "dcreate"],
						"OPTIME": [4, "optime"],
						"EXTRA": [10, "extra"],
						"QOWNER": [7, "qowner"],
						"SUBJECT": [9, "subject"],
						"QUIZINFO": [6, "quizinfo"],
						"TITLE": [3, "title"],
						"OPER": [2, "oper"],
						"QID": [1, "qid"],
						"TAGS": [5, "tags"]
					},
					"rowIdx": 0,
					"results": [
						["000001", "admin", "New Quiz", "2021-06-13 15:43:49", null, "", "admin", "2021-06-13T15:43:12.895Z", null, null]
					]
				}],
				"total": [1],
				"questions": {
					"type": "io.odysz.module.rs.AnResultset",
					"stringFormats": null,
					"total": 1,
					"rowCnt": 1,
					"colCnt": 10,
					"colnames": {
						"SHORTDESC": [8, "shortDesc"],
						"ANSWER": [6, "answer"],
						"HINTS": [9, "hints"],
						"EXTRA": [10, "extra"],
						"QORDER": [7, "qorder"],
						"QTYPE": [5, "qtype"],
						"QUIZID": [2, "quizId"],
						"ANSWERS": [4, "answers"],
						"QID": [1, "qid"],
						"QUESTION": [3, "question"]
					},
					"rowIdx": 0,
					"results": [
						["000001", "000001", "Question 0", "A. \\nB. \\nC. \\nD. ", "1", "0", null, null, null, null]
					]
				}
			}
		},
		"m": "quiz loaded",
		"map": null
	}],
	"version": "1.0",
	"seq": 0
}

const respInserted = {
    "type": "io.odysz.semantic.jprotocol.AnsonMsg",
    "code": "ok",
    "opts": null, "port": "quiz.serv", "header": null,
    "body": [{"type": "io.odysz.jquiz.QuizResp", "rs": null, "parent": "io.odysz.semantic.jprotocol.AnsonMsg", "a": null,
              "data": {
                "type": "io.odysz.semantics.SemanticObject",
                "props": {"qtitle": null, "quizId": "000004", "questions": 1}
              },
              "m": "inserted", "map": null, "uri": null
    }],
    "version": "1.0", "seq": 0
}

const respUpdated = {
  "type": "io.odysz.semantic.jprotocol.AnsonMsg",
  "code": "ok", "opts": null, "port": "quiz.serv", "header": null,
  "body": [{"type": "io.odysz.jquiz.QuizResp", "rs": null, "parent": "io.odysz.semantic.jprotocol.AnsonMsg", "a": null,
            "data": {"type": "io.odysz.semantics.SemanticObject",
            "props": {"quizId": "000005", "questions": 1}},
            "m": "updated", "map": null, "uri": null
          }],
  "version": "1.0", "seq": 0
}

describe('case: [04 Protocol.QuizResp] !! See example.js/lib/protocol.quiz.js line 1 ', () => {

	it('4.1 [Quiz] Convert AnsonResp to quizzes', () => {
		let quizResp = new QuizResp(jsonResp.body[0]);
		let quizzes = quizResp.quizzes();

		// ['QID', 'QOWNER', 'QTITLE', 'TAGS', 'QUESTIONS', 'OPER', 'OPERTIME']
		assert.equal(quizzes.length, 7, "1 ---");
		assert.equal(quizzes[0].qid, "000004", "2 ---");
		assert.equal(quizzes[6].qid, "00000A", "3 ---");
		assert.equal(quizzes[3].title, "zzzzzzzz", "4 ---");
	});

	it('4.2 [Quiz] Create QuizResp with new AnsonMsg()', () => {
		Protocol.registerBody('io.odysz.jquiz.QuizResp', (jsonBd) => {
			return new QuizResp(jsonBd);
		});

		let quizResp = new AnsonMsg(jsonResp);
		let quizzes = quizResp.Body().quizzes();

		// ['QID', 'QOWNER', 'QTITLE', 'TAGS', 'QUESTIONS', 'OPER', 'OPERTIME']
		assert.equal(quizzes.length, 7, "1 ---");
		assert.equal(quizzes[0].qid, "000004", "2 ---");
		assert.equal(quizzes[6].qid, "00000A", "3 ---");
		assert.equal(quizzes[3].title, "zzzzzzzz", "4 ---");
	});

	it('4.3 [Quiz.questions: no question] Convert AnsonResp to questions with new QuizResp()', () => {
		let quiz = new QuizResp(jsonNochild.body[0]);
		let { title, quizinfo, quizId, questions } = quiz.questions();

		assert.equal(title, "zzzzzzzz", "1 ---");
		assert.equal(quizId, "000007", "2 ---");
		assert.equal(quizinfo, "ddddddddddddddd", "3 ---");

		assert.equal(questions.length, 0, "4 ---");
	});

	it('4.4 [Quiz.questions: 1 question] Convert AnsonResp to questions with new QuizResp()', () => {
		let quiz = new QuizResp(resp1Question.body[0]);
		let { title, quizinfo, quizId, questions } = quiz.questions();

		assert.equal(title, "New Quiz", "1 ---");
		assert.equal(quizId, "000001", "2 ---");
		assert.equal(quizinfo, "", "3 ---");

		// questions: [ {qid, qorder, qtype, shortdesc, question, answer, hints, extra, additional} ]
		assert.equal(questions.length, 1, "4 ---");
		assert.equal(questions[0].qid, "000001", "5 ---");
		assert.equal(questions[0].qorder, null, "6 ---");
		assert.equal(questions[0].qtype, "1", "7 ---");
		assert.equal(questions[0].question, "Question 0", "8 ---");
		assert.equal(questions[0].answers.length, 15, "9 --- it's string length of " + questions[0].answers);
		assert.equal(questions[0].answers.split('\n').length, 4, "10  --- answers: " + questions[0].answers.split('\n'));
		assert.equal(questions[0].answer, "0", "11 ---");
	});
});

describe('case: [04 Protocol.QuizResp] Update / Insert Results', () => {
	it('4.A [Quiz] Inserted', () => {
		let quizResp = new QuizResp(respInserted.body[0]);
		let quizId = quizResp.getProp('quizId');

		assert.equal(respInserted.code, 'ok', "4.A - 1");
		assert.equal(quizId, '000004', "4.A - 2");
	});

	it('4.B [Quiz] updated', () => {
		debugger
		let quizResp = new QuizResp(respUpdated.body[0]);
		let quizId = quizResp.getProp('quizId');

		assert.equal(respUpdated.code, 'ok', "4.B - 1");
		assert.equal(quizResp.msg(), 'updated', "4.B - 2");
		assert.equal(quizId, '000005', "4.B - 3");
	});
});
