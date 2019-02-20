/**<h4>Design notes:</h4>
 * AES is just only one of crypto algorithms, so we need make this pluginized so
 * can be overriden by user. */
import AESLib from './ricmoo-aes.js';

export default function AES () {
	var verbose = false;
	AESLib(window);

	/**get byte[] of random 128bits iv
	 * @return {byte[]} iv
	 */
	this.getIv128 = function () {
		var iv = new Array(16);
		for (var i = 0; i < 16; i++) {
			iv[i] = Math.random() * 101;
		}
		iv = new Uint8Array(iv);
		return iv;
	}

	this.encrypt = function (txt, key, iv) {
		//txt = pad(txt, 16);
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
		return btoa(String.fromCharCode.apply(null, byteArr));
	}

	this.b64ToBytes = function (b64Str) {
		return new Uint8Array(atob(b64Str).split("").map(function(c) {
			return c.charCodeAt(0);
		}));
	}

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

	var STR_PAD_LEFT = 1;
	var STR_PAD_RIGHT = 2;
	var STR_PAD_BOTH = 3;

	this.pad = function (str, len, paddings, dir) {
		if (typeof(len) == "undefined") { var len = 0; }
		if (typeof(paddings) == "undefined") { var paddings = '-'; }
		if (typeof(dir) == "undefined") { var dir = STR_PAD_LEFT; }

		if (len + 1 >= str.length) {
			switch (dir) {
				case STR_PAD_RIGHT:
					str = str + Array(len + 1 - str.length).join(paddings);
					break;
				case STR_PAD_BOTH:
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
}

/**Test JS AES */
export function testAES() {
	var aes = new AES();

	var iv = aes.getIv128();
	var k = aes.pad16m("my-password");

	var c = aes.encrypt("plain-text", k, iv);
	console.log(c);

	var p = aes.decrypt(c, k, iv);
	console.log(p);
}
