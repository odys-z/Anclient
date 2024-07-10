import { assert } from 'chai';
import AES, { testAES } from '../aes';

describe('case: [00.1 AES]', () => {
    it('[AES] basic', () => {
		assert.equal(testAES("plain-text"), "------plain-text");
	});

    it('[AES] De-encrypt', () => {
		let aes = new AES();

		let iv = aes.getIv128();
		let k = aes.pad16m("my-password");

		let c = aes.encrypt("plain-text", k, iv);

		let p = aes.decrypt(c, k, iv);
        assert.equal(p, '------plain-text', "1 ---");
	});

    it('[AES] repack session token', () => {
		let uid = "ody", pswd = "io.github.odys-z";
		let aes = new AES();
		let ssToken = 'RPZYu7bYWHMHIBvsxTaOnw==:uKBft9Hyg+iGs2tm1XvVyw==';
		let repacked = aes.repackSessionToken_test(ssToken, pswd, uid, aes.b64ToBytes('RJ6U5idq4wcJ2HDEzNvJQw=='));
        assert.equal(repacked, '7WTnbQtErCQjreO2xZRr95pEPKnTEyZzXxDKRgLLNS0=:RJ6U5idq4wcJ2HDEzNvJQw==', "2 ---");


		ssToken = '+S0BaDLIPYwPm7+AazuNUrO1l8sX0ulJ87n525E2aa8=:qiEQje7IB4vDsPW2szAjQQ==';
		pswd = '123456'
		repacked = aes.repackSessionToken_test(ssToken, pswd, uid, aes.b64ToBytes('YQQUEwEIGw8dVxkgABYYAQ=='));
		assert.equal(repacked, "dER+buyh0NgYAMrD/GzVmku7CHhKcg5vXJeregP0j0s=:YQQUEwEIGw8dVxkgABYYAQ==");
	});
});
