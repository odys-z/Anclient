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
    it('[AES2] Decrypt - 2', () => {
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

	/**
	 * Run anson.cmake test 01 for tests.
	 * 
	 * Case 1
	 * 
	 * login reply:
	 * {"type": "io.odysz.semantics.SessionInf",
		"uid": "ody",
		"ssToken": "ie6uHYaAxUzTdkOZvagpXhopWTAMiqD14Jd1jkNgFdU=:97zMIGYPh/3+QUpqmaNY4A==",
		"roleId": null,
		"roleName": null,
		"userName": null,
		"ssid": "5+sIJnOB",
		"device": null,
		"seq": 0
		}
	 * SessionInf:
	 *  ssinf.ssid		:5+sIJnOB
		knows			:SHXoqfN2CeiChANHFBsd4Q==
		ssinf.ssToken	:ym/5XXBp9YSH5TDRcQmIOMXpCy+mACbf2AdhCo1rr6I=:JoFabRnGRbYbc++Q4jlaQg==
	 *
	 * case 2
	 * {"type": "io.odysz.semantics.SessionInf",
		"uid": "ody",
		"ssToken": "1OYj0I+b06C43roM7SsnghQChQ7JsvmBBZ7SoJctXX8=:9TgsimQd3Pv7+4u+nhZywQ==",
		"roleId": null,
		"roleName": null,
		"userName": null,
		"ssid": "0QOgszpm",
		"device": null,
		"seq": 0
		}
	 * SessionInf:
	 *  ssinf.ssid		:0QOgszpm
		knows			:LipVxlQC7sHiSsWrgjTGPQ==
		ssinf.ssToken	:ChzT01BOTnMLkvfmXmwD5QWSUfC3dF59bBWR0xtarYg=:T6AIbzvfDf8IMp6474a1VQ==
	 */
	it('[AES2] repack session token - 2', () => {
		let uid = "ody", pswd = "123456";
		let aes = new AES2();
		let ssToken = "ie6uHYaAxUzTdkOZvagpXhopWTAMiqD14Jd1jkNgFdU=:97zMIGYPh/3+QUpqmaNY4A==";
		let repacked = aes.repackSessionToken_(ssToken, pswd, uid, aes.b64ToBytes('JoFabRnGRbYbc++Q4jlaQg=='));
		// console.log("repacked\t", repacked);
		assert.equal(repacked, 'ym/5XXBp9YSH5TDRcQmIOMXpCy+mACbf2AdhCo1rr6I=:JoFabRnGRbYbc++Q4jlaQg==', "2 ---");

		ssToken = "1OYj0I+b06C43roM7SsnghQChQ7JsvmBBZ7SoJctXX8=:9TgsimQd3Pv7+4u+nhZywQ==";
		repacked = aes.repackSessionToken_(ssToken, pswd, uid, aes.b64ToBytes('T6AIbzvfDf8IMp6474a1VQ=='));
		assert.equal(repacked, "ChzT01BOTnMLkvfmXmwD5QWSUfC3dF59bBWR0xtarYg=:T6AIbzvfDf8IMp6474a1VQ==");
	});

});
