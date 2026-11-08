/**
 * Anson types: each class sends its Java type, set once by the constructor;
 * TreeModify and the tree fields of AnDatasetReq / AnDatasetResp as semantic.jserv reads them.
 */
import { assert } from 'chai'

import { AnDatasetReq, AnDatasetResp, AnHeader, AnSessionReq, AnsonMsg, DatasetierReq,
	DeleteReq, InsertReq, PageInf, QueryReq, TreeModify, UpdateReq, UserReq } from '../protocol'

describe('case: [06 Anson types]', () => {
	it('type of each class, by constructor', () => {
		assert.equal(new PageInf(0, 10).type, 'io.odysz.transact.sql.PageInf');
		assert.equal(new AnHeader('ss', 'u', 'tk').type, 'io.odysz.semantic.jprotocol.AnsonHeader');
		assert.equal(new AnSessionReq('u', 'tk', 'iv').type, 'io.odysz.semantic.jsession.AnSessionReq');
		assert.equal(new UserReq('/u', 'a_users').type, 'io.odysz.semantic.jserv.user.UserReq');
		assert.equal(new QueryReq({uri: '/q', mtabl: 't', mAlias: 'a', pageInf: new PageInf(0, 10)}).type,
					'io.odysz.semantic.jserv.R.AnQueryReq');
		assert.equal(new UpdateReq('/u', 't', ['id', '1']).type, 'io.odysz.semantic.jserv.U.AnUpdateReq');
		assert.equal(new DeleteReq('/u', 't', ['id', '1']).type, 'io.odysz.semantic.jserv.U.AnUpdateReq');
		assert.equal(new InsertReq('/u', 't').type, 'io.odysz.semantic.jserv.U.AnInsertReq');
		assert.equal(new DatasetierReq({uri: '/d'}).type, 'io.odysz.semantic.tier.DatasetierReq');
		assert.equal(new AnDatasetReq({uri: '/d', sk: 'x'}).type, 'io.odysz.semantic.ext.AnDatasetReq');
		assert.equal(new AnDatasetReq({uri: '/d', type: 'io.oz.sdoc.DoctreeReq'}).type, 'io.oz.sdoc.DoctreeReq',
					'a subclass passes its own type');
	});

	it('TreeModify as Java reads it', () => {
		const req = new AnDatasetReq({uri: '/sdoc', a: AnDatasetReq.A.stree})
					.Mod(TreeModify.insert('a1', 'after', 'nodetype', 'para', 'text', null));
		assert.equal(req.a, 'u/stree');

		const json = JSON.parse(JSON.stringify(req));
		assert.deepEqual(json.mod, {
			type: 'io.odysz.semantic.ext.TreeModify',
			op: 'insert', nid: 'a1', at: 'after',
			nvs: [['nodetype', 'para'], ['text', null]] });

		assert.deepEqual(JSON.parse(JSON.stringify(TreeModify.indent('a3'))),
					{type: 'io.odysz.semantic.ext.TreeModify', op: 'indent', nid: 'a3'});
	});

	it('AnDatasetResp of a tree modification', () => {
		const msg = new AnsonMsg({ type: 'io.odysz.semantic.jprotocol.AnsonMsg', code: 'ok', port: 'stree',
			body: [{ type: 'io.odysz.semantic.ext.AnDatasetResp', root: 'A', newId: 'n1', forest: [] }]});
		const resp = msg.Body() as AnDatasetResp;
		assert.instanceOf(resp, AnDatasetResp);
		assert.equal(resp.root, 'A');
		assert.equal(resp.newId, 'n1');
		assert.isUndefined(resp.rejected);

		const no = new AnDatasetResp({ forest: [], rejected: 'holder' });
		assert.equal(no.rejected, TreeModify.Rejected.holder);
	});
});
