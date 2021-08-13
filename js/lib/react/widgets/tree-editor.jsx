import React from "react";
import { withStyles } from "@material-ui/core/styles";
import withWidth from "@material-ui/core/withWidth";
import PropTypes from "prop-types";

import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Collapse from "@material-ui/core/Collapse";
import {
  Drafts, Inbox, Send, ExpandLess, ExpandMore, Sms
} from "@material-ui/icons";
import { Typography } from "@material-ui/core";

import { L } from '../../utils/langstr';
	import { AnContext } from '../reactext.jsx';
	import { AnTreeIcons } from "./tree"
	import { CrudCompW, DetailFormW } from '../crud';
	import { JsampleIcons } from '../../jsample/styles';

import { SimpleForm } from './simple-form';

const styles = (theme) => ({
  root: {
	// display: "flex",
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
	borderTop: "1px solid #bcd"
  },
  treeItem: {
	padding: theme.spacing(1),
	borderLeft: "1px solid #bcd",
  }
});

class TreeCardComp extends React.Component {
	state = {
		node: {},
	}

	newCard = undefined;

	constructor(props) {
		super(props);

		// this.state.tnode = props.tnode;
		this.toUp = this.toUp.bind(this);
		this.toDown = this.toDown.bind(this);
		this.toTop = this.toTop.bind(this);
		this.toDown = this.toDown.bind(this);
	}

	toUp(e) {
		let p = this.props.parent;
		let n = this.props.tnode;
		let children = p.node.children;
		let me = children.indexOf(n);
		let elder = me - 1;
		if (elder >= 0)
			children.swap(me, elder);

		if (typeof this.props.onUpdate === 'function')
			this.props.onUpdate(n, p, me, elder);
	}

	toTop(e) {
		let p = this.props.parent;
		let n = this.props.tnode;
		let children = p.node.children;
		let me = children.indexOf(n);
		if (me > 0)
			children.swap(me, 0);

		if (typeof this.props.onUpdate === 'function')
			this.props.onUpdate(n, p, me, 0);
	}

	toDown(e) {
		let p = this.props.parent;
		let n = this.props.tnode;
		let children = p.node.children;
		let me = children.indexOf(n);
		let younger = me + 1;
		if (younger < children.length)
			children.swap(me, younger);

		if (typeof this.props.onUpdate === 'function')
			this.props.onUpdate(n, p, me, younger);
	}

	toBottom(e) {
		let p = this.props.parent;
		let n = this.props.tnode;
		let children = p.node.children;
		let me = children.indexOf(n);
		if (me < children.length - 1)
			children.swap(me, children.length - 1);
		if (typeof this.props.onUpdate === 'function')
			this.props.onUpdate(n, p, me, children.length);
	}

	render() {
		let tnode = this.props.tnode;
		let n = tnode.node;
		n.css = n.css || {};
		let { classes, width } = this.props;
		return (
		  <Grid container
				key={tnode.id}
				spacing={0}
				className={classes.row} >
			{ this.props.columns.filter( v => v.hide !== true ).map( (col, cx) => {
			  if (cx === 0) return (
				<Grid key={`${tnode.id}.${cx}`} item {...col.cols} className={classes.rowHead}>
					<Typography noWrap variant='body2' >
						{this.props.leadingIcons(tnode, false)}
						{icon(n.css.icon)}
						{n.text}
					</Typography>
				</Grid> );
			  else if (col.type === 'actions') return (
				<Grid key={`${tnode.id}.${cx}`} item {...col.cols} className={classes.treeItem}>
					<JsampleIcons.Up onClick={this.toUp} />
					<JsampleIcons.Down onClick={this.toDown} />
					<Button onClick={this.props.toEdit}
						me={tnode.id} parent={n.parentId}
						startIcon={<JsampleIcons.Edit />} color="primary" >
						{this.props.media.isMd && L('Edit')}
					</Button>
				</Grid> );
			  else return (
				<Grid key={`${tnode.id}.${cx}`} item {...col.cols} className={classes.treeItem}>
					<Typography noWrap variant='body2' align={align(n.css[col.field])}>
						{n.text}
					</Typography>
				</Grid> );
			  } )
			}
		  </Grid> );

		function icon(icon, onClick) {
		  return AnTreeIcons[icon || "deflt"];
		}

		function align(css = {}) {
		  return css.align ? css.align : 'center';
		}
	}
}
TreeCardComp.contextType = AnContext;
TreeCardComp.propTypes = {
	media: PropTypes.object.isRequired,
	leadingIcons: PropTypes.func.isRequired,
	tnode: PropTypes.object.isRequired,
	parent: PropTypes.object.isRequired,
	columns: PropTypes.array.isRequired,
	toEdit: PropTypes.func.isRequired
};

const TreeCard = withWidth()(withStyles(styles)(TreeCardComp));
export { TreeCard, TreeCardComp }

class AnTreeditorComp extends React.Component {
	state = {
		// window: undefined,
		// [{id, node: {text, css, url}, level, children}. ... ]
		forest: [ ],

		expandings: new Set()
	};

	constructor(props) {
		super(props);
		this.state.sysName =
			props.sys || props.sysName || props.name || this.state.sysName;
		this.state.window = props.window;

		this.th = this.th.bind(this);
		this.folderHead = this.folderHead.bind(this);
		this.toExpandItem = this.toExpandItem.bind(this);
		this.toAddChild = this.toAddChild.bind(this);
		this.toEdit = this.toEdit.bind(this);

		this.leadingIcons = this.leadingIcons.bind(this);
		this.treeNodes = this.treeNodes.bind(this);

		this.toSearch = this.toSearch.bind(this);
	}

	componentDidMount() {
		console.log(this.props.uri);
		this.toSearch();
	}

	toSearch() {
		let { mtabl, columns, joins, wheres, s_tree } = this.props;
		if (s_tree)
			throw Error("s_tree is used for defined tree semantics at client side - not supported yet.");

		let pageInf = this.state.pageInf;
		let {uri, sk} = this.props;
		this.context.anReact.stree({uri, sk}, this.context.error, this);

		this.state.expandings.clear(0);
	}

	toExpandItem(e) {
		e.stopPropagation();
		let f = e.currentTarget.getAttribute("nid");

		let expandings = this.state.expandings;
		if (expandings.has(f)) expandings.delete(f);
		else expandings.add(f);
		this.setState({ expandings });
	}

	toAddChild (e) {
		e.stopPropagation();
		let that = this;

		let me = e.currentTarget.getAttribute("me");

		this.addForm = (
			<SimpleForm c uri={this.props.uri}
				mtabl={this.props.mtabl}
				pk={this.props.pk} fields={this.props.fields}
				pkval={undefined} parent={this.props.parent} parentId={me}
				title={this.props.detailFormTitle || 'Add Tree Node'}
				onClose={() => {that.addForm = undefined; that.toSearch({}) }}
				onOk={() => {that.addForm = undefined; }}
			/> );
		this.setState({});
	}

	toDel(e) { }

	toEdit(e) {
		e.stopPropagation();
		let that = this;

		let me = e.currentTarget.getAttribute("me");
		let parentId = e.currentTarget.getAttribute("parent");

		this.addForm = (
			<SimpleForm u uri={this.props.uri}
				mtabl={this.props.mtabl}
				pk={this.props.pk} fields={this.props.fields}
				pkval={me} parent={this.props.parent} parentId={parentId}
				title={this.props.detailFormTitle || 'Edit Tree Node'}
				onClose={() => {that.addForm = undefined; that.setState({}) }}
				onOk={() => {that.addForm = undefined; }}
			/> );
		this.setState({});
	}

	// TODO merge with treegrid
	leadingIcons(treeItem, expand, expIcon) {
		return treeItem.levelIcons ?
			treeItem.levelIcons.map((v, x) => {
				return x === treeItem.levelIcons.length - 1 && expand
					? expIcon ? <React.Fragment key={x}>{icon(expIcon || '+')}</React.Fragment>
							  : <React.Fragment key={x}>{icon('T')}</React.Fragment>
					: <React.Fragment key={x}>{icon(v)}</React.Fragment>;
			})
			: new Array(treeItem.level + 1).fill(0).map((v, x) => {
				return x === treeItem.level - 1 && expand
					? <React.Fragment key={x}>{AnTreeIcons[expIcon || 'T']}</React.Fragment>
					: <React.Fragment key={x}>{AnTreeIcons['.']}</React.Fragment>;
			})
	}

	/**
	 * @param {object} classes
	 */
	treeNodes(classes, media) {
		let that = this;
		// let isMd = media.isMd;

		let m = this.state.forest;
		let expandItem = this.toExpandItem;
		let mtree = buildTreegrid( m, classes );
		return mtree;

		function buildTreegrid(tnode, parent) {
		  if (Array.isArray(tnode)) {
			return tnode.map((i, x) => {
			  return buildTreegrid(i, parent);
			});
		  }
		  else {
			let open = that.state.expandings.has(tnode.id)
					&& tnode.node.children && tnode.node.children.length > 0;
			tnode.node.css = tnode.node.css || {};
			// if (tnode.node.children && tnode.node.children.length > 0) {
			if (that.props.isMidNode(tnode.node)) {
			  return (
				<div key={tnode.id} className={classes.folder}>
				  { that.folderHead(that.props.columns, tnode, open, classes, media) }
				  { open &&
					<Collapse in={open} timeout="auto" unmountOnExit>
						{buildTreegrid(tnode.node.children, tnode)}
					</Collapse>
				  }
				</div>
			  );
			}
			else
			  return (
				<TreeCard key={tnode.id} tnode={tnode} media={media}
					{...that.props}
					toEdit={that.toEdit}
					leadingIcons={that.leadingIcons}
					delete={that.toDelCard}
					onUpdate={that.onUpdate} />
			  );
		  }
		}
	}

	th(columns = [], classes, media) {
		return (
			<Grid container className={classes.th} >
				{columns.filter( v => v.hide !== true)
					.map( (col, ix) => {
						if (col.type === 'actions') return (
							<Grid item key={ix} {...col.cols}>
								<Button onClick={this.toAddChild}
									me={undefined} parent={undefined}
									startIcon={<JsampleIcons.ListAdd />} color="primary" >
									{media.isMd && L('New')}
								</Button>
							</Grid>);
						else return (
							<Grid item key={ix} {...col.cols}>
								{col.label || col.field}
							</Grid>);
					} )
				}
			</Grid>);
	}

	folderHead(columns=[], tnode, open, classes, media) {
	  let n = tnode.node;
	  n.css = n.css || {};
	  return (
		<div
			onClick={this.toExpandItem}
			nid={tnode.id}
			className={classes.folderHead}
		>
		  <Grid container spacing={0} key={tnode.id} >
			{columns.filter( v => v.hide != true).map( (col, ix) => {
				if (ix == 0) // row head
				  return (
					<Grid item key={`${tnode.id}.${ix}`} {...col.cols} >
						<Typography noWrap variant='body2' >
						  {this.leadingIcons(tnode, open, n.expandIcon)}
						  {icon(n.css.icon)}
						  {n.text}
						  {open ? icon("expand") : icon("collapse")}
						</Typography>
					</Grid>);
				else if (col.type === 'actions')
					return (
					  <Grid item key={`${tnode.id}.${ix}`} className={classes.actions}>
						<Typography noWrap variant='body2' >
							<Button onClick={this.toDel} me={tnode.id}
								startIcon={<JsampleIcons.Delete />} color="primary" >
								{media.isMd && L('Delete')}
							</Button>
							{( this.props.isMidNode ? this.props.isMidNode(n) : true )
							  && <Button onClick={this.toAddChild}
									me={tnode.id} parent={n.parent}
									startIcon={<JsampleIcons.ListAdd />} color="primary" >
									{media.isMd && L('New')}
							</Button>}
						</Typography>
					  </Grid>
					);
				else if (col.type === 'formatter')
				  return (
					<Grid item key={`${tnode.id}.${ix}`} {...col.cols} >
						<Typography variant='body2' >
						  {col.formatter(tnode, media)}
						</Typography>
					</Grid>);
				else
				  return (
					<Grid item key={`${tnode.id}.${ix}`} {...col.cols} >
						<Typography variant='body2' >
						  {formatFolderDesc(tnode, media)}
						</Typography>
					</Grid>);
			}) }
		  </Grid>
		</div>
		);

		function formatFolderDesc(tnode, media) {
			let {text, children} = tnode.node;

			if (children)
				children = `[${media.isMd ? 'children' : ''} ${children.length}]`;
			else children = '';

			return `${media.isXl ? text : ''} ${children}`;
		}

		function icon(icon) {
			return AnTreeIcons[icon || "deflt"];
		}

		function align(css = {}) {
			return css.align ? css.align : 'center';
		}
	}

	render() {
		const { classes, width } = this.props;

		let media = CrudCompW.setWidth(width);

		return (
			<div className={classes.root}>
				{this.th(this.props.columns, classes, media)}
				{this.treeNodes(classes, media)}
				{this.addForm}
			</div>
		);
	}
}
AnTreeditorComp.contextType = AnContext;

AnTreeditorComp.propTypes = {
	uri: PropTypes.string.isRequired,
	mtabl: PropTypes.string.isRequired,
	columns: PropTypes.array.isRequired,
	fields: PropTypes.array.isRequired,
	pk: PropTypes.object.isRequired,
	isMidNode: PropTypes.func
};

const AnTreeditor = withWidth()(withStyles(styles)(AnTreeditorComp));
export { AnTreeditor, AnTreeditorComp }
