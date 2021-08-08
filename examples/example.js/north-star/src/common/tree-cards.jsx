
import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import withWidth from "@material-ui/core/withWidth";
import { Grid, Card, Collapse, TextField, Button, Typography } from '@material-ui/core';

import { L, AnConst, Protocol, AnsonResp,
	CrudComp, CrudCompW, AnContext, AnError, AnQueryForm, AnTreeIcons
} from 'anclient'

import { StarIcons } from '../styles';

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
  },
  actions: {
	textAlign: 'end',
	verticalAlign: 'middle',
  }
});

class TreeCardComp extends CrudComp {
	state = {
		node: {},
		// parent: props.parent,
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
			<StarIcons.Up onClick={this.toUp} />
			<StarIcons.Down onClick={this.toDown} />
		  </Grid>
		</Grid>);

		function icon(icon, onClick) {
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

class TreeCardsComp extends CrudCompW {
  state = {
	window: undefined,
	treeData: {
	  id: "sys",
	  text: "Anclient Lv-0",
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
		  text: "Domain 1.1",
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
		  text: "Sysem 1.2",
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
			  text: "Domain 2.1",
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
			  text: "Sysem 2.2",
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
	this.toDelCard = this.toDelCard.bind(this);
	this.onUpdate = this.onUpdate.bind(this);
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
		<TreeCardDetails uri={this.props.uri}
			c mtabl='ind_emotion' pk={p}
			onClose={this.closeDetails}
			onOk={this.closeDetails}
		/> );
	this.setState({});
  }

  toDelCard(e) {
  }

  closeDetails() {
	this.addForm = undefined;
	this.setState({});
  }

  onUpdate(child, parent, cx, px) {
	this.setState({dirty: true});
	if (parent && parent.children)
		parent.children.forEach( (c, x) => {
			c.sibling = x;
			c.fullpath = `${parent.fullpath}.${x} ${c.id}`;
		} );
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

	function buildTreegrid(tnode, parent) {
	  if (Array.isArray(tnode)) {
		return tnode.map((i, x) => {
		  return buildTreegrid(i, parent);
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
				  <Grid item xs={5} >
					<Typography noWrap>
					  {leadingIcons(tnode.levelIcons, open, tnode.expandIcon)}
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
							startIcon={<StarIcons.ListAdd />} color="primary" >
							{L('New')}
						</Button>
						<Button onClick={that.toDel} nid={tnode.id}
							startIcon={<StarIcons.Delete />} color="primary" >
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
				parent={parent}
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
