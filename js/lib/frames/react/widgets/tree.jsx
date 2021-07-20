import React from "react";
import { withStyles } from "@material-ui/core/styles";
import SvgIcon from '@material-ui/core/SvgIcon';
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import Collapse from "@material-ui/core/Collapse";
import {
  Drafts, Inbox, Send, ExpandLess, ExpandMore, Sms
} from "@material-ui/icons";
import Checkbox from '@material-ui/core/Checkbox';
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";

export const AnTreeIcons = {
	expand: <ExpandMore />,
	collapse: <ExpandLess />,
	"menu-lv0": <Send color="primary" />,
	"menu-lv1": <Drafts color="primary" />,
	"menu-leaf": <Sms color="primary" />,
	"-": <_Icon />,
	"F": <FIcon />,
	"|": <IIcon />,
	"T": <TIcon />,
	"L": <LIcon />,
	"|-": <EIcon />,
	"E": <EIcon />,
	"+": <XIcon color="primary" />,
	".": <NIcon />,
	deflt: <Inbox />
};

function NIcon(props) {
  return (
	<SvgIcon fontSize="inherit" style={{ width: 24, height: 24 }} {...props}>
	  <path d=""/>
	</SvgIcon>
  );
}

function FIcon(props) {
  return (
	<SvgIcon fontSize="inherit" style={{ width: 24, height: 24 }} {...props}>
	  <path d="M11.5 24 h1 v-11.5 h 11.5 v-1 h-12.5z M8 8 h8 v8 h-8z"/>
	</SvgIcon>
  );
}

function LIcon(props) {
  return (
	<SvgIcon fontSize="inherit" style={{ width: 24, height: 24 }} {...props}>
	  <path d="M24 12.5 v-1 h-11.5 v-11.5 h-1 v12.5z"/>
	</SvgIcon>
  );
}

function _Icon(props) {
  return (
	<SvgIcon fontSize="inherit" style={{ width: 24, height: 24 }} {...props}>
	  <path d="M 24 12.5 v-1 h-24 v1 h24z"/>
	</SvgIcon>
  );
}

function TIcon(props) {
  return (
	<SvgIcon fontSize="inherit" style={{ width: 24, height: 24 }} {...props}>
	  <path d="M11.5 24 h1 v-11.5 h11.5 v-1 h-24 v1 h11.5z" />
	</SvgIcon>
  );
}

function IIcon(props) {
  return (
	<SvgIcon fontSize="inherit" style={{ width: 24, height: 24 }} {...props}>
	  <path d="M11.5 24 h1 v-24 h-1 v24z" />
	</SvgIcon>
  );
}

function XIcon(props) {
  return (
	<SvgIcon fontSize="inherit" style={{ width: 24, height: 24 }} {...props}>
	  <path d="M 19 3 H 5 c -1.11 0 -2 0.9 -2 2 v 14 c 0 1.1 0.89 2 2 2 h 14 c 1.1 0 2 -0.9 2 -2 V 5 c 0 -1.1 -0.9 -2 -2 -2 Z m -2 10 h -4 v 4 h -2 v -4 H 7 v -2 h 4 V 7 h 2 v 4 h 4 v 2 Z" />
	</SvgIcon>
  );
}

function EIcon(props) {
  return (
	<SvgIcon fontSize="inherit" style={{ width: 24, height: 24 }} {...props}>
	  <path d="M11.5 24 h1 v-11.5 h11.5 v-1 h-11.5 v-11.5 h-1z" />
	</SvgIcon>
  );
}

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
  },
  folder: {
	width: "100%"
  },
  folderHead: {
	borderBottom: "1px solid #bcd",
	borderTop: "1px solid #bcd"
  },
  hide: {
	display: "none"
  },
  treeItem: {
	borderLeft: "1px solid #bcd",
  }
});

class AnTreeComp extends React.Component {
  state = {
	window: undefined,
	stree: {
	  nodeId: "sys",
	  nodeName: "Anclient Lv-0",
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
		  nodeId: "domain",
		  nodeName: "Domain 1.1",
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
		  nodeId: "roles",
		  nodeName: "Sysem 1.2",
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
			  nodeId: "domain",
			  nodeName: "Domain 2.1",
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
			  nodeId: "roles",
			  nodeName: "Sysem 2.2",
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
	this.state.sysName =
	  props.sys || props.sysName || props.name || this.state.sysName;
	this.state.window = props.window;

	this.showMenu = this.showMenu.bind(this);
	this.hideMenu = this.hideMenu.bind(this);
	this.toExpandItem = this.toExpandItem.bind(this);
	this.buildTree = this.buildTree.bind(this);

	this.toLogout = this.toLogout.bind(this);
  }

  showMenu() {
	this.setState({ showMenu: true });
  }

  hideMenu() {
	this.setState({ showMenu: false });
  }

  toLogout() {
	// Notify children?
	this.setState({ showLogout: true });
  }

  toExpandItem(e) {
	e.stopPropagation();
	let f = e.currentTarget.getAttribute("nid");

	let expandings = this.state.expandings;
	if (expandings.has(f)) expandings.delete(f);
	else expandings.add(f);
	this.setState({ expandings });
  }

  /**
   * @param {object} classes
   */
  buildTree(classes) {
	let that = this;

	let m = this.state.stree;
	let expandItem = this.toExpandItem;
	let mtree = treeItems(m, classes);
	return mtree;

	function treeItems(stree) {
	  if (Array.isArray(stree)) {
		return stree.map((i, x) => {
		  return treeItems(i);
		});
	  }
	  else {
		let open = that.state.expandings.has(stree.nodeId);
		if (stree.children && stree.children.length > 0)
		  return (
			<Box key={stree.nodeId} className={classes.folder}>
			  <Box nid={stree.nodeId}
				onClick={expandItem}
				className={classes.folderHead}
			  >
				<Grid container spacing={0}>
					<Grid item xs={11} >
						{leadingIcons(stree.level)}
						{ stree.css.icon && icon(stree.css.icon)}
						{ that.props.checkbox &&
							(<Checkbox color="primary" />)
						}
						{stree.nodeName}
					</Grid>
					<Grid item xs={1}>
						{open ? icon("expand") : icon("collapse")}
					</Grid>
				</Grid>
			  </Box>
			  <Collapse in={open} timeout="auto" unmountOnExit>
				{treeItems(stree.children)}
			  </Collapse>
			</Box> );
		else
		  return (
			<Grid container key={stree.nodeId} className={classes.row} >
			  <Grid item xs={5} className={classes.treeItem}  >
				<Box flexDirection="row">
					{leadingIcons(stree.level)}
					{ stree.css.icon && icon(stree.css.icon)}
					{ that.props.checkbox &&
						(<Checkbox color="primary" />)
					}
					{stree.nodeName}
				</Box>
			  </Grid>
			  <Grid item xs={7} className={classes.treeItem} >
				<Typography >{stree.url}</Typography>
			  </Grid>
			</Grid>
		  );
	  }
	}

	function icon(icon) {
	  return AnTreeIcons[icon || "deflt"];
	}

	function align(css = {}) {
		return css.align ? css.align : 'center';
	}

	function leadingIcons(count) {
		let c = [];
		for (let i = 0; i < count; i++)
			c.push( <React.Fragment key={i}>{icon('.')}</React.Fragment> );
		return c;
	}
  }

  render() {
	const { classes } = this.props;

	return <div className={classes.root}>{this.buildTree(classes)}</div>;
  }
}

const AnTree = withStyles(styles)(AnTreeComp);
export { AnTree, AnTreeComp }
