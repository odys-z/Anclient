import React from "react";
import { Theme } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Collapse from "@material-ui/core/Collapse";
import Typography from "@material-ui/core/Typography";
import withStyles from "@material-ui/core/styles/withStyles";
import withWidth from "@material-ui/core/withWidth";

import { AnTreeNode, AnlistColAttrs, IndentIconame, toBool } from "@anclient/semantier";

import { AnTreeIcons, icon, levelIcons } from "./tree";
import { Comprops, CrudCompW } from "../crud";
import { ClassNames, CompOpts, Media, hide } from "../anreact";
import { AnTreegridCol, CssTreeItem, TreeCardComp } from "./tree-editor";
import { AnTablistProps } from "./table-list";

const styles = (theme: Theme) => ({
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
	paddingTop: 0,
	paddingBottom: 0,
  },
  folder: {
	width: "100%"
  },
  folderHead: {
	padding: theme.spacing(1),
	paddingTop: 0,
	paddingBottom: 0,
	borderBottom: "1px solid #bcd",
	borderTop: "1px solid #bcd"
  },
  hide: {
	display: "none"
  },
  treeItem: {
	padding: theme.spacing(1),
	paddingTop: 0,
	paddingBottom: 0,
	borderLeft: "1px solid #bcd",
  }
});

class AnTreegridComp extends CrudCompW<AnTablistProps> {
  state = {
	window: undefined,

  treeData: [
    { "type": "io.odysz.semantic.DA.DatasetCfg$AnTreeNode",
      "id": "sys",
      "node": { "text": "Acadynamo", "fullpath": "1 sys", "checked": "0", "sort": "1",
        "children": [
         {"type": "io.odysz.semantic.DA.DatasetCfg$AnTreeNode",
          "id": "sys-domain",
          "node": { "text": "Domain Settings", "fullpath": "1 sys.1",
              "children": [
                { "type": "io.odysz.semantic.DA.DatasetCfg$AnTreeNode",
                  "node": { "text": "Profiles", "fullpath": "1 sys.1.1", "checked": "0", "sort": "1", "nodeId": "sys-d-profiles", "parentId": "sys-domain", "css": {} },
                  "parent": "io.odysz.anson.utils.TreeIndenode",
                  "indents": [ "vlink", "childx" ], "lastSibling": true, "level": 2,
                  "id": "sys-d-profiles", "parentId": "sys-domain"
                } ],
              "checked": "0", "sort": "1",
              "nodeId": "sys-domain", "parentId": "sys", "css": {}, "expandChildren": false
          },
          "indents": [ "childi" ], "lastSibling": false, "level": 1,
          "parentId": "sys", "parent": "io.odysz.anson.utils.TreeIndenode"
         },
         {"type": "io.odysz.semantic.DA.DatasetCfg$AnTreeNode",
          "node": { "text": "Role Manage", "fullpath": "1 sys.2", "checked": "0", "sort": "2", "nodeId": "sys-role", "parentId": "sys", "css": {} },
          "id": "sys-role",
          "parent": "io.odysz.anson.utils.TreeIndenode",
          "indents": [ "childi" ], "lastSibling": false, "level": 1,
          "parentId": "sys"
         }],
        "nodeId": "sys", "css": {},
        "expandChildren": false
      },
      "indents": [], "lastSibling": false, "level": 0,
      "parent": "io.odysz.anson.utils.TreeIndenode", "parentId": null
    },
    { "type": "io.odysz.semantic.DA.DatasetCfg$AnTreeNode",
      "id": "n01",
      "node": { "text": "North Pole", "fullpath": "2 n01", "checked": "0", "sort": "2", "nodeId": "n01", "css": {}, "expandChildren": false },
      "indents": [], "lastSibling": false, "level": 0,
      "parent": "io.odysz.anson.utils.TreeIndenode", "parentId": null
    }
  ] as AnTreeNode[],

	expandings: new Set()
  };

  constructor(props: AnTablistProps) {
	super(props);

	this.toExpandItem = this.toExpandItem.bind(this);
	this.treeNodes = this.treeNodes.bind(this);
  }

  toExpandItem(e: React.MouseEvent<HTMLDivElement>) {
	e.stopPropagation();
	let id = e.currentTarget.id;

	let expandings = this.state.expandings;
	if (expandings.has(id)) expandings.delete(id);
	else expandings.add(id);
	this.setState({ expandings });
  }

  /**
   * @param {object} classes
   */
  treeNodes(classes: ClassNames, media: Media) {
    let that = this;

    let m = this.state.treeData;
    let expandItem = this.toExpandItem;
    let mtree = buildTreegrid( m );
    return mtree;

    function buildTreegrid(menu: AnTreeNode[] | AnTreeNode) {
      if (Array.isArray(menu)) 
        return menu.map((i, x) => buildTreegrid(i));
      else {
        let open = that.state.expandings.has(menu.id);
        if (menu.node.children?.length > 0)
          return folder(that.props.columns, menu, open);
        else
          return iconItem(that.props.columns, menu);
          // gridItem(that.props.columns, menu);
      }
    }

    function align(css?: CSSStyleDeclaration) {
      // function align(css: CssTreeItem = {}) {
      return css?.align ? css.align : 'center'; //
    }

    function folder(cols: AnTreegridCol[], menu: AnTreeNode, open: boolean) {
      return (
        <div key={menu.id} className={classes.folder}>
          <div  id={menu.id} onClick={expandItem}
                className={classes.folderHead} >
            <Grid container spacing={0}>
                <Grid item xs={6} >
                <Typography noWrap>
                    {levelIcons(
                        that.props.indentSettings,
                        menu.indents as IndentIconame[])}
                    { open ?
                        icon(that.props.indentIcons, "expand", 0) :
                        icon(that.props.indentIcons, "collapse", 0)}
                    {menu.node.text}
                </Typography>
                </Grid>
                <Grid item xs={2} >
                  { !open && <Typography>{`[${menu.node.children?.length}]`}</Typography> }
                </Grid>
                <Grid item xs={1}>
                {icon(that.props.indentIcons, menu.node.css.icon || "[]", 0)}
                </Grid>
            </Grid>
            </div>
            <Collapse in={open} timeout="auto" unmountOnExit>
              {buildTreegrid(menu.node.children)}
            </Collapse>
        </div>
      );
    }

    function iconItem (cols: AnTreegridCol[], n: AnTreeNode) {
      return (
        <Grid container key={n.id} spacing={0} className={classes.row} >
          {/*
          <Grid item xs={4} className={classes.rowHead}>
            <Typography noWrap>
              {levelIcons(that.props.indentSettings, n.indents as IndentIconame[])}
              {icon(that.props.indentIcons, "-", 0)}
              {n.node.text}
            </Typography>
          </Grid>
          <Grid item xs={4} className={classes.treeItem}>
            <Typography noWrap align={align(n.node.css)}>{n.node.mime}</Typography>
          </Grid>
          <Grid item xs={4} className={classes.treeItem}>
            <Typography align={align(n.node.css)}>{n.url}</Typography>
          </Grid>*/}
          { that.props.columns
            .filter( (v: AnlistColAttrs<JSX.Element, CompOpts>) => toBool(v.visible, true) )
            .map( (col: AnlistColAttrs<JSX.Element, CompOpts>, cx: number) => {
              if (cx === 0) return (
                hide(col.grid, media) ? undefined :
                <Grid key={`${n.id}.${cx}`} item {...col.grid} className={classes.rowHead}>
                  <Typography noWrap variant='body2'>
                    {levelIcons(that.props.indentSettings, n.indents)}
                    {n.node.text}
                  </Typography>
                </Grid> );
              else if (col.type === 'actions')
                return ( hide(col.grid, media) ? undefined :
                  TreeCardComp.actionFragment(n, col, cx, this, that.props));
              else return (
                hide(col.grid, media) ? undefined :
                <Grid key={`${n.id}.${cx}`} item {...col.grid} className={classes.treeItem}>
                  { typeof col.formatter === 'function' ?
                    col.formatter(col, n) :
                    <Typography noWrap variant='body2' align={align(col.css)} >
                      {n.node.text}
                    </Typography>
                  }
                </Grid> );
            } )
          }
        </Grid>);
    }

    function gridItem(cols: AnTreegridCol[], menu: AnTreeNode) {
      return (
        <Grid container
          key={menu.id}
          spacing={0}
          className={classes.row}
        >
          <Grid item xs={4} className={classes.rowHead}>
            <Typography noWrap>
              {levelIcons(that.props.indentSettings, menu.indents as IndentIconame[])}
              {icon(that.props.indentIcons, "-", 0)}
              {menu.node.text}
            </Typography>
          </Grid>
          <Grid item xs={4} className={classes.treeItem}>
            <Typography noWrap align={align(menu.node.css)}>{menu.node.mime}</Typography>
          </Grid>
          <Grid item xs={4} className={classes.treeItem}>
            <Typography align={align(menu.node.css)}>{menu.url}</Typography>
          </Grid>
        </Grid>);
    }
  }

  render() {
    const { classes, width } = this.props;
		let media = CrudCompW.getMedia(width);
    return this.treeNodes(classes, media);
  }
}

/**
 * Supported ColTypes: iconame, text, action, formatter (AnlistColAttrs.fomatter),
 * 
 * Where iconame is a combination of icon and text configured by 
 */
const AnTreegrid = withStyles<any, any, AnTablistProps>(styles)(withWidth()(AnTreegridComp));
export { AnTreegrid, AnTreegridComp }
