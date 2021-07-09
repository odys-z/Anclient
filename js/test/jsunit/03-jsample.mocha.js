import { expect, assert } from 'chai'
import { Protocol, AnsonMsg, DatasetReq } from '../../lib/protocol.js'

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
		let datasetCfg = {
				conn: 'con-1',
				sk: 'menu',
				mtabl: 's_funcs',
				args: ['admin'] };
		let mr = new DatasetReq(datasetCfg)
			.A('query');
		mr.args(['quizId', '000001']);

		console.log(mr.t);
        assert.equal(mr.conn, 'con-1', "1 ---");
        assert.equal(mr.mtabl, 's_funcs', "2 ---");
        assert.equal(mr.a, 'query', "3.1 ---");
        assert.equal(mr.sk, 'menu', "3.2 ---");

		// must keep consists as js/cs/java all denpends on this structure
		assert.equal(mr.sqlArgs[0], 'admin', "4 ---");
		assert.equal(mr.sqlArgs[1], 'quizId', "5 ---");
		assert.equal(mr.sqlArgs[2], '000001', "6 ---");

		let port = 'test1';
		let jreq = new AnsonMsg({
					port,
					header: null,
					dataset: datasetCfg,
					body: [mr]
				});

        assert.equal(jreq.port, 'test1', "8 ---");
	});

	it('Convert AnsonResp to menu', () => {
		let rp = new AnsonMsg(dsResp);
		assert.equal(rp.code, 'ok', "1 ---");
		assert.equal(rp.port, 'dataset', "2 ---");

		assert.equal(rp.Body().rs(0).type, "io.odysz.anson.AnsonResultset", "3 ---");
	});
})
