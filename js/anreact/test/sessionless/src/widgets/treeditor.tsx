import React, {ReactNode} from "react";

import withStyles from "@material-ui/core/styles/withStyles";
import withWidth from "@material-ui/core/withWidth";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Collapse from "@material-ui/core/Collapse";
import Typography from "@material-ui/core/Typography";


import { CRUD, AnTreeNode, AnlistColAttrs, UIComponent, toBool } from "@anclient/semantier";

import GalleryView from "./gallery-view";
import { PropTypes, Theme } from "@material-ui/core";
import { AnTablistProps } from "../../../../src/react/widgets/table-list";
import { CrudCompW, DetailFormW } from "../../../../src/react/crud";
import { swap } from "../../../../src/utils/lang-ext";
import { AnReactExt, ClassNames, CompOpts, Media } from "../../../../src/react/anreact";
import { JsampleIcons } from "../../../../src/jsample/styles";
import { AnTreeIcons, AnTreeIconsType } from "../../../../src/react/widgets/tree";
import { AnContext, AnContextType } from "../../../../src/react/reactext";
import { SimpleForm } from "../../../../src/react/widgets/simple-form";
import { L } from "../../../../src/utils/langstr";
import { GalleryTier } from "./gallerytier-less";

import { photos as _photos } from "./temp-photos";
import { StreeTier } from "./stree-tier";

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
  },
  folder: {
	width: "100%"
  },
  folderHead: {
	padding: theme.spacing(1),
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
	borderLeft: "1px solid #bcd",
  },
  smallBtn: {
	  minWidth: 24,
  },
  th: {
	  textAlign: 'center' as const,
	  border: '1px solid red'
  },
  rowText: {
	marginTop: theme.spacing(1),
  }
});

/* experimental
const R_ = [
  {
	edit: 'a',
	add: 'x',
  },
  {
	edit: 'v',
  }
]

class R {
	static lang = 0;
	static edit = R_[R.lang].edit;
	static add  = R_[R.lang].add
}
*/

/**
 * Icons to compose tree item's indent, like indent of command npm ls:
 * @example
 * anclient/anreact
 	├─ anclient/anreact
	│  ├─ anclient/semantier
	│  ├─ babel/cli
	│  └─ webpack-cli
 	└─ anclient/super
       └─ webpack-cli
 * @see AnTreeIcons for icon value */
interface IndentIcons {
	/** e.g. "T" */
	expand?: string;
	/** e.g. "+" */
	collaps?: string;
	/** e.g. "|-" */
	child0?: AnTreeIconsType;
	/** e.g. "L" */
	childx?: AnTreeIconsType;
	/** e.g. "|" */
	vlink?: AnTreeIconsType;
	/** e.g. " " or "."? */
	spacex?: AnTreeIconsType;
	/** e.g. "-" */
	hlink?: AnTreeIconsType;
}

const defltIcons: IndentIcons = {expand: 'T', collaps: '+', child0: '|-', childx: 'L', vlink: '|', spacex: '.', hlink: '-'};

interface TreecardProps extends AnTablistProps {
	/** gallery, card, etc. */
	// vistype: TreeNodeVisual;

	indentStyle?: IndentIcons;

};

interface CssTreeItem extends React.CSSProperties {
    align: string
}

export enum TreeNodeVisual { card, gallary };

export interface AnreactreeItem {
	node: AnTreeNode;
	toUp    : (e: React.MouseEvent<HTMLElement>) => void;
	toTop   : (e: React.MouseEvent<HTMLElement>) => void;
	toDown  : (e: React.MouseEvent<HTMLElement>) => void;
	toBottom: (e: React.MouseEvent<HTMLElement>) => void;
	/** format leading icons, according node.level */
	leadingIcons: () => ReactNode[];

	/** or just move to AnTreeReact and calculate with java? */
	levelIcons?: Array<AnTreeIconsType>;
}

class TreeCardComp extends DetailFormW<TreecardProps> implements AnreactreeItem {
	state = {
		showCarousel: false
	}

	vistype: TreeNodeVisual;

	node: AnTreeNode;
	// newCard = undefined;
	indentIcons: AnTreeIconsType[] = [];

	constructor(props: TreecardProps) {
		super(props);
		this.vistype = TreeNodeVisual.card;
		
		this.toUp = this.toUp.bind(this);
		this.toDown = this.toDown.bind(this);
		this.toTop = this.toTop.bind(this);
		this.toDown = this.toDown.bind(this);

		this.leadingIcons = this.leadingIcons.bind(this);
	}

	toUp(e: React.MouseEvent<HTMLElement>) {
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

	toTop(e: React.MouseEvent<HTMLElement>) {
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

	toDown(e: React.MouseEvent<HTMLElement>) {
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

	toBottom(e: React.MouseEvent<HTMLElement>) {
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
		return TreeCardComp.levelIcons(this.indentIcons, this.node.level, this.props.expand, this.props.expIcon);
	}

	// TODO merge with treegrid
	static levelIcons(levelIcons: AnTreeIconsType[], level: number, expand: boolean, expIcon: string) {
		// let expand: boolean;
		// let expIcon: string;
		return (levelIcons ?
			levelIcons.map((v: string, x: number) => {
				return x === levelIcons.length - 1 && expand
					? expIcon ? <React.Fragment key={x}>{icon(expIcon || '+')}</React.Fragment>
							  : <React.Fragment key={x}>{icon('T')}</React.Fragment>
					: <React.Fragment key={x}>{icon(v)}</React.Fragment>;
			})
			: new Array(level + 1).fill(0).map((v, x) => {
				return x === level - 1 && expand
					? <React.Fragment key={x}>{AnTreeIcons[expIcon || 'T']}</React.Fragment>
					: <React.Fragment key={x}>{AnTreeIcons['.']}</React.Fragment>;
			}));

        function icon(iconame?: string) {
	        return AnTreeIcons[iconame || "deflt"];
        }
	}

	render() {
		let tnode = this.props.tnode;
		let n = tnode.node;
		n.css = n.css || {};
		let { classes } = this.props;
		return (
		  <Grid container
				key={tnode.id}
				spacing={0}
				className={classes.row} >
			{ this.props.columns
				.filter( (v: AnlistColAttrs<JSX.Element, CompOpts>) => toBool(v.visible || true) )
				.map( (col: AnlistColAttrs<JSX.Element, CompOpts>, cx: number) => {
					if (cx === 0) return (
						<Grid key={`${tnode.id}.${cx}`} item {...col.grid} className={classes.rowHead}>
							<Typography noWrap >
								{this.props.leadingIcons(tnode, false)}
								{icon(n.css.icon)}
								{n.text}
							</Typography>
						</Grid> );
					else if (col.type === 'actions') return (
						<Grid key={`${tnode.id}.${cx}`} item {...col.grid} className={classes.treeItem}>
							<JsampleIcons.Up onClick={this.toUp} />
							<JsampleIcons.Down onClick={this.toDown} />
							{this.props.media.isMd ?
								<> <Button onClick={this.props.toEdit}
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
								<> <JsampleIcons.Edit onClick={this.props.toEdit} className={classes.smallBtn}
										data-me={tnode.id} data-parent={n.parentId} color='primary' />
									<JsampleIcons.Delete onClick={this.props.toDel} className={classes.smallBtn}
										data-me={tnode.id} data-parent={n.parentId} color='secondary' />
								</>
							}
						</Grid> );
					else return (
						<Grid key={`${tnode.id}.${cx}`} item {...col.grid} className={classes.treeItem}>
							{ typeof col.formatter === 'function'
								? col.formatter(col, tnode) as ReactNode
								: <Typography noWrap variant='body2' align={align(n.css[col.field])} className={classes.rowText} >
									{n.text}
								</Typography>
							}
						</Grid> );
					} )
			}
		  </Grid> );

		function icon(icon: string) {
		  return AnTreeIcons[icon] || AnTreeIcons["deflt"];
		}

		function align(css: CssTreeItem): PropTypes.Alignment {
		  return css.align ? css.align as PropTypes.Alignment : 'center';
		}
	}
}
TreeCardComp.contextType = AnContext;

const TreeCard = withStyles<any, any, TreecardProps>(styles)(withWidth()(TreeCardComp));
export { TreeCard, TreeCardComp }

class TreeGallaryComp extends TreeCardComp {
	tier: GalleryTier;
	/** pic collection id */
	collect: string;

	constructor(props: TreecardProps) {
		super(props);
		this.vistype = TreeNodeVisual.gallary;

		this.tier = props.tier as GalleryTier;
		this.node = props.tnode;
	}

	// node: AnTreeNode;
	// toUp: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void;
	// toTop: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void;
	// toDown: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void;
	// toBottom: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void;

	render() {
		return (<GalleryView port='album' uri={this.uri} aid={this.collect}/>);
	}
}

const TreeGallary = withStyles<any, any, TreecardProps>(styles)(withWidth()(TreeGallaryComp));
export { TreeGallary, TreeGallaryComp }

interface AnTreeditorProps extends AnTablistProps {
	columns: Array<AnTreegridCol>;
	tier: StreeTier;
}

interface AnTreegridCol extends AnlistColAttrs<JSX.Element, CompOpts> {
	/**
	 * Overide AnTablistProps#formatter
	 * Formatt a tree item cell/grid from col and node.
	 */
	formatter?: (col: AnlistColAttrs<JSX.Element, CompOpts>, n: AnTreeNode, opts?: CompOpts) => UIComponent;
}

class AnTreeditorComp2 extends DetailFormW<AnTreeditorProps> {
	state = {
		// window: undefined,
		// [{id, node: {text, css, url}, level, children}. ... ]
		forest: [] as AnTreeNode[],

		expandings: new Set(),
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
		this.toExpandItem = this.toExpandItem.bind(this);
		this.toAddChild = this.toAddChild.bind(this);
		this.toEditCard = this.toEditCard.bind(this);
		this.treeNodes = this.treeNodes.bind(this);
		this.toSearch = this.toSearch.bind(this);
	}

	componentDidMount() {
		console.log(this.props.uri);

		const ctx = this.context as unknown as AnContextType;
		this.anReact = ctx.uiHelper;
		this.toSearch();
	}

	toSearch() {
		let { s_tree } = this.props;
		if (s_tree)
			throw Error("s_tree is used for defined tree semantics at client side - not supported yet.");

		let { uri, sk } = this.props;
		//this.anReact.stree({ uri, sk }, this);
		this.treetier.stree({ uri, sk }, this);

		this.editForm = undefined;
		this.state.expandings.clear();
	}

	toExpandItem(e: React.MouseEvent<HTMLElement>) {
		e.stopPropagation();
		let f = e.currentTarget.getAttribute("data-nid");

		let expandings = this.state.expandings;
		if (expandings.has(f)) expandings.delete(f);
		else expandings.add(f);
		this.setState({ expandings });
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

	toEditCard(e: React.MouseEvent<HTMLElement>) {
		e.stopPropagation();
		let that = this;

		let me = e.currentTarget.getAttribute("data-me");
		let parentId = e.currentTarget.getAttribute("data-parent");

		this.editForm = (
			<SimpleForm crud={CRUD.u} uri={this.props.uri}
				mtabl={this.props.mtabl}
				fields={this.props.fields}
				pkval={{pk: this.props.pk, v: me}} parent={this.props.parent} parentId={parentId}
				title={this.props.detailFormTitle || 'Edit Tree Node'}
				onClose={() => {that.editForm = undefined; that.setState({}) }}
				onOk={() => {
					let {uri, sk} = this.props;
					(this.context as unknown as AnContextType).uiHelper
                        .rebuildTree({uri, sk, rootId: me}, () => {
                            that.toSearch();
                        });
				}}
			/> );
		this.setState({});
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

		function buildTreegrid(tnode: AnTreeNode | AnTreeNode[], parent: AnTreeNode, compOpts: CompOpts) {


		  if (Array.isArray(tnode)) {
			return tnode.map((i, x) => {
			  return buildTreegrid(i, parent, compOts);
			});
		  }
		  else if (tnode) {
			let open = that.state.expandings.has(tnode.id)
					&& tnode.jnode.children && tnode.jnode.children.length > 0;
			tnode.jnode.css = tnode.jnode.css || {};

		  	console.log(TreeNodeVisual[tnode.jnode.nodetype]);

			if (that.props.isMidNode(tnode.jnode)) {
			  return (
				<div key={tnode.id} className={classes.folder}>
				  { that.folderHead(that.props.columns, tnode, open, classes, media) }
				  { open &&
					<Collapse in={open} timeout="auto" unmountOnExit>
						{buildTreegrid(tnode.jnode.children, tnode, compOts)}
					</Collapse>
				  }
				</div>
			  );
			}
			else 
			  return (
				tnode.jnode.nodetype === TreeNodeVisual[TreeNodeVisual.gallary]
				? <TreeGallary key={tnode.id} aid={tnode.id}
					tnode={tnode} media
					{...that.props} parent={parent}
					indentStyle={Object.assign(defltIcons, that.props.indentIcons)}
					delete={that.toDel}
					onUpdate={that.toEditCard}
				  />
				: <TreeCard key={tnode.id}
					tnode={tnode} media
					{...that.props} parent={parent}
					toEdit={that.toEditCard}
					indentStyle={Object.assign(defltIcons, that.props.indentIcons)}
					delete={that.toDel}
					onUpdate={that.toEditCard}
				  />
			  );
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

	folderHead(columns=[] as AnTreegridCol[], treenode: AnTreeNode, open: boolean, classes: ClassNames, media: Media) {
	  let that = this;
	  let tnode = treenode.jnode;
	  let n = tnode.node;
	  n.css = n.css || {};
	  return (
		<div
			onClick={this.toExpandItem}
			data-nid={tnode.id}
			className={classes.folderHead}
		>
		  <Grid container spacing={0} key={tnode.id} >
			{columns
				.filter( v => v.hide != true)
				.map( (col: AnTreegridCol, ix: number) => {
					if (ix == 0) // row head
					  return (
						<Grid item key={`${tnode.id}.${ix}`} {...col.grid} >
							<Typography noWrap variant='body2' >
							{TreeCardComp.levelIcons(that.props.leadingIcons, tnode.level, open, n.expandIcon)}
							{icon(n.css.icon)}
							{n.text}
							{open ? icon("expand") : icon("collapse")}
							</Typography>
						</Grid>);
					else if (col.type === 'actions')
					  return (
						<Grid item key={`${tnode.id}.${ix}`} className={classes.actions}>
							<Typography noWrap variant='body2' >
								<Button onClick={this.toEditCard}
									data-me={tnode.id}
									startIcon={<JsampleIcons.Edit />} color="primary" >
									{media.isMd && L('Edit')}
								</Button>
								<Button onClick={this.toDel} data-me={tnode.id}
									startIcon={<JsampleIcons.Delete />} color="secondary" >
									{media.isMd && L('Delete')}
								</Button>
								{( this.props.isMidNode ? this.props.isMidNode(n) : true )
								&& <Button onClick={this.toAddChild}
										data-me={tnode.id} data-parent={n.parent}
										startIcon={<JsampleIcons.ListAdd />} color="primary" >
										{media.isMd && L('New')}
								</Button>}
							</Typography>
						</Grid>
						);
					else if (col.type === 'formatter' || col.formatter)
					  return (
						<Grid item key={`${tnode.id}.${ix}`} {...col.grid} >
							<Typography variant='body2' >
							  {col.formatter(col, treenode, {classes, media}) as ReactNode}
							</Typography>
						</Grid>);
					else
					  return (
						<Grid item key={`${tnode.id}.${ix}`} {...col.grid} >
							<Typography variant='body2' >
							{formatFolderDesc(treenode, media)}
							</Typography>
						</Grid>);
				}) }
		  </Grid>
		</div>
		);

		function formatFolderDesc(tnode: AnTreeNode, media: Media) {
			let {text, children} = tnode.jnode;

			if (children)
				children = `[${media.isMd ? 'children' : ''} ${children.length}]` as unknown as AnTreeNode[];
			else children = [];

			return `${media.isXl ? text : ''} ${children}`;
		}

		function icon(icon: string) {
			return AnTreeIcons[icon || "deflt"];
		}
	}

	render() {
		const { classes, width } = this.props;

		let media = CrudCompW.getMedia(width);

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
