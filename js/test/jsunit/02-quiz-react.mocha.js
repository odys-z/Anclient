import { expect, assert } from 'chai'
import {Protocol, AnsonMsg, AnsonResp} from '../../lib/protocol.js'
import {QuizResp, QuizReq} from '../../../examples/example.js/lib/protocol.quiz.js'

const jsonResp = {
"body": [ {
  "a": null,
  "conn": null,
  "data": {
    "props": {
    "rs": [
        { "colCnt": 15,
          "colnames": {
                "DCREATE": [ 8, "dcreate" ],
                "DID": [ 11, "did" ],
                "EXTRA": [ 10, "extra" ],
                "LABEL": [ 14, "label" ],
                "OPER": [ 2, "oper" ],
                "OPTIME": [ 4, "optime" ],
                "PARENT": [ 13, "parent" ],
                "QID": [ 1, "qid" ],
                "QOWNER": [ 7, "qowner" ],
                "QUIZINFO": [ 6, "quizinfo" ],
                "REMARKS": [ 15, "remarks" ],
                "SUBJECT": [ 9, "subject" ],
                "TAG": [ 12, "tag" ],
                "TAGS": [ 5, "tags" ],
                "TITLE": [ 3, "title" ]
          },
          "results": [
                [ "000004", "admin", null, "2021-06-09 12:55:02", null, null, "admin", "2021-06-09T12:55:02.200Z", null, null, null, null, null, null, null ],
                [ "000005", "admin", null, "2021-06-10 01:50:43", null, null, "admin", "2021-06-10T01:50:42.847Z", null, null, null, null, null, null, null ],
                [ "000006", "admin", "", "2021-06-10 01:51:20", null, null, "admin", "2021-06-10T01:51:19.888Z", null, null, null, null, null, null, null ],
                [ "000007", "admin", "zzzzzzzz", "2021-06-10 02:03:46", null, "ddddddddddddddd", "admin", "2021-06-10T02:03:46.032Z", null, null, null, null, null, null, null ],
                [ "000008", "admin", "", "2021-06-10 02:19:39", null, null, "admin", "2021-06-10T02:19:39.062Z", null, null, null, null, null, null, null ],
                [ "000009", "admin", "", "2021-06-10 02:26:33", null, null, "admin", "2021-06-10T02:26:33.569Z", null, null, null, null, null, null, null ],
                [ "00000A", "admin", "", "2021-06-10 02:29:19", null, "tt", "admin", "2021-06-10T02:29:19.187Z", null, null, null, null, null, null, null ]
          ],
          "rowCnt": 7,
          "rowIdx": 0,
          "stringFormats": null,
          "total": 7,
          "type": "io.odysz.module.rs.AnResultset"
        } ],
        "total": [ 7 ] },
    "type": "io.odysz.semantics.SemanticObject" },
  "m": "list loaded",
  "map": null,
  "parent": "io.odysz.semantic.jprotocol.AnsonMsg",
  "rs": null,
  "type": "io.odysz.jquiz.QuizResp"
  } ],
  "code": "ok",
  "header": null,
  "opts": null,
  "port": "quiz.serv",
  "seq": 0,
  "type": "io.odysz.semantic.jprotocol.AnsonMsg",
  "version": "1.0"
}

const jsonNochild = {
    "type": "io.odysz.semantic.jprotocol.AnsonMsg",
    "code": "ok",
    "opts": null,
    "port": "quiz.serv",
    "header": null,
    "body": [ {
        "type": "io.odysz.jquiz.QuizResp",
        "rs": null,
        "parent": "io.odysz.semantic.jprotocol.AnsonMsg",
        "a": null,
        "conn": null,
        "data": {
            "type": "io.odysz.semantics.SemanticObject",
            "props": {
                "rs": [ {
                    "type": "io.odysz.module.rs.AnResultset",
                    "stringFormats": null,
                    "total": 0,
                    "rowCnt": 0,
                    "colCnt": 10,
                    "colnames": {
                        "DCREATE": [ 8, "dcreate" ],
                        "OPTIME": [ 4, "optime" ],
                        "EXTRA": [ 10, "extra" ],
                        "QOWNER": [ 7, "qowner" ],
                        "SUBJECT": [ 9, "subject" ],
                        "QUIZINFO": [ 6, "quizinfo" ],
                        "TITLE": [ 3, "title" ],
                        "OPER": [ 2, "oper" ],
                        "QID": [ 1, "qid" ],
                        "TAGS": [ 5, "tags" ]
                    },
                    "results": [
                        [ "000007", "admin", "zzzzzzzz", "2021-06-10 02:03:46", null, "ddddddddddddddd", "admin", "2021-06-10T02:03:46.032Z", null, null, null, null, null, null, null ]
                    ],
                    "rowCnt": 1,
                    "rowIdx": 0,
                    }
                ],
                "total": [ 1 ],
                "questions": {
                    "type": "io.odysz.module.rs.AnResultset",
                    "stringFormats": null,
                    "total": 0,
                    "rowCnt": 0,
                    "colCnt": 10,
                    "colnames": {
                        "SHORTDESC": [ 3, "shortDesc" ],
                        "ANSWER": [ 7, "answer" ],
                        "HINTS": [ 8, "hintS" ],
                        "EXTRA": [ 10, "extra" ],
                        "QORDER": [ 5, "qorder" ],
                        "QTYPE": [ 6, "qtype" ],
                        "QUIZID": [ 2, "quizid" ],
                        "ADDITIONAL": [ 9, "additional" ],
                        "QID": [ 1, "qid" ],
                        "QUESTION": [ 4, "question" ]
                    },
                    "rowIdx": 0,
                    "results": []
                }
            }
        },
        "m": "quiz loaded",
        "map": null
    } ],
    "version": "1.0",
    "seq": 0
}

describe('case: [Protocol.AnReact] quiz converter', () => {

	it('[Quiz] Convert AnsonResp to quizzes', () => {
		let quizResp = new QuizResp(jsonResp.body[0]);
		let quizzes = quizResp.quizzes();

		// ['QID', 'QOWNER', 'QTITLE', 'TAGS', 'QUESTIONS', 'OPER', 'OPERTIME']
        assert.equal(quizzes.length, 7, "1 ---");
        assert.equal(quizzes[0].qid, "000004", "2 ---");
        assert.equal(quizzes[6].qid, "00000A", "3 ---");
        assert.equal(quizzes[3].title, "zzzzzzzz", "4 ---");
	});

	it('[Quiz.questions] Convert AnsonResp to questions', () => {
		let quiz = new QuizResp(jsonNochild.body[0]);
		let {title, quizinfo, quizId, questions} = quiz.questions();

        assert.equal(title, "zzzzzzzz", "1 ---");
        assert.equal(quizId, "000007", "2 ---");
        assert.equal(quizinfo, "ddddddddddddddd", "3 ---");

		assert.equal(questions.length, 0, "4 ---");
	});

	it('[Quiz.questions] Convert simple array to [[n, v], ...]', () => {
		let quests = [[ "id0", "Question 0", "A. \nB. \nC. \nD. ", "1", "0" ]];
		let nvs = QuizReq.questionToNvs(quests);

        assert.equal(nvs.length, 1, "1 ---");
        assert.equal(nvs[0].length, 5, "2 ---");
        assert.equal(nvs[0][0].length, 2, "3 ---");
        assert.equal(nvs[0][0][0], "qid", "4 ---");
        assert.equal(nvs[0][0][1], "id0", "5 ---");
        assert.equal(nvs[0][1][0], "question", "6 ---");
        assert.equal(nvs[0][1][1], "Question 0", "7 ---");
        assert.equal(nvs[0][2][0], "answers", "6 ---");
        assert.equal(nvs[0][2][1], "A. \nB. \nC. \nD. ", "7 ---");
        assert.equal(nvs[0][4][0], "answer", "8 ---");
        assert.equal(nvs[0][4][1], "0", "9 ---");
	});
})
