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

// import { AnTreeIcons } from "./tree"
// 	import { AnContext } from '../reactext.jsx';

import { L, AnTreeIcons, AnContext, CrudCompW, jsample } from 'anclient';
const { JsampleIcons } = jsample;

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
		let n = this.props.tnode;
		n.node.css = n.node.css || {};
		let { classes, width } = this.props;
		return (
		<Grid container
		  key={n.id}
		  spacing={0}
		  className={classes.row}
		>
		  <Grid item xs={4} className={classes.rowHead}>
			  <Typography noWrap variant='body2' >
				{this.props.leadingIcons(n)}
				{icon(n.node.css.icon)}
				{n.node.text}
			  </Typography>
		  </Grid>
		  <Grid item xs={2} className={classes.treeItem}>
			<Typography noWrap variant='body2' align={align(n.node.css.level)}>{n.level}</Typography>
		  </Grid>
		  <Grid item xs={3} className={classes.treeItem}>
			<Typography variant='body2' align={align(n.node.css.url)}>{n.node.url}</Typography>
		  </Grid>
		  <Grid item xs={3} className={classes.treeItem}>
			<JsampleIcons.Up onClick={this.toUp} />
			<JsampleIcons.Down onClick={this.toDown} />
		  </Grid>
		</Grid>);

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
	leadingIcons: PropTypes.func.isRequired
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

		this.toExpandItem = this.toExpandItem.bind(this);
		this.toAddChild = this.toAddChild.bind(this);

		this.leadingIcons = this.leadingIcons.bind(this);
		this.treeNodes = this.treeNodes.bind(this);

		this.toSearch = this.toSearch.bind(this);
	}

	componentDidMount() {
		console.log(this.props.uri);
		this.toSearch();
	}

	toSearch(e, query) {
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
				pkval={undefined} parent={me}
				title={this.props.detailFormTitle || 'Add Tree Node'}
				onClose={() => {that.addForm = undefined; that.setState({}) }}
				onOk={() => {that.addForm = undefined; }}
			/> );
		this.setState({});
	}

	toDel(e) { }

	toEdit(e) {
		e.stopPropagation();
		let that = this;

		let me = e.currentTarget.getAttribute("me");

		this.addForm = (
			<SimpleForm u uri={this.props.uri}
				mtabl={this.props.mtabl}
				pk={this.props.pk} fields={this.props.fields}
				pkval={me.id} me={me}
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
		let isMd = media.isMd;

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
			let open = that.state.expandings.has(tnode.id);
			tnode.node.css = tnode.node.css || {};
			if (tnode.node.children && tnode.node.children.length > 0) {
			  let editable = true;  // TODO data record privilege
			  return (
				<div key={tnode.id} className={classes.folder}>
				  <div
					onClick={expandItem}
					nid={tnode.id}
					className={classes.folderHead}
				  >
					<Grid container spacing={0}>
					  <Grid item xs={5} >
						<Typography noWrap variant='body2' >
						  {that.leadingIcons(tnode, open, tnode.expandIcon)}
						  {icon(tnode.node.css.icon)}
						  {tnode.node.text}
						</Typography>
					  </Grid>
					  <Grid item xs={3} >
						<Typography variant='body2' >{formatFolderDesc(tnode, media)}
							{open ? icon("expand") : icon("collapse")}
						</Typography>
					  </Grid>
					  <Grid item className={classes.actions}>
						<Typography noWrap variant='body2' >
						{editable && <>
							<Button onClick={that.toAddChild} me={tnode}
								startIcon={<JsampleIcons.ListAdd />} color="primary" >
								{isMd && L('New')}
							</Button>
							<Button onClick={that.toDel} me={tnode}
								startIcon={<JsampleIcons.Delete />} color="primary" >
								{isMd && L('Delete')}
							</Button>
							</>
						}
						</Typography>
					  </Grid>
					</Grid>
				  </div>
				  {open &&
					<Collapse in={open} timeout="auto" unmountOnExit>
						{buildTreegrid(tnode.node.children, tnode)}
					</Collapse>
				  }
				</div>
			  );
			}
			else
			  return (
				<TreeCard key={tnode.id} tnode={tnode}
					parent={parent} leadingIcons={that.leadingIcons}
					delete={that.toDelCard} onUpdate={that.onUpdate} />
			  );
		  }
		}

		function icon(icon) {
			return AnTreeIcons[icon || "deflt"];
		}

		function align(css = {}) {
			return css.align ? css.align : 'center';
		}

		function formatFolderDesc(tnode, media) {
			let {text, children} = tnode.node;

			if (children)
				children = `[${media.isMd ? 'children' : ''} ${children.length}]`;
			else chidlren = '';

			return `${media.isXl ? text : ''} ${children}`;
		}
	}

	render() {
		const { classes, width } = this.props;

		let media = CrudCompW.setWidth(width);

		return <div className={classes.root}>
			{this.treeNodes(classes, media)}
			{this.addForm}
		</div>;
	}
}
AnTreeditorComp.contextType = AnContext;

AnTreeditorComp.propTypes = {
	uri: PropTypes.string.isRequired,
	mtabl: PropTypes.string.isRequired
};

const AnTreeditor = withWidth()(withStyles(styles)(AnTreeditorComp));
export { AnTreeditor, AnTreeditorComp }
