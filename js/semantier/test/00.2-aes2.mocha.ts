import { assert } from 'chai';
import AES2 from '../aes2';

/**
 * anson.cmake/tests/build
 *  decrypt
	=======
	key:			Героям слава!
	iv:				J/r4ACTePjQWSR1KuWBRKQ==
	plain:			Слава Україні!
	re-encrypted:	a2zlaOo8fPoBUBU90n3LZzabRsoSzYOKtF1JTsR2Nv4=
	origin cipher:	a2zlaOo8fPoBUBU90n3LZzabRsoSzYOKtF1JTsR2Nv4=

 *  encrypt
	=======
	key:			Героям слава!
	iv:				NXAKQcZGUk3E4pLm1iP4yA==
	cipher:			nPf99DNPI1gvzL3HGicg0kdGJgAo3L0zMUbS90ReCto=
	re-decrpyted:	Слава Україні!

 * --------------------------------------------------------------
 *  decrypt
	=======
	key:			Героям слава!
	iv:				c+r+6moOay+4VadcEkveNg==
	plain:			Слава Україні!
	re-encrypted:	ZAFqxw+z62DQJXZYv26+wkXPi5UP8bCkSlTpiQcYKwM=
	origin cipher:	ZAFqxw+z62DQJXZYv26+wkXPi5UP8bCkSlTpiQcYKwM=

 *  encrypt
	=======
	key:			Героям слава!
	iv:				98Q1sXoSS0Ry4CooJYy/tg==
	cipher:			q6vt9EfQZD3Oc/Pf4tICD5tSHpprYy4j1GcrWkFQ8iE=
	re-decrpyted:	Слава Україні!

 */
describe('case: [00.2 AES]', () => {
    it('[AES2] Decrypt', () => {
		let aes = new AES2();
		let iv = aes.b64ToBytes("98Q1sXoSS0Ry4CooJYy/tg==");
		let k = "Героям слава!";
		let c = "q6vt9EfQZD3Oc/Pf4tICD5tSHpprYy4j1GcrWkFQ8iE=";
		let p = aes.decrypt(c, k, iv);
		assert.equal('Слава Україні!', p, "2.1.1 ---");

			iv = aes.b64ToBytes("NXAKQcZGUk3E4pLm1iP4yA==");
			c = "nPf99DNPI1gvzL3HGicg0kdGJgAo3L0zMUbS90ReCto=";
			p = aes.decrypt(c, k, iv);
        assert.equal('Слава Україні!', p, "2.1.2 ---");
	});


});
