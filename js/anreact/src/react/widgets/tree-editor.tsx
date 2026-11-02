import React, {ReactNode} from "react";

import { withStyles, gridSize, withWidth, Color, Alignment } from '../mui-compat';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';

import { CRUD, AnTreeNode, AnlistColAttrs, removeNode,
	toBool, IndentName, defltIcons, StreeTier, AnsonMsg, AnDatasetResp, IndentIcons, AnsonResp
} from "@anclient/semantier";

import { GalleryView, lightboxFomatter as lightboxFormatter } from "./gallery-view";
import { Theme } from '@mui/material/styles';
import { AnTablistProps } from "./table-list";
import { CrudCompW, DetailFormW } from "../crud";
import { swap } from "../../utils/lang-ext";
import { AnReactExt, ClassNames, CompOpts, Media, hide } from "../anreact";
import { JsampleIcons } from "../../jsample/styles";
import { AnContext, AnContextType } from "../reactext";
import { SimpleForm } from "./simple-form";
import { L } from "../../utils/langstr";

import { photos as _photos } from "./res/temp-photos";
import { icon, levelIcons, AnTreegridCol, TreeItemProps, AnreactreeItem, TreeNodeVisual } from "./tree";
import { AnTreegridComp } from "./treegrid";

export const treeditorStyles = (theme: Theme) => ({
  root: { width: "100%", },
  row: {
	width: "100%",
	"& :hover": {
	  backgroundColor: "#ced"
	}
  },
  th: {
    width: "100%",
	textAlign: 'center' as const,
	paddingBottom: '0.1em',
	borderBottom: '1px solid #bcd'
  },
  thCell: {
    margin: 'auto',
    verticalAlign: 'middle',
    textShadow: `${theme.spacing(0.5)}px ${theme.spacing(0.5)}px ${theme.spacing(1)}px #112244`
  },
  rowHead: {
    paddingRight: theme.spacing(1),
    paddingLeft: 0,
    paddingTop: 0,
    paddingBottom: 0,
  },
  folder: { width: "100%" },
  folderHead: {
	paddingRight: theme.spacing(1),
	paddingTop: 0,
	paddingBottom: 0,
	borderBottom: "1px solid #bcd",
	borderTop: "1px solid #bcd",
	"& :hover": {
	  backgroundColor: "#ccc"
	}
  },
  forest: {
	  height: '90vh',
  },
  treeCell: {
	paddingLeft : theme.spacing(1),
	paddingRight: theme.spacing(1),
	paddingTop: 0,
	paddingBottom: 0,
	borderLeft: "1px solid #bcd",
  },
  smallBtn: {
	  minWidth: 24,
  },
  rowText: {
	textShadow: '2px 2px 8px #112244'
  },
  galleryHead: {
	maxWidth: '50%',
	paddingLeft: 0,
	paddingTop: 0,
	paddingBottom: 0,
	paddingRight: theme.spacing(2),
  },
  galleryHeadExpandIcon: {
	paddingLeft: theme.spacing(0.5),
	paddingRight: theme.spacing(3.5)
  },
  toggle: {
    padding: 0,
    paddingRight: theme.spacing(1),
    paddingLeft : theme.spacing(1),
    verticalAlign: 'middle',
    height: theme.spacing(4),
  },
  action: {}
});

class TreeCardComp<T> extends DetailFormW<TreeItemProps & T> implements AnreactreeItem {
	state = {
		showCarousel: false,
		expand: false
	}

	vistype: TreeNodeVisual;

	node: AnTreeNode & {indentIcons?: IndentName[]};

	constructor(props: TreeItemProps) {
		super(props);
		this.vistype = TreeNodeVisual.card;

		this.node = props.tnode;
		this.state.expand = props.expand;

		this.toUp = this.toUp.bind(this);
		this.toDown = this.toDown.bind(this);
		this.toTop = this.toTop.bind(this);
		this.toDown = this.toDown.bind(this);

		this.leadingIcons = this.leadingIcons.bind(this);
	}

	componentDidMount() {
		this.setState({});
	}

	toUp(_e: React.MouseEvent<HTMLElement>) {
		let p = this.props.parent;
		let n = this.props.tnode;
		let children = p.node.children;
		let me = children.indexOf(n);
		let elder = me - 1;
		if (elder >= 0)
			swap(children, me, elder);

		if (typeof this.props.onUpdate === 'function')
			this.props.onUpdate(n, p, me, elder);
	}

	toTop(_e: React.MouseEvent<HTMLElement>) {
		let p = this.props.parent;
		let n = this.props.tnode;
		let children = p.node.children;
		let me = children.indexOf(n);
		if (me > 0)
			swap(children, me, 0);

		if (typeof this.props.onUpdate === 'function')
			this.props.onUpdate(n, p, me, 0);
	}

	toDown(_e: React.MouseEvent<HTMLElement>) {
		let p = this.props.parent;
		let n = this.props.tnode;
		let children = p.node.children;
		let me = children.indexOf(n);
		let younger = me + 1;
		if (younger < children.length)
			swap(children, me, younger);

		if (typeof this.props.onUpdate === 'function')
			this.props.onUpdate(n, p, me, younger);
	}

	toBottom(_e: React.MouseEvent<HTMLElement>) {
		let p = this.props.parent;
		let n = this.props.tnode;
		let children = p.node.children;
		let me = children.indexOf(n);
		if (me < children.length - 1)
			swap(children, me, children.length - 1);
		if (typeof this.props.onUpdate === 'function')
			this.props.onUpdate(n, p, me, children.length);
	}

	leadingIcons () {
		let tnode = this.props.tnode;
		return levelIcons(this.props.indentSettings, tnode.indents);
	}

	static actionFragment(tnode: AnTreeNode, col: AnTreegridCol,
			fragKey: string | number, handler: AnreactreeItem | undefined, props: TreeItemProps) {

		let {classes, media} = props;
		let parentId = tnode.parent;
		return (
		  <Grid key={`${tnode.id}.${fragKey}`} className={classes.treeCell} size={gridSize(col.grid)}>
			<JsampleIcons.Up onClick={handler?.toUp} />
			<JsampleIcons.Down onClick={handler?.toDown} />
			{media.isMd ?
			  <><Button onClick={handler?.toEdit}
					data-me={tnode.id} data-parent={parentId}
					startIcon={<JsampleIcons.Edit />} color="primary" >
					{L('Edit')}
					</Button>
					<Button onClick={handler?.toDel}
					data-me={tnode.id} data-parent={parentId}
					startIcon={<JsampleIcons.Delete />} color="secondary" >
					{L('Delete')}
					</Button>
			  </>
			  :
			  <><JsampleIcons.Edit onClick={handler?.toEdit}
					className={classes.smallBtn}
					data-me={tnode.id} data-parent={parentId}
					color='primary'
				    />
					<JsampleIcons.Delete onClick={handler?.toDel}
					className={classes.smallBtn}
					data-me={tnode.id} data-parent={parentId}
					color='secondary'
				/>
			  </>
			}
		  </Grid>);
	}

	render() {
		let that = this;
		let tnode = this.props.tnode;
		let n = tnode.node;
		n.css = n.css || {};
		let { classes, media } = this.props;

		return (
		  <Grid container key={tnode.id}
				onClick={this.props.conClick}
				spacing={0} className={classes.row} >
			{ this.props.columns
				.filter( (v: AnlistColAttrs<JSX.Element, CompOpts>) => toBool(v.visible, true) )
				.map( (col: AnlistColAttrs<JSX.Element, CompOpts>, cx: number) => {
				  if (cx === 0) return (
					hide(col.grid, media) ? undefined :
					<Grid key={`${tnode.id}.${cx}`} className={classes.rowHead} size={gridSize(col.grid)}>
						<Typography noWrap variant='body2'>
							{that.leadingIcons()}
							{n[col.field] as React.ReactNode}
						</Typography>
					</Grid> );
				  else if (col.type === 'actions')
				  	return (hide(col.grid, media) ? undefined :
							TreeCardComp.actionFragment(tnode, col, cx, this, this.props));
				  else return (
					hide(col.grid, media) ? undefined :
					<Grid key={`${tnode.id}.${cx}`} className={classes.treeCell} size={gridSize(col.grid)}>
						{ typeof col.formatter === 'function' ?
							col.formatter(col, tnode) :
							<Typography noWrap variant='body2'
								// issue: This is controlling the presentation layer by data service. Is this the right way?
								align={align(n.css[col.field])}
								className={classes.rowText} >
								{n[col.field] as React.ReactNode}
							</Typography>
						}
					</Grid> );
				} )
			}
		  </Grid> );

		function align(css: React.CSSProperties) {
		  return css?.textAlign ? css.textAlign as Alignment : 'center';
		}
	}
}
TreeCardComp.contextType = AnContext;

const TreeCard = withStyles<any, any, TreeItemProps>(treeditorStyles)(withWidth()(TreeCardComp));

class TreeGallaryComp extends TreeCardComp<{lightbox: lightboxFormatter}> {
	/** pic collection id */
	collect: string;

	toEditCard: ()=>void;
	galleref: GalleryView;

	constructor(props: TreeItemProps & {lightbox?: lightboxFormatter}) {
		super(props);

		this.vistype = TreeNodeVisual.gallery;
		this.node = props.tnode;

		this.expand = this.expand.bind(this);
	}

	expand(e: React.UIEvent) {
		console.log(e);
		this.setState({expand: !this.state.expand});
	}

	render() {
		let that = this;
		let {classes, tnode, onClick, media} = this.props;
		let node = tnode.node;
		return (<>
		  { this.galleryHead(that.props.columns, tnode, classes, media, onClick) }
		  <Collapse in={this.state.expand}>
			<GalleryView {... this.props}
				ref={undefined} // suppress type error
				uri={this.uri} docuri={this.props.docuri} media={this.props.media}
				cid={this.collect}
				photos={node.children} // or fire a request to get photos?
				visible={this.state.expand}
				lightbox={this.props.lightbox}
			/>
		  </Collapse>
		</>);
	}

	galleryHead (columns: AnTreegridCol[], tnode: AnTreeNode,
			classes: ClassNames, media: Media,
			onClick: React.MouseEventHandler<HTMLElement>): React.ReactNode {
		let that = this;
		let n = tnode.node;
		n.css = n.css || {};
		let expd = that.state.expand;

		return (
		<div onClick={ onClick ? onClick : (_e) => {
				that.state.expand = !expd;
				that.setState({})
			}}
		>
		  <Grid container spacing={0} key={tnode.id} className={`classes.row classes.galleryHead`}>
			{ columns
			  .filter( v => v.hide != true )
			  .map( (col: AnTreegridCol, ix: number) => {
				if (ix == 0) // row head
				  return (
					hide(col.grid, media) ? undefined :
					<Grid key={`${tnode.id}.${ix}`} className={classes.galleryHead} size={gridSize(col.grid)} >
						<Typography noWrap variant='body2' className={expd ? classes.galleryHeadExpandIcon : ''}>
						{levelIcons(
							that.props.indentSettings,
							tnode.indents as IndentName[])}
						{expd ? icon(that.props.indentIcons, "pic-lib", 0)
							: icon(that.props.indentIcons, "collapse", 0)}
						{n[col.field] as React.ReactNode}
						</Typography>
					</Grid>);
				else if (!hide(col.grid, media)) {
					if (col.type === 'formatter' || col.formatter)
						return (
							<Grid key={`${tnode.id}.${ix}`} className={classes.treeCell} size={gridSize(col.grid)} >
								<Typography variant='body2' >
									{col.formatter(col, tnode, {classes, media}) as ReactNode}
								</Typography>
							</Grid>);
					else if (col.type === 'actions')
						return ( TreeCardComp.actionFragment(tnode, col, ix, this, this.props));
					else if (col.type === 'icon-sum')
						return (
							<Grid key={`${tnode.id}.${ix}`} className={classes.treeCell} size={gridSize(col.grid)}>
								{TreeGallaryComp.formatFolderIcons(that.props.indentIcons, tnode, {grid: col.grid, media, classes})}
							</Grid>);
					else
						return (
						<Grid key={`${tnode.id}.${ix}`} className={classes.treeCell} size={gridSize(col.grid)}>
							<Typography variant='body2' > {n[col.field] as React.ReactNode} </Typography>
						</Grid>);
				}
			  }) }
		  </Grid>
		</div>
		);
	}

	/**
	 * Ui helper for a summary of mime types.
	 * If in grid md size, also with lable from tnode.node.pname || pid || text || fullpath.
	 *
	 * @param iconpool
	 * @param tnode
	 * @param opts
	 * @returns the element
	 */
	static formatFolderIcons(iconpool: IndentIcons, tnode: AnTreeNode, opts: {grid: any, media: Media, classes: ClassNames}) {
		let n = tnode.node;
		let {grid, media, classes} = opts;

		return (
		  <Typography noWrap variant='body2' className={classes.rowText} >
			{hide(grid, media) ? undefined : media.isMd && `[${n.pname || n.pid || n.text || n.fullpath}]` }
			{ Number(n.img) > 0 && [icon(iconpool, "[]", 0), `x ${n.img}`] }
			{ Number(n.geo) > 0 && [icon(iconpool, "!", 0), `x ${n.geo}`] }
			{ Number(n.mov) > 0 && [icon(iconpool, ">", 0), `x ${n.mov}`] }
			{ Number(n.fav) > 0 && [icon(iconpool, "b", 0), `x ${n.fav}`] }
		  </Typography>);
	}
}

const TreeGallary = withStyles<any, any, TreeItemProps>(treeditorStyles)(withWidth()(TreeGallaryComp));

export interface AnTreeditorProps extends AnTablistProps {
	columns: Array<AnTreegridCol>;

	/**
	 * @since 0.6.0 As TreeEditor implements TreeCard or TrreeGallary that handling photos,
	 * so TreeEditor needs this filed.
	 * @since 0.8.0 only required when the forest has gallery nodes.
	 */
	docuri?: string;

	/** optional since 0.8.0: no tier for a forest held by a subclass or given in {@link forest} */
	tier?: StreeTier;

	/**
	 * A forest given by the host, e.g. loaded by its own tier (not the s-tree port).
	 * Precedence: props.forest, tier.forest, state.forest.
	 * @since 0.8.0
	 */
	forest?: AnTreeNode[];

	reload: boolean;

	nodeFormatter?: (n: AnTreeNode, parent: AnTreeNode | undefined, opts: CompOpts) => React.ReactElement;

	lightbox?: lightboxFormatter;
}

/**
 * Since 0.8.0, subclasses can override the hooks:
 * {@link visualOf}, {@link renderLeaf}, {@link sectionTitle}, {@link rowActions}, {@link onMoved}, {@link removeNode}.
 */
class AnTreeditorComp<P extends AnTreeditorProps = AnTreeditorProps> extends DetailFormW<P> {
	state = {
		forest: [] as AnTreeNode[],
		tobeLoad: true
	};

    sysName: '';
    window: Window;

    anReact: AnReactExt | undefined;
	editForm: React.ReactElement | undefined;
	treetier: StreeTier;

	/** for debug */
	columns: AnTreegridCol[];

	constructor(props: P) {
		super(props);

		this.columns = props.columns;
		console.log(this.columns);

		this.sysName = props.sys || props.sysName || props.name || this.sysName;
		this.window = props.window;
		this.treetier = props.tier;


		this.folderHead = this.folderHead.bind(this);
		this.toAddChild = this.toAddChild.bind(this);
		this.toEditCard = this.toEditCard.bind(this);
		this.treeNodes  = this.treeNodes.bind(this);
		this.toSearch   = this.toSearch.bind(this);
		this.refresh    = this.refresh.bind(this);
		this.toDel      = this.toDel.bind(this);
		this.onMoved    = this.onMoved.bind(this);
		this.buildTreegrid = this.buildTreegrid.bind(this);
	}

	componentDidMount() {
		console.log(this.props.uri);

		const ctx = this.context as unknown as AnContextType;
		this.anReact = ctx.uiHelper;
		if (this.props.reload && this.state.tobeLoad) {
			this.toSearch();
		}
	}

	/**
	 * @deprecated the {@link AnTreegrid} update schema is prefered.
	 * @see example test/sessionles/src/less-widgets-treegrid.tsx
	 */
	toSearch() {
		let that = this;
		let { s_tree } = this.props;
		if (s_tree)
			throw Error("s_tree is used for defined tree semantics at client side - not supported yet.");

		let { uri, sk } = this.props;
		this.state.tobeLoad = false;
		this.treetier.stree({ uri, sk, // uiHelper: this.context.uiHelper,
			onOk: (resp: AnsonMsg<AnsonResp>) => {
				that.setState({forest: (resp.Body() as AnDatasetResp).forest,
					tobeLoad: false});
			}},
			(this.context as AnContextType).error);

		this.editForm = undefined;
	}

	toAddChild (e: React.MouseEvent<HTMLElement>, colx?: number) {
		e.stopPropagation();
		let that = this;

		let me = e.currentTarget.getAttribute("data-me");

		this.editForm = (
			<SimpleForm crud={CRUD.c} uri={this.props.uri}
				mtabl={this.props.mtabl}
				pk={this.props.pk} fields={this.props.fields}
				pkval={undefined} parent={this.props.parent} parentId={me}
				title={this.props.detailFormTitle || 'Add Tree Node'}
				onClose={() => {that.editForm = undefined; that.setState({}); }}
				onOk={() => {that.editForm = undefined; that.toSearch(); }}
			/> );
		this.setState({});
	}

	toDel(e: React.MouseEvent<HTMLElement>) {
		e.stopPropagation();
		let me = e.currentTarget.getAttribute("data-me");
		if (me) this.removeNode(me);
	}

	/**
	 * Hook: delete a node. Default: remove it (and its subtree) from the forest held in state.
	 * @since 0.8.0
	 */
	removeNode(id: string) {
		this.setState({forest: removeNode(this.state.forest, id)});
	}

	/**
	 * Hook: a node has been moved among its siblings (by TreeCard's up / down).
	 * Default: re-render. (Before 0.8.0, a move opened the edit form.)
	 * @since 0.8.0
	 */
	onMoved(_n?: AnTreeNode, _p?: AnTreeNode, _from?: number, _to?: number) {
		this.setState({});
	}

	/**
	 * Hook: visual type of a node.
	 * Default: TreeNodeVisual[node.nodetype], or card.
	 * @since 0.8.0
	 */
	visualOf(tnode: AnTreeNode): TreeNodeVisual {
		return TreeNodeVisual[tnode.node.nodetype as keyof typeof TreeNodeVisual] ?? TreeNodeVisual.card;
	}

	/**
	 * Hook: the title shown in a folder (section) head.
	 * Default: node.text.
	 * @since 0.8.0
	 */
	sectionTitle(tnode: AnTreeNode): React.ReactNode {
		return tnode.node.text as React.ReactNode;
	}

	/**
	 * Hook: action buttons of a row. Default: undefined, i.e. the built-in Edit / Delete / New.
	 * @since 0.8.0
	 */
	rowActions(_tnode: AnTreeNode): React.ReactNode | undefined {
		return undefined;
	}

	toEditCard(e: React.UIEvent<HTMLElement>) {
		e.stopPropagation();
		let that = this;

		let me = e.currentTarget.getAttribute("data-me");
		let parentId = e.currentTarget.getAttribute("data-parent");

		this.editForm = (
			this.props.editorForm &&
			this.props.editorForm(this, this.props, me, this.refresh) ||
			<SimpleForm crud={CRUD.u} uri={this.props.uri}
				mtabl={this.props.mtabl}
				fields={this.props.fields}
				pkval={{pk: this.props.pk, v: me}} parent={this.props.parent} parentId={parentId}
				title={this.props.detailFormTitle || 'Edit Tree Node'}
				onClose={() => {that.editForm = undefined; that.setState({}) }}
				onOk={this.refresh}
			/> );
		this.setState({});
	}

	refresh(root: string): void {
		let {uri, sk} = this.props;
		let that = this;
		(this.context as AnContextType).uiHelper
			.rebuildTree({uri, sk, rootId: root}, () => that.toSearch());
	}

	/**
	 * @param compOts
	 */
	treeNodes(compOts: CompOpts) {
		let { classes } = compOts;

		// there are different ways to load a tree
		let f = this.props.forest || this.treetier?.forest || this.state.forest;

		return (<div className={classes?.forest}>{this.buildTreegrid(f, undefined, compOts)}</div>);
	}

	/**
	 * Render a node or a forest. Folders: visual type collapsable, or a card having children.
	 * Children of a collapsed folder are not rendered.
	 * @since 0.8.0 a method (was a closure in treeNodes)
	 */
	buildTreegrid(tnode: AnTreeNode | AnTreeNode[], parent: AnTreeNode | undefined, compOpts: CompOpts): React.ReactNode {
		if (Array.isArray(tnode))
			return tnode.map((i) => this.buildTreegrid(i, parent, compOpts));
		if (!tnode) return undefined;

		let { classes, media } = compOpts;
		classes = classes || {};
		media = media || {isMd: true};

		tnode.node.css = tnode.node.css || {};

		let ntype = this.visualOf(tnode);
		if (ntype === TreeNodeVisual.hide)
			return undefined;

		if (ntype === TreeNodeVisual.collapsable
			|| ntype === TreeNodeVisual.card && tnode.node.children?.length || 0 > 0) {
			return (
			  <div key={tnode.id} className={classes.folder}>
				{ this.folderHead(this.props.columns, tnode, classes, media) }
				<Collapse in={!!tnode.node.expandChildren} timeout="auto" unmountOnExit>
					{this.buildTreegrid(tnode.node.children || [], tnode, compOpts)}
				</Collapse>
			  </div>
			);
		}
		return this.renderLeaf(tnode, parent, compOpts);
	}

	/**
	 * Hook: render a leaf node.
	 * Default: TreeGallary, TreeCard, or props.nodeFormatter for other types.
	 * @since 0.8.0
	 */
	renderLeaf(tnode: AnTreeNode, parent: AnTreeNode | undefined, compOpts: CompOpts): React.ReactNode {
		let { media } = compOpts;
		let ntype = this.visualOf(tnode);
		let indentSettings = {...defltIcons, ...this.props.indentIcons};

		if (ntype === TreeNodeVisual.gallery) {
			if (!this.props.docuri)
				throw Error("Since 0.6.0, gallery nodes require doc-uri, separate to func-uri, for loading media files.");
			return (
			  <TreeGallary {...this.props} // it should be forced to use anonymouse properties as the first one (props.tnode here is different to tnode)
				docuri={this.props.docuri}
				lightbox={this.props.lightbox}
				key={tnode.id} tier={this.treetier as StreeTier}
				tnode={tnode} media={media}
				parent={parent}
				indentSettings={indentSettings}
				delete={this.toDel}
				onUpdate={this.onMoved}
			  />);
		}
		if (ntype === TreeNodeVisual.card)
			return (
			  <TreeCard {...this.props}
				key={tnode.id} tier={this.treetier as StreeTier}
				tnode={tnode} media={media}
				parent={parent}
				toEdit={this.toEditCard}
				indentSettings={indentSettings}
				delete={this.toDel}
				onUpdate={this.onMoved}
			  />);
		return this.props.nodeFormatter
			? this.props.nodeFormatter(tnode, parent, compOpts)
			: <React.Fragment key={tnode.id}>{`Unhandled tnode, id: ${tnode.id}, visual type: ${ntype}`}</React.Fragment>;
	}

	folderHead( columns=[] as AnTreegridCol[], treenode: AnTreeNode, classes: ClassNames, media: Media) {
	  let that = this;
	  let n = treenode.node;
	  n.css = n.css || {};
	  let expd = !!n.expandChildren;

	  return (
		<div
			onClick={(_e) => {
				n.expandChildren = !n.expandChildren;
				that.setState({})
			}}
			data-nid={treenode.id}
			className={classes.folderHead}
		>
		  <Grid container spacing={0} key={treenode.id} >
			{columns
				.filter( v => v.hide != true)
				.map( (col: AnTreegridCol, ix: number) => {
					if (ix == 0) // row head
					  return (
						hide(col.grid, media) ? undefined :
						<Grid key={`${treenode.id}.${ix}`} size={gridSize(col.grid)} >
							{/* div: sectionTitle() may render blocks */}
							<Typography noWrap variant='body2' component='div' >
							{levelIcons(
								that.props.indentSettings,
								treenode.indents as IndentName[])}
							{expd ? icon(that.props.indentIcons, "expand", 0)
								: icon(that.props.indentIcons, "collapse", 0)}
							{that.sectionTitle(treenode)}
							</Typography>
						</Grid>);
					else if (col.type === 'actions')
					  return (
						hide(col.grid, media) ? undefined :
						<Grid key={`${treenode.id}.${ix}`} className={classes.actions}>
							<Typography noWrap variant='body2' onClick={(e) => e.stopPropagation()}>
							  {that.rowActions(treenode) ?? <>
								<Button onClick={that.toEditCard}
									data-me={treenode.id}
									startIcon={<JsampleIcons.Edit />} color="primary" >
									{media.isMd && L('Edit')}
								</Button>
								<Button onClick={that.toDel} data-me={treenode.id}
									startIcon={<JsampleIcons.Delete />} color="secondary" >
									{media.isMd && L('Delete')}
								</Button>
								{n.nodetype === TreeNodeVisual[TreeNodeVisual.collapsable] &&
									<Button onClick={that.toAddChild}
										data-me={treenode.id} data-parent={n.parent}
										startIcon={<JsampleIcons.ListAdd />} color="primary" >
										{media.isMd && L('New')}
									</Button>}
							  </>}
							</Typography>
						</Grid>
						);
					else if (col.type === 'formatter' || col.formatter)
					  return (
						hide(col.grid, media) ? undefined :
						<Grid key={`${treenode.id}.${ix}`} size={gridSize(col.grid)} >
							<Typography variant='body2' >
							  {col?.formatter?.(col, treenode, {classes, media}) as ReactNode}
							</Typography>
						</Grid>);
					else
					  return (
						hide(col.grid, media) ? undefined :
						<Grid key={`${treenode.id}.${ix}`} size={gridSize(col.grid)} >
							<Typography noWrap variant='body2' >
							{formatFolderDesc(treenode, media)}
							</Typography>
						</Grid>);
				}) }
		  </Grid>
		</div>
		);

		function formatFolderDesc(tnode: AnTreeNode, media: Media) {
			let {text, children} = tnode.node;

			if (children)
				children = `[${media.isMd ? 'children' : ''} ${children.length}]` as unknown as AnTreeNode[];
			else children = [];

			return `${media.isXl ? text : ''} ${children}`;
		}
	}

	render() {
		let { classes, width } = this.props;
		classes = classes || ({} as ClassNames);

		let media = CrudCompW.getMedia(width);

		if (this.props.reload && this.state.tobeLoad) {
			this.toSearch();
			this.state.tobeLoad = false;
		}

		return (
			<div className={classes.root}>
        		{AnTreegridComp.th(this.props.columns, classes, media, {onThClick: this.toAddChild})}
				{this.treeNodes({classes: classes, media})}
				{this.editForm}
			</div>
		);
	}
}
AnTreeditorComp.contextType = AnContext;

/**
 * Supported ColTypes: text, action, formatter (AnlistColAttrs.fomatter)
 *
 * Supported node type: {@link TreeNodeVisual.card} & {@link TreeNodeVisual.gallery}.
 */
const AnTreeditor = withStyles<any, any, TreeItemProps>(treeditorStyles)(withWidth()(AnTreeditorComp));

export { TreeCard, TreeCardComp, TreeGallary, TreeGallaryComp, AnTreeditor, AnTreeditorComp }
