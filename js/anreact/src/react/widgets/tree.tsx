import React from "react";
import { Theme, withStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import Collapse from "@material-ui/core/Collapse";
import Checkbox from "@material-ui/core/Checkbox";
import Typography from "@material-ui/core/Typography";
import SvgIcon from "@material-ui/core/SvgIcon";
import {
	Drafts, Inbox, Send, ExpandLess, ExpandMore, Sms
} from "@material-ui/icons";
import PhotoLibraryOutlinedIcon from '@material-ui/icons/PhotoLibraryOutlined';
import PinDropOutlined from '@material-ui/icons/PinDropOutlined';
import Wallpaper from '@material-ui/icons/Wallpaper';
import MovieRounded from '@material-ui/icons/MovieRounded';
import FavoriteBorderOutlined from '@material-ui/icons/FavoriteBorderOutlined';

import { AnTreeIconsType, AnTreeNode, AnlistColAttrs, IndentIconame, IndentIcons, defltIcons, toBool } from '@anclient/semantier';
import { Comprops, CrudCompW } from "../crud";
import { ClassNames, CompOpts, Media } from "../anreact";
import { AnTablistProps } from "./table-list";

export const AnTreeIcons = {
	expand: <ExpandMore style={{verticalAlign: 'middle'}} />,
	collapse: <ExpandLess style={{verticalAlign: 'middle'}} />,
	"menu-lv0": <Send color="primary" style={{verticalAlign: 'middle'}} />,
	"menu-lv1": <Drafts color="primary" style={{verticalAlign: 'middle'}} />,
	"menu-leaf": <Sms color="primary" style={{verticalAlign: 'middle'}} />,
	deflt: <Inbox color="primary" style={{verticalAlign: 'middle'}} />,

	"-": <_Icon color="primary" style={{verticalAlign: 'middle'}} />,
	"F": <FIcon color="primary" style={{verticalAlign: 'middle', width: '2em', height: '2em'}} />,
	"|": <IIcon color="primary" style={{verticalAlign: 'middle', width: '2em', height: '2em'}} />,
	"T": <TIcon color="primary" style={{verticalAlign: 'middle', width: '2em', height: '2em'}} />,
	"L": <LIcon color="primary" style={{verticalAlign: 'middle', width: '2em', height: '2em'}} />,
	"|-": <EIcon color="primary" style={{verticalAlign: 'middle', width: '2em', height: '2em'}} />,
	"E": <EIcon color="primary" style={{verticalAlign: 'middle', width: '2em', height: '2em'}} />,
	"+": <XIcon color="primary" style={{verticalAlign: 'middle', width: '2em', height: '2em'}} />,
	".": <NIcon color="primary" style={{verticalAlign: 'middle', width: '2em', height: '2em'}} />,

	"pic-lib": <PhotoLibraryOutlinedIcon color="primary" style={{verticalAlign: 'middle', height: '1.5em', fontSize: '1.333333em'}} />,
	"!": <PinDropOutlined color="primary" style={{verticalAlign: 'middle', height: '1.5em', fontSize: '1.333333em'}} />,
	"[]": <Wallpaper color="primary" style={{verticalAlign: 'middle', height: '1.5em', fontSize: '1.333333em'}} />,
	">": <MovieRounded color="primary" style={{verticalAlign: 'middle', height: '1.5em', fontSize: '1.333333em'}} />,
	"b": <FavoriteBorderOutlined color="primary" style={{verticalAlign: 'middle', height: '1.5em', fontSize: '1.333333em'}} />,
};

function NIcon(props) {
  return (
	<SvgIcon fontSize="inherit" {...props}>
	  <path d="" />
	</SvgIcon>
  );
}

function FIcon(props) {
  return (
	<SvgIcon fontSize="inherit" {...props}>
	  <path d="M11.5 24 h1 v-11.5 h 11.5 v-1 h-12.5z M8 8 h8 v8 h-8z"/>
	</SvgIcon>
  );
}

function LIcon(props) {
  return (
	<SvgIcon fontSize="inherit" {...props}>
	  <path d="M24 12.5 v-1 h-11.5 v-11.5 h-1 v12.5z"/>
	</SvgIcon>
  );
}

function _Icon(props) {
  return (
	<SvgIcon fontSize="inherit" {...props}>
	  <path d="M 24 12.5 v-1 h-24 v1 h24z"/>
	</SvgIcon>
  );
}

function TIcon(props) {
  return (
	<SvgIcon fontSize="inherit" {...props}>
	  <path d="M11.5 24 h1 v-11.5 h11.5 v-1 h-24 v1 h11.5z" />
	</SvgIcon>
  );
}

/**
 * icon shape: | 
 * @param {*} props 
 * @returns 
 */
function IIcon(props) {
  return (
	<SvgIcon fontSize="inherit" {...props}>
	  <path d="M11.5 24 h1 v-24 h-1 v24z" />
	</SvgIcon>
  );
}

function XIcon(props) {
  return (
	<SvgIcon fontSize="inherit" {...props} viewBox="-6 -6 36 36">
	  <path d="M 19 3 H 5 c -1.11 0 -2 0.9 -2 2 v 14 c 0 1.1 0.89 2 2 2 h 14 c 1.1 0 2 -0.9 2 -2 V 5 c 0 -1.1 -0.9 -2 -2 -2 Z m -2 10 h -4 v 4 h -2 v -4 H 7 v -2 h 4 V 7 h 2 v 4 h 4 v 2 Z" />
	</SvgIcon>
  );
}

/**
 * |-
 * @param {*} props 
 * @returns 
 */
function EIcon(props) {
  return (
	<SvgIcon fontSize="inherit" {...props}>
	  <path d="M11.5 24 h1 v-11.5 h11.5 v-1 h-11.5 v-11.5 h-1z" />
	</SvgIcon>
  );
}

const styles = (_theme: Theme) => ({
  root: {
	display: "flex",
	flexDirection: "column" as any,
	textAlign: "left" as any,
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
	textAlign: 'center' as any,
	paddingLeft: '8ch',
  }
});

/**
 * NOTE: Not used by AnTreeComp yet within 0.4.27 
 * 
 * @see {@link IndentIconame}
 * @param iconNames 
 * @param lvlIcons 
 * @param itemIcon 
 * @param lastSibling 
 * @param hasChildren 
 * @param expand 
 * @returns indent fragment
 */
function levelIcons(iconNames: IndentIcons, lvls: IndentIconame[]) {
    return (<React.Fragment >
            {lvls && lvls.map( (i, x) => icon(iconNames, i, x) )}
        </React.Fragment>);
}

function icon(iconNames: IndentIcons, name: AnTreeIconsType | IndentIconame, k: string | number, classes?: string) {
    let icon = AnTreeIcons[(iconNames || defltIcons)[name || 'deflt']]
            || AnTreeIcons[name]; // extend to all supported icons
    if (!icon)
        console.error(`Icon name, ${name}, is not one of supported names.`, defltIcons);

	// icon 'pic-lib' is not exists
	// if (!name)
	//	return <div style={{paddingLeft: "8px"}}>{React.cloneElement(icon, {key:k})}</div>;
	
	if (classes)
		return (<div className={classes}>{React.cloneElement(icon, {key:k})}</div>);
	else
		return React.cloneElement(icon, {key: k});
}

interface AnTreegridCol extends AnlistColAttrs<JSX.Element, CompOpts> {
	/**
	 * Overide AnTablistProps#formatter
	 * Formatt a tree item cell/grid from col and node.
	 */
	colFormatter?: (col: AnTreegridCol, n: AnTreeNode, opts?: CompOpts) => JSX.Element;

	thFormatter?: (col: AnTreegridCol, colx: number, opts?: CompOpts) => JSX.Element;

	className?: string;
}

enum TreeNodeVisual {
	/** data item presented by {@link TreeCard} */
	card,
	/** container */
	gallery,
	/** invisible */
	hide,
	/** e.g. a container */
	collapsable
};

interface TreegridProps extends AnTablistProps {
	indentSettings?: IndentIcons;
	parent?: AnTreeNode | undefined;
	/** Root node, optional for possible of a forest, or provided by tier. */
	tnode? : AnTreeNode;
	columns: Array<AnTreegridCol>;

	onThClick?: (col: AnTreegridCol, cx: number) => void;

	testData?: Array<AnTreeNode>;
};

interface AnreactreeItem {
	node: AnTreeNode;
	toUp    : (e: React.MouseEvent<HTMLElement>) => void;
	toTop   : (e: React.MouseEvent<HTMLElement>) => void;
	toDown  : (e: React.MouseEvent<HTMLElement>) => void;
	toBottom: (e: React.MouseEvent<HTMLElement>) => void;

	toEdit? : (e: React.MouseEvent<HTMLElement>) => void;
	toDel?  : (e: React.MouseEvent<HTMLElement>) => void;
	/** or just move to AnTreeReact and calculate with java? */
	levelIcons?: Array<AnTreeIconsType>;

	/** format leading icons, according node.level */
	leadingIcons: () => JSX.Element | JSX.Element[];
}

class AnTreeComp extends CrudCompW<Comprops> {
  state = {
	// [{id, node, level}], where node is {checked text, css, children}
	forest: [],

	expandings: new Set()
  };

  constructor(props: Comprops) {
	super(props);
	this.state.forest = props.forest || [];

	this.toExpandItem = this.toExpandItem.bind(this);
	this.buildTree = this.buildTree.bind(this);
  }

  toExpandItem(e: React.UIEvent) {
	e.stopPropagation();
	let f = e.currentTarget.getAttribute("data-nid");

	let expandings = this.state.expandings;
	if (expandings.has(f)) expandings.delete(f);
	else expandings.add(f);
	this.setState({ expandings });
  }

  /**
   * @param {object} classes
   */
  buildTree(classes: ClassNames, media: Media) {
	let that = this;

	let expandItem = this.toExpandItem;

	return this.state.forest.map(
		(tree, _tx) => {return treeItems(tree);}
	);
	// return treeItems(this.state.forest[0] || {});

	function treeItems(stree) {
	  if (Array.isArray(stree)) {
		return stree.map((i, _x) => {
		  return treeItems(i);
		});
	  }
	  else {
		let open = that.state.expandings.has(stree.id);
		let {id, node, level} = stree;
		if (node.children && node.children.length > 0)
		  return (
			<Box key={id} className={classes.folder}>
			  <Box  data-nid={id}
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
				  { leadingIcons(level) }
				  { node.css && node.css.icon && icon(node.css.icon) }
				  { that.props.checkbox
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

	function icon(icon: string) {
	  return AnTreeIcons[icon || "deflt"];
	}

	function leadingIcons(count: number) {
	  let c = [];
	  for (let i = 0; i < count; i++)
		c.push(<React.Fragment key={i}>{icon(".")}</React.Fragment>);
	  return c;
	}

	function itemLabel(txt, _l, _css) {
		return txt;
	}
  }

  render() {
	const { classes, media } = this.props;
	this.state.forest = this.props.forest;

	return <div className={classes.root}>{this.buildTree(classes, media)}</div>;
  }
}

const AnTree = withStyles(styles)(AnTreeComp);
export { levelIcons, icon, TreeNodeVisual, AnTreegridCol,
		TreegridProps as TreeItemProps, AnreactreeItem, AnTree, AnTreeComp }
