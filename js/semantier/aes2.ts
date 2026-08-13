/* ricomoo aes wrapper
 * Design notes:
 * AES is just only one of crypto algorithms, so we need make this pluginized so
 * can be overriden by user.
 */

import AESLib, { AESHook } from 'opensources/ricmoo-aes';
import {sha256} from 'js-sha256';

/* The ricomoo AES Wrapper.
 * The dependee class is ported from github/ricomoo, the original soruce file doesn't have any license declarations.
 * @module jclient/js/aes */

const STR_PAD_LEFT = 1;
const STR_PAD_RIGHT = 2;
const STR_PAD_BOTH = 3;

/**AES class
 * @class
 * @property {function} encrypt
 */
export default class AES2 {
	verbose = false;
	private aesjs: NonNullable<AESHook['aesjs']>;

	constructor() {
		let hook: AESHook = { aesjs: undefined };
		AESLib(hook);
		this.aesjs = hook.aesjs!;
	}

	/**
	 * get byte[] of random 128bits iv
	 * @return iv
	 */
	getIv128(): Uint8Array {
		var iv = new Array(16);
		for (var i = 0; i < 16; i++) {
			iv[i] = Math.random() * 101;
		}
		return new Uint8Array(iv);
	}

	encrypt(txt: string, key: string, iv: Uint8Array): string {
		var textBytes = this.aesjs.utils.utf8.toBytes(txt);
		var keyBytes = this.aesjs.utils.utf8.toBytes(key);
		var aesCbc = new this.aesjs.ModeOfOperation.cbc(keyBytes, iv);
		var encryptedBytes = aesCbc.encrypt(textBytes);
		var encryptedB64 = this.bytesToB64(encryptedBytes);
		return encryptedB64;
	}

	// encrypt_nopadding(txt: string, key: string, iv: Uint8Array): string {
	// 	txt = this.pad16m(txt);
	// 	if (this.verbose) console.log("txt: " + txt);
	// 	var textBytes = this.aesjs.utils.utf8.toBytes(txt);
	// 	key = this.pad16m(key);
	// 	if (this.verbose) console.log("key: " + key);
	// 	var keyBytes = this.aesjs.utils.utf8.toBytes(key);
	// 	var aesCbc = new this.aesjs.ModeOfOperation.cbc(keyBytes, iv);
	// 	var encryptedBytes = aesCbc.encrypt(textBytes);

	// 	// check https://stackoverflow.com/questions/12710001/how-to-convert-uint8-array-to-base64-encoded-string
	// 	// var encryptedB64  = btoa(String.fromCharCode.apply(null, encryptedBytes));
	// 	var encryptedB64 = this.bytesToB64(encryptedBytes);
	// 	// var u8_2 = new Uint8Array(atob(encryptedB64).split("").map(function(c) { return c.charCodeAt(0); }));
	// 	return encryptedB64;
	// }

	bytesToB64(byteArr: Uint8Array): string {
		if (typeof btoa == 'function')
			return btoa(String.fromCharCode.apply(null, byteArr as unknown as number[]));
		else
			// should only happen while testing
			return Buffer.from(byteArr as any, 'binary').toString('base64')
	}

	encode64(byteArr: Uint8Array): string {
		return this.bytesToB64(byteArr);
	}

	b64ToBytes(b64Str: string): Uint8Array {
		return new Uint8Array(
			(typeof atob === 'function'
				? atob(b64Str)
				// should only happen while testing
				: Buffer.from(b64Str, 'base64').toString('binary')
			).split("").map(function (c: string) {
				return c.charCodeAt(0);
			})
		);
	}

	decode64(b64Str: string): Uint8Array {
		return this.b64ToBytes(b64Str);
	}

	// decrypt_nopadding(cipherB64: string, key: string, iv: Uint8Array): string {
	// 	// check https://stackoverflow.com/questions/12710001/how-to-convert-uint8-array-to-base64-encoded-string
	// 	//var encryptedBytes = new Uint8Array(atob(cipherB64).split("").map(function(c) {
	// 	//   return c.charCodeAt(0); }));
	// 	var encryptedBytes = this.b64ToBytes(cipherB64);

	// 	// The cipher-block chaining mode of operation maintains internal
	// 	// state, so to decrypt a new instance must be instantiated.
	// 	var keyBytes = this.aesjs.utils.utf8.toBytes(key);
	// 	var aesCbc = new this.aesjs.ModeOfOperation.cbc(keyBytes, iv);
	// 	var decryptedBytes = aesCbc.decrypt(encryptedBytes);

	// 	// Convert our bytes back into text
	// 	var decryptedText = this.aesjs.utils.utf8.fromBytes(decryptedBytes);
	// 	return decryptedText.trim();
	// }

	decrypt(cipherB64: string, key: string, iv: Uint8Array): string {
		// 1. Decrypt raw bytes using CBC mode
		let encryptedBytes = this.b64ToBytes(cipherB64);
		let keyBytes = this.aesjs.utils.utf8.toBytes(key);
		let keymd = sha256.array(key);
		const decryptedBytes = new this.aesjs.ModeOfOperation.cbc(keymd as any, iv)
											 .decrypt(encryptedBytes);

		// 2. Strip PKCS#7 padding
		const paddingLength = decryptedBytes[decryptedBytes.length - 1];
		const unpaddedBytes = decryptedBytes.slice(0, decryptedBytes.length - paddingLength);

		// 3. Convert unpadded bytes to string
		const decryptedText = this.aesjs.utils.utf8.fromBytes(unpaddedBytes);
		return decryptedText;
	}

	pad16m(str: string, paddings?: string, dir?: typeof STR_PAD_LEFT | typeof STR_PAD_RIGHT | typeof STR_PAD_BOTH): string {
		var len = str.length;
		len = Math.ceil(len / 16);
		return this.pad(str, len * 16, paddings, dir) as string;
	}

	pad(str: string | any[], len: number, paddings?: string,
		dir?: typeof STR_PAD_LEFT | typeof STR_PAD_RIGHT | typeof STR_PAD_BOTH): string | any[] {
		if (typeof (len) == "undefined") { len = 0; }
		if (typeof (paddings) == "undefined") { paddings = '-'; }
		if (typeof (dir) == "undefined") { dir = STR_PAD_LEFT; }

		if (len + 1 >= str.length) {
			switch (dir) {
				case STR_PAD_RIGHT:
					str = str + Array(len + 1 - str.length).join(paddings);
					break;
				case STR_PAD_BOTH:
					var padlen;
					var right = Math.ceil((padlen = len - str.length) / 2);
					var left = padlen - right;
					str = Array(left + 1).join(paddings) + str + Array(right + 1).join(paddings);
					break;
				default:
					str = Array(len + 1 - str.length).join(paddings) + str;
					break;
			} // switch
		}
		return str;
	}

	// /**
	//  * <pre>
	//  * ssToken = cipher : iv, len(cipher) = 16
	//  * plain = decrypt(cipher, key, iv)
	//  * token = encrypt(pad(uid) : plain, key, iv2)
	//  * return token : iv2
	//  * </pre>
	//  */
	// repackSessionToken_nopadding(ssToken: string, key: string, uid: string): string {
	// 	/*
	// 	let ss = ssToken.split(":");
	// 	console.log(ss[0], ss[1]);
	// 	let plain = this.decrypt(ss[0], this.pad16m(key), this.decode64(ss[1]));
	// 	console.log(plain);

	// 	let iv = this.getIv128();
	// 	let cipher = this.encrypt(uid + ":" + plain, this.pad16m(key), iv);

	// 	console.log(cipher + ":" + this.encode64(iv));
	// 	return cipher + ":" + this.encode64(iv);
	// 	*/
	// 	return this.repackSessionToken_test_nopadding(ssToken, key, uid, this.getIv128());
	// }

	// repackSessionToken_test_nopadding(ssToken: string, key: string, uid: string, iv: Uint8Array): string {
	// 	let ss = ssToken.split(":");

	// 	let plain = this.decrypt_nopadding(ss[0], this.pad16m(key), this.decode64(ss[1]) as unknown as Uint8Array);
	// 	console.log(plain.length, plain);
	// 	if (plain.length == 32)
	// 		plain = plain.substring(8);
	// 	console.log(plain.length, plain);

	// 	let cipher = this.encrypt_nopadding(uid + ":" + plain, this.pad16m(key), iv);
	// 	return cipher + ":" + this.encode64(iv);
	// }
}

// /**
//  * @constructor
//  * Test JS AES
//  * @class*/
// export function testAES2(plain: string) {
// 	var aes = new AES2();

// 	var iv = aes.getIv128();
// 	var k = aes.pad16m("my-password");

// 	var c = aes.encrypt_nopadding(plain, k, iv);
// 	// var c = aes.encrypt("plain-text", k, iv);
// 	console.log(c);

// 	var p = aes.decrypt_nopadding(c, k, iv);
// 	// console.log(p);
// 	return p;
// }
