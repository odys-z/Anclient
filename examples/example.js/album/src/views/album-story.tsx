import React from 'react';

import { AnStoryEditor } from 'semantic-doc/story';
import { StreeDoctier } from 'semantic-doc/doctree';
import { AnContext, type AnContextType, type Comprops } from '@anclient/anreact';
import type { SessionClient } from '@anclient/semantier';
import { SynDocollPort } from '../tiers/syn-docoll-port';

/** function uri of the page, as the doc tree's */
const uri = '/album/sys';

/**
 * STUB (media story, WP6).
 *
 * Function page of the story editor, route /story (SysComp.extendLinks() in app.tsx), loaded
 * lazily (chunk story). Stories are docs of the synode's doc-tree tier (SynDocollPort.doctree),
 * with kind 'story'; the album tree beside the page is the album's, by GalleryTier and the
 * semantics key of the album home page.
 *
 * TODO WP6:
 * - list / create stories (docs of kind 'story'), as AlbumDoctree lists docs;
 * - the album tier: GalleryTier (tiers/gallerytier.ts) with albumsk, as AlbumDocview does;
 *   semantic-doc only knows it as a StreeTier.
 */
export function AlbumStory(_props: Comprops) {
	const ctx = React.useContext(AnContext) as AnContextType;
	const doctier = React.useMemo(() => ctx.anClient
		? new StreeDoctier(ctx.anClient as unknown as SessionClient, uri, SynDocollPort.doctree, SynDocollPort.doctree206)
		: undefined, [ctx.anClient]);

	/** TODO WP6: the story selected or created */
	const [docId] = React.useState<string>();

	if (!doctier) return <div>Not logged in.</div>;

	return (docId
		? <AnStoryEditor key={docId} docId={docId} doctier={doctier}
			albumtier={undefined /* TODO WP6: GalleryTier */} albumsk='tree-album-family-folder'
			height='calc(100vh - 140px)' />
		: <div>TODO: stories</div>);
}
