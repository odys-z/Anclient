/**Test case of anclient/js/Protocol with mocha and chai.
 */

import chai from 'chai'
import { expect, assert } from 'chai'

import {Protocol, AnsonMsg, UserReq, AnsonResp} from '../../lib/protocol.js'
import {AnClient, SessionClient} from '../../lib/anclient.js'


const dsResp = {
	"type": "io.odysz.semantic.jprotocol.AnsonMsg",
	"code": "ok", "opts": null,
	"port": "dataset",
	"header": null,
	"body": [{
		"type": "io.odysz.semantic.ext.AnDatasetResp",
		"rs": [{"type": "io.odysz.module.rs.AnResultset", "stringFormats": null,
				"total": 10, "rowCnt": 10, "colCnt": 7,
				"colnames": {"PARENTID": [2, "parentId"], "SORT": [5, "sort"], "DOMAINID": [1, "domainId"], "STAMP": [7, "stamp"], "DOMAINVALUE": [4, "domainValue"], "FULLPATH": [6, "fullpath"], "DOMAINNAME": [3, "domainName"]},
				"rowIdx": 0,
				"results": [
					["0", "", "org type", "t-org", "1", "0", ""],
		  			["001", "0", "5 START", "AAAAA", "1", "0.1 001", ""],
					["002", "0", "4 START", "AAAA ", "2", "0.2 002", ""],
					["003", "0", "3 START", "AAA  ", "3", "0.3 003", ""],
					["004", "0", "2 START", "AA   ", "4", "0.4 004", ""],
					["005", "0", "1 START", "A    ", "5", "0.5 005", ""],
					["nation", "", "nations", "t-nation", "2", "1", ""],
					["N01", "nation", "Republic of China", "CHN", "1", "1.1 CN", ""],
					["N02", "nation", "United States of America", "USA", "2", "1.2 US", ""],
					["N03", "nation", "Israel", "ISR", "2", "1.3 IS", ""]
				]
		} ],
		"parent": "io.odysz.semantic.jprotocol.AnsonMsg",
		"a": null,
		"forest": null, "conn": null, "m": "", "map": null
	}],
	"version": "1.0",
	"seq": 0
}

describe('case: [01.2 Ext dataset]', () => {
    it('convert to AnReact bombobox', () => {
		let rp = new AnsonMsg(dsResp);

		assert.equal(rp.Body().type, "io.odysz.semantic.ext.AnDatasetResp", "1 ---");

		debugger
		let rs = rp.Body().Rs();
		assert.equal(rs.type, "io.odysz.module.rs.AnResultset", "2 ---");
		assert.equal(rs.total, 10, "3 ---");

		let {rows, cols} = AnsonResp.rs2nvs(rs, {n: 'domainName', v: 'domainId'});
		/*rows: [
		  { n: 'org type', v: '0' },
		  { n: '5 START', v: '001' },
		  { n: '4 START', v: '002' },
		  { n: '3 START', v: '003' },
		  { n: '2 START', v: '004' },
		  { n: '1 START', v: '005' },
		  { n: 'nations', v: 'nation' },
		  { n: 'Republic of China', v: 'N01' },
		  { n: 'United States of America', v: 'N02' },
		  { n: 'Israel', v: 'N03' } ]
		 */
		assert.equal(rows.length, 10, "4 ---");
		assert.equal(rows[0].n, "org type", "5 ---");
		assert.equal(rows[0].v, "0", "6 ---");
	});
});
