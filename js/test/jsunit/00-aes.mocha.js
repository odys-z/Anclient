import chai from 'chai';
import { expect, assert } from 'chai';
import AES from '../../lib/aes.js';

/**
 * Test JS AES
function testAES() {
	var aes = new AES();

	var iv = aes.getIv128();
	var k = aes.pad16m("my-password");

	var c = aes.encrypt("plain-text", k, iv);
	console.log(c);

	var p = aes.decrypt(c, k, iv);
	console.log(p);
}
 */

describe('case: [AES]', () => {
    it('[AES] De-encrypt', () => {
		let aes = new AES();

		let iv = aes.getIv128();
		let k = aes.pad16m("my-password");

		let c = aes.encrypt("plain-text", k, iv);
		console.log(c);

		let p = aes.decrypt(c, k, iv);
		// console.log(p);

        assert.equal(p, '------plain-text', "1 ---");
	});
});
