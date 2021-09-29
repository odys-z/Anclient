
/** npm install mime-types */
import Mime from 'mime-types';

/* test helper:
 * http://www.regular-expressions.info/javascriptexample.html
 */
export const regex = {
	/**Add # at start if none
	 * @param {string} str
	 * @param {string} defltStr default if  str is undefined or null
	 * @return {string} "#str" */
	sharp_: function (str, defltStr) {
		if (str === undefined || str === null )
			str = defltStr;
		if (typeof str === "string" && str.substring(0, 1) !== '#')
			return '#' + str;
		return str;
	},

	/**Add # at start if none
	 * @param {string} str string with or without a starting '#'
	 * @return {string} "str" without starting '#' */
	desharp_: function (str) {
		if (typeof str === "string" && str.substring(0, 1) === '#')
			return str.substring(1);
		return str;
	},

	_regImage: /^image\//,

	/**Find doc type of mime
	 * https://docs.w3cub.com/http/basics_of_http/mime_types/complete_list_of_mime_types
	 * @param {string} mime
	 * @return {string} .doc or undefined
	 */
	mime2type: function (mime) {
		if (regex._regImage.test(mime))
			return 'image';
		else return "." + (mime.startsWith('/') ?
				Mime.extension(mime.substring(1)) :
				Mime.extension(mime));
	},

	type2mime: function (doctype) {
		return doctype.startsWith('.') ?
			Mime.lookup(doctype) :
			Mime.lookup('.' + doctype);
	}

	// /**split target with <i>separator</i> then get the the ith element
	//  * @param {string} target
	//  * @param {string} separator
	//  * @param {int} ith optinal.<br>If undefined, return all splitted array
	//  * @return {Array|string} the ith element or all the array.
	//  */
	// split: function (target, separator, ith) {
	// 	if (target === undefined) { return; }
	//
	// 	if (separator === undefined) {
	// 		console.error('can not separate', separator, target);
	// 		return;
	// 	}
	//
	// 	target = target.trim();
	//
	// 	if (separator != ',') {
	// 		console.error('Your separator not supported yet...', separator);
	// 	}
	//
	// 	var ss = target.split(/\s*,\s*/);
	//
	// 	if (ith !== undefined) { return ss[ith]; }
	// 	else { return ss; }
	// },
};
