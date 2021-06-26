import chai from 'chai';
import { expect, assert } from 'chai';
import AES from '../../lib/aes.js';

describe('case: [AES]', () => {
    it('[AES] De-encrypt', () => {
		let aes = new AES();

		let iv = aes.getIv128();
		let k = aes.pad16m("my-password");

		let c = aes.encrypt("plain-text", k, iv);
		console.log(c);

		let p = aes.decrypt(c, k, iv);
        assert.equal(p, '------plain-text', "1 ---");
	});
});
