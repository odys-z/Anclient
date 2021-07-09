import { expect, assert } from 'chai'
import { Protocol, AnsonMsg, AnsonResp } from '../../lib/protocol.js'

const dsResp = {
	"type": "io.odysz.semantic.jprotocol.test.AnsonMsg",
	"code": "ok", "opts": null,
	"port": "dataset", "header": null,
	"vestion": "1.0",
	"body": [{"type": "io.odysz.semantic.ext.test.AnDatasetResp",
			  "rs": [{  "type": "io.odysz.anson.AnsonResultset",
			  			"stringFormats": null, "total": 0, "rowCnt": 2, "colCnt": 2,
						"colnames": {"1": [1, "1"], "2": [2, "2"]},
						"rowIdx": 0,
						"results": [["0, 1", "0, 2"], ["1, 1", "1, 2"]]
					}],
			  "parent": "io.odysz.semantic.jprotocol.test.AnsonMsg",
			  "a": null,
			  "forest": null, "conn": null, "m": "", "map": null
	}], "seq": 0
}

describe('case: [03.1 Jsample.menu]', () => {

	it('Convert to menu.serv requests', () => {
		let mr = new DatasetReq('con-1', 'quizzes', {title: 'user-req'})
			.A('query')
			.set('quizId', '000001');

        assert.equal(mr.conn, 'con-1', "1 ---");
        assert.equal(mr.tabl, 'quizzes', "2 ---");
        assert.equal(mr.a, 'query', "3 ---");

        assert.equal(mr.get('quizId'), '000001', "4 ---");
        assert.equal(mr.get('title'), 'user-req', "5 ---");

		// must keep consists as js/cs/java all denpends on this structure
		assert.equal(mr.data.props['title'], 'user-req', "6 ---");
		assert.equal(mr.data.props.quizId, '000001', "7 ---");

		let port = 'test1';
		let jreq = new AnsonMsg({
					port,
					header: null,
					body: [mr]
				});

        assert.equal(jreq.port, 'test1', "8 ---");

		let an = new AnClient();
		an.init("localhost", "conn-1");
		an.understandPorts(TestPorts);

		assert.equal(an.servUrl(port), "localhost/test.serv", "- 11 -");
	});

	it('Convert AnsonResp to menu', () => {
		let rp = new AnsonMsg(dsResp);
		assert.equal(rp.code, 'ok', "1 ---");
		assert.equal(rp.port, 'dataset', "2 ---");

		assert.equal(rp.Body().rs(0).type, "io.odysz.anson.AnsonResultset", "3 ---");
	});
})
