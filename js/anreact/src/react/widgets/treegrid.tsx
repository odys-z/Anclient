import React from "react";
import { Theme } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Collapse from "@material-ui/core/Collapse";
import Typography from "@material-ui/core/Typography";
import withStyles from "@material-ui/core/styles/withStyles";
import withWidth from "@material-ui/core/withWidth";

import { AnTreeNode, IndentIconame, StreeTier, toBool } from "@anclient/semantier";

import { AnTreegridCol, TreeItemProps, icon, levelIcons } from "./tree";
import { CrudCompW } from "../crud";
import { ClassNames, Media, hide } from "../anreact";
import { TreeCardComp } from "./tree-editor";
import { AnTablistProps } from "./table-list";
import { Button, PropTypes } from "@material-ui/core";
import { JsampleIcons } from "../../jsample/styles";
import { L } from "../../utils/langstr";

const styles = (theme: Theme) => ({
  root: { width: "100%", },
  row: {
    width: "100%",
    "& :hover": { backgroundColor: "#ced" }
  },
  th: {
	  textAlign: 'center' as const,
	  paddingTop: '0.25em',
	  paddingBottom: '0.25em',
	  borderBottom: '1px solid #bcd',
    BackgroundCollor: "#dde5ed"
  },
  rowHead: {
    padding: theme.spacing(1),
    paddingTop: 0,
    paddingBottom: 0,
  },
  folder: { width: "100%" },
  folderHead: {
    padding: theme.spacing(1),
    paddingTop: 0,
    paddingBottom: 0,
    borderBottom: "1px solid #bcd",
    borderTop: "1px solid #bcd"
  },
  hide: { display: "none" },
  treeItem: {
    padding: theme.spacing(1),
    paddingTop: 0,
    paddingBottom: 0,
    borderLeft: "1px solid #bcd",
  }
});

class AnTreegridComp extends CrudCompW<TreeItemProps> {
  state = {
	  window: undefined,
    expandings: new Set(),
    // tobeLoad: true
  };

  editForm: JSX.Element;
  stier: StreeTier;

  constructor(props: AnTablistProps) {
    super(props);

    this.stier = this.props.tier as StreeTier;

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

	static th(columns: Array<AnTreegridCol> = [],
            classes: ClassNames, media: Media,
            opts: {onThClick: (e: React.MouseEvent<any>, colx: number) => void} ) {
	  return (
      <Grid container className={classes.th} >
      {columns
        .filter( v => toBool(v.visible, true))
        .map( (col: AnTreegridCol, ix: number) => {
          if (col.thFormatter) return col.thFormatter(col, ix, {classes, media});
          if (col.type === 'actions') return (
            <Grid item key={ix} {...col.grid}>
              <Button onClick={(e) => opts.onThClick(e, ix)}
                data-me={undefined} date-parent={undefined}
                startIcon={<JsampleIcons.ListAdd />} color="primary" >
                {media.isMd && L('New')}
              </Button>
            </Grid>);
          else return (
            <Grid item key={ix} {...col.grid}>
              {col.label || col.field}
            </Grid>);
          } )
      }
      </Grid>);
  }
	
  /**
   * @param {object} classes
   */
  treeNodes(classes: ClassNames, media: Media) {
    let that = this;

    let m = this.stier.forest || this.props.testData;

    let expandItem = this.toExpandItem;
    // let mtree = buildTreegrid( m );
    // return mtree;
		return (<div>{buildTreegrid(m)}</div>);

    function buildTreegrid(tn: AnTreeNode[] | AnTreeNode) {
      if (Array.isArray(tn)) 
        return <div>{tn.map((i, x) => buildTreegrid(i))}</div>;
      else {
        let open = that.state.expandings.has(tn.id);
        if (tn.node.children?.length > 0)
          return folder(that.props.columns, tn, open);
        else
          return iconItem(that.props.columns, tn);
      }
    }

    function align(css?: React.CSSProperties) : PropTypes.Alignment {
      return css?.textAlign ? css.textAlign as PropTypes.Alignment : 'center'; //
    }

    // function folder_back(cols: AnTreegridCol[], menu: AnTreeNode, open: boolean) {
    //   return (
    //     <div key={menu.id} className={classes.folder}>
    //       <div  id={menu.id} onClick={expandItem}
    //             className={classes.folderHead} >
    //         <Grid container spacing={0}>
    //             <Grid item xs={6} >
    //             <Typography noWrap>
    //                 {levelIcons(
    //                   that.props.indentSettings,
    //                   menu.indents as IndentIconame[])}
    //                 {open ?
    //                   icon(that.props.indentIcons, "expand", 0) :
    //                   icon(that.props.indentIcons, "collapse", 0)}
    //                 {menu.node.text}
    //             </Typography>
    //             </Grid>
    //             <Grid item xs={2} >
    //               {!open && <Typography>{`[${menu.node.children?.length}]`}</Typography>}
    //             </Grid>
    //             <Grid item xs={1}>
    //               {icon(that.props.indentIcons, menu.node.css.icon || "[]", 0)}
    //             </Grid>
    //         </Grid>
    //         </div>
    //         <Collapse in={open} timeout="auto" unmountOnExit>
    //           {buildTreegrid(menu.node.children)}
    //         </Collapse>
    //     </div>
    //   );
    // }

    function folder(cols: AnTreegridCol[], n: AnTreeNode, open: boolean) {
      return (
        <div key={n.id} className={classes.folder}>
          <Grid container id={n.id} onClick={expandItem} className={classes.folderHead} >
            { cols
              .filter( (v: AnTreegridCol) => toBool(v.visible, true) )
              .map( (col: AnTreegridCol, cx: number) => {
                if (cx === 0) return (
                  // no array of p is allowed as Typography' children
                  <Grid key={`${n.id}.${cx}`} item {...col.grid} >
                    <Typography noWrap variant='body2'>
                      {levelIcons(that.props.indentSettings, n.indents)}
                      {open ?
                        icon(that.props.indentIcons, "expand", 0) :
                        icon(that.props.indentIcons, "collapse", 0)}
                      {`${n.node[col.field]} ${open ? '' : `[${n.node.children?.length}]`}`}
                    </Typography>
                  </Grid> );
                else if (col.type === 'actions')
                  return ( hide(col.grid, media) ? undefined :
                    TreeCardComp.actionFragment(n, col, cx, this, that.props));
                else return (
                  hide(col.grid, media) ? undefined :
                  <Grid key={`${n.id}.${cx}`} item {...col.grid} className={classes.treeItem}>
                    { typeof col.colFormatter === 'function' ?
                      col.colFormatter(col, n, {media, classes}) :
                      <Typography noWrap variant='body2' align={align(n.node.css)} >
                        {n.node[col.field]}
                      </Typography>
                    }
                  </Grid> );
              })
            }
          </Grid>
          <Collapse in={open} timeout="auto" unmountOnExit>
            {buildTreegrid(n.node.children)}
          </Collapse>
        </div>
      );
    }

    function iconItem (cols: AnTreegridCol[], n: AnTreeNode) {
      return (
        <Grid container key={n.id} spacing={0} className={classes.row} >
          { that.props.columns
            .filter( (v: AnTreegridCol) => toBool(v.visible, true) )
            .map( (col: AnTreegridCol, cx: number) => {
              if (cx === 0) return (
                // hide(col.grid, media) ? undefined :
                <Grid key={`${n.id}.${cx}`} item {...col.grid} className={classes.rowHead}>
                  <Typography noWrap variant='body2'>
                    {levelIcons(that.props.indentSettings, n.indents)}
                    {n.node[col.field]}
                  </Typography>
                </Grid> );
              else if (col.type === 'actions')
                return ( hide(col.grid, media) ? undefined :
                  TreeCardComp.actionFragment(n, col, cx, this, that.props));
              else return (
                hide(col.grid, media) ? undefined :
                <Grid key={`${n.id}.${cx}`} item {...col.grid} className={classes.treeItem}>
                  { typeof col.colFormatter === 'function' ?
                    col.colFormatter(col, n) :
                    <Typography noWrap variant='body2' align={align(n.node.css)} >
                      {n.node[col.field]}
                    </Typography>
                  }
                </Grid> );
            } )
          }
        </Grid>);
    }

    // function gridItem(cols: AnTreegridCol[], menu: AnTreeNode) {
    //   return (
    //     <Grid container
    //       key={menu.id}
    //       spacing={0}
    //       className={classes.row}
    //     >
    //       <Grid item xs={4} className={classes.rowHead}>
    //         <Typography noWrap>
    //           {levelIcons(that.props.indentSettings, menu.indents as IndentIconame[])}
    //           {icon(that.props.indentIcons, "-", 0)}
    //           {menu.node.text}
    //         </Typography>
    //       </Grid>
    //       <Grid item xs={4} className={classes.treeItem}>
    //         <Typography noWrap align={align(menu.node.css)}>{menu.node.mime}</Typography>
    //       </Grid>
    //       <Grid item xs={4} className={classes.treeItem}>
    //         <Typography align={align(menu.node.css)}>{menu.url}</Typography>
    //       </Grid>
    //     </Grid>);
    // }
  }

  render() {
    const { classes, width } = this.props;
		let media = CrudCompW.getMedia(width);

    return (
      <div className={classes.root}>
        {AnTreegridComp.th(this.props.columns, classes, media, {onThClick: this.props.th})}
        {this.treeNodes(classes, media)}
        {this.editForm}
      </div>);
  }
}

/**
 * Supported ColTypes: iconame, text, action, formatter (AnlistColAttrs.fomatter),
 * 
 * Where iconame is a combination of icon and text configured by 
 */
const AnTreegrid = withStyles<any, any, AnTablistProps>(styles)(withWidth()(AnTreegridComp));
export { AnTreegrid, AnTreegridComp }
