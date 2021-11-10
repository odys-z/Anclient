/** Utils for anclient/js
 * @module anclient.js.utils
 */
/**
 * @param {array} u8arr uint8 array, e.g. file reader's read result.
 * @param {string} [mime] data url prefix,
 * "data:[<mediatype>][;base64]," for data, including ending comma,
 * e.g. "data:image/png;utf8;base64,".
 * See mime type index: https://www.iana.org/assignments/media-types/media-types.xhtml#image
 * @return {string} base64
 */
export declare function uarr2Base64(u8Arr: any, mime: any): string;
export declare function dataOfurl(dataUrl: any): any;
export declare function mimeOf(dataUrl: any): any;
export declare function urlOfdata(mime: any, data: any): string;
