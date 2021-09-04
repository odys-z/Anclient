import { expect, assert } from 'chai'
import { Protocol, AnsonMsg, AnsonResp } from '../../lib/protocol.js'
// import { QuizResp, QuizReq } from '../../../examples/example.js/lib/protocol.quiz.js'
import { QuizResp, QuizReq } from '../jsample/common/protocol.quiz.js'

var __TESTING__ = true;

const jsonQuestionsInReq = [
    { "qid": 0, "question": "/sys/domain", "answers": "A. 1\nB. 5", "qtype": "s", "qorder": "1", "shortDesc": null, "extra": null },
    { "qid": 0, "question": "/sys/roles", "answers": "A\nB\nC", "qtype": "s", "qorder": "2", "shortDesc": null, "extra": null },
    { "qid": 0, "question": "/sys/orgs", "answers": "A\nB\nC", "qtype": "s", "qorder": "3", "shortDesc": null, "extra": null },
    { "qid": 0, "question": "/sys/users", "answers": "A\nB\nC", "qtype": "s", "qorder": "4", "shortDesc": null, "extra": null },
    { "qid": 0, "question": "/n/indicators", "answers": "A\nB\nC", "qtype": "s", "qorder": "5", "shortDesc": null, "extra": null },
    { "qid": 0, "question": "/n/dashboard", "answers": "A\nB\nC", "qtype": "s", "qorder": "1", "shortDesc": null, "extra": null },
    { "qid": 0, "question": "Computer Science A", "answers": "A\nB\nC", "qtype": "n", "qorder": "1", "shortDesc": null, "extra": null },
    { "qid": 0, "question": "/c/status", "answers": "A\nB\nC", "qtype": "n", "qorder": "2", "shortDesc": null, "extra": null },
    { "qid": 0, "question": "/c/myconn", "answers": "A\nB\nC", "qtype": "n", "qorder": "3", "shortDesc": null, "extra": null },
    { "qid": 0, "question": "/c/mypolls", "answers": "A\nB\nC", "qtype": "n", "qorder": "4", "shortDesc": null, "extra": null },
    { "qid": 0, "question": "/n/quizzes", "answers": "A\nB\nC", "qtype": "s", "qorder": "2", "shortDesc": null, "extra": null },
    { "qid": 0, "question": "/n/polls", "answers": "A\nB\nC", "qtype": "s", "qorder": "2", "shortDesc": null, "extra": null },
    { "qid": 0, "question": "/n/my-students", "answers": "A\nB\nC", "qtype": "s", "qorder": "3", "shortDesc": null, "extra": null }
];

describe('case: [04 Protocol.JsonQuestion] serializing', () => {

	it('4.-1 [QuizReq.checkQuestions]', () => {
		let quests = QuizReq.checkQuestions(jsonQuestionsInReq);

		assert.equal(quests.length, jsonQuestionsInReq.length, "-1.1 ---");
		assert.equal(quests[0].type, "io.odysz.jquiz.JsonQuestion", "-1.2 ---");
		assert.equal(quests[0].qid, "0", "-1.3 ---");
		assert.equal(quests[0].question, "/sys/domain", "-1.4 ---");
		assert.equal(quests[12].question, "/n/my-students", "-1.5 ---");
	});
});

// const jsonResp = {
// "body": [{
// 	"a": null,
// 	"conn": null,
// 	"data": {
// 		"props": {
// 			"rs": [{
// 				"colCnt": 15,
// 				"colnames": {
// 					"DCREATE": [8, "dcreate"],
// 					"DID": [11, "did"],
// 					"EXTRA": [10, "extra"],
// 					"LABEL": [14, "label"],
// 					"OPER": [2, "oper"],
// 					"OPTIME": [4, "optime"],
// 					"PARENT": [13, "parent"],
// 					"QID": [1, "qid"],
// 					"QOWNER": [7, "qowner"],
// 					"QUIZINFO": [6, "quizinfo"],
// 					"REMARKS": [15, "remarks"],
// 					"SUBJECT": [9, "subject"],
// 					"TAG": [12, "tag"],
// 					"TAGS": [5, "tags"],
// 					"TITLE": [3, "title"]
// 				},
// 				"results": [
// 					["000004", "admin", null, "2021-06-09 12:55:02", null, null, "admin", "2021-06-09T12:55:02.200Z", null, null, null, null, null, null, null],
// 					["000005", "admin", null, "2021-06-10 01:50:43", null, null, "admin", "2021-06-10T01:50:42.847Z", null, null, null, null, null, null, null],
// 					["000006", "admin", "", "2021-06-10 01:51:20", null, null, "admin", "2021-06-10T01:51:19.888Z", null, null, null, null, null, null, null],
// 					["000007", "admin", "zzzzzzzz", "2021-06-10 02:03:46", null, "ddddddddddddddd", "admin", "2021-06-10T02:03:46.032Z", null, null, null, null, null, null, null],
// 					["000008", "admin", "", "2021-06-10 02:19:39", null, null, "admin", "2021-06-10T02:19:39.062Z", null, null, null, null, null, null, null],
// 					["000009", "admin", "", "2021-06-10 02:26:33", null, null, "admin", "2021-06-10T02:26:33.569Z", null, null, null, null, null, null, null],
// 					["00000A", "admin", "", "2021-06-10 02:29:19", null, "tt", "admin", "2021-06-10T02:29:19.187Z", null, null, null, null, null, null, null]
// 				],
// 				"rowCnt": 7,
// 				"rowIdx": 0,
// 				"stringFormats": null,
// 				"total": 7,
// 				"type": "io.odysz.module.rs.AnResultset"
// 			}],
// 			"total": [7]
// 		},
// 		"type": "io.odysz.semantics.SemanticObject"
// 	},
// 	"m": "list loaded",
// 	"map": null,
// 	"parent": "io.odysz.semantic.jprotocol.AnsonMsg",
// 	"rs": null,
// 	"type": "io.odysz.jquiz.QuizResp"
// }],
// "code": "ok",
// "header": null,
// "opts": null,
// "port": "quiz.serv",
// "seq": 0,
// "type": "io.odysz.semantic.jprotocol.AnsonMsg",
// "version": "1.0" }

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

	// it('4.1 [Quiz] Convert AnsonResp to quizzes', () => {
	// 	let quizResp = new QuizResp(jsonResp.body[0]);
	// 	let quizzes = quizResp.quizzes();
	//
	// 	// ['QID', 'QOWNER', 'QTITLE', 'TAGS', 'QUESTIONS', 'OPER', 'OPERTIME']
	// 	assert.equal(quizzes.length, 7, "1 ---");
	// 	assert.equal(quizzes[0].qid, "000004", "2 ---");
	// 	assert.equal(quizzes[6].qid, "00000A", "3 ---");
	// 	assert.equal(quizzes[3].title, "zzzzzzzz", "4 ---");
	// });

	// it('4.2 [Quiz] Create QuizResp with new AnsonMsg()', () => {
	// 	Protocol.registerBody('io.odysz.jquiz.QuizResp', (jsonBd) => {
	// 		return new QuizResp(jsonBd);
	// 	});
	//
	// 	let quizResp = new AnsonMsg(jsonResp);
	// 	let quizzes = quizResp.Body().quizzes();
	//
	// 	// ['QID', 'QOWNER', 'QTITLE', 'TAGS', 'QUESTIONS', 'OPER', 'OPERTIME']
	// 	assert.equal(quizzes.length, 7, "1 ---");
	// 	assert.equal(quizzes[0].qid, "000004", "2 ---");
	// 	assert.equal(quizzes[6].qid, "00000A", "3 ---");
	// 	assert.equal(quizzes[3].title, "zzzzzzzz", "4 ---");
	// });

	it('4.3 [Quiz.quiz_questions: no question] Convert AnsonResp to questions with new QuizResp()', () => {
		let quizresp = new QuizResp(jsonNochild.body[0]);
		let { quiz, quizId, questions } = quizresp.quiz_questions();
		let { title, quizinfo } = quiz;

		assert.equal(title, "zzzzzzzz", "1 ---");
		assert.equal(quizId, "000007", "2 ---");
		assert.equal(quizinfo, "ddddddddddddddd", "3 ---");

		assert.equal(questions.length, 0, "4 ---");
	});

	it('4.4 [Quiz.questions: 1 question] Convert AnsonResp to questions with new QuizResp()', () => {
		let quizresp = new QuizResp(resp1Question.body[0]);
		let { quiz, quizId, questions } = quizresp.quiz_questions();
		let { title, quizinfo } = quiz;

		assert.equal(title, "New Quiz", "1 ---");
		assert.equal(quizId, "000001", "2 ---");
		assert.equal(quizinfo, "", "3 ---");

		// questions: [ {qid, qorder, qtype, shortdesc, question, answer, hints, extra, additional} ]
		assert.equal(questions.length, 1, "4 ---");
		assert.equal(questions[0].qid, "000001", "5 ---");
		assert.equal(questions[0].qorder, null, "6 ---");
		assert.equal(questions[0].qtype, "1", "7 ---");
		assert.equal(questions[0].question, "Question 0", "8 ---");
		assert.equal(questions[0].answers.length, 18, "9 --- it's string length of " + questions[0].answers);
		assert.equal(questions[0].answers.split('\\n').length, 4, "10  --- answers: " + questions[0].answers.split('\n'));
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
		let quizResp = new QuizResp(respUpdated.body[0]);
		let quizId = quizResp.getProp('quizId');

		assert.equal(respUpdated.code, 'ok', "4.B - 1");
		assert.equal(quizResp.msg(), 'updated', "4.B - 2");
		assert.equal(quizId, '000005', "4.B - 3");
	});
});

const respWithUsers = {
  "type": "io.odysz.semantic.jprotocol.AnsonMsg",
  "code": "ok", "opts": null, "port": "quiz.serv", "header": null,
  "body": [{
    "type": "io.odysz.jquiz.QuizResp", "rs": null,
    "parent": "io.odysz.semantic.jprotocol.AnsonMsg", "a": null,
    "data": {"type": "io.odysz.semantics.SemanticObject", "props": null},
    "quizUsers": {
      "type": "io.odysz.module.rs.AnResultset", "stringFormats": null,
      "total": 2, "rowCnt": 2, "colCnt": 3,
      "colnames": {"USERNAME": [3, "userName"], "CHECKED": [1, "checked"], "USERID": [2, "userId"]},
      "rowIdx": 0,
      "results": [[1, "alice", "Alice"], [1, "georgy", "Georgy"]]
    },
    "m": null, "map": null, "uri": null
  }],
  "version": "1.0", "seq": 0
}

describe('case: [04 Protocol.QuizResp] quiz users', () => {
	it('4.X [Quiz] puiz users', () => {
		Protocol.registerBody('io.odysz.jquiz.QuizResp', (jsonBd) => {
			return new QuizResp(jsonBd);
		});

		let quizResp = new AnsonMsg(respWithUsers);
		let u = quizResp.Body().quizUsers;

		assert.equal(u.type, "io.odysz.module.rs.AnResultset", "4.X - type");
		assert.equal(u.colnames.USERNAME.length, 2, "4.X - 2");
		assert.equal(u.results.length, 2, "4.X - 2");
		assert.equal(u.results[0][0], 1, "4.X - checked");
		assert.equal(u.results[0][1], "alice", "4.X - userId");
		assert.equal(u.results[0][2], "Alice", "4.X - user name");

		// bugs must be guarded here
		let ids = quizResp.Body().quizUserIds();
		console.log(ids);
		assert.equal(ids[0], 'alice', "4.x - alice");
		assert.equal(ids[1], 'georgy', "4.x - george");
	});
})	;

/** Fix bug: indId for question got lost */
const quizRespStartingQuestions = {
  "type": "io.odysz.semantic.jprotocol.AnsonMsg",
  "code": "ok", "opts": null, "port": "quiz.serv", "header": null,
  "body": [
    {
      "type": "io.odysz.jquiz.QuizResp",
      "rs": null,
      "parent": "io.odysz.semantic.jprotocol.AnsonMsg",
      "a": null,
      "data": {
        "type": "io.odysz.semantics.SemanticObject",
        "props": {
          "rs": [
            { "type": "io.odysz.module.rs.AnResultset",
              "stringFormats": null, "total": 0, "rowCnt": 0, "colCnt": 11,
              "colnames": {
                    "DCREATE": [ 9, "dcreate" ], "OPTIME": [ 4, "optime" ], "EXTRA": [ 11, "extra" ], "QOWNER": [ 7, "qowner" ],
                    "SUBJECT": [ 8, "subject" ], "QUIZINFO": [ 6, "quizinfo" ], "TITLE": [ 2, "title" ], "OPER": [ 3, "oper" ],
                    "PUBTIME": [ 10, "pubTime" ], "QID": [ 1, "qid" ], "TAGS": [ 5, "tags" ] },
              "rowIdx": 0,
              "results": []
            }
          ],
          "total": [ 0 ],
          "questions": {
            "type": "io.odysz.module.rs.AnResultset",
            "stringFormats": null, "total": 8, "rowCnt": 8, "colCnt": 9,
            "colnames": {
              "SHORTDESC": [ 8, "shortDesc" ], "INDID": [ 5, "indId" ], "EXTRA": [ 9, "extra" ], "QORDER": [ 7, "qorder" ],
              "QTYPE": [ 6, "qtype" ], "QUIZID": [ 2, "quizId" ], "ANSWERS": [ 4, "answers" ], "QID": [ 1, "qid" ], "QUESTION": [ 3, "question" ]
            },
            "rowIdx": 0,
            "results": [
              [ 0, 0, "学习压力", "", "B01", "mr10", "1", "学习压力", null ],
              [ 0, 0, "父母/家庭关系", "A. I am pretty sure\nB. Not sure\nC. Nop, I'm the priorety", "B02", "s", "1", "父母/家庭关系", null ],
              [ 0, 0, "朋友/人际关系", "", "B03", "r5", "2", "朋友/人际关系", null ],
              [ 0, 0, "考试测试", "", "B04", "r5", "3", "考试测试", null ],
              [ 0, 0, "恋爱/异性", "", "B05", "r5", "4", "恋爱/异性", null ],
              [ 0, 0, "追星/偶像", "A.Taliban\nB.ISIS\nYou name it", "B06", "mr5", "5", "追星/偶像", null ],
              [ 0, 0, "学业", "", "B07", "n", "6", "学业", null ],
              [ 0, 0, "天气", "", "B08", "r5", "7", "天气", null ]
            ]
          }
        }
      },
      "quizUsers": null, "m": "quiz loaded", "map": null, "uri": null
    }
  ],
  "version": "1.0",
  "seq": 0
}

describe('case: [04 Protocol.QuizResp] indId can not be null', () => {
	it('4.Y [Quiz] start with question indId', () => {
		Protocol.registerBody('io.odysz.jquiz.QuizResp', (jsonBd) => {
			return new QuizResp(jsonBd);
		});

		let quizResp = new AnsonMsg(quizRespStartingQuestions);
		let u = quizResp.Body();

		assert.equal(u.type, "io.odysz.jquiz.QuizResp", "4.Y - type");

		let {quizId, quiz, questions} = u.quiz_questions();
		assert.equal(quizId, undefined, "4.y - quizId");
		assert.equal(quiz.title, 'New Quiz', "4.y - title");
		assert.equal(questions.length, 8, "4.y - q len");
		assert.equal(questions[0].qtype, "mr10", "4.y - qtype");
		assert.equal(questions[0].indId, "B01", "4.y - indId");
		assert.equal(questions[1].indId, "B02", "4.y - B2");
		assert.equal(questions[2].indId, "B03", "4.y - B3");
		assert.equal(questions[3].indId, "B04", "4.y - B4");
		assert.equal(questions[4].indId, "B05", "4.y - B5");
		assert.equal(questions[5].indId, "B06", "4.y - B6");
		assert.equal(questions[6].indId, "B07", "4.y - B7");
		assert.equal(questions[7].indId, "B08", "4.y - B8");
	});
})	;
