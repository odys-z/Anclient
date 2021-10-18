/**AES class
 * @class
 * @property {AESLib} aesLib the ricomoo/aes
 * @protpery {function} encrypt
 *
 */
export default function AES(): void;
export default class AES {
    /**get byte[] of random 128bits iv
     * @return {byte[]} iv
     */
    getIv128: () => any[];
    encrypt: (txt: any, key: any, iv: any) => string;
    bytesToB64: (byteArr: any) => string;
    b64ToBytes: (b64Str: any) => Uint8Array;
    decrypt: (cipherB64: any, key: any, iv: any) => any;
    pad16m: (str: any, paddings: any, dir: any) => any;
    pad: (str: any, len: any, paddings: any, dir: any) => any;
}
/**
 * @constructor
 * Test JS AES
 * @class*/
export function testAES(): void;
export class testAES {
}
