import React from "react";
import { withStyles } from "@material-ui/core/styles";
import withWidth from "@material-ui/core/withWidth";
import PropTypes from "prop-types";

import Grid from "@material-ui/core/Grid";
import Collapse from "@material-ui/core/Collapse";
import {
  Drafts, Inbox, Send, ExpandLess, ExpandMore, Sms
} from "@material-ui/icons";
import { Typography } from "@material-ui/core";

// import { AnTreeIcons } from "./tree"
// 	import { AnContext } from '../reactext.jsx';

import { AnTreeIcons, AnContext, jsample } from 'anclient';
const { JsampleIcons } = jsample;

const styles = (theme) => ({
  root: {
	display: "flex",
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
  // hide: {
	// display: "none"
  // },
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

		this.state.node = props.node;

		this.toUp = this.toUp.bind(this);
		this.toDown = this.toDown.bind(this);
	}

	toUp(e) {
		let p = this.props.parent;
		let n = this.state.node;
		let me = p.children.indexOf(n);
		let elder = me - 1;
		if (elder >= 0)
			p.children.swap(me, elder);

		if (typeof this.props.onUpdate === 'function')
			this.props.onUpdate(n, p, me, elder);
	}

	toTop(e) {
		let p = this.props.parent;
		let n = this.state.node;
		let me = p.children.indexOf(n);
		if (me > 0)
			p.children.swap(me, 0);

		if (typeof this.props.onUpdate === 'function')
			this.props.onUpdate(n, p, me, 0);
	}

	toDown(e) {
		let p = this.props.parent;
		let n = this.state.node;
		let me = p.children.indexOf(n);
		let younger = me + 1;
		if (younger < p.children.length)
			p.children.swap(me, younger);

		if (typeof this.props.onUpdate === 'function')
			this.props.onUpdate(n, p, me, younger);
	}

	toTop(e) {
		let p = this.props.parent;
		let n = this.state.node;
		let me = p.children.indexOf(n);
		if (me < p.children.length - 1)
			p.children.swap(me, p.children.length - 1);
		if (typeof this.props.onUpdate === 'function')
			this.props.onUpdate(n, p, me, p.children.length);
	}

	render() {
		let n = this.state.node;
		n.css = n.css || {};
		let { classes, width } = this.props;
		return (
		<Grid container
		  key={n.id}
		  spacing={0}
		  className={classes.row}
		>
		  <Grid item xs={4} className={classes.rowHead}>
			  <Typography noWrap>
				{this.props.leadingIcons(n)}
				{icon(n.css.icon)}
				{n.text}
			  </Typography>
		  </Grid>
		  <Grid item xs={2} className={classes.treeItem}>
			<Typography noWrap align={align(n.css.level)}>{n.level}</Typography>
		  </Grid>
		  <Grid item xs={3} className={classes.treeItem}>
			<Typography align={align(n.css.url)}>{n.url}</Typography>
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
// TreeCardComp.propTypes = {
// 	leadingIcons: PropTypes.func.isRequired
// };

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
		this.leadingIcons = this.leadingIcons.bind(this);
		this.treeNodes = this.treeNodes.bind(this);

		this.toSearch = this.toSearch.bind(this);
	}

	componentDidMount() {
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
		let f = e.currentTarget.getAttribute("iid");

		let expandings = this.state.expandings;
		if (expandings.has(f)) expandings.delete(f);
		else expandings.add(f);
		this.setState({ expandings });
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
			: new Array(treeItem.level + 1).map((v, x) => {
				return x === icons.length - 1 && expand
					? expIcon ? <React.Fragment key={x}>{icon(expIcon)}</React.Fragment>
							  : <React.Fragment key={x}>{icon('T')}</React.Fragment>
					: <React.Fragment key={x}>{icon('.')}</React.Fragment>;
			})
	}

	/**
	 * @param {object} classes
	 */
	treeNodes(classes) {
		let that = this;

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
			tnode.css = tnode.css || {};
			if (tnode.children && tnode.children.length > 0) {
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
						<Typography noWrap>
						  {this.leadingIcons(tnode, open, tnode.expandIcon)}
						  {icon(tnode.css.icon)}
						  {tnode.text}
						</Typography>
					  </Grid>
					  <Grid item xs={3} >
						<Typography>{formatFolderDesc(tnode)}
							{open ? icon("expand") : icon("collapse")}
						</Typography>
					  </Grid>
					  <Grid item className={classes.actions}>
						<Typography noWrap>
						{editable && <>
							<Button onClick={that.toAddChild} nid={tnode.id}
								startIcon={<JsampleIcons.ListAdd />} color="primary" >
								{L('New')}
							</Button>
							<Button onClick={that.toDel} nid={tnode.id}
								startIcon={<JsampleIcons.Delete />} color="primary" >
								{L('Delete')}
							</Button>
							</>
						}
						</Typography>
					  </Grid>
					</Grid>
				  </div>
				  {open &&
					<Collapse in={open} timeout="auto" unmountOnExit>
						{buildTreegrid(tnode.children, tnode)}
					</Collapse>
				  }
				</div>
			  );
			}
			else
			  return (
				<TreeCard key={tnode.id} node={tnode}
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

	}

	render() {
		console.log(this.uri);
		const { classes } = this.props;

		return <div className={classes.root}>{this.treeNodes(classes)}</div>;
	}
}
AnTreeditorComp.contextType = AnContext;

const AnTreeditor = withStyles(styles)(AnTreeditorComp);
export { AnTreeditor, AnTreeditorComp }
