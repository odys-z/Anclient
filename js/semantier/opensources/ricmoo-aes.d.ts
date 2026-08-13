declare module 'opensources/ricmoo-aes' {
  interface AesJsModeCtor {
    new (key: Uint8Array, iv?: Uint8Array | any): {
      encrypt(data: Uint8Array): Uint8Array;
      decrypt(data: Uint8Array): Uint8Array;
    };
  }

  export interface AesJS {
    AES: new (key: Uint8Array) => any;
    Counter: new (bytes?: Uint8Array | number) => any;
    ModeOfOperation: {
      ecb: AesJsModeCtor;
      cbc: AesJsModeCtor;
      cfb: AesJsModeCtor;
      ofb: AesJsModeCtor;
      ctr: AesJsModeCtor;
    };
    utils: {
      hex: { toBytes(text: string): number[]; fromBytes(bytes: Uint8Array | number[]): string };
      utf8: { toBytes(text: string): Uint8Array; fromBytes(bytes: Uint8Array | number[]): string };
    };
    padding: {
      pkcs7: {
        pad(data: Uint8Array | number[]): Uint8Array;
        strip(data: Uint8Array | number[]): Uint8Array;
      };
    };
  }

  export interface AESHook {
    aesjs?: AesJS;
  }

  // NOT a class — it's a side-effecting function: root.aesjs = aesjs
  export default function AESLib(root: AESHook): void;
}