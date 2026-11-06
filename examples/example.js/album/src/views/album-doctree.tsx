import React from 'react';
import 'katex/dist/katex.min.css'; // the host provides KaTeX CSS for the editor's formulas

import { AnDoctreeditor, JservDoctier, type DocInf } from 'semantic-doc/doctree';
import { AnContext, type AnContextType, type Comprops } from '@anclient/anreact';
import type { SessionClient } from '@anclient/semantier';

/** function uri of the page; the doc-tree tier doesn't check sessions yet */
const uri = '/album/sys';

/** a docx of the album, as the doc selector returns it */
export interface DocxPick {
	/** the h_photos record's pid (local to this synode) */
	docId: string;
	/** the record's io_oz_synuid: the same on every synode, what the import is asked with */
	synuid: string;
	/** the doc's name, e.g. "report.docx" */
	pname: string;
}

/**
 * HARD-CODED: the doc selector's result, until the selector dialog (like the welcome page's
 * tree, docx records only) is there. Replace with a docx record of your synode's album.
 */
const HARD_CODED_PICKS: DocxPick[] = [
	{ docId: '000A', synuid: 'X.000A', pname: 'tricky.docx' },
];

/** TODO the doc selector dialog: returns the picked docx records */
function selectDocx(): Promise<DocxPick[]> {
	console.warn('%c[album-doctree] HARD-CODED doc selection, not a dialog yet (HARD_CODED_PICKS):',
		'color: white; background: #c0392b; font-size: 1.3em; font-weight: bold; padding: 2px 6px',
		HARD_CODED_PICKS);
	return Promise.resolve(HARD_CODED_PICKS);
}

/**
 * Function page of the doc-tree editor, route /doctree (SysComp.extendLinks() in app.tsx),
 * on the synode's doc-tree tier (port doctree): the docs of the working copy, and importing
 * a docx of the album.
 */
export function AlbumDoctree(_props: Comprops) {
	const ctx = React.useContext(AnContext) as AnContextType;
	const tier = React.useMemo(() => ctx.anClient
		? new JservDoctier(ctx.anClient as unknown as SessionClient, uri) : undefined, [ctx.anClient]);

	const [docs, setDocs] = React.useState<DocInf[]>([]);
	const [docId, setDocId] = React.useState<string>();
	/** progress or error of loading / importing */
	const [msg, setMsg] = React.useState<string>();

	/** load the docs' headers; select one, or the first if none is selected */
	const reload = React.useCallback((select?: string) => {
		tier?.docs((resp) => {
			const ds = resp.docs ?? [];
			setDocs(ds);
			setDocId((cur) => select ?? cur ?? ds.find((d) => d.state === 'ready')?.docId);
		}, setMsg);
	}, [tier]);

	React.useEffect(() => {
		console.log(uri);
		reload();
	}, [reload]);

	const importDocx = async () => {
		const [pick] = await selectDocx();
		if (!pick || !tier) return;
		setMsg(`Importing ${pick.pname} …`);
		tier.importDocx(pick.synuid, undefined, (resp) => {
			const id = resp.doc!.docId;
			tier.whenParsed(id, () => { setMsg(undefined); reload(id); }, setMsg);
		}, setMsg);
	};

	if (!tier) return <div>Not logged in.</div>;

	return (<>
		<div>
			<select value={docId ?? ''} onChange={(e) => setDocId(e.target.value)}>
				{!docId && <option value=''>(no doc)</option>}
				{docs.map((d) => (
					<option key={d.docId} value={d.docId} disabled={d.state !== 'ready'}>
						{d.title || d.docId}{d.state !== 'ready' ? ` (${d.state})` : ''}
					</option>))}
			</select>
			<button onClick={importDocx}>Import docx</button>
			{msg && <span> {msg}</span>}
		</div>
		{docId &&
			// preview: the Sphinx template at web-dist/sdoc-template/ (jserv-album's sdoc-template-0.8)
			<AnDoctreeditor key={docId} docId={docId} doctier={tier} height='calc(100vh - 140px)'
				preview='sdoc-template/' />}
	</>);
}
