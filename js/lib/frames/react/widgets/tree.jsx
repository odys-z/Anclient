import React from "react";
import { withStyles } from "@material-ui/core/styles";
import SvgIcon from "@material-ui/core/SvgIcon";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import Collapse from "@material-ui/core/Collapse";
import {
  Drafts,
  Inbox,
  Send,
  ExpandLess,
  ExpandMore,
  Sms
} from "@material-ui/icons";
import Checkbox from "@material-ui/core/Checkbox";
import Typography from "@material-ui/core/Typography";

export const AnTreeIcons = {
  expand: <ExpandMore style={{verticalAlign: 'middle'}} />,
  collapse: <ExpandLess style={{verticalAlign: 'middle'}} />,
  "menu-lv0": <Send color="primary" style={{verticalAlign: 'middle'}} />,
  "menu-lv1": <Drafts color="primary" style={{verticalAlign: 'middle'}} />,
  "menu-leaf": <Sms color="primary" style={{verticalAlign: 'middle'}} />,
  ".": <NIcon />,
  deflt: <Inbox color="primary" style={{verticalAlign: 'middle'}} />
};

function NIcon(props) {
  return (
	<SvgIcon fontSize="inherit" style={{ width: 24, height: 24 }} {...props}>
	  <path d="" />
	</SvgIcon>
  );
}



const styles = (theme) => ({
  root: {
	display: "flex",
	width: "100%"
  },
  row: {
	width: "100%",
	"& :hover": {
	  backgroundColor: "#ced"
	}
  },
  rowHead: {},
  folder: {
	width: "100%"
  },
  folderHead: {
	borderBottom: "1px solid #bcd",
	borderTop: "1px solid #bcd",
	margin: 0,
	padding: 0,
	lineHeight: '4ch',
  },
  hide: {
	display: "none"
  },
  treeItem: {
	verticalAlign: 'middle',
	borderLeft: "1px solid #bcd",
	lineHeight: '4ch',
  }
});

class AnTreeComp extends React.Component {
  state = {
	window: undefined,
	stree: {
	  nodeId: "sys",
	  nodeName: "Anclient Lv-0",
	  level: 0,
	  levelIcons: ["+"],
	  expandIcon: "F",
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
		  levelIcons: ["|-", "-"],
		  url: "/sys/domain",
		  css: { icon: "menu-lv1", url: { align: "left" } },
		  flags: "0",
		  fullpath: "sys.0 domain",
		  parentId: "sys",
		  sibling: 0
		},
		{
		  nodeId: "roles",
		  nodeName: "Sysem 1.2",
		  level: 1,
		  levelIcons: ["L", "+"],
		  url: "/sys/roles",
		  css: { icon: "menu-leaf", url: { align: "left" } },
		  flags: "0",
		  fullpath: "sys.1 roles",
		  parentId: "sys",
		  sibling: 0,

		  children: [
			{
			  nodeId: "domain",
			  nodeName: "Domain 2.1",
			  level: 2,
			  levelIcons: [".", "|-", "-"],
			  url: "/sys/domain",
			  css: { icon: "menu-lv1", url: { align: "left" } },
			  flags: "0",
			  fullpath: "sys.0 domain",
			  parentId: "sys",
			  sibling: 0
			},
			{
			  nodeId: "roles",
			  nodeName: "Sysem 2.2",
			  level: 2,
			  levelIcons: [".", "L", "-"],
			  url: "/sys/roles",
			  css: { icon: "menu-leaf", url: { align: "left" } },
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
	  } else {
		let open = that.state.expandings.has(stree.nodeId);
		if (stree.children && stree.children.length > 0)
		  return (
			<Box key={stree.nodeId} className={classes.folder}>
			  <Box
				nid={stree.nodeId}
				onClick={expandItem}
				className={classes.folderHead}
			  >
				<Grid container spacing={0}>
				  <Grid item xs={11}>
					<Typography>
					  {leadingIcons(stree.level)}
					  {stree.css.icon && icon(stree.css.icon)}
					  <Checkbox color="primary" />
					  {stree.nodeName}
					</Typography>
				  </Grid>
				  <Grid item xs={1}>
					{open ? icon("expand") : icon("collapse")}
				  </Grid>
				</Grid>
			  </Box>
			  <Collapse in={open} timeout="auto" unmountOnExit>
				{treeItems(stree.children)}
			  </Collapse>
			</Box>
		  );
		else
		  return (
			<Grid container key={stree.nodeId} className={classes.row}>
			  <Grid item xs={7} className={classes.treeItem}>
				<Typography >
				  {leadingIcons(stree.level)}
				  {stree.css.icon && icon(stree.css.icon)}
				  {that.props.checkbox && <Checkbox color="primary" />}
				  {stree.nodeName}
				</Typography>
			  </Grid>
			  <Grid item xs={5} className={classes.treeItem} >
				<Typography className={classes.treeItem} >{stree.url}</Typography>
			  </Grid>
			</Grid>
		  );
	  }
	}

	function icon(icon) {
	  return AnTreeIcons[icon || "deflt"];
	}

	function leadingIcons(count) {
	  let c = [];
	  for (let i = 0; i < count; i++)
		c.push(<React.Fragment key={i}>{icon(".")}</React.Fragment>);
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
