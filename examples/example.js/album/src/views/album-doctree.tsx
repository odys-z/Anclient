import React from 'react';
import 'katex/dist/katex.min.css'; // the host provides KaTeX CSS for the editor's formulas

import { AnDoctreeditor, locate, type DocCols, type DoctreeResp, type DoctreeTier,
	type OnErr, type OnOk, type TreeModify } from 'semantic-doc/doctree';
import { Comprops } from '@anclient/anreact';

/**
 * Urls of the test docs, copied from semantic-doc/src/demo/jsons into web-dist/res-vol/doctree.
 * Relative to the page, like res-vol/lang.json in app.tsx.
 */
const testDocs: Record<string, string> = {
	'doc-a': 'res-vol/doctree/doc-a.json',
	'doc-b': 'res-vol/doctree/doc-b.json',
};

const clone = <T,>(o: T): T => JSON.parse(JSON.stringify(o));

/** a request as one line, e.g. "u/move a2.3 → a2[0]" */
const describe = (q: TreeModify) =>
	q.a === 'd' ? `d ${q.rootId}`
	: `${q.a} ${q.rootId ?? q.nvs?.find((nv) => nv[0] === 'kind')?.[1] ?? ''} → ${q.toParent ?? '(top)'}[${q.toIndex}]`;

/**
 * Stands in for the synode's doc-tree tier (port doctree, doctree.jserv) until DoctreeTier
 * serves doc trees: plays the server over the test docs in res-vol/doctree.
 * Copied from semantic-doc's demo/stub-tier.ts (StubDoctreeTier).
 *
 * Text saves and commits work on an in-memory copy. Structure changes need the
 * server's reshaping, so they are answered with an error naming the request.
 */
class TestDoctier implements DoctreeTier {
	/** the "server's" copy of each doc */
	docs = new Map<string, Promise<DoctreeResp>>();
	/** answer delay, ms */
	delay = 120;

	private doc(docId: string) {
		if (!this.docs.has(docId)) {
			const url = testDocs[docId];
			this.docs.set(docId, url
				? fetch(url).then((r) => (r.ok ? r.json() : Promise.reject(`${r.status} ${url}`)))
				: Promise.reject(`no such doc: ${docId}`));
		}
		return this.docs.get(docId)!;
	}

	/** answer like a server: later, a copy */
	private answer(docId: string, ok: OnOk, err: OnErr | undefined, f: (d: DoctreeResp) => DoctreeResp) {
		this.doc(docId)
			.then((d) => setTimeout(() => ok(clone(f(d))), this.delay))
			.catch((e) => err?.(String(e)));
	}

	tree(docId: string, ok: OnOk, err?: OnErr) {
		this.answer(docId, ok, err, (d) => ({ doc: d.doc, root: null, forest: d.forest }));
	}

	update(docId: string, node: DocCols, ok: OnOk, err?: OnErr) {
		this.answer(docId, ok, err, (d) => {
			const n = locate(d.forest ?? [], node.nid)?.t.node;
			if (n) Object.assign(n, { json: node.json, rst: node.rst, rstver: node.rstver });
			d.doc!.dirty = true;
			return { doc: d.doc };
		});
	}

	modify(_docId: string, req: TreeModify, _ok: OnOk, err?: OnErr) {
		setTimeout(() => err?.(`${describe(req)}: the synode doesn't serve doc trees yet.`), this.delay);
	}

	commit(docId: string, ok: OnOk, err?: OnErr) {
		this.answer(docId, ok, err, (d) => {
			d.doc!.dirty = false;
			d.doc!.committedAt = new Date().toLocaleString();
			return { doc: d.doc };
		});
	}
}

/**
 * Function page of the doc-tree editor, route /doctree (SysComp.extendLinks() in app.tsx).
 * The doc selector is copied from semantic-doc's demo/doctree.tsx.
 */
export function AlbumDoctree(_props: Comprops) {
	const [tier] = React.useState(() => new TestDoctier());
	const [docId, setDocId] = React.useState('doc-a');
	return (<>
		<select value={docId} onChange={(e) => setDocId(e.target.value)}>
			{Object.keys(testDocs).map((d) => <option key={d}>{d}</option>)}
		</select>
		{/* preview: the Sphinx template at web-dist/sdoc-template/ (jserv-album's sdoc-template-0.8) */}
		<AnDoctreeditor key={docId} docId={docId} doctier={tier} height='calc(100vh - 110px)'
			preview='sdoc-template/' />
	</>);
}
