/**
 * A dynamic extending {string-key: parameterized-instance} translation mapper.
 * function:
 * use string template as resource key;
 * accept object as arguments
 * extending &amp; resolve un-mapped string template.
 */
const Langstrs = {
	s: {
		'en': new Set(),
		'ch': { },
		'ja': { },
	},

	lang: 'en',

	using: function (lang = 'en') {
		Langstrs.lang = lang;
		if (! lang in Langstrs.s)
			langstrs.s[lang] = {};
	},
}

const arg = /{\s*(.+)\s*\}/g;

/**var L = require('language');
 * or import L from langstr;
 * Usage:
 * Langstrs.using('en'); // optional, default en
 * var the_string = L('Welcome {name}', {name: 'Joe'});
 * see https://stackoverflow.com/a/30191493/7362888
 * and https://stackoverflow.com/a/57882370/7362888
 */
export default function L(t, o) {
	return {
		if (! t in Langstrs.s[Langstrs.lang)
			if (t !== 'en')
				Langstrs.s[t] = t;
			else
				Langstrs.s.add(t);
		if (o)
			TODO;
		else
			return Langstrs.s[t];
	}
}
