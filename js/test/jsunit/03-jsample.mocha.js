import { expect, assert } from 'chai'
import { Protocol, AnsonMsg, AnsonResp } from '../../lib/protocol.js'

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

		debugger
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
	});
})
