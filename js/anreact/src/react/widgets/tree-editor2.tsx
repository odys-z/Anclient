import React, {ReactNode} from "react";

import withStyles from "@material-ui/core/styles/withStyles";
import withWidth from "@material-ui/core/withWidth";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Collapse from "@material-ui/core/Collapse";
import Typography from "@material-ui/core/Typography";


import { CRUD, AnTreeNode, AnlistColAttrs, AnTreeIconsType,
	UIComponent, toBool, IndentIcons, IndentIconame, defltIcons, StreeTier, AnsonMsg, AnDatasetResp
} from "@anclient/semantier";

import { GalleryView } from "./gallery-view";
import { PropTypes, Theme } from "@material-ui/core";
import { AnTablistProps } from "./table-list";
import { CrudCompW, DetailFormW } from "../crud";
import { swap } from "../../utils/lang-ext";
import { AnReactExt, ClassNames, CompOpts, Media, hide } from "../anreact";
import { JsampleIcons } from "../../jsample/styles";
import { AnTreeIcons } from "./tree";
import { AnContext, AnContextType } from "../reactext";
import { SimpleForm } from "./simple-form";
import { L } from "../../utils/langstr";

import { photos as _photos } from "./res/temp-photos";

const styles = (theme: Theme) => ({
  root: {
	width: "100%",
  },
  row: {
	width: "100%",
	"& :hover": {
	  backgroundColor: "#ced"
	}
  },
  rowHead: {
	padding: theme.spacing(1),
	paddingTop: 0,
	paddingBottom: 0,
  },
  folder: {
	width: "100%"
  },
  folderHead: {
	padding: theme.spacing(1),
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
  treeItem: {
	padding: theme.spacing(1),
	paddingTop: 0,
	paddingBottom: 0,
	borderLeft: "1px solid #bcd",
  },
  smallBtn: {
	  minWidth: 24,
  },
  th: {
	  textAlign: 'center' as const,
	  borderBottom: '1px solid #bcd'
  },
  rowText: {
	textShadow: '2px 2px 8px #112244'
  },
  galleryHead: {
	padding: theme.spacing(1),
  }
});

interface TreecardProps extends AnTablistProps {
	indentSettings?: IndentIcons;
	// lastSibling: boolean; 
	parent: AnTreeNode;
	tnode: AnTreeNode;
};

interface CssTreeItem extends React.CSSProperties {
    align: string
}


export enum TreeNodeVisual {
	/** data item presented by {@link TreeCard} */
	card,
	/** container */
	gallery,
	/** invisible */
	hide,
	/** e.g. a container */
	collapsable
};

export interface AnreactreeItem {
	node: AnTreeNode;
	toUp    : (e: React.MouseEvent<HTMLElement>) => void;
	toTop   : (e: React.MouseEvent<HTMLElement>) => void;
	toDown  : (e: React.MouseEvent<HTMLElement>) => void;
	toBottom: (e: React.MouseEvent<HTMLElement>) => void;

	/** or just move to AnTreeReact and calculate with java? */
	levelIcons?: Array<AnTreeIconsType>;

	/** format leading icons, according node.level */
	leadingIcons: () => JSX.Element | JSX.Element[];
}

class TreeCardComp extends DetailFormW<TreecardProps> implements AnreactreeItem {
	state = {
		showCarousel: false,
		expand: false
	}

	vistype: TreeNodeVisual;

	node: AnTreeNode & {indentIcons?: IndentIconame[]};

	constructor(props: TreecardProps) {
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
			// children.swap(me, elder);
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
			// children.swap(me, 0);
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
			// children.swap(me, younger);
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
			// children.swap(me, children.length - 1);
			swap(children, me, children.length - 1);
		if (typeof this.props.onUpdate === 'function')
			this.props.onUpdate(n, p, me, children.length);
	}

	leadingIcons () {
		let tnode = this.props.tnode;
		let n = tnode.node;
		return TreeCardComp.levelIcons(this.props.indentSettings, tnode.indents);
			// n.css?.icon, islastSibling, n.children?.length > 0, this.state.expand, tnode)
	}

	// TODO merge with treegrid
	/**
	 * 
	 * @see {@link IndentIconame}
	 * @param iconNames 
	 * @param lvlIcons 
	 * @param itemIcon 
	 * @param lastSibling 
	 * @param hasChildren 
	 * @param expand 
	 * @returns indent fragment
	 */
	static levelIcons(iconNames: IndentIcons, lvls: IndentIconame[]) {
		return (<React.Fragment >
				{lvls && lvls.map( (i, x) => TreeCardComp.icon(iconNames, i, x) )}
			</React.Fragment>);
	}

	static icon(iconNames: IndentIcons, name: AnTreeIconsType | IndentIconame, k: string | number) {
		let icon = AnTreeIcons[(iconNames || defltIcons)[name || 'deflt']]
				|| AnTreeIcons[name]; // extend to all supported icons
		if (!icon)
			console.error(`Icon name, ${name}, is not one of supported names.`, defltIcons);
		return React.cloneElement(icon, {key: k});
	}

	static actionFragment(tnode: AnTreeNode, fragKey: string | number, handler, props: TreecardProps) {
		let {col, classes, media} = props;
		let parentId = tnode.parent;
		<Grid key={`${tnode.id}.${fragKey}`} item {...col.grid} className={classes.treeItem}>
			<JsampleIcons.Up onClick={handler.toUp} />
			<JsampleIcons.Down onClick={handler.toDown} />
			{media.isMd ?
			  <><Button onClick={handler.toEdit}
					data-me={tnode.id} data-parent={parentId}
					startIcon={<JsampleIcons.Edit />} color="primary" >
					{L('Edit')}
					</Button>
					<Button onClick={handler.toDel}
					data-me={tnode.id} data-parent={parentId}
					startIcon={<JsampleIcons.Delete />} color="secondary" >
					{L('Delete')}
					</Button>
			  </>
			  :
			  <><JsampleIcons.Edit onClick={handler.toEdit}
					className={classes.smallBtn}
					data-me={tnode.id} data-parent={parentId}
					color='primary'
				/>
					<JsampleIcons.Delete onClick={handler.toDel}
					className={classes.smallBtn}
					data-me={tnode.id} data-parent={parentId}
					color='secondary'
				/>
			  </>
			}
		</Grid> 
	} 

	render() {
		let that = this;
		let tnode = this.props.tnode;
		let n = tnode.node;
		n.css = n.css || {};
		let { classes, media } = this.props;

		return (
		  <Grid container
				key={tnode.id}
				spacing={0}
				onClick={this.props.conClick}
				className={classes.row} >
			{ this.props.columns
				.filter( (v: AnlistColAttrs<JSX.Element, CompOpts>) => toBool(v.visible, true) )
				.map( (col: AnlistColAttrs<JSX.Element, CompOpts>, cx: number) => {
				  if (cx === 0) return (
					hide(col.grid, media) ? undefined :
					<Grid key={`${tnode.id}.${cx}`} item {...col.grid} className={classes.rowHead}>
						<Typography noWrap variant='body2'>
							{that.leadingIcons()}
							{n.text}
						</Typography>
					</Grid> );
				  else if (col.type === 'actions') return (
					hide(col.grid, media) ? undefined :
					TreeCardComp.actionFragment(tnode, cx, this, this.props)
					/*
					<Grid key={`${tnode.id}.${cx}`} item {...col.grid} className={classes.treeItem}>
						<JsampleIcons.Up onClick={this.toUp} />
						<JsampleIcons.Down onClick={this.toDown} />
						{media.isMd ?
							<><Button onClick={this.props.toEdit}
								data-me={tnode.id} data-parent={n.parentId}
								startIcon={<JsampleIcons.Edit />} color="primary" >
								{L('Edit')}
							  </Button>
							  <Button onClick={this.props.toDel}
								data-me={tnode.id} data-parent={n.parentId}
								startIcon={<JsampleIcons.Delete />} color="secondary" >
								{L('Delete')}
							  </Button>
							</>
							:
							<><JsampleIcons.Edit onClick={this.props.toEdit}
								className={classes.smallBtn}
								data-me={tnode.id} data-parent={n.parentId}
								color='primary'
							  />
							  <JsampleIcons.Delete onClick={this.props.toDel}
							  	className={classes.smallBtn}
								data-me={tnode.id} data-parent={n.parentId}
								color='secondary'
							  />
							</>
						}
					</Grid> */);
				  else return (
					// Note: return "true" will result in warning: 
					// Warning: Failed prop type: Invalid prop `children` supplied to `ForwardRef(Grid)`, expected a ReactNode.
					// hide(col.grid, media) ||
					hide(col.grid, media) ? undefined :
					<Grid key={`${tnode.id}.${cx}`} item {...col.grid} className={classes.treeItem}>
						{ typeof col.formatter === 'function' ?
							col.formatter(col, tnode) :
							<Typography noWrap variant='body2' align={align(n.css[col.field])} className={classes.rowText} >
								{n.text}
							</Typography>
						}
					</Grid> );
				} )
			}
		  </Grid> );

		function align(css: CssTreeItem): PropTypes.Alignment {
		  return css?.align ? css.align as PropTypes.Alignment : 'center';
		}
	}
}
TreeCardComp.contextType = AnContext;

const TreeCard = withStyles<any, any, TreecardProps>(styles)(withWidth()(TreeCardComp));
export { TreeCard, TreeCardComp }

class TreeGallaryComp extends TreeCardComp {
	// tier: AlbumTier;
	/** pic collection id */
	collect: string;

	toEditCard: ()=>void;
	galleref: GalleryView;

	constructor(props: TreecardProps) {
		super(props);
		this.vistype = TreeNodeVisual.gallery;

		// this.tier = props.tier as StreeTier;
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
		return (
		  <>
		  { this.galleryHead(that.props.columns, tnode, classes, media, onClick) }
		  <Collapse in={this.state.expand}>
			<GalleryView {... this.props} 
				aid={''}
				ref={undefined} // suppress type error
				uri={this.uri} media={this.props.media}
				cid={this.collect}
				// tier={this.tier}
				photos={node.children} // or fire a request to get photos?
			/>
		  </Collapse>
		  </>
		  );
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
		<Grid container spacing={0} key={tnode.id} >
		  {columns
			.filter( v => v.hide != true)
			.map( (col: AnTreegridCol, ix: number) => {
				if (ix == 0) // row head
					return (
					hide(col.grid, media) ? undefined :
					<Grid item key={`${tnode.id}.${ix}`} {...col.grid} >
						<Typography noWrap variant='body2' >
						{TreeCardComp.levelIcons(
							that.props.indentSettings,
							tnode.indents as IndentIconame[])}
						{expd ? TreeCardComp.icon(that.props.indentIcons, "pic-lib", 0)
							: TreeCardComp.icon(that.props.indentIcons, "collapse", 0)}
						{n.text}
						</Typography>
					</Grid>);
				else if (col.type === 'actions')
					return (
					hide(col.grid, media) ? undefined :
					TreeCardComp.actionFragment(tnode, ix, this, this.props)
					);
				else if (col.type === 'formatter' || col.formatter)
					return (
					hide(col.grid, media) ? undefined :
					<Grid item key={`${tnode.id}.${ix}`} {...col.grid} >
						<Typography variant='body2' >
							{col.formatter(col, tnode, {classes, media}) as ReactNode}
						</Typography>
					</Grid>);
				else
					return (
					hide(col.grid, media) ? undefined :
					<Grid item key={`${tnode.id}.${ix}`} {...col.grid} >
						{formatFolderDesc(tnode, col.grid, media)}
					</Grid>);
			}) }
		</Grid> 
		</div>
		);

		function formatFolderDesc(tnode: AnTreeNode, grid: {}, media: Media) {
			let n = tnode.node;

			return (
			  <Typography noWrap variant='body2' className={classes.rowText} >
				{hide(grid, media) ? undefined : `[${n.pname}]`}
				{ Number(n.img) > 0 &&
					[TreeCardComp.icon(that.props.indentIcons, "[]", 0),
					`x ${n.img}`] } 
				{ Number(n.geo) > 0 &&
					[TreeCardComp.icon(that.props.indentIcons, "!", 0),
					`x ${n.geo}`] } 
				{ Number(n.mov) > 0 &&
					[TreeCardComp.icon(that.props.indentIcons, ">", 0),
					`x ${n.mov}`] }
				{ Number(n.fav) > 0 &&
					[TreeCardComp.icon(that.props.indentIcons, "b", 0),
					`x ${n.fav}`] }
			  </Typography>);
		}
	}
}

const TreeGallary = withStyles<any, any, TreecardProps>(styles)(withWidth()(TreeGallaryComp));
export { TreeGallary, TreeGallaryComp }

interface AnTreeditorProps extends AnTablistProps {
	columns: Array<AnTreegridCol>;
	tier: StreeTier;

	reload: boolean;

	nodeFormatter?: (n: AnTreeNode, parent: ReactNode, opts: CompOpts) => JSX.Element;
}

interface AnTreegridCol extends AnlistColAttrs<JSX.Element, CompOpts> {
	/**
	 * Overide AnTablistProps#formatter
	 * Formatt a tree item cell/grid from col and node.
	 */
	colFormatter?: (col: AnlistColAttrs<JSX.Element, CompOpts>, n: AnTreeNode, opts?: CompOpts) => UIComponent;
}

class AnTreeditorComp2 extends DetailFormW<AnTreeditorProps> {
	state = {
		// window: undefined,
		// [{id, node: {text, css, url}, level, children}. ... ]
		forest: [] as AnTreeNode[],
		tobeLoad: true
	};

    sysName: '';
    window: Window;

    anReact: AnReactExt;
    editForm: JSX.Element;
	treetier: StreeTier;

	constructor(props: AnTreeditorProps) {
		super(props);
		this.sysName = props.sys || props.sysName || props.name || this.sysName;
		this.window = props.window;
		this.treetier = props.tier;

		this.th = this.th.bind(this);
		this.folderHead = this.folderHead.bind(this);
		this.toAddChild = this.toAddChild.bind(this);
		this.toEditCard = this.toEditCard.bind(this);
		this.treeNodes = this.treeNodes.bind(this);
		this.toSearch = this.toSearch.bind(this);
		this.refresh = this.refresh.bind(this);
	}

	componentDidMount() {
		console.log(this.props.uri);

		const ctx = this.context as unknown as AnContextType;
		this.anReact = ctx.uiHelper;
		this.treetier.client = this.anReact.client;
		if (this.props.reload && this.state.tobeLoad) {
			this.toSearch();
		}
	}

	toSearch() {
		let that = this;
		let { s_tree } = this.props;
		if (s_tree)
			throw Error("s_tree is used for defined tree semantics at client side - not supported yet.");

		let { uri, sk } = this.props;
		this.state.tobeLoad = false;
		this.treetier.stree({ uri, sk, uiHelper: this.context.uiHelper,
			onOk: (resp: AnsonMsg<AnDatasetResp>) => {
				that.setState({forest: resp.Body().forest});
			}},
			this.context.error);

		this.editForm = undefined;
	}

	toAddChild (e: React.MouseEvent<HTMLElement>) {
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
		let that = this;

		let me = e.currentTarget.getAttribute("data-me");
		this.setState({});
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
			.rebuildTree({uri, sk, rootId: root}, () => {
				that.toSearch();
			});
	}

	/**
	 * @param compOts
	 */
	treeNodes(compOts: CompOpts) {
		let { classes, media } = compOts;
		let that = this;

		let m = this.state.forest;
		let mtree = buildTreegrid( m, undefined, compOts );
		return (<div className={classes.forest}>{mtree}</div>);

		function buildTreegrid(tnode: AnTreeNode | AnTreeNode[],
				parent: AnTreeNode, compOpts: CompOpts) {
		  if (Array.isArray(tnode)) {
			return tnode.map((i, x) => {
			  // return buildTreegrid(i, parent, parent?.node && x === parent.node.children?.length - 1, compOts);
			  return buildTreegrid(i, parent, compOts);
			});
		  }
		  else if (tnode) {
			// tnode = incIndent(tnode, parent, isLastChild);
			tnode.node.css = tnode.node.css || {};

			// let ntype = tnode.node.nodetype || TreeNodeVisual[TreeNodeVisual.card];
			let ntype = TreeNodeVisual[tnode.node.nodetype] || TreeNodeVisual.card;
			if (ntype === TreeNodeVisual.card && tnode.node.children?.length > 0) {
			  return (
				<div key={tnode.id} className={classes.folder}>
				  { that.folderHead(that.props.columns, tnode, classes, media) }
				  { open &&
					<Collapse in={tnode.node.expandChildren} timeout="auto" unmountOnExit>
						{buildTreegrid(tnode.node.children, tnode, compOts)}
					</Collapse>
				  }
				</div>
			  );
			}
			else {
			  return (
				ntype === TreeNodeVisual.gallery ?
				<TreeGallary {...that.props} // it should be forced to use anonymouse properties as the first one (props.tnode here is different to tnode)  
					key={tnode.id} tier={that.treetier as StreeTier}
					tnode={tnode} media={media}
					parent={parent}
					indentSettings={Object.assign(defltIcons, that.props.indentIcons)}
					delete={that.toDel}
					onUpdate={that.toEditCard}
				  />
				: ntype === TreeNodeVisual.card ?
				<TreeCard {...that.props}
					key={tnode.id} tier={that.treetier as StreeTier}
					tnode={tnode} media={media}
					parent={parent}
					toEdit={that.toEditCard}
					indentSettings={Object.assign(defltIcons, that.props.indentIcons)}
					delete={that.toDel}
					onUpdate={that.toEditCard}
				  />
				: that.props.nodeFormatter
				? that.props.nodeFormatter(tnode, parent, compOpts)
				: <>Unhandled tnode, id: {tnode.id}, visual type: {ntype}</>
			  );
			}
		  }
		}
	}

	th( columns: Array<AnTreegridCol> = [],
		classes: ClassNames, media: Media ) {
		return (
			<Grid container className={classes.th} >
			{columns
				.filter( v => toBool(v.visible, true))
				.map( (col: AnTreegridCol, ix: number) => {
				  if (col.type === 'actions') return (
					<Grid item key={ix} {...col.grid}>
					  <Button onClick={this.toAddChild}
						data-me={undefined} date-parent={undefined}
						startIcon={<JsampleIcons.ListAdd />} color="primary" >
						{media.isMd && L('New')}
					  </Button>
					</Grid>);
				  else return (
					<Grid item key={ix} {...col.grid}>
						{col.label || col.field}
					</Grid>);
				} )
			}
			</Grid>);
	}

	folderHead( columns=[] as AnTreegridCol[], treenode: AnTreeNode, classes: ClassNames, media: Media) {
	  let that = this;
	  let n = treenode.node;
	  n.css = n.css || {};
	  // let indentIcons = this.props.indentIcons;
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
						<Grid item key={`${treenode.id}.${ix}`} {...col.grid} >
							<Typography noWrap variant='body2' >
							{TreeCardComp.levelIcons(
								that.props.indentSettings,
								treenode.indents as IndentIconame[])}
							{expd ? TreeCardComp.icon(that.props.indentIcons, "expand", 0)
								: TreeCardComp.icon(that.props.indentIcons, "collapse", 0)}
							{n.text}
							</Typography>
						</Grid>);
					else if (col.type === 'actions')
					  return (
						hide(col.grid, media) ? undefined :
						<Grid item key={`${treenode.id}.${ix}`} className={classes.actions}>
							<Typography noWrap variant='body2' >
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
							</Typography>
						</Grid>
						);
					else if (col.type === 'formatter' || col.formatter)
					  return (
						hide(col.grid, media) ? undefined :
						<Grid item key={`${treenode.id}.${ix}`} {...col.grid} >
							<Typography variant='body2' >
							  {col.formatter(col, treenode, {classes, media}) as ReactNode}
							</Typography>
						</Grid>);
					else
					  return (
						hide(col.grid, media) ? undefined :
						<Grid item key={`${treenode.id}.${ix}`} {...col.grid} >
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
		const { classes, width } = this.props;

		let media = CrudCompW.getMedia(width);

		if (this.props.reload && this.state.tobeLoad) {
			this.toSearch();
			this.state.tobeLoad = false;
		}

		return (
			<div className={classes.root}>
				{this.th(this.props.columns, classes, media)}
				{this.treeNodes({classes, media})}
				{this.editForm}
			</div>
		);
	}
}
AnTreeditorComp2.contextType = AnContext;

const AnTreeditor2 = withStyles<any, any, TreecardProps>(styles)(withWidth()(AnTreeditorComp2));
export { AnTreeditor2, AnTreeditorComp2, TreecardProps }
