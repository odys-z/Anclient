import React from "react";
import { withStyles } from "@material-ui/core/styles";
import SvgIcon from '@material-ui/core/SvgIcon';
import Grid from "@material-ui/core/Grid";
import Collapse from "@material-ui/core/Collapse";
import {
  Drafts, Inbox, Send, ExpandLess, ExpandMore, Sms
} from "@material-ui/icons";
import { Typography } from "@material-ui/core";

const _icons = {
	expand: <ExpandMore />,
	collapse: <ExpandLess />,
	"menu-lv0": <Send />,
	"menu-lv1": <Drafts />,
	"menu-leaf": <Sms />,
	"-": <_Icon />,
	"F": <FIcon />,
	"|": <IIcon />,
	"T": <TIcon />,
	"L": <LIcon />,
	"|-": <EIcon />,
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

class AnTreegridComp extends React.Component {
  state = {
	window: undefined,
	sysName: "Anreact Sample",
	sysMenu: {
	  funcId: "sys",
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
		  funcId: "domain",
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
		  funcId: "roles",
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
			  funcId: "domain",
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
			  funcId: "roles",
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
	debugger
	this.state.sysName =
	  props.sys || props.sysName || props.name || this.state.sysName;
	this.state.window = props.window;

	this.showMenu = this.showMenu.bind(this);
	this.hideMenu = this.hideMenu.bind(this);
	this.toExpandItem = this.toExpandItem.bind(this);
	this.menuItems = this.menuItems.bind(this);

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
	let f = e.currentTarget.getAttribute("iid");

	let expandings = this.state.expandings;
	if (expandings.has(f)) expandings.delete(f);
	else expandings.add(f);
	this.setState({ expandings });
  }

  /**
   * @param {object} classes
   */
  menuItems(classes) {
	let that = this;

	let m = this.state.sysMenu;
	let expandItem = this.toExpandItem;
	let mtree = buildMenu(m, classes);
	return mtree;

	function buildMenu(menu) {
	  if (Array.isArray(menu)) {
		return menu.map((i, x) => {
		  return buildMenu(i);
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
				  <Grid container item xs={8} >
						<Grid item xs={3} >
						  {leadingIcons(menu.levelIcons, open, menu.expandIcon)}
						  {icon(menu.css.icon)}
						</Grid>
						<Grid item xs={9} >
						  <Typography noWrap>{menu.funcName}</Typography>
						</Grid>
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
				{buildMenu(menu.children)}
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
	  // shall we use theme here?
	  return _icons[icon || "deflt"];
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

	return <div className={classes.root}>{this.menuItems(classes)}</div>;
  }
}

const AnTreegrid = withStyles(styles)(AnTreegridComp);
export { AnTreegrid, AnTreegridComp }
