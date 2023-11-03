
/** npm install mime-types-no-nodejs */
import Mime from 'mime-types-no-nodejs';

/**
 * test helper:
 * http://www.regular-expressions.info/javascriptexample.html
 */
export const regex = {
	/**
	 * Add # at start if none
	 * @param str
	 * @param defltStr default if  str is undefined or null
	 * @return "#str" */
	sharp_: function (str: string, defltStr: string): string {
		if (str === undefined || str === null )
			str = defltStr;
		if (typeof str === "string" && str.substring(0, 1) !== '#')
			return '#' + str;
		return str;
	},

	/**
	 * Add # at start if none
	 * @param str string with or without a starting '#'
	 * @return "str" without starting '#' */
	desharp_: function (str: string): string {
		if (typeof str === "string" && str.substring(0, 1) === '#')
			return str.substring(1);
		return str;
	},

	_regImage: /^image\//,
	_regVideo: /^video\//,
	_regAudio: /^audio\//,
	_regHeif: /^image\/heic/,

	/**
	 * Find preview type (not doc type) of mime:
	 * https://docs.w3cub.com/http/basics_of_http/mime_types/complete_list_of_mime_types
	 * 
	 * see also example.android\file-picker\src\main\java\com\vincent\filepicker\filter\loader\ImageLoader.java
	 * and example.android\file-picker\src\main\java\com\vincent\filepicker\filter\loader\FileLoader.java
	 * 
	 * Note: heif is a special image type that can be uploaded by iPhone but Safari won't support,
	 * which is not a W3C type and needs decoding.
	 * @param mime
	 * @return string of  "" | "heif" | "image" | "video" | "audio" or doc extension
	 */
	mime2type: function (mime: string): "" | "heif" | "image" | "video" | "audio" | string {
		if (!mime)
			return '';
		else if (regex._regHeif.test(mime))
			return "heif";
		else if (regex._regImage.test(mime))
			return 'image';
		else if (regex._regVideo.test(mime))
			return 'video';
		else if (regex._regAudio.test(mime))
			return 'audio';
		else return "." + (mime.startsWith('/') ?
				Mime.extension(mime.substring(1)) || '' :
				Mime.extension(mime) || '');
	},

	/**
	 * Find most likly mime of preview type
	 *
	 * @param doctype
	 * @return mime, likely
	 */
	type2mime: function (doctype: string): string {
		if (doctype === 'image')
			return 'image/';
		else {
			return Mime.lookup('x.' + doctype) || '';
		}
	}
};
