import React from 'react';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';

import { AnsonMsg, AnsonResp, AnTreeNode, Tierec } from '@anclient/semantier';
import { L, AnContextType, AnTreegrid, AnTreegridCol, CompOpts, Comprops, CrudCompW, regex } from '@anclient/anreact';

import { GalleryTier } from '../tiers/gallerytier';
import { AlbumResp } from '../tiers/album-req';
import { DocIcon } from '../icons/doc-ico';

/** a docx of the album, as the doc selector returns it */
export interface DocxPick {
	/** the h_photos record's pid (local to this synode) */
	docId: string;
	/** the record's io_oz_synuid: the same on every synode, what the import is asked with */
	synuid: string;
	/** the doc's name, e.g. "report.docx" */
	pname: string;
}

interface DocxSelectProps extends Comprops {
	/** the checked docx records */
	onPick: (picks: DocxPick[]) => void;
	onCancel: () => void;
}

/**
 * Selecting docx files of the album: the docs view of AlbumDocview (sk tree-docs-folder) in a dialog,
 * where only docx files have a checkbox (AnTreegrid.checkable).
 */
export class DocxSelectDialog extends CrudCompW<DocxSelectProps> {
	doctreesk = 'tree-docs-folder';
	synuri = '/album/syn';

	get ctx() { return this.context as AnContextType; }

	tier: GalleryTier | undefined;
	docIcon = new DocIcon();
	picks = new Map<string, Tierec>();

	constructor(props: DocxSelectProps) {
		super(props);
		this.uri = '/album/sys';
	}

	componentDidMount() {
		let client = this.ctx.anClient;
		if (client) {
			this.tier = new GalleryTier({uri: this.uri, synuri: this.synuri, client, comp: this});
			this.tier.setContext(this.ctx);
			this.toSearch();
		}
	}

	toSearch() {
		let tier = this.tier as GalleryTier;
		tier.stree({ uri: this.uri, synuri: this.synuri, sk: this.doctreesk,
			onOk: (rep: AnsonMsg<AnsonResp>) => {
				tier.forest = (rep.Body() as AlbumResp).forest as AnTreeNode[];
				this.setState({});
			}},
			this.ctx.error);
	}

	/** a docx file, not a folder (folders carry their children's mime too) */
	static isDocx(n: AnTreeNode) {
		return !(n.node.children?.length as number > 0)
			&& regex.mime2type(n.node.mime as string || '') === '.docx';
	}

	toOk = () => {
		this.props.onPick(Array.from(this.picks.values()).map((n) => {
			let t = n as AnTreeNode;
			return { docId: t.id, synuid: t.node.synuid as string, pname: t.node.docname as string };
		}));
	}

	render() {
	  let that = this;
	  let ismd = this.props.media?.isMd;
	  return (
		<Dialog open={true} fullWidth maxWidth="md" scroll='paper' onClose={this.props.onCancel}>
		  <DialogTitle color="primary">{L('Select docx')}</DialogTitle>
		  <DialogContent sx={{minHeight: '50vh'}}>
			{ this.tier &&
			  <AnTreegrid
				pk={''}
				tier={this.tier}
				uri={this.synuri}
				checkable={DocxSelectDialog.isDocx}
				columns={[
					{ type: 'iconame', field: 'docname', label: L('File Name'),   grid: {xs: 10, sm: 7, md: 8},
					  style: {maxWidth: '90vw', overflow: 'hidden', textOverflow: 'ellipsis'} },
					{ type: 'text',    field: 'mime', label: ismd ? L('type'):'', grid: {xs: 1, sm: 1, md: 1},
					  style: {textAlign: 'center'}, colFormatter: typeParser },
					{ type: 'text',    field: 'shareby', label: L('share by'),    grid: {xs: false, sm: 2, md: 1},
					  style: {textAlign: 'center', paddingRight: '1em'} },
					{ type: 'text',    field: 'filesize',label: L('size'),        grid: {xs: 1, sm: 2, md: 2},
					  style: {textAlign: 'right', paddingRight: '1em'},
					  colFormatter: (_col: AnTreegridCol, n: AnTreeNode, opts?: CompOpts) => opts?.media?.isMd ? <span>{n.node.filesize as React.ReactNode}</span> : <></>}
				]}
				onSelectChange={(ids: Map<string, Tierec>) => { this.picks = ids; this.setState({}); }}
			  /> }
		  </DialogContent>
		  <DialogActions sx={{justifyContent: 'center'}}>
			<Button onClick={this.toOk} variant="contained" color="primary" disabled={this.picks.size === 0}>
			  {L('OK')}
			</Button>
			<Button onClick={this.props.onCancel} variant="contained" color="primary">
			  {L('Cancel')}
			</Button>
		  </DialogActions>
		</Dialog>);

	  function typeParser(c: AnTreegridCol, n: AnTreeNode, opt?: CompOpts) {
		if (n.node.children?.length as number > 0) return <></>;
		else return that.docIcon.typeParser(c, n, opt);
	  }
	}
}
