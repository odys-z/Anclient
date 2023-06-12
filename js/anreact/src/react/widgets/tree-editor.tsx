// import React, {ReactNode} from "react";

// import withStyles from "@material-ui/core/styles/withStyles";
// import withWidth from "@material-ui/core/withWidth";
// import Grid from "@material-ui/core/Grid";
// import Button from "@material-ui/core/Button";
// import Collapse from "@material-ui/core/Collapse";
// import Typography from "@material-ui/core/Typography";

// import { CRUD, AnTreeNode, AnlistColAttrs, UIComponent, toBool } from "@anclient/semantier";

// import { L } from '../../utils/langstr';
// import { AnContext, AnContextType } from '../reactext';
// import { AnTreeIcons } from './tree'
// import { CrudCompW, DetailFormW } from '../crud';
// import { JsampleIcons } from '../../jsample/styles';

// import { SimpleForm } from './simple-form';
// import { AnReactExt, ClassNames, CompOpts, Media } from "../anreact";
// import { PropTypes, Theme } from "@material-ui/core";
// import { AnTablistProps } from "./table-list";
// import { swap } from "../../utils/lang-ext";

// const styles = (theme: Theme) => ({
//   root: {
// 	width: "100%",
//   },
//   row: {
// 	width: "100%",
// 	"& :hover": {
// 	  backgroundColor: "#ced"
// 	}
//   },
//   rowHead: {
// 	padding: theme.spacing(1),
//   },
//   folder: {
// 	width: "100%"
//   },
//   folderHead: {
// 	padding: theme.spacing(1),
// 	borderBottom: "1px solid #bcd",
// 	borderTop: "1px solid #bcd",
// 	"& :hover": {
// 	  backgroundColor: "#ccc"
// 	}
//   },
//   forest: {
// 	  height: '90vh',
//   },
//   treeItem: {
// 	padding: theme.spacing(1),
// 	borderLeft: "1px solid #bcd",
//   },
//   smallBtn: {
// 	  minWidth: 24,
//   },
//   th: {
// 	  textAlign: 'center' as const,
// 	  border: '1px solid red'
//   },
//   rowText: {
// 	marginTop: theme.spacing(1),
//   }
// });

// interface TreecardProps extends AnTablistProps {
// 	/**Used as default rows - data is bound by TreeEditor itself. */
// 	// rows : Tierec[];
// };

// interface CssTreeItem extends React.CSSProperties {
//     align: string
// }

// class TreeCardComp extends DetailFormW<TreecardProps> {
// 	state = {
// 		node: {},
// 	}

// 	newCard = undefined;

// 	constructor(props: TreecardProps) {
// 		super(props);

// 		// this.state.tnode = props.tnode;
// 		this.toUp = this.toUp.bind(this);
// 		this.toDown = this.toDown.bind(this);
// 		this.toTop = this.toTop.bind(this);
// 		this.toDown = this.toDown.bind(this);
// 	}

// 	toUp(e: React.MouseEvent<HTMLElement>) {
// 		let p = this.props.parent;
// 		let n = this.props.tnode;
// 		let children = p.node.children;
// 		let me = children.indexOf(n);
// 		let elder = me - 1;
// 		if (elder >= 0)
// 			// children.swap(me, elder);
// 			swap(children, me, elder);

// 		if (typeof this.props.onUpdate === 'function')
// 			this.props.onUpdate(n, p, me, elder);
// 	}

// 	toTop(e: React.MouseEvent<HTMLElement>) {
// 		let p = this.props.parent;
// 		let n = this.props.tnode;
// 		let children = p.node.children;
// 		let me = children.indexOf(n);
// 		if (me > 0)
// 			// children.swap(me, 0);
// 			swap(children, me, 0);

// 		if (typeof this.props.onUpdate === 'function')
// 			this.props.onUpdate(n, p, me, 0);
// 	}

// 	toDown(e: React.MouseEvent<HTMLElement>) {
// 		let p = this.props.parent;
// 		let n = this.props.tnode;
// 		let children = p.node.children;
// 		let me = children.indexOf(n);
// 		let younger = me + 1;
// 		if (younger < children.length)
// 			// children.swap(me, younger);
// 			swap(children, me, younger);

// 		if (typeof this.props.onUpdate === 'function')
// 			this.props.onUpdate(n, p, me, younger);
// 	}

// 	toBottom(e: React.MouseEvent<HTMLElement>) {
// 		let p = this.props.parent;
// 		let n = this.props.tnode;
// 		let children = p.node.children;
// 		let me = children.indexOf(n);
// 		if (me < children.length - 1)
// 			// children.swap(me, children.length - 1);
// 			swap(children, me, children.length - 1);
// 		if (typeof this.props.onUpdate === 'function')
// 			this.props.onUpdate(n, p, me, children.length);
// 	}

// 	render() {
// 		let tnode = this.props.tnode;
// 		let n = tnode.node;
// 		n.css = n.css || {};
// 		let { classes } = this.props;
// 		return (
// 		  <Grid container
// 				key={tnode.id}
// 				spacing={0}
// 				className={classes.row} >
// 			{ this.props.columns
// 				.filter( (v: AnlistColAttrs<JSX.Element, CompOpts>) => toBool(v.visible || true) )
// 				.map( (col: AnlistColAttrs<JSX.Element, CompOpts>, cx: number) => {
// 					if (cx === 0) return (
// 						<Grid key={`${tnode.id}.${cx}`} item {...col.grid} className={classes.rowHead}>
// 							<Typography noWrap >
// 								{this.props.leadingIcons(tnode, false)}
// 								{icon(n.css.icon)}
// 								{n.text}
// 							</Typography>
// 						</Grid> );
// 					else if (col.type === 'actions') return (
// 						<Grid key={`${tnode.id}.${cx}`} item {...col.grid} className={classes.treeItem}>
// 							<JsampleIcons.Up onClick={this.toUp} />
// 							<JsampleIcons.Down onClick={this.toDown} />
// 							{this.props.media.isMd ?
// 								<> <Button onClick={this.props.toEdit}
// 										data-me={tnode.id} data-parent={n.parentId}
// 										startIcon={<JsampleIcons.Edit />} color="primary" >
// 										{L('Edit')}
// 									</Button>
// 									<Button onClick={this.props.toDel}
// 										data-me={tnode.id} data-parent={n.parentId}
// 										startIcon={<JsampleIcons.Delete />} color="secondary" >
// 										{L('Delete')}
// 									</Button>
// 								</>
// 								:
// 								<> <JsampleIcons.Edit onClick={this.props.toEdit} className={classes.smallBtn}
// 										data-me={tnode.id} data-parent={n.parentId} color='primary' />
// 									<JsampleIcons.Delete onClick={this.props.toDel} className={classes.smallBtn}
// 										data-me={tnode.id} data-parent={n.parentId} color='secondary' />
// 								</>
// 							}
// 						</Grid> );
// 					else return (
// 						<Grid key={`${tnode.id}.${cx}`} item {...col.grid} className={classes.treeItem}>
// 							{ typeof col.formatter === 'function'
// 								? col.formatter(col, tnode) as ReactNode
// 								: <Typography noWrap variant='body2' align={align(n.css[col.field])} className={classes.rowText} >
// 									{n.text}
// 								</Typography>
// 							}
// 						</Grid> );
// 					} )
// 			}
// 		  </Grid> );

// 		function icon(icon: string) {
// 		  return AnTreeIcons[icon] || AnTreeIcons["deflt"];
// 		}

// 		function align(css: CssTreeItem): PropTypes.Alignment {
// 		  return css.align ? css.align as PropTypes.Alignment : 'center';
// 		}
// 	}
// }
// TreeCardComp.contextType = AnContext;

// const TreeCard = withStyles<any, any, TreecardProps>(styles)(withWidth()(TreeCardComp));
// export { TreeCard, TreeCardComp }

// interface AnTreeditorProps extends AnTablistProps {
// 	columns: Array<AnTreegridCol>;
// }

// interface AnTreegridCol extends AnlistColAttrs<JSX.Element, CompOpts> {
// 	/**
// 	 * Overide AnTablistProps#formatter
// 	 * Formatt a tree item cell/grid from col and node.
// 	 */
// 	formatter?: (col: AnlistColAttrs<JSX.Element, CompOpts>, n: AnTreeNode, opts?: CompOpts) => UIComponent;
// }

// class AnTreeditorComp extends DetailFormW<AnTreeditorProps> {
// 	state = {
// 		// window: undefined,
// 		// [{id, node: {text, css, url}, level, children}. ... ]
// 		forest: [] as AnTreeNode[],

// 		expandings: new Set(),

//         sysName: '',
//         window: Window
// 	};

//     anReact: AnReactExt;
//     addForm: JSX.Element;
//     toDelCard: any; // FIXME bug by type checking
//     onUpdate: any;  // FIXME bug by type checking

// 	constructor(props: TreecardProps) {
// 		super(props);
// 		this.state.sysName =
// 			props.sys || props.sysName || props.name || this.state.sysName;
// 		this.state.window = props.window;

// 		this.th = this.th.bind(this);
// 		this.folderHead = this.folderHead.bind(this);
// 		this.toExpandItem = this.toExpandItem.bind(this);
// 		this.toAddChild = this.toAddChild.bind(this);
// 		this.toEdit = this.toEdit.bind(this);

// 		this.leadingIcons = this.leadingIcons.bind(this);
// 		this.treeNodes = this.treeNodes.bind(this);

// 		this.toSearch = this.toSearch.bind(this);
// 	}

// 	componentDidMount() {
// 		console.log(this.props.uri);

// 		const ctx = this.context as unknown as AnContextType;
// 		this.anReact = ctx.uiHelper;
// 		this.toSearch();
// 	}

// 	toSearch() {
// 		let { s_tree } = this.props;
// 		if (s_tree)
// 			throw Error("s_tree is used for defined tree semantics at client side - not supported yet.");

// 		let { uri, sk } = this.props;
// 		this.anReact.stree({ uri, sk }, this);

// 		this.addForm = undefined;
// 		this.state.expandings.clear();
// 	}

// 	toExpandItem(e: React.MouseEvent<HTMLElement>) {
// 		e.stopPropagation();
// 		let f = e.currentTarget.getAttribute("data-nid");

// 		let expandings = this.state.expandings;
// 		if (expandings.has(f)) expandings.delete(f);
// 		else expandings.add(f);
// 		this.setState({ expandings });
// 	}

// 	toAddChild (e: React.MouseEvent<HTMLElement>) {
// 		e.stopPropagation();
// 		let that = this;

// 		let me = e.currentTarget.getAttribute("data-me");

// 		this.addForm = (
// 			<SimpleForm crud={CRUD.c} uri={this.props.uri}
// 				mtabl={this.props.mtabl}
// 				pk={this.props.pk} fields={this.props.fields}
// 				pkval={undefined} parent={this.props.parent} parentId={me}
// 				title={this.props.detailFormTitle || 'Add Tree Node'}
// 				onClose={() => {that.addForm = undefined; that.setState({}); }}
// 				onOk={() => {that.addForm = undefined; that.toSearch(); }}
// 			/> );
// 		this.setState({});
// 	}

// 	toDel(e: React.MouseEvent<HTMLElement>) { }

// 	toEdit(e: React.MouseEvent<HTMLElement>) {
// 		e.stopPropagation();
// 		let that = this;

// 		let me = e.currentTarget.getAttribute("data-me");
// 		let parentId = e.currentTarget.getAttribute("data-parent");

// 		this.addForm = (
// 			<SimpleForm crud={CRUD.u} uri={this.props.uri}
// 				mtabl={this.props.mtabl}
// 				// pk={this.props.pk}
// 				fields={this.props.fields}
// 				pkval={{pk: this.props.pk, v: me}} parent={this.props.parent} parentId={parentId}
// 				title={this.props.detailFormTitle || 'Edit Tree Node'}
// 				onClose={() => {that.addForm = undefined; that.setState({}) }}
// 				onOk={() => {
// 					// Reshape in case fullpath has been changed.
// 					// DESIGN NOTE:
// 					// Is this a good reason that widgets shouldn't connected with datat tier?
// 					// Explaination:
// 					// 1. A simple UI form doesn't understand this special post updating data processing such as tree re-shaping.
// 					// 2. As the tree is loaded via port "stree", why saving items with general updating? Should this been wrapped into a component?
// 					// If a general purpose widget can't be good at handling data tier, is it resonable has an independant module for a samntics process, e.g. tree reshaping?

// 					// close as data saved, search later in case re-shape failed. (shouldn't be a transaction?)
// 					let {uri, sk} = this.props;
// 					(this.context as unknown as AnContextType).uiHelper
//                         .rebuildTree({uri, sk, rootId: me}, () => {
//                             that.toSearch();
//                         });
// 				}}
// 			/> );
// 		this.setState({});
// 	}

// 	// TODO merge with treegrid
// 	leadingIcons(treeItem, expand, expIcon) {
// 		return treeItem.levelIcons ?
// 			treeItem.levelIcons.map((v: string, x: React.Key) => {
// 				return x === treeItem.levelIcons.length - 1 && expand
// 					? expIcon ? <React.Fragment key={x}>{icon(expIcon || '+')}</React.Fragment>
// 							  : <React.Fragment key={x}>{icon('T')}</React.Fragment>
// 					: <React.Fragment key={x}>{icon(v)}</React.Fragment>;
// 			})
// 			: new Array(treeItem.level + 1).fill(0).map((v, x) => {
// 				return x === treeItem.level - 1 && expand
// 					? <React.Fragment key={x}>{AnTreeIcons[expIcon || 'T']}</React.Fragment>
// 					: <React.Fragment key={x}>{AnTreeIcons['.']}</React.Fragment>;
// 			})

//         function icon(iconame?: string) {
// 	        return AnTreeIcons[iconame || "deflt"];
//         }
// 	}

// 	/**
// 	 * @param compOts
// 	 */
// 	treeNodes(compOts: CompOpts) {
// 		let { classes, media } = compOts;
// 		let that = this;

// 		let m = this.state.forest;
// 		let mtree = buildTreegrid( m, undefined, compOts );
// 		return (<div className={classes.forest}>{mtree}</div>);

// 		function buildTreegrid(tnode: AnTreeNode | AnTreeNode[], parent: AnTreeNode, compOpts: CompOpts) {
// 		  if (Array.isArray(tnode)) {
// 			return tnode.map((i, x) => {
// 			  return buildTreegrid(i, parent, compOts);
// 			});
// 		  }
// 		  else if (tnode) {
// 			let open = that.state.expandings.has(tnode.id)
// 					&& tnode.node.children && tnode.node.children.length > 0;
// 			tnode.node.css = tnode.node.css || {};

// 			if (that.props.isMidNode(tnode.node)) {
// 			  return (
// 				<div key={tnode.id} className={classes.folder}>
// 				  { that.folderHead(that.props.columns, tnode, open, classes, media) }
// 				  { open &&
// 					<Collapse in={open} timeout="auto" unmountOnExit>
// 						{buildTreegrid(tnode.node.children, tnode, compOts)}
// 					</Collapse>
// 				  }
// 				</div>
// 			  );
// 			}
// 			else
// 			  return (
// 				<TreeCard key={tnode.id} tnode={tnode} media={media}
// 					{...that.props} parent={parent}
// 					toEdit={that.toEdit}
// 					leadingIcons={that.leadingIcons}
// 					delete={that.toDelCard}
// 					onUpdate={that.onUpdate} />
// 			  );
// 		  }
// 		}
// 	}

// 	th( columns: Array<AnTreegridCol> = [],
// 		classes: ClassNames, media: Media) {
// 		return (
// 			<Grid container className={classes.th} >
// 				{columns
// 					.filter( v => toBool(v.visible, true))
// 					.map( (col: AnTreegridCol, ix: number) => {
// 						if (col.type === 'actions') return (
// 							<Grid item key={ix} {...col.grid}>
// 								<Button onClick={this.toAddChild}
// 									data-me={undefined} date-parent={undefined}
// 									startIcon={<JsampleIcons.ListAdd />} color="primary" >
// 									{media.isMd && L('New')}
// 								</Button>
// 							</Grid>);
// 						else return (
// 							<Grid item key={ix} {...col.grid}>
// 								{col.label || col.field}
// 							</Grid>);
// 					} )
// 				}
// 			</Grid>);
// 	}

// 	folderHead(columns=[], tnode, open, classes, media) {
// 	  let n = tnode.node;
// 	  n.css = n.css || {};
// 	  return (
// 		<div
// 			onClick={this.toExpandItem}
// 			data-nid={tnode.id}
// 			className={classes.folderHead}
// 		>
// 		  <Grid container spacing={0} key={tnode.id} >
// 			{columns
// 				.filter( v => v.hide != true)
// 				.map( (col: AnTreegridCol, ix: number) => {
// 					if (ix == 0) // row head
// 					  return (
// 						<Grid item key={`${tnode.id}.${ix}`} {...col.grid} >
// 							<Typography noWrap variant='body2' >
// 							{this.leadingIcons(tnode, open, n.expandIcon)}
// 							{icon(n.css.icon)}
// 							{n.text}
// 							{open ? icon("expand") : icon("collapse")}
// 							</Typography>
// 						</Grid>);
// 					else if (col.type === 'actions')
// 					  return (
// 						<Grid item key={`${tnode.id}.${ix}`} className={classes.actions}>
// 							<Typography noWrap variant='body2' >
// 								<Button onClick={this.toEdit}
// 									data-me={tnode.id}
// 									startIcon={<JsampleIcons.Edit />} color="primary" >
// 									{media.isMd && L('Edit')}
// 								</Button>
// 								<Button onClick={this.toDel} data-me={tnode.id}
// 									startIcon={<JsampleIcons.Delete />} color="secondary" >
// 									{media.isMd && L('Delete')}
// 								</Button>
// 								{( this.props.isMidNode ? this.props.isMidNode(n) : true )
// 								&& <Button onClick={this.toAddChild}
// 										data-me={tnode.id} data-parent={n.parent}
// 										startIcon={<JsampleIcons.ListAdd />} color="primary" >
// 										{media.isMd && L('New')}
// 								</Button>}
// 							</Typography>
// 						</Grid>
// 						);
// 					else if (col.type === 'formatter' || col.formatter)
// 					  return (
// 						<Grid item key={`${tnode.id}.${ix}`} {...col.grid} >
// 							<Typography variant='body2' >
// 							  {col.formatter(col, tnode, {classes, media}) as ReactNode}
// 							</Typography>
// 						</Grid>);
// 					else
// 					  return (
// 						<Grid item key={`${tnode.id}.${ix}`} {...col.grid} >
// 							<Typography variant='body2' >
// 							{formatFolderDesc(tnode, media)}
// 							</Typography>
// 						</Grid>);
// 				}) }
// 		  </Grid>
// 		</div>
// 		);

// 		function formatFolderDesc(tnode, media) {
// 			let {text, children} = tnode.node;

// 			if (children)
// 				children = `[${media.isMd ? 'children' : ''} ${children.length}]`;
// 			else children = '';

// 			return `${media.isXl ? text : ''} ${children}`;
// 		}

// 		function icon(icon) {
// 			return AnTreeIcons[icon || "deflt"];
// 		}
// 	}

// 	render() {
// 		const { classes, width } = this.props;

// 		let media = CrudCompW.getMedia(width);

// 		return (
// 			<div className={classes.root}>
// 				{this.th(this.props.columns, classes, media)}
// 				{this.treeNodes({classes, media})}
// 				{this.addForm}
// 			</div>
// 		);
// 	}
// }
// AnTreeditorComp.contextType = AnContext;

// const AnTreeditor = withStyles<any, any, TreecardProps>(styles)(withWidth()(AnTreeditorComp));
// export { AnTreeditor, AnTreeditorComp, TreecardProps }
