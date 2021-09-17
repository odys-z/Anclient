

export function toBool(str) {
	return  !str || str === '0' || str === 'false'
			|| (typeof str === 'string' && str.trim().length === 0)
			? false : true;
}

export function isEmpty(str) {
	return typeof str === 'undefined' || str === null || str === '';
}

/**
 * Parse lagacy json format.
 * @return {object} {funcId, id, funcName, url, css, flags, parentId, sort, sibling, children}
 */
export function parseMenus(json = []) {
	let paths = []; // {'/home': Home}
	let menu = parse(json);
	return { menu, paths };

	function parse(json) {
		if (Array.isArray(json))
			return json.map( (jn) => { return parse(jn); } );
		else {
			// this is just a lagacy of EasyUI, will be deprecated
			let {funcId, id, funcName, text, url, css, flags, parentId, sort, sibling, children}
				= json.node;

			sibling = sibling || sort;
			funcId = funcId || id;
			funcName = funcName || text;

			if (! url.startsWith('/')) url = '/' + url;
			paths.push({path: url, params: {flags, css}})

			if (children)
				children = parse(children);

			return {funcId, funcName, url, css, flags, parentId, sibling, children};
		}
	}
}

/**Usage: arr.swap(a, b);
 * see https://stackoverflow.com/a/4011851/7362888
 */
Array.prototype.swap = function(a, b){
    this[a] = this.splice(b, 1, this[a])[0];
    return this;
}


/**
 * https://stackoverflow.com/a/563442/7362888
 */
Date.prototype.addDays = function(days) {
    let date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
};

/**
 * @return {string} e.g. '2021-09-11'
 */
Date.prototype.toISOStr = function() {
	return this.toISOString().substring(0, 10);
};