
import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import withWidth from "@material-ui/core/withWidth";
import { Grid, Card, Collapse, TextField, Button, Typography } from '@material-ui/core';

import { L, AnConst, Protocol, AnsonResp,
	CrudComp, AnContext, AnError, AnQueryForm, AnTreeIcons
} from 'anclient'

import { TreeCardDetails } from './treecard-details';

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
  hide: {
	display: "none"
  },
  treeItem: {
	padding: theme.spacing(1),
	borderLeft: "1px solid #bcd",
  }
});

class TreeCardComp extends CrudComp {
	state = {
		node: {},
	}

	newCard = undefined;

	constructor(props) {
		super(props);

		this.state.node = props.node;

		// this.toAddChild = this.toAddChild.bind(this);
	}

	render() {
		let n = this.state.node;
		let { classes, width } = this.props;
		return (
		<Grid container
		  key={n.id}
		  spacing={0}
		  className={classes.row}
		>
		  <Grid item xs={4} className={classes.rowHead}>
			  <Typography noWrap>
				{leadingIcons(n.levelIcons)}
				{icon(n.css.icon)}
				{n.funcName}
			  </Typography>
		  </Grid>
		  <Grid item xs={4} className={classes.treeItem}>
			<Typography noWrap align={align(n.css.level)}>{n.level}</Typography>
		  </Grid>
		  <Grid item xs={4} className={classes.treeItem}>
			<Typography align={align(n.css.url)}>{n.url}</Typography>
		  </Grid>
		</Grid>);

		function icon(icon) {
		  return AnTreeIcons[icon || "deflt"];
		}

		function align(css = {}) {
		  return css.align ? css.align : 'center';
		}

		function leadingIcons(icons, expand, expIcon) {
		  return icons.map((v, x) => {
			return x === icons.length && v === '+' && expand
				? expIcon ? <React.Fragment key={x}>{icon(expIcon)}</React.Fragment>
						  : <React.Fragment key={x}>{icon('T')}</React.Fragment>
				: <React.Fragment key={x}>{icon(v)}</React.Fragment>;
		  });
		}
	}
}
TreeCardComp.contextType = AnContext;

const TreeCard = withWidth()(withStyles(styles)(TreeCardComp));
export { TreeCard, TreeCardComp }

class TreeCardsComp extends CrudComp {
  state = {
	window: undefined,
	treeData: {
	  id: "sys",
	  funcName: "Anclient Lv-0",
	  level: 0,
	  levelIcons: ['+'],
	  expandIcon: 'F',
	  url: "/",
	  css: { icon: "menu-lv0" },
	  flags: "0",
	  fullpath: "sys",
	  parentId: undefined,
	  sibling: 0,
	  children: [
		{
		  id: "domain",
		  funcName: "Domain 1.1",
		  level: 1,
		  levelIcons: ['|-', '-'],
		  url: "/sys/domain",
		  css: { icon: "menu-lv1", url: {align: 'left'} },
		  flags: "0",
		  fullpath: "sys.0 domain",
		  parentId: "sys",
		  sibling: 0
		},
		{
		  id: "roles",
		  funcName: "Sysem 1.2",
		  level: 1,
		  levelIcons: ['L', '+'],
		  url: "/sys/roles",
		  css: { icon: "menu-leaf", url: {align: 'left'} },
		  flags: "0",
		  fullpath: "sys.1 roles",
		  parentId: "sys",
		  sibling: 0,

		  children: [
			{
			  id: "domain",
			  funcName: "Domain 2.1",
			  level: 2,
			  levelIcons: ['.', '|-', '-'],
			  url: "/sys/domain",
			  css: { icon: "menu-lv1", url: {align: 'left'} },
			  flags: "0",
			  fullpath: "sys.0 domain",
			  parentId: "sys",
			  sibling: 0
			},
			{
			  id: "roles",
			  funcName: "Sysem 2.2",
			  level: 2,
			  levelIcons: ['.', 'L', '-'],
			  url: "/sys/roles",
			  css: { icon: "menu-leaf", url: {align: 'left'} },
			  flags: "0",
			  fullpath: "sys.1 roles",
			  parentId: "sys",
			  sibling: 0
			}
		  ]
		}
	  ]
	},

	expandings: new Set()
  };

  constructor(props) {
	super(props);
	this.state.window = props.window;

	this.closeDetails = this.closeDetails.bind(this);

	this.toExpandItem = this.toExpandItem.bind(this);
	this.treeNodes = this.treeNodes.bind(this);
	this.toAddChild = this.toAddChild.bind(this);
	this.toUpdown = this.toUpdown.bind(this);
	this.toDelCard = this.toDelCard.bind(this);
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
	let p = e.currentTarget.getAttribute("pid");

	this.addForm = (
		<TreeCardDetails
			c mtabl='ind_emotion' pk={p}
			onClose={this.closeDetails}
		/> );
	this.setState({});
  }

  toUpdown(e) {
  }

  toDelCard(e) {
  }

  closeDetails() {
	this.addForm = undefined;
	this.setState({});
  }


  /**
   * @param {object} classes
   */
  treeNodes(classes) {
	let that = this;

	let m = this.state.treeData;
	let expandItem = this.toExpandItem;
	let mtree = buildTreegrid( m, classes );
	return mtree;

	function buildTreegrid(tnode) {
	  if (Array.isArray(tnode)) {
		return tnode.map((i, x) => {
		  return buildTreegrid(i);
		});
	  } else {
		let open = that.state.expandings.has(tnode.id);
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
				  <Grid item xs={8} >
					<Typography noWrap>
					  {leadingIcons(tnode.levelIcons, open, tnode.expandIcon)}
					  {icon(tnode.css.icon)}
					  {tnode.funcName}
					</Typography>
				  </Grid>
				  <Grid item xs={2} >
					<Typography>{formatFolderDesc(tnode)}</Typography>
				  </Grid>
				  <Grid item xs={2}>
					{open ? icon("expand") : icon("collapse")}
					{editable &&
						<Button onClick={that.toAddChild} pid={tnode.id} color="primary" >
							{L('Delete All')}
						</Button>
					}
				  </Grid>
				</Grid>
			  </div>
			  {open &&
				<Collapse in={open} timeout="auto" unmountOnExit>
					{buildTreegrid(tnode.children)}
					{editable &&
						<Button onClick={that.toAddChild} color="primary" >
							{L('Append Child')}
						</Button>
					}
				</Collapse>
			  }
			</div>
		  );
		}
		else
		  return (
			<TreeCard key={tnode.id} node={tnode} delete={that.toDelCard} upDown={that.toUpdown} />
			/*
			<Grid container key={menu.id} spacing={0} className={classes.row} >
			  <Grid item xs={4} className={classes.rowHead}>
				  <Typography noWrap>
					{leadingIcons(menu.levelIcons)} {icon(menu.css.icon)} {menu.funcName}
				  </Typography>
			  </Grid>
			  <Grid item xs={4} className={classes.treeItem}>
				<Typography noWrap align={align(menu.css.level)}>{menu.level}</Typography>
			  </Grid>
			  <Grid item xs={4} className={classes.treeItem}>
				<Typography align={align(menu.css.url)}>{menu.url}</Typography>
			  </Grid>
			</Grid>
			*/
		  );
	  }
	}

	function icon(icon) {
	  return AnTreeIcons[icon || "deflt"];
	}

	function align(css = {}) {
	  return css.align ? css.align : 'center';
	}

	function formatFolderDesc(tnode) {
		return L('children: {count}', {count: tnode.children ? tnode.children.length : 0});
	}

	function leadingIcons(icons, expand, expIcon) {
	  return icons.map((v, x) => {
		return x === icons.length && v === '+' && expand
			? expIcon ? <React.Fragment key={x}>{icon(expIcon)}</React.Fragment>
					  : <React.Fragment key={x}>{icon('T')}</React.Fragment>
			: <React.Fragment key={x}>{icon(v)}</React.Fragment>;
	  });
	}
  }

  render() {
	const { classes } = this.props;

	return (
		<div className={classes.root}>
			{this.treeNodes(classes)}
			{this.addForm}
			{this.context.isSm && <Button >{L('Save')}</Button>}
		</div>);
  }
}
TreeCardsComp.contextType = AnContext;

const TreeCards = withWidth()(withStyles(styles)(TreeCardsComp));
export { TreeCards, TreeCardsComp }
