import React from "react";
import { withStyles } from "@material-ui/core/styles";
import SvgIcon from '@material-ui/core/SvgIcon';
import Grid from "@material-ui/core/Grid";
import Collapse from "@material-ui/core/Collapse";
import {
  Drafts, Inbox, Send, ExpandLess, ExpandMore, Sms
} from "@material-ui/icons";
import { Typography } from "@material-ui/core";

import { AnTreeIcons } from "./tree"

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

class AnTreeditorComp extends React.Component {
  state = {
	window: undefined,
	// [{id, node: {text, css, url}, level, children}. ... ]
	treeData: [ ],

	expandings: new Set()
  };

  constructor(props) {
	super(props);
	this.state.sysName =
	  props.sys || props.sysName || props.name || this.state.sysName;
	this.state.window = props.window;

	this.toExpandItem = this.toExpandItem.bind(this);
	this.treeNodes = this.treeNodes.bind(this);

	this.toLogout = this.toLogout.bind(this);
  }

  toLogout() {
	// Notify children?
	this.setState({ showLogout: true });
  }

  toExpandItem(e) {
	e.stopPropagation();
	let f = e.currentTarget.getAttribute("iid");

	let expandings = this.state.expandings;
	if (expandings.has(f)) expandings.delete(f);
	else expandings.add(f);
	this.setState({ expandings });
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

	function buildTreegrid(menu) {
	  if (Array.isArray(menu)) {
		return menu.map((i, x) => {
		  return buildTreegrid(i);
		});
	  } else {
		let open = that.state.expandings.has(menu.funcId);
		if (menu.children && menu.children.length > 0)
		  return (
			<div key={menu.funcId} className={classes.folder}>
			  <div
				onClick={expandItem}
				iid={menu.funcId}
				className={classes.folderHead}
			  >
				<Grid container spacing={0}>
				  <Grid item xs={8} >
						<Typography noWrap>
						  {leadingIcons(menu.levelIcons, open, menu.expandIcon)}
						  {icon(menu.css.icon)}
						  {menu.funcName}
						</Typography>
				  </Grid>
				  <Grid item xs={3} >
					<Typography>{menu.url}</Typography>
				  </Grid>
				  <Grid item xs={1}>
					{open ? icon("expand") : icon("collapse")}
				  </Grid>
				</Grid>
			  </div>
			  <Collapse in={open} timeout="auto" unmountOnExit>
				{buildTreegrid(menu.children)}
			  </Collapse>
			</div>
		  );
		else
		  return (
			<Grid container
			  key={menu.funcId}
			  spacing={0}
			  className={classes.row}
			>
			  <Grid item xs={4} className={classes.rowHead}>
				  <Typography noWrap>
					{leadingIcons(menu.levelIcons)}
					{icon(menu.css.icon)}
					{menu.funcName}
				  </Typography>
			  </Grid>
			  <Grid item xs={4} className={classes.treeItem}>
				<Typography noWrap align={align(menu.css.level)}>{menu.level}</Typography>
			  </Grid>
			  <Grid item xs={4} className={classes.treeItem}>
				<Typography align={align(menu.css.url)}>{menu.url}</Typography>
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

	function leadingIcons(icons, expand, expIcon) {
	  return icons.map((v, x) => {
		return x === icons.length - 1 && v === '+' && expand
			? expIcon ? <React.Fragment key={x}>{icon(expIcon)}</React.Fragment>
					  : <React.Fragment key={x}>{icon('T')}</React.Fragment>
			: <React.Fragment key={x}>{icon(v)}</React.Fragment>;
	  });
	}
  }

  render() {
	const { classes } = this.props;

	return <div className={classes.root}>{this.treeNodes(classes)}</div>;
  }
}

const AnTreeditor = withStyles(styles)(AnTreeditorComp);
export { AnTreeditor, AnTreeditorComp }
