/**
 * @param u8arr uint8 array, e.g. file reader's read result.
 * @param [mime] data url prefix,
 * "data:[<mediatype>][;base64]," for data, including ending comma,
 * e.g. "data:image/png;utf8;base64,".
 * See mime type index: https://www.iana.org/assignments/media-types/media-types.xhtml#image
 * @return base64
 */
export function uarr2Base64 (u8Arr: Uint8Array, mime: string): string {
	// console.log(e, freader.result);
	// var CHUNK_SIZE = 0x8000; //arbitrary number
	// Common Multiple of 6 and 8 should result in 0 padding in the middle?
	// a smaller size for test: var CHUNK_SIZE = 0x8 * 0x6;
	let CHUNK_SIZE = 0x8 * 0x6 * 0x8 * 0x6 * 0x8 * 0x6; //110592
	let index = 0;
	let length = u8Arr.length;
	let result = mime || '';
	let slice: Uint8Array;
	while (index < length) {
		slice = u8Arr.subarray(index, Math.min(index + CHUNK_SIZE, length));
		result += String.fromCharCode.apply(null, slice);
		index += CHUNK_SIZE;
	}
	return btoa(result);
}

export function dataOfurl(dataUrl: string) {
	if (dataUrl && dataUrl.startsWith('data:'))
		return dataUrl.substring( dataUrl.indexOf(',') + 1 );
	else return dataUrl;
}

export function mimeOf(dataUrl: string) {
	if (dataUrl && dataUrl.startsWith('data:'))
		return dataUrl.substring( 5, dataUrl.indexOf(',') );
	else return undefined;
}

export function isPdf(str: string) {

}

export function urlOfdata(mime: string, data) {
	return ['data:' + mime, data].join(',');
}

/**
 * Creat blob url for img tag' src attribute.
 * 
 * @param svg 
 * @returns blob url 
 */
export function svgImgSrc(svg: string) {
	return URL.createObjectURL(new Blob([svg], {type: 'image/svg+xml'}));
}