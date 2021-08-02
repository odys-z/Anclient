

export function toBool(str) {
	return  !str || str === '0' || str === 'false'
			|| (typeof str === 'string' && str.trim().length === 0)
			? false : true;
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
