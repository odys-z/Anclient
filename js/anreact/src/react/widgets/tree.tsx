import React from "react";
import type { Theme } from '@mui/material/styles';
import { withStyles, gridSize, withWidth } from '../mui-compat';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import SvgIcon from '@mui/material/SvgIcon';
import { Drafts, Inbox, Send, ExpandLess, ExpandMore, Sms } from '@mui/icons-material';
import PhotoLibraryOutlinedIcon from '@mui/icons-material/PhotoLibraryOutlined';
import PinDropOutlined from '@mui/icons-material/PinDropOutlined';
import Wallpaper from '@mui/icons-material/Wallpaper';
import MovieRounded from '@mui/icons-material/MovieRounded';
import FavoriteBorderOutlined from '@mui/icons-material/FavoriteBorderOutlined';

import { type AnTreeIconsType, AnTreeNode, type AnlistColAttrs, type IndentName, type IndentIcons, defltIcons, toBool } from '@anclient/semantier';
import { type Comprops, CrudCompW } from "../crud";
import type { ClassNames, CompOpts, Media } from "../anreact";
import type { AnTablistProps } from "./table-list";
import type { TreeDragPayload } from "./tree-drag";

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
	"[-]": <MIcon color="primary" style={{verticalAlign: 'middle', width: '2em', height: '2em'}} />,
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
 * The box of {@link XIcon}, '+' (collapsed), with a minus: an expanded node, '[-]'.
 * The minus is of the background colour, so the lines under the box (see {@link indentLine}) don't show through.
 * @since 0.8.2
 */
function MinusBoxIcon(props) {
  return (
	<SvgIcon fontSize="inherit" {...props} viewBox="-6 -6 36 36">
	  <path d="M 19 3 H 5 c -1.11 0 -2 0.9 -2 2 v 14 c 0 1.1 0.89 2 2 2 h 14 c 1.1 0 2 -0.9 2 -2 V 5 c 0 -1.1 -0.9 -2 -2 -2 Z" />
	  <path d="M 7 11 h 10 v 2 H 7 Z" fill="#fff" />
	</SvgIcon>
  );
}

/**
 * '[-]', an expanded node: {@link MinusBoxIcon} at the T junction, the line from the left,
 * on to the title and down to the children, as 'T' (in this icon's 36 units: 1.5 is 'T''s 1).
 * @since 0.8.2
 */
function MIcon(props) {
  return (
	<SvgIcon fontSize="inherit" {...props} viewBox="-6 -6 36 36">
	  <path d="M -6 11.25 h 36 v 1.5 h -36 Z M 11.25 12 h 1.5 v 18 h -1.5 Z" />
	  <path d="M 19 3 H 5 c -1.11 0 -2 0.9 -2 2 v 14 c 0 1.1 0.89 2 2 2 h 14 c 1.1 0 2 -0.9 2 -2 V 5 c 0 -1.1 -0.9 -2 -2 -2 Z" />
	  <path d="M 7 11 h 10 v 2 H 7 Z" fill="#fff" />
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
 * @see {@link IndentName}
 * @param iconNames 
 * @param lvlIcons 
 * @param itemIcon 
 * @param lastSibling 
 * @param hasChildren 
 * @param expand 
 * @returns indent fragment
 */
function levelIcons(iconNames: IndentIcons, lvls: IndentName[]) {
    return (<React.Fragment >
            {lvls && lvls.map( (i, x) => icon(iconNames, i, x) )}
        </React.Fragment>);
}

/**
 * y of a branch to its row's head: the middle of the head's first line, as the 2em icons of {@link AnTreeIcons}
 * @since 0.8.2
 */
const indentHeadY = '1em';

/**
 * The indent icons drawn as lines of an svg as high as the row, {@link indentLines}: [x1, y1, x2, y2].
 * The vertical lines reach the row's bottom however high the row is, e.g. a paragraph of a doc.
 * @since 0.8.2
 */
const IndentLines: Partial<Record<AnTreeIconsType, Array<[string, string, string, string]>>> = {
	'|' : [['50%', '0', '50%', '100%']],
	'|-': [['50%', '0', '50%', '100%'], ['50%', indentHeadY, '100%', indentHeadY]],
	'E' : [['50%', '0', '50%', '100%'], ['50%', indentHeadY, '100%', indentHeadY]],
	'L' : [['50%', '0', '50%', indentHeadY], ['50%', indentHeadY, '100%', indentHeadY]],
	'T' : [['0', indentHeadY, '100%', indentHeadY], ['50%', indentHeadY, '50%', '100%']],
	// expanded: the lines of 'T', the box of '[-]' over them (indentLine)
	'[-]': [['0', indentHeadY, '100%', indentHeadY], ['50%', indentHeadY, '50%', '100%']],
	'F' : [['50%', indentHeadY, '100%', indentHeadY], ['50%', indentHeadY, '50%', '100%']],
	'-' : [['0', indentHeadY, '100%', indentHeadY]],
	'.' : [],
};

/**
 * An indent of {@link indentLines}: the lines, or the icon if it isn't a line, e.g. '+', at the row's head.
 */
function indentLine(iconNames: IndentIcons | undefined, name: AnTreeIconsType | IndentName, k: string | number) {
	let type = ((iconNames || defltIcons)[name as IndentName] || name) as AnTreeIconsType;
	let lines = IndentLines[type];
	if (!lines)
		return (<Box key={k} component='span' sx={{flex: 'none', alignSelf: 'flex-start'}}>
					{icon(iconNames || defltIcons, name, k)}
				</Box>);

	return (
	  <Box key={k} component='span' sx={{flex: 'none', position: 'relative', width: '2em', minHeight: '2em', color: 'primary.main'}}>
		<svg width='100%' height='100%' style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}
			 stroke='currentColor' strokeWidth={1} shapeRendering='crispEdges' aria-hidden='true'>
		  {lines.map(([x1, y1, x2, y2], x) => <line key={x} x1={x1} y1={y1} x2={x2} y2={y2} />)}
		  {type === 'F' && <rect x='50%' y={indentHeadY} width={8} height={8} transform='translate(-4 -4)' fill='currentColor' />}
		</svg>
		{/* the toggle's box, 2em as the icons: centred on the junction (50%, indentHeadY) */}
		{type === '[-]' && <MinusBoxIcon color='primary'
				style={{position: 'absolute', left: 0, top: 0, width: '2em', height: '2em'}} />}
	  </Box>);
}

/**
 * A row's head: the indents as lines as high as the row, so the tree's links are not broken by a high
 * row, e.g. a paragraph or a picture; then the head's content, at the top. The row head (a grid cell)
 * should be as high as the row, which a cell of a Grid container is.
 * 
 * @param iconNames indent names to icons, default {@link defltIcons}
 * @param lvls the indents, e.g. AnTreeNode.indents, and the node's toggle, 'expand' or 'collapse'
 * @param children the head's content, e.g. the node's title
 * @since 0.8.2
 */
function indentLines(iconNames: IndentIcons | undefined, lvls: Array<IndentName | AnTreeIconsType> | undefined, children?: React.ReactNode) {
	return (
	  <Box component='span' sx={{display: 'flex', alignItems: 'stretch', height: '100%', minHeight: '2em'}}>
		{lvls && lvls.map((i, x) => indentLine(iconNames, i, x))}
		<Box component='span' sx={{alignSelf: 'flex-start', minWidth: 0, lineHeight: '2em',
					overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
			{children}
		</Box>
	  </Box>);
}

function icon(iconNames: IndentIcons, name: AnTreeIconsType | IndentName, k: string | number, classes?: string) {
    let icon = AnTreeIcons[(iconNames || defltIcons)[name || 'deflt']]
            || AnTreeIcons[name]; // extend to all supported icons
    if (!icon)
        console.error(`Icon name, ${name}, is not one of supported names.`, defltIcons);

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
	colFormatter?: (col: AnTreegridCol, n: AnTreeNode, opts?: CompOpts & {
		// classes?: ClassNames, media?: Media,
		/**
		 * Column index while rendering.
		 * React children can use this to generati key
		 */
		colx: number
	}) => JSX.Element;

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

	/**
	 * AnTreegrid: if provided, leaves for which this returns true are shown with a checkbox, and only
	 * they can be selected (clicked) - others have no checkbox and ignore clicks.
	 * @since 0.8.0
	 */
	checkable?: (n: AnTreeNode) => boolean;

	/**
	 * STUB (media story, WP1): nodes for which this returns a payload can be dragged out of the
	 * tree, e.g. treeDragPayload() (tree-drag.ts) for the album tree into the story editor.
	 * TODO WP1: AnTreegrid / TreeCard / TreeGallary render a drag handle; the drag engine is
	 * decided by the prototype (WP0).
	 */
	dragPayload?: (n: AnTreeNode) => TreeDragPayload | undefined;

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
				  <Grid size={gridSize({xs: 11})}>
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
				  <Grid size={gridSize({xs: 1})}>
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
			  <Grid className={classes.treeItem} size={gridSize({xs: 9})}>
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
			  <Grid className={classes.treeItem} size={gridSize({xs: 3})} >
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

const AnTree = withStyles<any, any, Comprops>(styles)(withWidth()(AnTreeComp));
export { levelIcons, indentLines, IndentLines, icon, TreeNodeVisual, type AnTreegridCol,
		type TreegridProps as TreeItemProps, type AnreactreeItem, AnTree, AnTreeComp }
