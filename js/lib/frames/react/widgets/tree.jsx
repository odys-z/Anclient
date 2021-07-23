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
	flexDirection: 'column',
	width: "100%"
  },
  row: {
	width: "100%",
	"& :hover": {
	  backgroundColor: "#bed"
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
  },
  treeLabel: {
	textAlign: 'center',
	paddingLeft: '8ch',
  }
});

class AnTreeComp extends React.Component {
  state = {
	// window: undefined,
	// stree: {
	//   nodeId: "sys",
	//   text: "Anclient Lv-0",
	//   level: 0,
	//   levelIcons: ["+"],
	//   expandIcon: "F",
	//   url: "/",
	//   css: { icon: "menu-lv0" },
	//   flags: "0",
	//   fullpath: "sys",
	//   parentId: undefined,
	//   sibling: 0,
	//   children: [
	// 	{
	// 	  nodeId: "domain",
	// 	  text: "Domain 1.1",
	// 	  level: 1,
	// 	  levelIcons: ["|-", "-"],
	// 	  url: "/sys/domain",
	// 	  css: { icon: "menu-lv1", url: { align: "left" } },
	// 	  flags: "0",
	// 	  fullpath: "sys.0 domain",
	// 	  parentId: "sys",
	// 	  sibling: 0
	// 	},
	// 	{
	// 	  nodeId: "roles",
	// 	  text: "Sysem 1.2",
	// 	  level: 1,
	// 	  levelIcons: ["L", "+"],
	// 	  url: "/sys/roles",
	// 	  css: { icon: "menu-leaf", url: { align: "left" } },
	// 	  flags: "0",
	// 	  fullpath: "sys.1 roles",
	// 	  parentId: "sys",
	// 	  sibling: 0,
	//
	// 	  children: [
	// 		{
	// 		  nodeId: "domain",
	// 		  text: "Domain 2.1",
	// 		  level: 2,
	// 		  levelIcons: [".", "|-", "-"],
	// 		  url: "/sys/domain",
	// 		  css: { icon: "menu-lv1", url: { align: "left" } },
	// 		  flags: "0",
	// 		  fullpath: "sys.0 domain",
	// 		  parentId: "sys",
	// 		  sibling: 0
	// 		},
	// 		{
	// 		  nodeId: "roles",
	// 		  text: "Sysem 2.2",
	// 		  level: 2,
	// 		  levelIcons: [".", "L", "-"],
	// 		  url: "/sys/roles",
	// 		  css: { icon: "menu-leaf", url: { align: "left" } },
	// 		  flags: "0",
	// 		  fullpath: "sys.1 roles",
	// 		  parentId: "sys",
	// 		  sibling: 0
	// 		}
	// 	  ]
	// 	}
	//   ]
	// },
	forest: [],

	expandings: new Set()
  };

  constructor(props) {
	super(props);
	this.state.forest = props.forest || [];

	this.toExpandItem = this.toExpandItem.bind(this);
	this.buildTree = this.buildTree.bind(this);
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

	let expandItem = this.toExpandItem;

	return this.state.forest.map(
		(tree, tx) => {return treeItems(tree);}
	);
	// return treeItems(this.state.forest[0] || {});

	function treeItems(stree) {
	  if (Array.isArray(stree)) {
		return stree.map((i, x) => {
		  return treeItems(i);
		});
	  }
	  else {
		let open = that.state.expandings.has(stree.id);
		let {id, node, level} = stree;
		if (node.children && node.children.length > 0)
		  return (
			<Box key={id} className={classes.folder}>
			  <Box
				nid={id}
				onClick={expandItem}
				className={classes.folderHead}
			  >
				<Grid container spacing={0}>
				  <Grid item xs={11}>
					<Typography>
					  {leadingIcons(level)}
					  {node.css && node.css.icon && icon(node.css.icon)}
				  	  {that.props.checkbox
					   && <Checkbox color="primary" checked={toBool(node.checked)}
						  onClick={(e) => {
							  e.stopPropagation();
							  node.checked = !toBool(node.checked);
							  if (typeof that.props.onCheck === 'function')
								that.props.onCheck(e); }}/>
					  }
					  {node.text}
					</Typography>
				  </Grid>
				  <Grid item xs={1}>
					{open ? icon("expand") : icon("collapse")}
				  </Grid>
				</Grid>
			  </Box>
			  <Collapse in={open} timeout="auto" unmountOnExit>
				{treeItems(node.children)}
			  </Collapse>
			</Box>
		  );
		else
		  return (
			<Grid container key={id} className={classes.row}>
			  <Grid item xs={9} className={classes.treeItem}>
				<Typography >
				  {leadingIcons(level)}
				  {node.css && node.css.icon && icon(node.css.icon)}
				  {that.props.checkbox
					  && <Checkbox color="primary" checked={toBool(node.checked)}
						onClick={(e) => {
							e.stopPropagation();
							node.checked = !toBool(node.checked);
							if (typeof that.props.onCheck === 'function')
								that.props.onCheck(e); }}/>
				  }
				  {node.text}
				</Typography>
			  </Grid>
			  <Grid item xs={3} className={classes.treeItem} >
				<Typography className={classes.treeLabel} >{itemLabel(node.url, level)}</Typography>
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

	function toBool(str) {
		return str
			? str !== '0' && str !== ' ' || str.trim().toLowerCase() === 'true'
			: false;
	}

	function itemLabel(n, l) {
		return `${l}`;
	}
  }

  render() {
	const { classes } = this.props;

	return <div className={classes.root}>{this.buildTree(classes)}</div>;
  }
}

const AnTree = withStyles(styles)(AnTreeComp);
export { AnTree, AnTreeComp }
