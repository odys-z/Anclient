import React from 'react';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';

import { AnStoryEditor, loadTemplates, type StoryTemplate } from 'semantic-doc/storytree';
import { StreeDoctier, type DocInf } from 'semantic-doc/doctree';
import { AnContext, L, type AnContextType, type Comprops, type CrudComp } from '@anclient/anreact';
import type { SessionClient } from '@anclient/semantier';
import { SynDocollPort } from '../tiers/syn-docoll-port';
import { GalleryTier } from '../tiers/gallerytier';

/** function uri of the page, as the doc tree's */
const uri = '/album/sys';
/** the album's doc uri, as AlbumDocview's */
const synuri = '/album/syn';
/** the story templates' folder, templates.json and their gifs, as res-vol/lang.json */
const templateFolder = 'res-vol/story';

/**
 * Function page of the story editor, route /story (SysComp.extendLinks() in app.tsx), loaded
 * lazily (chunk story). Stories are docs of the synode's doc-tree tier (SynDocollPort.doctree),
 * listed with r/stories, created with u/page from a template picked in a dialog (as AlbumDoctree's
 * docx, DocxSelectDialog), the templates of res-vol/story/templates.json; copied from AlbumDoctree.
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
	/** New story: the template dialog is open */
	const [picking, setPicking] = React.useState(false);

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

	/** a new story from the template picked */
	const create = (tmpl: StoryTemplate) => {
		setPicking(false);
		if (!doctier) return;
		setMsg('Creating a story …');
		doctier.savePage(undefined, tmpl.data, (resp) => {
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
			<button onClick={() => setPicking(true)}>New story</button>
			{msg && <span> {msg}</span>}
		</div>
		{docId &&
			<AnStoryEditor key={docId} docId={docId} doctier={doctier}
				albumtier={albumtier} albumsk='tree-album-family-folder' synuri={synuri}
				height='calc(100vh - 140px)' />}
		{picking &&
			<TemplateDialog onPick={create} onCancel={() => setPicking(false)} />}
	</>);
}

/**
 * Picking the Puck template of a new story, loaded from res-vol/story (semantic-doc's loadTemplates(),
 * once a session), each with its gif; the dialog as DocxSelectDialog's.
 */
function TemplateDialog({ onPick, onCancel }: {
	onPick: (tmpl: StoryTemplate) => void;
	onCancel: () => void;
}) {
	const [tmpls, setTmpls] = React.useState<StoryTemplate[]>();
	const [ix, setIx] = React.useState(0);

	React.useEffect(() => {
		loadTemplates(templateFolder).then(setTmpls);
	}, []);

	const t = tmpls?.[ix];

	return (
		<Dialog open={true} fullWidth maxWidth="md" scroll='paper' onClose={onCancel}>
		  <DialogTitle color="primary">{L('New story from a template')}</DialogTitle>
		  <DialogContent sx={{minHeight: '40vh'}}>
			{!tmpls ? L('Loading templates ...') :
			<Grid container spacing={2}>
			  <Grid size={{xs: 12, sm: 5}}>
				<List>
				  {tmpls.map((t, i) => (
					<ListItemButton key={t.id} selected={i === ix}
						onClick={() => setIx(i)} onDoubleClick={() => onPick(t)} >
						<ListItemText primary={t.name} secondary={t.data.title} />
					</ListItemButton>))}
				</List>
			  </Grid>
			  <Grid size={{xs: 12, sm: 7}}>
				{t?.gif &&
				  <img key={t.gif} src={t.gif} alt={t.name} style={{maxWidth: '100%'}}
					onError={(e) => { e.currentTarget.style.display = 'none'; }} />}
			  </Grid>
			</Grid>}
		  </DialogContent>
		  <DialogActions sx={{justifyContent: 'center'}}>
			<Button onClick={() => t && onPick(t)} variant="contained" color="primary" disabled={!t}>
			  {L('OK')}
			</Button>
			<Button onClick={onCancel} variant="contained" color="primary">
			  {L('Cancel')}
			</Button>
		  </DialogActions>
		</Dialog>);
}
