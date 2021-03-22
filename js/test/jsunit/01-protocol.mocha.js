/**Test case of anclient/js/Protocol with mocha and chai.
 */

import chai from 'chai'
import { expect, assert } from 'chai'

// import {Affine} from '../../lib/xmath/affine'
import {Protocol, AnsonResp} from '../../lib/protocol.js'


describe('case: [Protocol] data converter', () => {

    it('AnsonResp response handling', () => {
        assert.isTrue(typeof(Protocol.rs2arr) === 'function', "1 ---");

		let resp = {
		    "type": "io.odysz.semantic.jprotocol.AnsonMsg",
		    "code": "ok",
		    "opts": null,
		    "port": "query",
		    "header": null,
		    "body": [
		        {
		            "type": "io.odysz.semantic.jprotocol.AnsonResp",
		            "rs": [
		                {
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
		                }
		            ],
		            "parent": "io.odysz.semantic.jprotocol.AnsonMsg",
		            "a": null,
		            "conn": null,
		            "m": null,
		            "map": null
		        }
		    ],
		    "version": "1.0",
		    "seq": 0
		}

		let anResp = new AnsonResp(resp);
		// FIXME to be tested
        // assert.equal(8, anResp.rowCnt, "3 ---");
        // assert.equal(8, anResp.results.length, "4 ---");

		let rs = AnsonResp.rs2arr(resp.body[0].rs[0]);
        assert.equal(8, rs.length, "4 ---");
		let r0 = rs[0]
        assert.equal('v 001', r0.vid, "4.1 ---");
        assert.equal('100', r0.amount, "4.2 ---");
		r0 = rs[1]
        assert.equal('v 002', r0.vid, "5.1 ---");
        assert.equal('103', r0.amount, "5.2 ---");
    });

});
