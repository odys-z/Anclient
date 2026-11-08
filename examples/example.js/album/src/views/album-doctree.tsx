import React from 'react';
import 'katex/dist/katex.min.css'; // the host provides KaTeX CSS for the editor's formulas

import { AnDoctreeditor, StreeDoctier, type DocInf } from 'semantic-doc/doctree';
import { AnContext, type AnContextType, type Comprops } from '@anclient/anreact';
import type { SessionClient } from '@anclient/semantier';
import { SynDocollPort } from '../tiers/syn-docoll-port';
import { DocxSelectDialog, type DocxPick } from './docx-select-dialog';

/** function uri of the page; the doc-tree tier doesn't check sessions yet */
const uri = '/album/sys';

/**
 * Function page of the doc-tree editor, route /doctree (SysComp.extendLinks() in app.tsx),
 * on the synode's doc-tree tier (port SynDocollPort.doctree): the docs of the working copy, and importing
 * a docx of the album.
 */
export function AlbumDoctree(_props: Comprops) {
	const ctx = React.useContext(AnContext) as AnContextType;
	const tier = React.useMemo(() => ctx.anClient
		? new StreeDoctier(ctx.anClient as unknown as SessionClient, uri, SynDocollPort.doctree) : undefined, [ctx.anClient]);

	const [docs, setDocs] = React.useState<DocInf[]>([]);
	const [docId, setDocId] = React.useState<string>();
	/** progress or error of loading / importing */
	const [msg, setMsg] = React.useState<string>();
	/** showing the docx select dialog */
	const [selecting, setSelecting] = React.useState(false);

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

	/** import the docx files checked in the select dialog */
	const importDocx = (picks: DocxPick[]) => {
		setSelecting(false);
		if (!tier) return;
		for (const pick of picks) {
			setMsg(`Importing ${pick.pname} …`);
			tier.importDocx(pick.synuid, undefined, (resp) => {
				const id = resp.doc?.docId;
				if (!id) return setMsg(`Importing ${pick.pname}: no doc id in the answer.`);
				tier.whenParsed(id, () => { setMsg(undefined); reload(id); }, setMsg);
			}, setMsg);
		}
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
			<button onClick={() => setSelecting(true)}>Import docx</button>
			{msg && <span> {msg}</span>}
		</div>
		{selecting &&
			<DocxSelectDialog uri={uri} onPick={importDocx} onCancel={() => setSelecting(false)} />}
		{docId &&
			// preview: the Sphinx template at web-dist/sdoc-template/ (jserv-album's sdoc-template-0.8)
			<AnDoctreeditor key={docId} docId={docId} doctier={tier} height='calc(100vh - 140px)'
				preview='sdoc-template/' />}
	</>);
}
