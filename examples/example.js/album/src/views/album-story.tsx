import React from 'react';

import { AnStoryEditor, templates } from 'semantic-doc/storytree';
import { StreeDoctier, type DocInf } from 'semantic-doc/doctree';
import { AnContext, type AnContextType, type Comprops, type CrudComp } from '@anclient/anreact';
import type { SessionClient } from '@anclient/semantier';
import { SynDocollPort } from '../tiers/syn-docoll-port';
import { GalleryTier } from '../tiers/gallerytier';

/** function uri of the page, as the doc tree's */
const uri = '/album/sys';
/** the album's doc uri, as AlbumDocview's */
const synuri = '/album/syn';

/**
 * Function page of the story editor, route /story (SysComp.extendLinks() in app.tsx), loaded
 * lazily (chunk story). Stories are docs of the synode's doc-tree tier (SynDocollPort.doctree),
 * listed with r/stories, created with u/page from a template; copied from AlbumDoctree.
 * The album tree beside the page is the album's, GalleryTier with the album home's semantics key,
 * as AlbumDocview's; semantic-doc only knows it as a StreeTier.
 */
export function AlbumStory(_props: Comprops) {
	const ctx = React.useContext(AnContext) as AnContextType;
	const doctier = React.useMemo(() => ctx.anClient
		? new StreeDoctier(ctx.anClient as unknown as SessionClient, uri, SynDocollPort.doctree, SynDocollPort.doctree206)
		: undefined, [ctx.anClient]);

	/** the album tree's tier, as AlbumDocview's (no component of it here: GalleryTier keeps it only) */
	const albumtier = React.useMemo(() => ctx.anClient
		? new GalleryTier({uri, synuri, client: ctx.anClient as unknown as SessionClient,
			comp: undefined as unknown as CrudComp<Comprops>}).setContext(ctx) as GalleryTier
		: undefined, [ctx.anClient]);

	const [docs, setDocs] = React.useState<DocInf[]>([]);
	const [docId, setDocId] = React.useState<string>();
	/** progress or error of loading / creating */
	const [msg, setMsg] = React.useState<string>();

	/** load the stories' headers; select one, or the first if none is selected */
	const reload = React.useCallback((select?: string) => {
		doctier?.stories((resp) => {
			const ds = resp.docs ?? [];
			setDocs(ds);
			setDocId((cur) => select ?? cur ?? ds[0]?.docId);
		}, setMsg);
	}, [doctier]);

	React.useEffect(() => {
		reload();
	}, [reload]);

	/** a new story from the first template */
	const create = () => {
		if (!doctier) return;
		setMsg('Creating a story …');
		doctier.savePage(undefined, templates[0].data, (resp) => {
			const id = resp.doc?.docId;
			if (!id) return setMsg('Creating a story: no doc id in the answer.');
			setMsg(undefined);
			reload(id);
		}, setMsg);
	};

	if (!doctier) return <div>Not logged in.</div>;

	return (<>
		<div>
			<select value={docId ?? ''} onChange={(e) => setDocId(e.target.value)}>
				{!docId && <option value=''>(no story)</option>}
				{docs.map((d) => (
					<option key={d.docId} value={d.docId}>{d.title || d.docId}</option>))}
			</select>
			<button onClick={create}>New story</button>
			{msg && <span> {msg}</span>}
		</div>
		{docId &&
			<AnStoryEditor key={docId} docId={docId} doctier={doctier}
				albumtier={albumtier} albumsk='tree-album-family-folder' synuri={synuri}
				height='calc(100vh - 140px)' />}
	</>);
}
