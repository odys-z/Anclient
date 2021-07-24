import chai from 'chai';
import { expect, assert } from 'chai';

import { L, Langstrs } from '../../lib/frames/react/utils/langstr';
import { toBool } from '../../lib/frames/react/utils/helpers';

describe('case: [00.1 string value]', () => {
    it('toBool', () => {
		assert.isTrue(toBool('1'), '1');
		assert.isTrue(toBool('2'), '2');
		assert.isTrue(toBool(1), '3');
		assert.isTrue(toBool(2), '4');
		assert.isTrue(toBool(true), '5');
		assert.isTrue(toBool('true'), '6');

		assert.isFalse(toBool('0'), 'A');
		assert.isFalse(toBool(' '), 'B');
		assert.isFalse(toBool(0), 'C');
		assert.isFalse(toBool(undefined), 'D');
		assert.isFalse(toBool(null), 'E');
		assert.isFalse(toBool('false'), 'F');
	} );
} );

describe('case: [00.2 Language]', () => {
    it('translation', () => {
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
		assert.equal(Langstrs.s.ja.world, undefined, "A ---");
		assert.equal(Langstrs.s.zh.world, undefined, "B ---");

		let totrans = Langstrs.report();
		console.log(totrans);
		// assert.equal(totrans.size, 2, "C ---");
		assert.isTrue(totrans.has('hello'), "D ---");
		assert.isTrue(totrans.has('world'), "E ---");
	});
});
