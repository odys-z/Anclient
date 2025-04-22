import React from 'react';
import FlipCameraIosIcon from '@material-ui/icons/FlipCameraIos';
import FolderSharedIcon from '@material-ui/icons/FolderShared';

import { Protocol, Inseclient, AnsonResp, AnsonMsg, 
	AnTreeNode, ErrorCtx, SessionClient, Tierec, size} from '@anclient/semantier';

import { L, AnError, AnReactExt, Lightbox, PdfIframe,
	AnTreeditor, CrudCompW, AnContextType, AlbumResp,
	AnTreegridCol, Media, ClassNames, AnTreegrid, regex, GalleryView, CompOpts, Comprops,
	PdfView
} from '@anclient/anreact';
import { GalleryTier } from '../tiers/gallerytier';
import { Button, Grid } from '@material-ui/core';
import { DocIcon } from '../icons/doc-ico';
import { ConnectionDetails } from './album-doconn-details';

interface AlbumDocProps extends Comprops {
	synuri: string
	/** album id */
	aid: string;
}

/**
 * Album View
 */
export class AlbumDocview extends CrudCompW<AlbumDocProps> {

    inclient?: Inseclient;
	anReact? : AnReactExt;  // helper for React
	error: ErrorCtx;
    nextAction: string | undefined;

	albumsk = 'tree-album-family-folder';
	doctreesk = 'tree-docs-folder';
	synuri = '/album/syn';

	/**
	 * The entity table name updated each time loaded a tree.
	 * Issue: See java AlbumResp.docTable's comments
	 */
	docTabl: string = 'h_photos';

	state = {
		hasError: false,
		showingDocs: false,
		sk: undefined,
	};

	client : SessionClient | undefined;
	tier   : GalleryTier | undefined;
	docIcon: DocIcon;
	pdfview: JSX.Element | undefined;
	orgview: JSX.Element | undefined;

	/**
	 * Restore session from window.localStorage
	 */
	constructor(props: AlbumDocProps | Readonly<AlbumDocProps>) {
		super(props);

		this.uri = '/album/sys';

		this.error   = {onError: this.onError, msg: '', that: this};
		this.docIcon = new DocIcon();

		this.onError = this.onError.bind(this);
		this.onErrorClose = this.onErrorClose.bind(this);
		this.toSearch = this.toSearch.bind(this);
		this.switchDocMedias = this.switchDocMedias.bind(this);
        this.viewFile = this.viewFile.bind(this);
	}

	componentDidMount() {
		console.log(this.uri);
        let client = (this.context as AnContextType).anClient;
        if (client) {
		    this.tier = new GalleryTier({uri: this.uri, synuri: this.props.synuri, client, comp: this});
		    this.tier.setContext(this.context as AnContextType);
			this.toSearch();
        }
	}

	toSearch() {
		let that = this;
		let tier = this.tier as GalleryTier;

		if (!tier) return;

		tier.stree({ uri: this.uri, synuri: this.synuri,
			sk: this.state.showingDocs ? this.doctreesk : this.albumsk,
			onOk: (rep: AnsonMsg<AnsonResp>) => {
				tier.forest = (rep.Body() as AlbumResp).forest as AnTreeNode[];
				// console.log((rep.Body() as AlbumResp).docTabl);
				that.docTabl = (rep.Body() as AlbumResp).docTabl || 'h_photos';
				that.setState({});
			}},
			this.error);

		this.onErrorClose();
	}

	switchDocMedias (col: AnTreegridCol, ix: number, opts: {classes?: ClassNames, media?: Media} | undefined) {
		let that = this;
		return (
		  <Grid item key={ix as number} {...col.grid}>
			<Button onClick={toToggleView}
				className={opts?.classes?.toggle}
				startIcon={that.state.showingDocs ? <FolderSharedIcon style={{ fontSize: 30 }}/> : <FlipCameraIosIcon style={{ fontSize: 30 }}/>}
				color="primary" >
				{opts?.media?.isMd && L(`${this.state.showingDocs ? L('Docs') : L('Medias')}`)}
			</Button>
			{/* TODO Let's filter connection later
			<Button onClick={this.toFilterOrgs}
				className={opts?.classes?.toggle}
				startIcon={<LibraryAddCheckIcon/>}
				color="primary" >
				{opts?.media?.isMd && L('Groups')}
			</Button>
			*/}
		  </Grid> );

		function toToggleView(_e: React.UIEvent) {
			that.state.showingDocs = !that.state.showingDocs;
			that.toSearch();
		}
	}

	toFilterOrgs = (_: React.UIEvent) => {
		this.orgview = (<ConnectionDetails
			tier={this.tier}
		>
		</ConnectionDetails>);
	}

	lightbox = (photos: AnTreeNode[], opts: {ix: number, open: boolean, onClose: (e: any) => {}}) => {
		return (<Lightbox {...opts} showResourceCount photos={photos} tier={this.tier} />);
	}

	viewFile = (ids: Map<string, Tierec>) => {
		if (size(ids) > 0 && this.tier) {
			let fid = ids.keys().next().value;
            let synuri = this.synuri;

			if (fid) {
				let file = ids.get(fid) as AnTreeNode;
				let t = regex.mime2type(file.node.mime as string || "");
				if (t === '.pdf') {
					let pdfsrc = GalleryView.imgSrcReq(file?.id, this.docTabl, {...this.tier, docuri: () => synuri });
					let close = (_e: any) => {
								this.pdfview = undefined;
								this.context.onFullScreen(false);
								this.setState({});
							} 
					this.pdfview = ( this.context && this.context.clientOpts && this.context.clientOpts.legacyPDF
						? <PdfView src={pdfsrc} close={close}
							pdfjs='pdfjs-legacy/pdf.mjs'
							worksrc='pdfjs-legacy/pdf.worker.mjs'
							cMapUrl='pdfjs-legacy/cmaps/'/>
						: <PdfIframe src={pdfsrc} close={close} />);
					this.context.onFullScreen(true);
				}
				else {
					this.pdfview = undefined;
					this.error.msg = L('Type {t} is not supported yet.', {t});
					this.setState({
						hasError: true,
						nextAction: 'ignore'});
				}
			}
		}
		else {
			this.pdfview = undefined;
		}
		this.setState({});
	};

	onError(c: string, r: AnsonMsg<AnsonResp> ) {
		console.error(c, r.Body()?.msg(), r);
		let ui = (this as ErrorCtx).that as AlbumDocview;
		ui.error.msg = r.Body()?.msg();
		ui.state.hasError = !!c;
		ui.nextAction = c === Protocol.MsgCode.exSession ? 're-login' : 'ignore';
		ui.setState({});
	}

	onErrorClose() {
        this.state.hasError = false;
		this.setState({});
	}

	render() {
	  let that = this;
	  let ismd  = this.props.media?.isMd;
	  return (<>
		  { this.tier && (
			this.state.showingDocs ?
		    <AnTreegrid
				pk={''} singleCheck
				tier={this.tier}
				uri={this.synuri}
				columns={[
				  { type: 'iconame', field: 'docname', label: L('File Name'),   grid: {xs: 11, sm: 7, md: 8},
				    style: {maxWidth: '90vw', overflow: 'hidden', textOverflow: 'ellipsis'} },
				  { type: 'text',    field: 'mime', label: ismd ? L('type'):'', grid: {xs: 1, sm: 1, md: 1},
				    style: {textAlign: 'center'}, colFormatter: typeParser },
				  { type: 'text',    field: 'shareby', label: L('share by'),    grid: {xs: false, sm: 2, md: 1},
					style: {textAlign: 'center', paddingRight: '1em'} },
				  { type: 'text',    field: 'filesize',label: L('size'),        grid: {xs: false, sm: 2, md: 2},
				    style: {textAlign: 'right', paddingRight: '1em'}, thFormatter: this.switchDocMedias }
				]}
				onSelectChange={this.viewFile}
			/> :
		    <AnTreeditor {... this.props} // reload={!this.state.showingDocs}
				pk={'pid'} sk={this.albumsk}
				tier={this.tier}
				tnode={this.tier.root()} title={this.tier.albumTitle}
				onSelectChange={() => undefined}
				uri={this.uri} docuri={this.synuri}
				columns={[
					{ type: 'text',     field: 'text',   label: L('Folders'), grid: {xs: 5, sm: 4, md: 3} },
					{ type: 'icon-sum', field: '',       label: L('Summary'), grid: {xs: 4, sm: 4, md: 3} },
					{ type: 'text',     field: 'shareby',label: L('Share'),   grid: {sm: false, md: 3} },
					{ type: 'actions',  field: '',       label: '',           grid: {xs: 3, sm: 4, md: 3},
					  thFormatter: this.switchDocMedias, formatter: ()=>{/* supress default */} }
				]}
				lightbox={this.lightbox}
			/>) }
		  { this.pdfview }
		  { this.orgview }
		  { this.state.hasError &&
			<AnError onClose={this.onErrorClose} fullScreen={false}
				uri={this.uri} tier={undefined}
				title={L('Error')} msg={this.error.msg || ''} /> }
	  </>);

	  function typeParser(c: AnTreegridCol, n: AnTreeNode, opt?: CompOpts) {
		if (n.node.children?.length as number > 0) return <></>;
		else return that.docIcon.typeParser(c, n, opt);
	  }
	}
}
