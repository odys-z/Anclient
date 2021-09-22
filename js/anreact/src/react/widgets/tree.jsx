import React from "react";
import { withStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import Collapse from "@material-ui/core/Collapse";
import Checkbox from "@material-ui/core/Checkbox";
import Typography from "@material-ui/core/Typography";
import SvgIcon from "@material-ui/core/SvgIcon";
import {
	Drafts, Inbox, Send, ExpandLess, ExpandMore, Sms
} from "@material-ui/icons";

import { toBool } from '../../utils/helpers';

export const AnTreeIcons = {
	expand: <ExpandMore style={{verticalAlign: 'middle'}} />,
	collapse: <ExpandLess style={{verticalAlign: 'middle'}} />,
	"menu-lv0": <Send color="primary" style={{verticalAlign: 'middle'}} />,
	"menu-lv1": <Drafts color="primary" style={{verticalAlign: 'middle'}} />,
	"menu-leaf": <Sms color="primary" style={{verticalAlign: 'middle'}} />,
	deflt: <Inbox color="primary" style={{verticalAlign: 'middle'}} />,

	"-": <_Icon color="primary" style={{verticalAlign: 'middle'}} />,
	"F": <FIcon color="primary" style={{verticalAlign: 'middle'}} />,
	"|": <IIcon color="primary" style={{verticalAlign: 'middle'}} />,
	"T": <TIcon color="primary" style={{verticalAlign: 'middle'}} />,
	"L": <LIcon color="primary" style={{verticalAlign: 'middle'}} />,
	"|-": <EIcon color="primary" style={{verticalAlign: 'middle'}} />,
	"E": <EIcon color="primary" style={{verticalAlign: 'middle'}} />,
	"+": <XIcon color="primary" style={{verticalAlign: 'middle'}} />,
	".": <NIcon color="primary" style={{verticalAlign: 'middle'}} />,
};

function NIcon(props) {
  return (
	<SvgIcon fontSize="inherit" style={{ width: 24, height: 24 }} {...props}>
	  <path d="" />
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
	flexDirection: "column",
	textAlign: "left",
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
	// [{id, node, level}], where node is {checked text, css, children}
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
			  <Box  nid={id}
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
				<Typography className={classes.treeLabel} >{itemLabel(node.label || node.text, level, node.css)}</Typography>
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

	function itemLabel(txt, l, css) {
		return txt;
	}
  }

  render() {
	const { classes } = this.props;
	this.state.forest = this.props.forest;

	return <div className={classes.root}>{this.buildTree(classes)}</div>;
  }
}

const AnTree = withStyles(styles)(AnTreeComp);
export { AnTree, AnTreeComp }
