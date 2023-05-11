import $ from 'jquery';

export interface StrResource {[x: string]: string };
/**
 * A dynamic extending {string-key: parameterized-instance} translation mapper.
 * function:
 * use string template as resource key;
 * accept object as arguments
 * extending &amp; resolve un-mapped string template.
*/
export const Langstrs = {
	s: {
		'en': new Set<string>(),
		'zh': {} as StrResource,
		'ja': {} as StrResource,
	},

	lang: 'en',

	/**
	 * Load the string resource.
	 * 
	 * @param url relative json path
	 */
	load: function(url: string) {
		$.ajax({
			dataType: "json",
			url,
		})
		.done( (json) => {
			Object.assign(Langstrs.s, json);
			Langstrs.using(json.using);
		} )
		.fail( (e) => {
			console.error("Loading language resource failed. Url: " + url);
		} )
	},

	using: function (lang = 'en') {
		Langstrs.lang = lang;
		if (! (lang in Langstrs.s))
			Langstrs.s[lang] = {};
	},

	report: function (lang = 'zh') {
		let res = new Set();
		Langstrs.s.en.forEach( (v) => {
			if (!(v in Langstrs.s[lang]))
				res.add(v);
		} );
		return res;
	}
}

const argex = /{(\s*(\w|\d)*\s*)}/g;

/**var L = require('language');
 * or import L from Langstr;
 * Usage:
 * Langstrs.using('en'); // optional, default en
 * var the_string = L('Welcome {name}', {name: 'Joe'});
 * see https://stackoverflow.com/a/30191493/7362888
 * and https://stackoverflow.com/a/57882370/7362888
 *
 * @param t template
 * @param o arg object
 * @returns
 */
/**
 *
 * @param t template
 * @param vals optional: value args
 * @returns
 */
export function L(t: string | undefined, vals?: {[name: string]: string | number}): string {
	if (! (t in Langstrs.s[Langstrs.lang]) )
			Langstrs.s.en.add(t);
	else t = Langstrs.lang === 'en' ?
		 t : Langstrs.s[Langstrs.lang][t];

	if (vals)
		return replaceArg(t, vals);
	else
		return t;

	function replaceArg(t: string, args? : object) {
		if (t) {
			t = t.replace(argex,
				function(match, argname) {
					return typeof args[argname] != 'undefined'
						? args[argname]
						: argname in args
						? '--' : match ;
				});
		}
		return t;
	}
}

/** return a promise
 *
 *  memo: navigator clipboard api needs a secure context (https)
 * @param textToCopy text to be copied
 * https://stackoverflow.com/a/65996386/7362888
 */
export function copyToClipboard(textToCopy: string) {
	if (navigator.clipboard && window.isSecureContext) {
	    return navigator.clipboard.writeText(textToCopy);
	} else {
	    let textArea = document.createElement("textarea");
	    textArea.value = textToCopy;

		textArea.style.display = "none";
	    document.body.appendChild(textArea);
	    textArea.focus();
	    textArea.select();
	    return new Promise<void>((res, rej) => {
	        document.execCommand('copy') ? res() : rej();
	        textArea.remove();
	    });
	}
}
