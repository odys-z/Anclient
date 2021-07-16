import chai from 'chai';
import { expect, assert } from 'chai';

import { L, Langstrs } from '../../lib/frames/react/utils/langstr';

describe('case: [00.2 Language]', () => {
    it('hello', () => {
		let s;
		Langstrs.s.zh = {'hello {name} from {frm}': '你好 {name} from {frm}', 'OK': '确定'};
		Langstrs.s.ja = {'hello {name} from {frm}': '{name}は こんにちは, {frm}', 'OK': 'はい'};

		assert.equal(L('hello'), 'hello', "1 ---");
        assert.equal(L('OK'), 'OK', "2 ---");
		s = L('world');
        assert.equal(L('world'), 'world', "2 ---");

		Langstrs.using('ja')
		assert.equal(L('hello {name} from {frm}', {name: 'ody', frm: 'JA'}), 'odyは こんにちは, JA', "3 ---");
        assert.equal(L('OK'), 'はい', "4 ---");
		s = L('world');
        assert.equal(L('world'), 'world', "5 ---");

		Langstrs.using('zh')
		assert.equal(L('hello {name} from {frm}', {name: 'ody', frm: 'TW'}), '你好 ody from TW', "6 ---");
        assert.equal(L('OK'), '确定', "7 ---");
		s = L('world');
        assert.equal(L('world'), 'world', "8 ---");

        assert.isTrue(Langstrs.s.en.has('world'), "9 ---");
        assert.equal(Langstrs.s.ja.world, 'world', "A ---");
        assert.equal(Langstrs.s.zh.world, 'world', "B ---");
	});
});
