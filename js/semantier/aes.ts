/* ricomoo aes wrapper
 * Design notes:
 * AES is just only one of crypto algorithms, so we need make this pluginized so
 * can be overriden by user.
 */
import AESLib from './opensources/ricmoo-aes.js';

/* The ricomoo AES Wrapper.
 * The dependee class is ported from github/ricomoo, the original soruce file doesn't have any license declarations.
 * @module jclient/js/aes */

/**AES class
 * @class
 * @property {AESLib} aesLib the ricomoo/aes
 * @protpery {function} encrypt
 *
 */
export default function AES () {
	var verbose = false;
	let hook = {aesjs: undefined}
	var aesLib = new AESLib(hook);
	let aesjs = hook.aesjs;

	/**
	 * get byte[] of random 128bits iv
	 * @return iv
	 */
	this.getIv128 = function (): Uint8Array {
		var iv = new Array(16);
		for (var i = 0; i < 16; i++) {
			iv[i] = Math.random() * 101;
		}
		return new Uint8Array(iv);
	}

	this.encrypt = function (txt, key, iv) {
		txt = this.pad16m(txt);
		if (this.verbose) console.log("txt: " + txt);
		var textBytes = aesjs.utils.utf8.toBytes(txt);
		key = this.pad16m(key);
		if (this.verbose) console.log("key: " + key);
		var keyBytes = aesjs.utils.utf8.toBytes(key);
		var aesCbc = new aesjs.ModeOfOperation.cbc(keyBytes, iv);
		var encryptedBytes = aesCbc.encrypt(textBytes);

		// check https://stackoverflow.com/questions/12710001/how-to-convert-uint8-array-to-base64-encoded-string
		// var encryptedB64  = btoa(String.fromCharCode.apply(null, encryptedBytes));
		var encryptedB64 = this.bytesToB64(encryptedBytes);
		// var u8_2 = new Uint8Array(atob(encryptedB64).split("").map(function(c) { return c.charCodeAt(0); }));
		return encryptedB64;
	}

	this.bytesToB64 = function (byteArr) {
		if (typeof btoa == 'function')
			return btoa(String.fromCharCode.apply(null, byteArr));
		else // should only happens in testing
			return Buffer.from(byteArr, 'binary').toString('base64')
	}

	this.encode64 = this.bytesToB64;

	this.b64ToBytes = function (b64Str) {
		return new Uint8Array(
			(typeof atob === 'function' ? atob(b64Str)
				: Buffer.from(b64Str, 'base64').toString('binary')
			).split("").map(function(c) {
					return c.charCodeAt(0);
			})
		);
	}

	this.decode64 = this.b64ToBytes;

	this.decrypt = function (cipherB64, key, iv) {
		// check https://stackoverflow.com/questions/12710001/how-to-convert-uint8-array-to-base64-encoded-string
		//var encryptedBytes = new Uint8Array(atob(cipherB64).split("").map(function(c) {
		//   return c.charCodeAt(0); }));
		var encryptedBytes = this.b64ToBytes(cipherB64);

		// The cipher-block chaining mode of operation maintains internal
		// state, so to decrypt a new instance must be instantiated.
		var keyBytes = aesjs.utils.utf8.toBytes(key);
		var aesCbc = new aesjs.ModeOfOperation.cbc(keyBytes, iv);
		var decryptedBytes = aesCbc.decrypt(encryptedBytes);

		// Convert our bytes back into text
		var decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);
		return decryptedText.trim();
	}

	this.pad16m = function (str, paddings, dir) {
		var len = str.length;
		len = Math.ceil(len / 16);
		return this.pad(str, len * 16, paddings, dir);
	}

	const STR_PAD_LEFT = 1;
	const STR_PAD_RIGHT = 2;
	const STR_PAD_BOTH = 3;

	this.pad = function (str: string | any[], len: number, paddings: string,
						dir: typeof STR_PAD_LEFT | typeof STR_PAD_RIGHT | typeof STR_PAD_BOTH) {
		if (typeof(len) == "undefined") { len = 0; }
		if (typeof(paddings) == "undefined") { paddings = '-'; }
		if (typeof(dir) == "undefined") { dir = STR_PAD_LEFT; }

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

	/**
	 * <pre>
	 * ssToken = cipher : iv, len(cipher) = 16
	 * plain = decrypt(cipher, key, iv)
	 * token = encrypt(pad(uid) : plain, key, iv2)
	 * return token : iv2
	 * </pre>
	 */
	this.repackSessionToken = (ssToken: string, key: string, uid: string) => {
		/*
		let ss = ssToken.split(":");
		console.log(ss[0], ss[1]);
		let plain = this.decrypt(ss[0], this.pad16m(key), this.decode64(ss[1]));
		console.log(plain);

		let iv = this.getIv128();
		let cipher = this.encrypt(uid + ":" + plain, this.pad16m(key), iv);

		console.log(cipher + ":" + this.encode64(iv));
		return cipher + ":" + this.encode64(iv);
		*/
		return this.repackSessionToken_test(ssToken, key, uid, this.getIv128());
	};

	this.repackSessionToken_test = (ssToken: string, key: string, uid: string, iv: Uint8Array) => {
		let ss = ssToken.split(":");

		let plain = this.decrypt(ss[0], this.pad16m(key), this.decode64(ss[1]));
		console.log(plain.length, plain);
		if (plain.length == 32)
			plain = plain.substring(8);
		console.log(plain.length, plain);

		let cipher = this.encrypt(uid + ":" + plain, this.pad16m(key), iv);
		return cipher + ":" + this.encode64(iv);
	};

}

/**
 * @constructor
 * Test JS AES
 * @class*/
export function testAES(plain: string) {
	var aes = new AES();

	var iv = aes.getIv128();
	var k = aes.pad16m("my-password");

	var c = aes.encrypt(plain, k, iv);
	// var c = aes.encrypt("plain-text", k, iv);
	console.log(c);

	var p = aes.decrypt(c, k, iv);
	// console.log(p);
	return p;
}
