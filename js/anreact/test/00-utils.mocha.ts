import { assert } from 'chai';

import { L, Langstrs } from '../../anreact/src/utils/langstr';
import { regex } from '../../anreact/src/utils/regex';
import { swap } from '../src/utils/lang-ext';

describe('case: [0.0] utils', () => {
	it('Array pathc', () => {
		let arr = [1, 2, 3];
		swap(arr, 0, 1);
		assert.equal(arr.length, 3);
		assert.equal(arr[0], 2);
		assert.equal(arr[1], 1);
		assert.equal(arr[2], 3);
	});
} );

let { mime2type, type2mime } = regex;
describe('case: [00.1 regex]', () => {
	it('mime2type', () => {
		assert.equal(mime2type('image/jpeg'), 'image', '00.1 jpeg');
		assert.equal(mime2type('image/png'), 'image', '00.1 png');
		assert.equal(mime2type('image/png;base64'), 'image', '00.1 image');
		assert.equal(mime2type('image/svg+xml'), 'image', '00.1 svg');
		assert.equal(mime2type('video/ogg'), 'video', '00.1 video');
		assert.equal(mime2type('audio/mpeg'), 'audio', '00.1 audio');
		assert.equal(mime2type('application/pdf'), '.pdf', '00.1 pdf');
		assert.equal(mime2type('application/xml'), '.xml', '00.1 xml');
		assert.equal(mime2type(''), '', '00.1 ""');
		assert.equal(mime2type(null), '', '00.1 null');
		assert.equal(mime2type(undefined), '', '00.1 undefined');
	});

    it('type2mime', () => {
		assert.equal(type2mime('png'), 'image/png', '00.2 --png');
		assert.equal(type2mime('.png'), 'image/png', '00.2 .png');
		assert.equal(type2mime('pdf'), 'application/pdf', '00.2 --pdf');
		assert.equal(type2mime('image'), 'image/', '00.2 --image');
		assert.equal(type2mime(''), '', '00.2 --""');
		assert.equal(type2mime(null), '', '00.2 --null');
		assert.equal(type2mime(undefined), '', '00.2 --undefined');
	});
});

describe('case: [00.2 Language]', () => {
	it('translation', () => {
		let s;
		const t_hello = 'Hello {name} from {frm}';

		Langstrs.s.zh[t_hello] = '你好 {name} from {frm}';
		Langstrs.s.zh['OK'] = '确定';
		Langstrs.s.ja[t_hello] = '{frm}の{name}は こんにちは!';
		Langstrs.s.ja['OK'] = 'はい';

		assert.equal(L('hello'), 'hello', "1 ---");
		assert.equal(L('OK'), 'OK', "2 ---");
		s = L('world');
		assert.equal(L('world'), 'world', "2 ---");
		assert.equal(L(t_hello, {name: 'Ody', frm: 'US'}), 'Hello Ody from US', "2.0 ---");

		Langstrs.using('ja')
		assert.equal(L(t_hello, {name: 'Ody', frm: 'JA'}), 'JAのOdyは こんにちは!', "3 ---");
		assert.equal(L(t_hello, {name: 'Alice', frm: 'US'}), 'USのAliceは こんにちは!', "3.0 ---");
		assert.equal(L('OK'), 'はい', "4 ---");

		s = L('world');
		assert.equal(L('world'), 'world', "5 ---");

		s = L('Totally {count} role records will be deleted. Are you sure?',
				{count: 3});
		assert.equal(L('Totally {count} role records will be deleted. Are you sure?', {count: 3}),
				'Totally 3 role records will be deleted. Are you sure?', "5.3 args with no translation");

		Langstrs.using('zh')
		assert.equal(L(t_hello, {name: 'ody', frm: 'TW'}), '你好 ody from TW', "6 ---");
		assert.equal(L('OK'), '确定', "7 ---");
		s = L('world');
		assert.equal(L('world'), 'world', "8 ---");

		assert.isTrue(Langstrs.s.en.has('world'), "9 ---");
		assert.equal(Langstrs.s.ja.world, undefined, "A ---");
		assert.equal(Langstrs.s.zh.world, undefined, "B ---");

		let totrans = Langstrs.report();
		assert.isTrue(totrans.has('hello'), "D ---");
		assert.isTrue(totrans.has('world'), "E ---");
	});
});
