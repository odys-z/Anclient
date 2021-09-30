
/** npm install mime-types-no-nodejs */
import Mime from 'mime-types-no-nodejs';

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

	/**Find preview type (not doc type) of mime
	 * https://docs.w3cub.com/http/basics_of_http/mime_types/complete_list_of_mime_types
	 * @param {string} mime
	 * @return {string} .doc or undefined
	 */
	mime2type: function (mime) {
		if (!mime)
			return '';
		else if (regex._regImage.test(mime))
			return 'image';
		else return "." + (mime.startsWith('/') ?
				Mime.extension(mime.substring(1)) || '' :
				Mime.extension(mime) || '');
	},

	/**Find most likly mime of preview type
	 *
	 * @param {string} prvtype
	 * @return {string} mime, likely
	 */
	type2mime: function (doctype) {
		if (doctype === 'image')
			return 'image/'; // regex._regImage.source;
		// else if (doctype.startsWith('.'))
		// 	return Mime.lookup(doctype) || '';
		else {
			return Mime.lookup('x.' + doctype) || '';
		}
	}
};
