/**Test case of anclient/js/Protocol with mocha and chai.
 */

import { assert } from 'chai'

import { Protocol, AnsonMsg, QueryReq, UserReq, UpdateReq, AnsonResp, AnResultset, AnSessionResp } from '../protocol';
import { AnClient, SessionClient, SessionInf, CRUD, NameValue, NV } from '../anclient';

const resp = {
    "type": "io.odysz.semantic.jprotocol.AnsonMsg",
    "code": "ok",
    "opts": null,
    "port": "query",
    "header": null,
    "body": [ {
        "type": "io.odysz.semantic.jprotocol.AnsonResp",
        "rs": [ {
            "type": "io.odysz.module.rs.AnResultset",
            "stringFormats": null,
            "total": 8,
            "rowCnt": 8,
            "colCnt": 8,
            "colnames": {
                "VID": [ 1, "vid" ],
                "PERSON": [ 3, "person" ],
                "YEAR": [ 4, "year" ],
                "AMOUNT": [ 2, "amount" ],
                "DIM4": [ 6, "dim4" ],
                "DIM5": [ 7, "dim5" ],
                "DIM6": [ 8, "dim6" ],
                "AGE": [ 5, "age" ]
            },
            "rowIdx": 0,
            "results": [
                    [ "v 001", "100", "A1", "B1", "C1", "D1", "E1", "F1" ],
                    [ "v 002", "103", "A1", "B2", "C2", "D2", "E2", "F2" ],
                    [ "v 003", "105", "A1", "B1", "C3", "D1", "E3", "F1" ],
                    [ "v 004", "113", "A2", "B1", "C3", "D2", "E4", "F2" ],
                    [ "v 005", "111", "A1", "B1", "C1", "D3", "E1", "F1" ],
                    [ "v 006", "103", "A2", "B1", "C2", "D2", "E2", "F2" ],
                    [ "v 007", "105", "A3", "B1", "C4", "D3", "E3", "F1" ],
                    [ "v 008", "106", "A3", "B1", "C2", "D4", "E4", "F2" ]
                ]
        } ],
        "parent": "io.odysz.semantic.jprotocol.AnsonMsg",
        "a": null,
        "uri": null,
        "m": null,
        "map": null
    } ],
    "version": "1.0",
    "seq": 0
}

const respErr = {
	"type": "io.odysz.semantic.jprotocol.AnsonMsg",
	"code": "exSession", "opts": null,
	"port": "quiz.serv", "header": null,
	"body": [{
		"type": "io.odysz.semantic.jprotocol.AnsonResp",
		"rs": null,
		"parent": "io.odysz.semantic.jprotocol.AnsonMsg",
		"a": null,
		"uri": null,
		"m": "session info is missing or timeout",
		"map": null
	}],
	"version": "1.0", "seq": 0
}

const respSession = {
	"type": "io.odysz.semantic.jprotocol.AnsonMsg",
	"code": "ok", "opts": null, "port": "session",
	"header": null,
	"body": [ {
		"type": "io.odysz.semantic.jsession.AnSessionResp",
		"rs": null, "parent": "io.odysz.semantic.jprotocol.AnsonMsg",
		"a": null, "uri": null,
		"ssInf": { "type": "io.odysz.semantic.jsession.SessionInf",
				   "uid": "admin", "roleId": null, "ssid": "001eysTj"
			      },
		"m": null, "map": null
	} ],
	"version": "1.0", "seq": 0
};

const TestPorts = {
	test1: "test.serv",
	test2: "hello.serv"
};

const ajaxError = {
	"readyState":4,
	"responseText": `{
		"type": "io.odysz.semantic.jprotocol.AnsonMsg",
		"code": "ok",
		"opts": null,
		"port": "quiz.serv", "header": null,
		"body": [{
			"type": "io.odysz.jquiz.QuizResp",
			"rs": null, "parent": "io.odysz.semantic.jprotocol.AnsonMsg",
			"a": null, "uri": null,
			"data": {
				"type": "io.odysz.semantics.SemanticObject",
				"props": {
					"rs": [{
						"type": "io.odysz.module.rs.AnResultset", "stringFormats": null, "total": 1, "rowCnt": 1, "colCnt": 15,
						"colnames": {
							"DCREATE": [8, "dcreate"], "EXTRA": [10, "extra"], "REMARKS": [15, "remarks"], "OPER": [2, "oper"],
							"QID": [1, "qid"], "OPTIME": [4, "optime"], "PARENT": [13, "parent"], "QOWNER": [7, "qowner"],
							"LABEL": [14, "label"], "SUBJECT": [9, "subject"], "QUIZINFO": [6, "quizinfo"],
							"TITLE": [3, "title"], "TAG": [12, "tag"], "DID": [11, "did"], "TAGS": [5, "tags"] },
						"rowIdx": 0,
						"results": [["000001", "admin", "a", "2021-06-27 03:17:27", null, "d \"escape error here\"", "admin", "2021-06-27T03:17:27.663Z", null, null, null, null, null, null, null]]
					}],
					"total": [1]
			}},
			"m": "list loaded", "map": null
			}], "version": "1.0", "seq": 0
	}`,
	"status":200,
	"statusText":"parsererror"
}

describe('TS: [01.1 Protocol.Port]', () => {
    it('extending port', () => {
		let an = new AnClient('http://localhost/jsample');
		an.understandPorts(TestPorts);

		assert.equal(Protocol.Port['echo'], "echo.less");
		assert.equal(Protocol.Port['test1'], "test.serv");
		assert.equal(Protocol.Port['test2'], "hello.serv");

	});
});

const localStorage = {
	setItem: function () {},
}
describe('TS: [01.2 Protocol/AnsonReq]', () => {

    it('SessionReq formating / instantiation', () => {
		let ssReq = Protocol.formatSessionLogin('user 1', 'passweord cipher', 'iv64 ... ...');
        assert.equal(ssReq.code, null, "1 ---");
        assert.equal(ssReq.port, 'session', "2 ---");
        assert.equal(ssReq.type, "io.odysz.semantic.jprotocol.AnsonMsg", "3 ---");
        assert.equal(ssReq.Body()?.type, "io.odysz.semantic.jsession.AnSessionReq", "4 ---");
        assert.equal(ssReq.Body()?.uid, "user 1", "5 ---");
	});

	it('QueryReq', () => {
		let qr = new QueryReq('con-1', 'a_users', 'u', undefined)
			.expr("vid").expr("val", "amount")
			.expr("dim1", "agegrp").expr("dim2", "tex").expr("dim3", "indust")
			.expr("dim4").expr("dim5").expr("dim6")
			.whereCond("=", "agegrp", "'80-'")
			.A<QueryReq>('query');

		assert.equal(qr.uri, 'con-1', "1 ---");
		assert.equal(qr.mtabl, 'a_users', "2 ---");
		assert.equal(qr.mAlias, 'u', "2.1--");
		assert.equal(qr.a, 'query', "3 ---");

		assert.equal(qr.exprs.length, 8, "4 ---");
		assert.equal(qr.exprs[0].length, 2, "5 ---");
		assert.equal(qr.exprs[0][0], 'vid', "6 ---");
		assert.equal(qr.exprs[0][1], undefined, "6 undefined");
		assert.equal(qr.exprs[2].length, 2, "5 1--");
		assert.equal(qr.exprs[2][0], 'dim1', "6 2--");
		assert.equal(qr.exprs[2][1], 'agegrp', "6 3--");
		assert.equal(qr.where[0].length, 3, "7 1--");
		assert.equal(qr.where[0][0], '=', "8 2--");
		assert.equal(qr.where[0][1], 'agegrp', "9 3--");

		let port = 'query';
		let jreq = new AnsonMsg({
					port,
					header: null,
					body: [qr]
				});

        assert.equal(jreq.port, 'query', "10 ---");

		let an = new AnClient(undefined);
		an.init("localhost");
		an.understandPorts(TestPorts);

		assert.equal(an.servUrl(port), "localhost/r.serv11", "- 11 -");
	} );

	it('UserReq', () => {
		let ur = new UserReq('con-1', 'quizzes', {title: 'user-req'})
			.A<UserReq>('query')
			.set('quizId', '000001');

		assert.equal(ur.uri, 'con-1', "1 ---");
		assert.equal(ur.tabl, 'quizzes', "2 ---");
		assert.equal(ur.a, 'query', "3 ---");

		assert.equal(ur.get('quizId') as unknown as string, '000001', "4 ---");
		assert.equal(ur.get('title') as unknown as string, 'user-req', "5 ---");

		// must keep consists as js/cs/java all denpends on this structure
		assert.equal(ur.data.props['title'], 'user-req', "6 ---");
		assert.equal(ur.data.props['quizId'], '000001', "7 ---");

		let port = 'test1';
		let jreq = new AnsonMsg({
					port,
					header: null,
					body: [ur]
				});

        assert.equal(jreq.port, 'test1', "8 ---");

		let an = new AnClient(undefined);
		an.init("localhost");
		an.understandPorts(TestPorts);

		assert.equal(an.servUrl(port), "localhost/test.serv", "11 ==");
	} );

	it('UpdateReq', () => {

	});

	it('InsertReq <UpdateReq.A(insert)>', () => {
		let ur = new UpdateReq('con-1', 'quizzes', ['quizId'])
			.A<UpdateReq>('insert');

		assert.equal(ur.uri, 'con-1', "1 ---");
		assert.equal(ur.mtabl, 'quizzes', "2 ---");
		assert.equal(ur.a, 'insert', "3 ---");

		let port = 'test1';
		let jreq = new AnsonMsg({ port, header: null, body: [ur] });

        assert.equal(jreq.port, 'test1', "8 ---");

		let nvss : Array<NameValue[]> = [
			[{name: 'roleId', value: 'r01'}, {name: 'funcId', value: 'f01'}],
			[{name: 'roleId', value: 'r01'}, {name: 'funcId', value: 'f02'}]
		];

		let ssInf : SessionInf = { "type": "io.odysz.semantic.jsession.SessionInf",
					  "jserv": "",
					  "uid": "admin", "roleId": undefined, "ssid": "001eysTj" };
		let ir = new SessionClient(ssInf, new TextEncoder().encode('iv 3456789ABCDEF'), true)
				.usrAct('func', 'cate', 'cmd', 'remarks')
				.inserts(undefined, 'a_role_func', nvss)
				.Body();

		assert.equal(ir?.nvss.length, 2, 'A ---');
		assert.equal(ir?.nvss[0].length, 2, 'B ---');
		assert.equal(ir?.mtabl, 'a_role_func', 'a_role_func ---');

		jreq = new AnsonMsg({ port, header: null, body: [ir] });

        assert.equal(jreq.type, "io.odysz.semantic.jprotocol.AnsonMsg", "C ---");
        assert.equal(jreq.Body()?.type, "io.odysz.semantic.jserv.U.AnInsertReq", "D ---");

		ir?.newrow().nv("roleId", "r00").nv("roleId", "f00")
		assert.equal(ir?.nvss.length, 3, 'E ---');
		assert.equal(ir?.nvss[0].length, 2, 'F ---');
		assert.equal(ir?.nvss[2][0][1], 'r00', 'F ---');
		assert.equal(ir?.mtabl, 'a_role_func', 'F a_role_func ---');

		jreq = new AnsonMsg({ port, header: null, body: [ir] });

        assert.equal(jreq.type, "io.odysz.semantic.jprotocol.AnsonMsg", "G ---");
        assert.equal(jreq.Body()?.type, "io.odysz.semantic.jserv.U.AnInsertReq", "H ---");
	});

	it('InsertReq alternative rows', () => {
		let ur = new UpdateReq('con-1', 'quizzes', ['quizId'])
			.A<UpdateReq>('insert');

		assert.equal(ur.uri, 'con-1', "1 ---");
		assert.equal(ur.mtabl, 'quizzes', "2 ---");
		assert.equal(ur.a, 'insert', "3 ---");

		let port = 'test1';
		let jreq = new AnsonMsg({ port, header: null, body: [ur] });

		assert.equal(jreq.port, 'test1', "8 ---");

		let nvss : Array<NV[]> = [
			[{n: 'roleId', v: 'r01'}, {n: 'funcId', v: 'f01'}],
			[{n: 'roleId', v: 'r01'}, {n: 'funcId', v: 'f02'}]
		];

		let ssInf : SessionInf = { "type": "io.odysz.semantic.jsession.SessionInf",
					"jserv": "",
					"uid": "admin", "roleId": undefined, "ssid": "001eysTj" };
		let ir = new SessionClient(ssInf, new TextEncoder().encode('iv 3456789ABCDEF'), true)
				.usrAct('func', 'cate', 'cmd', 'remarks')
				.insert(undefined, "ZSU", nvss[0])
				.Body()
				?.newrow().nv("x", "1").nv("y", "2")
				?.rows(nvss)
				.newrow().nv("", "").nv("", "");

		assert.equal(ir?.nvss.length, 5, 'A ---');
		ir?.nvss.forEach((nvs, x) => {
			assert.equal(ir?.nvss[0].length, 2, 'B ---');
			assert.equal(nvs.length, 2, 'B ---');
		});
		assert.equal(ir?.mtabl, 'ZSU', 'ZSU ---');
		assert.equal(ir?.nvss[2][1][1], 'f01', 'F ---');
		assert.equal(ir?.nvss[1][1][1], '2', 'F ---');

		jreq = new AnsonMsg({ port, header: null, body: [ir] });

		assert.equal(jreq.type, "io.odysz.semantic.jprotocol.AnsonMsg", "C ---");
		assert.equal(jreq.Body()?.type, "io.odysz.semantic.jserv.U.AnInsertReq", "D ---");
	});
});

describe('TS: [01.3 Protocol/AnsonResp]', () => {
    it('Ajax error handling 1', () => {
		// TODO where this is used? let's remove it
		let json: any = { "readyState": 0, "status": 0, "statusText": "error" };

		json.code = Protocol.MsgCode.exIo,
		json.body = [ {
				type: 'io.odysz.semantic.jprotocol.AnsonResp',
				m: 'Ajax: network failed!'
			} ];
		let rp = new AnsonMsg( json );
		assert.equal(rp.type, 'io.odysz.semantic.jprotocol.AnsonMsg', "- 1 -");
		assert.equal(rp.code, 'exIo', "- 2 -");
		assert.equal(rp.Body()?.type, 'io.odysz.semantic.jprotocol.AnsonResp', "- 3 -");
		assert.equal(rp.Body()?.msg(), 'Ajax: network failed!', "- 4 -");
	});

    it('Ajax error handling 2', () => {
		// TODO let's use this replace above tested funtion
		let rp = AnClient.fromAjaxError(ajaxError);
        assert.equal(rp.type, 'io.odysz.semantic.jprotocol.AnsonMsg', "- A -");
        assert.equal(rp.code, 'exIo', "- B -");
		assert.equal(rp.Body()?.type, 'io.odysz.semantic.jprotocol.AnsonResp', "- C -");
		assert.equal(rp.Body()?.msg(), 'Ajax: parsererror', "- D -");
		assert.equal(rp.Body()?.ajax.statusText, ajaxError.statusText, "- E -");
		assert.equal(rp.Body()?.ajax.responseText, ajaxError.responseText, "- F -");
	});

    it('AnsonResp response instancing', () => {
		let rp = new AnsonMsg(resp);
		assert.equal(AnsonResp.hasColumn(rp.Body()?.Rs(), 'person'), true, "0 000");
		assert.equal(AnsonResp.hasColumn(rp.Body()?.Rs(), 'age'), true, "0 001");
        assert.equal(rp.code, 'ok', "1 ---");
        assert.equal(rp.port, 'query', "2 ---");
        assert.equal(rp.Body()?.msg(), null, "3 ---");

		rp = new AnsonMsg(respErr);
		assert.equal(rp.code, 'exSession', "4 ---");
		assert.equal(rp.Body()?.msg(), 'session info is missing or timeout', "5 ---");
	} );

    it('SessionResp response instancing', () => {

		let rp = new AnsonMsg(respSession);
        assert.equal(rp.code, 'ok', "1 ---");
        assert.equal(rp.port, 'session', "2 ---");
        assert.equal(rp.Body()?.ssInf?.type, "io.odysz.semantic.jsession.SessionInf", "3 ---");
        assert.equal(rp.Body()?.ssInf?.uid, "admin", "4 ---");
        assert.equal(rp.Body()?.ssInf?.ssid, "001eysTj", "5 ---");

		let sessionClient = new SessionClient(rp.Body()?.ssInf, new TextEncoder().encode('iv....'), true);
		let ssi = sessionClient.userInfo;
        assert.equal(ssi.uid, "admin", "6 ---");
        assert.equal(ssi.ssid, "001eysTj", "7 ---");
	} );

	it('AnsonResp {colnames, results} => [{n, v}, ...] ', () => {
		type Vec = {vid: string, amount: string};

		assert.isTrue(typeof(Protocol.rs2arr) === 'function', "1 ---");

		let { rows } = AnsonResp.rs2arr(resp.body[0].rs[0] as unknown as AnResultset);
		assert.equal(8, rows.length, "2 ---");
		let r0 = rows[0] as Vec;
		assert.equal('v 001', r0.vid, "3 ---");
		assert.equal('100', r0.amount, "4 ---");
		r0 = rows[1] as Vec
		assert.equal('v 002', r0.vid, "5 ---");
		assert.equal('103', r0.amount, "6 ---");

		rows = AnsonResp.rsArr((resp as unknown as AnsonMsg<AnsonResp>).body, 0).rows;
		assert.equal(8, rows.length, "7 ---");

		rows = AnsonMsg.rsArr((resp as unknown as AnsonMsg<AnsonResp>), 0).rows;
        assert.equal(8, rows.length, "8 ---");
    });

    it('AnsonResp [{NAME: [x, Name]}] => [{Name, x}, ...] ', () => {

		let { cols } = AnsonResp.rs2arr((resp.body[0] as unknown as AnsonResp).rs[0]);

        assert.equal(8, cols.length, "2 ---");
        assert.equal('vid', cols[0], "0 ---");
        assert.equal('dim6', cols[7], "7 ---");
	});
});

/**
  /u.serv11
  delete from n_docs where docId = 'undefined'
  insert into n_docs  (docId, mime, docName, uri, userId, optime, oper) values ('000008', 'image/jpeg;base64', 'test-5.jpg', 'shares/admin/000008 test-5.jpg', 'admin', datetime('now'), 'admin')
 */
const resulveInsertDocResp = {
    "type": "io.odysz.semantic.jprotocol.AnsonMsg",
    "code": "ok", "opts": null, "port": "update",
    "header": null,
    "body": [
      { "type": "io.odysz.semantic.jprotocol.AnsonResp",
        "rs": null,
        "parent": "io.odysz.semantic.jprotocol.AnsonMsg",
        "a": null, "m": null,
        "map": {
          "resulved": {
            "type": "io.odysz.semantics.SemanticObject",
            "props": {
                "n_docs": {
                    "type": "io.odysz.semantics.SemanticObject",
                    "props": { "docId": "000008" }
                }
            }
          },
          "deleted": [ 0, 1 ]
        },
        "uri": null
    } ],
    "version": "1.0", "seq": 0
}
const insertDoc = {
  "docId": null,
  "mime": "image/jpeg;base64",
  "docName": "test-5.jpg",
  "uri": "/9j/4AAQSkZJR...",
  "userId": "admin"
}
describe('TS: [01.5 Protocol/AnsonResp]', () => {
    it('Resulve post insertion <u.serv11>', () => {
		let crud = CRUD.c;
		let rec = insertDoc;
		let that = {
				pk: 'docId',
				mtabl: 'n_docs' };

		function saveDocCallback (resp, onOk) {
			let bd = resp.Body();
			if ( crud === CRUD.c )
				rec[that.pk] = bd.resulve(that.mtabl, that.pk, rec);
			onOk(resp, rec);
		}

		let rp = new AnsonMsg(resulveInsertDocResp);
		saveDocCallback(rp, (resp, rec) => {
			assert.equal('000008', rec.docId, 'docId ...');
		});
	});
});
