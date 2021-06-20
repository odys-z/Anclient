/**Test case of anclient/js/Protocol with mocha and chai.
 */

import chai from 'chai'
import { expect, assert } from 'chai'

import {Protocol, AnsonMsg, UserReq, AnsonResp} from '../../lib/protocol.js'
import {AnClient, SessionClient} from '../../lib/anclient.js'


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
        "conn": null,
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
		"conn": null,
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
		"a": null, "conn": null,
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

describe('case: [Protocol/AnsonMsg]', () => {
    it('UserReq handling', () => {
		let an = new AnClient();
		an.understandPorts(TestPorts);

		assert.equal(Protocol.Port['echo'], "echo.serv11");
		assert.equal(Protocol.Port['test1'], "test.serv");
		assert.equal(Protocol.Port['test2'], "hello.serv");
	});
});

describe('case: [Protocol/AnsonMsg]', () => {
    it('UserReq handling', () => {
		let ur = new UserReq('con-1', 'quizzes', {title: 'user-req'})
			.A('query')
			.set('quizId', '000001');

        assert.equal(ur.conn, 'con-1', "1 ---");
        assert.equal(ur.tabl, 'quizzes', "2 ---");
        assert.equal(ur.a, 'query', "3 ---");

        assert.equal(ur.get('quizId'), '000001', "4 ---");
        assert.equal(ur.get('title'), 'user-req', "5 ---");

		// must keep consists as js/cs/java all denpends on this structure
		assert.equal(ur.data.props['title'], 'user-req', "6 ---");
		assert.equal(ur.data.props.quizId, '000001', "7 ---");

		let port = 'test1';
		let jreq = new AnsonMsg({
					port,
					header: null,
					body: [ur]
				});

        assert.equal(jreq.port, 'test1', "8 ---");
        assert.equal(jreq.port, 'test1', "8 ---");

		let an = new AnClient();
		an.init("localhost", "conn-1");
		an.understandPorts(TestPorts);

		assert.equal(an.servUrl(port), "localhost/test.serv", "- 11 -");
	} );

    it('AnsonResp response instancing', () => {
		let rp = new AnsonMsg(resp);
        assert.equal(rp.code, 'ok', "1 ---");
        assert.equal(rp.port, 'query', "2 ---");
        assert.equal(rp.Body().msg(), null, "3 ---");

		rp = new AnsonMsg(respErr);
		assert.equal(rp.code, 'exSession', "4 ---");
		assert.equal(rp.Body().msg(), 'session info is missing or timeout', "5 ---");
	} );

    it('SessionReq formating / instantiation', () => {
		let ssReq = Protocol.formatSessionLogin('user 1', 'passweord cipher', 'iv64 ... ...');
        assert.equal(ssReq.code, null, "1 ---");
        assert.equal(ssReq.port, 'session', "2 ---");
        assert.equal(ssReq.type, "io.odysz.semantic.jprotocol.AnsonMsg", "3 ---");
        assert.equal(ssReq.Body().type, "io.odysz.semantic.jsession.AnSessionReq", "4 ---");
        assert.equal(ssReq.Body().uid, "user 1", "5 ---");
	});

    it('SessionResp response instancing', () => {
		let rp = new AnsonMsg(respSession);
        assert.equal(rp.code, 'ok', "1 ---");
        assert.equal(rp.port, 'session', "2 ---");
        assert.equal(rp.Body().ssInf.type, "io.odysz.semantic.jsession.SessionInf", "3 ---");
        assert.equal(rp.Body().ssInf.uid, "admin", "4 ---");
        assert.equal(rp.Body().ssInf.ssid, "001eysTj", "5 ---");

		let sessionClient = new SessionClient(rp.Body().ssInf, ['iv....'], true);
		let ssi = sessionClient.userInfo;
        assert.equal(ssi.uid, "admin", "6 ---");
        assert.equal(ssi.ssid, "001eysTj", "7 ---");
	} );

    it('AnsonResp response handling', () => {
        assert.isTrue(typeof(Protocol.rs2arr) === 'function', "1 ---");

		let rs = AnsonResp.rs2arr(resp.body[0].rs[0]);
        assert.equal(8, rs.length, "2 ---");
		let r0 = rs[0]
        assert.equal('v 001', r0.vid, "3 ---");
        assert.equal('100', r0.amount, "4 ---");
		r0 = rs[1]
        assert.equal('v 002', r0.vid, "5 ---");
        assert.equal('103', r0.amount, "6 ---");

		let arr = AnsonResp.rsArr(resp.body, 0);
        assert.equal(8, arr.length, "7 ---");

		arr = AnsonMsg.rsArr(resp, 0);
        assert.equal(8, arr.length, "8 ---");
    });

});
