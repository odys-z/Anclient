# C

https://codesandbox.io/s/material-demo-forked-r7x96?file=/demo.js:0-8282

'''
	import React from "react";
	import { withStyles } from "@material-ui/core/styles";
	import SvgIcon from '@material-ui/core/SvgIcon';
	import Grid from "@material-ui/core/Grid";
	import Collapse from "@material-ui/core/Collapse";
	import {
	  Drafts,
	  Inbox,
	  Send,
	  ExpandLess,
	  ExpandMore,
	  Sms
	} from "@material-ui/icons";
	import { Typography } from "@material-ui/core";

	const _icons = {
	  expand: <ExpandMore />,
	  collapse: <ExpandLess />,
	  "menu-lv0": <Send />,
	  "menu-lv1": <Drafts />,
	  "menu-leaf": <Sms />,
	  "-": <_Icon />,
	  "|": <IIcon />,
	  "T": <TIcon />,
	  "L": <LIcon />,
	  "|-": <I_Icon />,
	  "+": <XIcon />,
	  " ": <NIcon />,
	  deflt: <Inbox />
	};

	function NIcon(props) {
	  return (
	    <SvgIcon fontSize="inherit" style={{ width: 24, height: 24 }} {...props}>
	      <path d=""/>
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
	      <path d="M11.5 24 h1 v-24 h-1 v24z M11.5 24 h1 v-24 h-1 v24z" />
	    </SvgIcon>
	  );
	}

	function I_Icon(props) {
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
	    // border: "1px solid"
	  },
	  row: {
	    // border: "1px solid red",
	    width: "100%",
	    "& :hover": {
	      backgroundColor: "#ced"
	    }
	  },
	  rowHead: {
	    // border: "1px solid green"
	  },
	  folder: {
	    width: "100%"
	    // border: '1px dashed',
	  },
	  folderHead: {
	    borderBottom: "1px solid #bcd",
	    borderTop: "1px solid #bcd"
	    // width: "80%"
	  },
	  hide: {
	    display: "none"
	  },
	  treeItem: {
	    borderLeft: "1px solid #bcd",
	  }
	});

	class SysComp extends React.Component {
	  state = {
	    window: undefined,
	    sysName: "Anreact Sample",
	    sysMenu: {
	      funcId: "sys",
	      funcName: "Anclient Lv-0",
	      level: 0,
	      levelIcons: ['T'],
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
	          levelIcons: ['L', 'T'],
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
	              levelIcons: [' ', '|-', '-'],
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
	              levelIcons: [' ', 'L', '-'],
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
	                button
	                onClick={expandItem}
	                iid={menu.funcId}
	                className={classes.folderHead}
	              >
	                <Grid container spacing={0.5}>
	                  <Grid container xs={8} >
	                    <Grid item xs={3} noWrap>
	                      {leadingIcons(menu.levelIcons)}
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
	            <Grid
	              key={menu.funcId}
	              container
	              spacing={0.5}
	              className={classes.row}
	            >
	              <Grid xs={4} noWrap className={classes.rowHead}>
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

	    function leadingIcons(icons) {
	      return icons.map((v, x) => {
	        return icon(v);
	      });
	    }
	  }

	  render() {
	    const { classes } = this.props;

	    return <div className={classes.root}>{this.menuItems(classes)}</div>;
	  }
	}

	export default withStyles(styles)(SysComp);
	export { SysComp };

'''

[svg path editor](https://yqnn.github.io/svg-path-editor/)

# B

https://codesandbox.io/s/material-demo-forked-fhcm9?file=/demo.js:0-6371

import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import TreeView from "@material-ui/lab/TreeView";
import TreeItem from "@material-ui/lab/TreeItem";
import Typography from "@material-ui/core/Typography";
import MailIcon from "@material-ui/icons/Mail";
import DeleteIcon from "@material-ui/icons/Delete";
import Label from "@material-ui/icons/Label";
import SupervisorAccountIcon from "@material-ui/icons/SupervisorAccount";
import InfoIcon from "@material-ui/icons/Info";
import ForumIcon from "@material-ui/icons/Forum";
import LocalOfferIcon from "@material-ui/icons/LocalOffer";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import ArrowRightIcon from "@material-ui/icons/ArrowRight";

const useTreeItemStyles = makeStyles((theme) => ({
  root: {
    color: theme.palette.text.secondary,
    "&:hover > $content": {
      backgroundColor: theme.palette.action.hover
    },
    "&:focus > $content, &$selected > $content": {
      backgroundColor: `var(--tree-view-bg-color, ${theme.palette.grey[400]})`,
      color: "var(--tree-view-color)"
    },
    "&:focus > $content $label, &:hover > $content $label, &$selected > $content $label": {
      backgroundColor: "transparent"
    },
    border: 1,
    bordercolor: "gray"
  },
  content: {
    color: theme.palette.text.secondary,
    borderTop: 'solid 1px #57a',
    borderTopRightRadius: theme.spacing(0),
    borderBottomRightRadius: theme.spacing(0.5),
    paddingRight: theme.spacing(2),
    fontWeight: theme.typography.fontWeightMedium,
    "$expanded > &": {
      fontWeight: theme.typography.fontWeightRegular
    }
  },
  group: {
    marginLeft: 0,
    "& $content": {
      paddingLeft: theme.spacing(2)
    }
  },
  expanded: {},
  selected: {},
  label: {
    fontWeight: "inherit",
    color: "inherit"
  },
  labelRoot: {
    border: 1,
    borderColor: "yellow !important",
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(.5, 0)
  },
  labelIcon: {
    marginRight: theme.spacing(1)
  },
  labelText: {
    fontWeight: "inherit",
    flexGrow: 1
  },
  labelCell: {
    fontWeight: "inherit",
    flexGrow: 1,
    borderLeft: 'solid 1px #57a',
  }
}));

function StyledTreeItem(props) {
  const classes = useTreeItemStyles();
  const {
    labelText,
    labelIcon: LabelIcon,
    labelInfo,
    labelExtra,
    color,
    bgColor,
    ...other
  } = props;

  return (
    <TreeItem
      label={
        <div className={classes.labelRoot}>
          <LabelIcon color="inherit" className={classes.labelIcon} />
          <Typography variant="body2" className={classes.labelText}>
            {labelText}
          </Typography>
          <Typography
            variant="caption"
            color="inherit"
            className={classes.labelCell}
          >
            {labelInfo}
          </Typography>
          <Typography
            variant="caption"
            color="inherit"
            className={classes.labelCell}
          >
            {labelInfo}
          </Typography>
          <Typography
            variant="caption"
            color="inherit"
            className={classes.labelCell}
          >
            {labelInfo}
          </Typography>
          <Typography
            variant="caption"
            color="inherit"
            className={classes.labelCell}
          >
            {labelExtra}
          </Typography>
        </div>
      }
      style={{
        "--tree-view-color": color,
        "--tree-view-bg-color": bgColor
      }}
      classes={{
        root: classes.root,
        content: classes.content,
        expanded: classes.expanded,
        selected: classes.selected,
        group: classes.group,
        label: classes.label
      }}
      {...other}
    />
  );
}

StyledTreeItem.propTypes = {
  bgColor: PropTypes.string,
  color: PropTypes.string,
  labelIcon: PropTypes.elementType.isRequired,
  labelInfo: PropTypes.string,
  labelText: PropTypes.string.isRequired
};

const useStyles = makeStyles({
  root: {
    height: 264,
    flexGrow: 1,
    maxWidth: 400
  }
});

export default function GmailTreeView() {
  const classes = useStyles();

  return (
    <TreeView
      className={classes.root}
      defaultExpanded={["3"]}
      defaultCollapseIcon={<ArrowDropDownIcon />}
      defaultExpandIcon={<ArrowRightIcon />}
      defaultEndIcon={<div style={{ width: 24 }} />}
    >
      <StyledTreeItem
        nodeId="1"
        labelText="All Mail"
        labelIcon={MailIcon}
        labelInfo="733AA"
        labelExtra="extra"
      ></StyledTreeItem>
      <StyledTreeItem nodeId="2" labelText="Trash" labelIcon={DeleteIcon} />
      <StyledTreeItem nodeId="3" labelText="Categories" labelIcon={Label}>
        <StyledTreeItem
          nodeId="5"
          labelText="Social"
          labelIcon={SupervisorAccountIcon}
          labelInfo="90"
          color="#1a73e8"
          bgColor="#e8f0fe"
        />
        <StyledTreeItem
          nodeId="6"
          labelText="Updates"
          labelIcon={InfoIcon}
          labelInfo="2,294"
          color="#e3742f"
          bgColor="#fcefe3"
        />
        <StyledTreeItem
          nodeId="7"
          labelText="Forums"
          labelIcon={ForumIcon}
          labelInfo="3,566"
          color="#a250f5"
          bgColor="#f3e8fd"
        />
        <StyledTreeItem
          nodeId="8"
          labelText="Promotions"
          labelIcon={LocalOfferIcon}
          labelInfo="733"
          color="#3c8039"
          bgColor="#e6f4ea"
        >
          <StyledTreeItem nodeId="r4" labelText="History" labelIcon={Label}>
            <StyledTreeItem
              nodeId="9"
              labelText="Promotions"
              labelIcon={LocalOfferIcon}
              labelInfo="733AA"
              labelExtra="extra"
              color="#3c8039"
              bgColor="#e00"
            />
            </StyledTreeItem>
          </StyledTreeItem>
        </StyledTreeItem>
      <StyledTreeItem nodeId="4" labelText="History" labelIcon={Label}>
        <StyledTreeItem
          nodeId="9"
          labelText="Promotions"
          labelIcon={LocalOfferIcon}
          labelInfo="733AA"
          labelExtra="extra"
          color="#3c8039"
          bgColor="#e6f4ea"
        />
      </StyledTreeItem>
    </TreeView>
  );
}

# A

https://codesandbox.io/s/bb1x9?file=/demo.js

import React from 'react';
import SvgIcon from '@material-ui/core/SvgIcon';
import { alpha, makeStyles, withStyles } from '@material-ui/core/styles';
import TreeView from '@material-ui/lab/TreeView';
import TreeItem from '@material-ui/lab/TreeItem';
import Typography from "@material-ui/core/Typography";


function MinusSquare(props) {
  return (
    <SvgIcon fontSize="inherit" style={{ width: 34, height: 32 }} {...props}>
      <path d="M22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0zM17.873 11.023h-11.826q-.375 0-.669.281t-.294.682v0q0 .401.294 .682t.669.281h11.826q.375 0 .669-.281t.294-.682v0q0-.401-.294-.682t-.669-.281z" />
    </SvgIcon>
  );
}

function PlusSquare(props) {
  return (
    <SvgIcon fontSize="inherit" style={{ width: 34, height: 32 }} {...props}>
      <path d="M22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0zM17.873 12.977h-4.923v4.896q0 .401-.281.682t-.682.281v0q-.375 0-.669-.281t-.294-.682v-4.896h-4.923q-.401 0-.682-.294t-.281-.669v0q0-.401.281-.682t.682-.281h4.923v-4.896q0-.401.294-.682t.669-.281v0q.401 0 .682.281t.281.682v4.896h4.923q.401 0 .682.281t.281.682v0q0 .375-.281.669t-.682.294z" />
    </SvgIcon>
  );
}

function CloseSquare(props) {
  return (
    <SvgIcon className="close" fontSize="inherit" style={{ width: 34, height: 32 }} {...props}>
      <path d="M17.485 17.512q-.281.281-.682.281t-.696-.268l-4.12-4.147-4.12 4.147q-.294.268-.696.268t-.682-.281-.281-.682.294-.669l4.12-4.147-4.12-4.147q-.294-.268-.294-.669t.281-.682.682-.281.696 .268l4.12 4.147 4.12-4.147q.294-.268.696-.268t.682.281 .281.669-.294.682l-4.12 4.147 4.12 4.147q.294.268 .294.669t-.281.682zM22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0z" />
    </SvgIcon>
  );
}

const StyledTreeItem = withStyles((theme) => ({
  // root: {height: '24px'},
  iconContainer: {
    height: '34px',
    '& .close': {
      opacity: 0.3,
      border: 'solid 1px red',
    },
  },
  group: {
    marginLeft: 7,
    paddingLeft: 18,
    borderLeft: `3px solid ${alpha(theme.palette.text.primary, 0.4)}`,
  },
  labelRoot: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(0., 0),
    margin : theme.spacing(0., 0),
    marginLeft: theme.spacing(1),
  },
  labelIcon: {
    marginRight: theme.spacing(4)
  },
  labelText: {
    fontWeight: "inherit",
    width: '40px',
    height: '32px',
    flexGrow: 1
  },
  labelCell: {
    fontWeight: "inherit",
    flexGrow: 1,
    height: '32px',
    borderLeft: 'solid 1px #57a',
    width: '20px',
    textAlign: 'center',
    verticalAlign: 'middle',
  },
  content: {
    borderTop: 'solid 1px silver',
    color: theme.palette.text.secondary,
    paddingRight: theme.spacing(0),
    verticalAlign: 'middle',
    alignItems: 'center',
    alignContent: 'center',
    fontWeight: theme.typography.fontWeightMedium,
    "$expanded > &": {
      fontWeight: theme.typography.fontWeightRegular
    }
  },
}))((props) => {  const {
  classes,
  labelText,
  labelIcon: LabelIcon,
  labelCell,
  labelInfo,
  labelExtra,
  color,
  bgColor,
  ...other
} = props;

return (
  <TreeItem className={classes.content}
    label={
      <div className={classes.labelRoot}>
        <Typography variant="body2" className={classes.labelText}>
          {labelText}
        </Typography>
        <Typography
          variant="caption"
          color="inherit" className={classes.labelCell} >
          {labelInfo} ddd
        </Typography>
        <Typography
          variant="caption"
          color="inherit"
          className={classes.labelCell}
        >
          {labelExtra}
        </Typography>
      </div>
    }
    style={{
      "--tree-view-color": color,
      "--tree-view-bg-color": bgColor
    }}
    classes={{
      root: classes.root,
      content: classes.content,
      expanded: classes.expanded,
      selected: classes.selected,
      group: classes.group,
      label: classes.label
    }}
    {...other}
  />
);
});

const useStyles = makeStyles({
  root: {
    height: 264,
    flexGrow: 1,
    // maxWidth: 400,
  },
});

export default function CustomizedTreeView() {
  const classes = useStyles();

  return (
    <TreeView
      className={classes.root}
      defaultExpanded={['1']}
      defaultCollapseIcon={<MinusSquare />}
      defaultExpandIcon={<PlusSquare />}
      defaultEndIcon={<CloseSquare />}
    >
      <StyledTreeItem nodeId="1" labelText='MAIN HEAD'
              labelInfo="AAAA" labelExtra='extra - ' >
        <StyledTreeItem nodeId="2"  labelText='S HEAD' labelInfo="BBB" labelExtra='extra 11 ' />
        <StyledTreeItem nodeId="3" label="Subtree with children" >
          <StyledTreeItem nodeId="6" label="Hello" />
          <StyledTreeItem nodeId="7" label="Sub-subtree with children">
            <StyledTreeItem nodeId="9" label="Child 1" />
            <StyledTreeItem nodeId="10" label="Child 2" />
            <StyledTreeItem nodeId="11" label="Child 3" />
          </StyledTreeItem>
          <StyledTreeItem nodeId="8" labelText="Hellooooooo with children"
              labelInfo="733AA"
              labelExtra="extra"
              color="#3c8039">
            <StyledTreeItem nodeId="9" label="Child 1" />
            <StyledTreeItem nodeId="10" label="Child 2" />
            <StyledTreeItem nodeId="11" label="Child 3" />
          </StyledTreeItem>
        </StyledTreeItem>
        <StyledTreeItem nodeId="4" label="World" />
        <StyledTreeItem nodeId="5" label="Something something" />
      </StyledTreeItem>
    </TreeView>
  );
}
