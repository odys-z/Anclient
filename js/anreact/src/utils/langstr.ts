/**
 * 
 */
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
	load: function(url: string, usingLang?: string) {
		fetch(url)
		.then((r) => r.ok ? r.json() : Promise.reject(r))
		.then( (json) => {
			Object.assign(Langstrs.s, json);
			Langstrs.using(usingLang || json.using);
		},
		(_e) => {
			console.error("Loading language resource failed. Url: " + url);
		} );
	},

	/**
	 * Don't call this immediately after load, as load is async.
	 * @param lang
	 */
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

/**
 * var L = require('language');
 * 
 * or import L from Langstr;
 * 
 * Usage:
 * @example
 * Langstrs.using('en'); // optional, default en, see resolv/lang.json
 * var the_string = L('Welcome {name}', {name: 'Joe'}); // Welcome Joe
 * 
 * @Reference 
 * <a href='https://stackoverflow.com/a/30191493/7362888'>[1]</a>,
 * <a href='https://stackoverflow.com/a/57882370/7362888'>[2]</a>.
 *
 * @param t template
 * @param vals optional: value args
 * @returns translation
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
export function copyToClipboard(textToCopy: string): Promise<void> {
	if (navigator.clipboard && window.isSecureContext)
		return navigator.clipboard.writeText(textToCopy);

	// Not a secure context, e.g. a synode served by http at its ip: execCommand('copy') copies the
	// selection, of a textarea that is rendered (one of display: none can't be focused or selected)
	// and keeps the focus. In a modal, e.g. MUI's Dialog, its focus trap takes the focus back from
	// an element outside it, so the textarea goes into the open dialog, if any.
	const active = document.activeElement as HTMLElement | null;
	const host = (active?.closest('[role="dialog"]') as HTMLElement | null) ?? document.body;

	const textArea = document.createElement("textarea");
	textArea.value = textToCopy;
	textArea.setAttribute('readonly', '');	// no keyboard on mobiles
	Object.assign(textArea.style, { position: 'fixed', top: '0', left: '-9999px', opacity: '0' });
	host.appendChild(textArea);
	textArea.focus();
	textArea.select();
	textArea.setSelectionRange(0, textToCopy.length);	// iOS

	let copied = false;
	try { copied = document.execCommand('copy'); }
	catch (e) { copied = false; }
	finally {
		textArea.remove();
		active?.focus?.();
	}
	return copied ? Promise.resolve() : Promise.reject(new Error('Not copied (no clipboard access)'));
}
