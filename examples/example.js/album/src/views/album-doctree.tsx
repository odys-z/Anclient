import React from 'react';
import 'katex/dist/katex.min.css'; // the host provides KaTeX CSS for the editor's formulas

import { AnDoctreeditor, DocKind, type DocCols, type DoctreeResp, type DoctreeTier,
	type DocTreeNode, type OnErr, type OnOk, type TreeModify } from 'semantic-doc/doctree';
import { Comprops } from '@anclient/anreact';

/**
 * Stands in for the synode's doc-tree tier (port doctree, doctree.jserv) until the doc json
 * is wired up: one empty doc, held in this page. Text edits are kept here; structure changes
 * and commits are refused.
 */
class PlaceholderDoctier implements DoctreeTier {
	static readonly docId = 'new-doc';

	private resp: DoctreeResp = {
		doc: { docId: PlaceholderDoctier.docId, title: 'Untitled', creator: '' },
		root: null,
		forest: [ node(PlaceholderDoctier.docId, undefined, DocKind.doc, '01', [
				node('p-1', PlaceholderDoctier.docId, DocKind.p, '01.01') ]) ],
	};

	tree(_docId: string, ok: OnOk, _err?: OnErr) {
		ok(clone(this.resp));
	}

	update(_docId: string, n: DocCols, ok: OnOk, _err?: OnErr) {
		let t = find(this.resp.forest || [], n.nid);
		if (t) Object.assign(t.node, { json: n.json, rst: n.rst, rstver: n.rstver });
		ok({ doc: this.resp.doc });
	}

	modify(_docId: string, req: TreeModify, _ok: OnOk, err?: OnErr) {
		err?.(`${req.a}: the synode doesn't serve doc trees yet.`);
	}

	commit(_docId: string, _ok: OnOk, err?: OnErr) {
		err?.('Commit: the synode doesn\'t serve doc trees yet.');
	}
}

/** a tree node as the server would send it */
function node(nid: string, parentId: string | undefined, kind: DocKind, fullpath: string,
			  children?: DocTreeNode[]): DocTreeNode {
	return {
		type: 'io.odysz.semantic.DA.DatasetCfg$AnTreeNode',
		id: nid, parentId, level: fullpath.split('.').length - 1,
		indents: [],
		node: { nid, docId: PlaceholderDoctier.docId, parentId, sort: '1', fullpath, kind,
				rstver: '0', text: kind === DocKind.doc ? 'Untitled' : '', children },
	} as unknown as DocTreeNode;
}

function find(forest: DocTreeNode[], id: string): DocTreeNode | undefined {
	for (let t of forest) {
		if (t.id === id) return t;
		let found = find(t.node.children || [], id);
		if (found) return found;
	}
	return undefined;
}

const clone = <T,>(o: T): T => JSON.parse(JSON.stringify(o));

/**
 * Function page of the doc-tree editor, route /doctree (SysComp.extendLinks() in app.tsx).
 */
export function AlbumDoctree(_props: Comprops) {
	const [tier] = React.useState(() => new PlaceholderDoctier());
	return (
		<AnDoctreeditor docId={PlaceholderDoctier.docId} doctier={tier} height='calc(100vh - 80px)' />);
}
