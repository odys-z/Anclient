import React from "react";
import { Theme } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Collapse from "@material-ui/core/Collapse";
import Typography from "@material-ui/core/Typography";
import withStyles from "@material-ui/core/styles/withStyles";
import withWidth from "@material-ui/core/withWidth";

import { AnTreeNode, StreeTier, toBool } from "@anclient/semantier";

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
    paddingTop: theme.spacing(1.25),
    paddingBottom: theme.spacing(1),
    borderBottom: '1px solid #bcd',
    BackgroundCollor: "#dde5ed"
  },
  thCell: {
    margin: 'auto',
    verticalAlign: 'middle',
    textShadow: `${theme.spacing(0.5)}px ${theme.spacing(0.5)}px ${theme.spacing(1)}px #112244`
  },
  rowHead: {
    paddingRight: theme.spacing(1),
    paddingLeft: 0,
    paddingTop: 0,
    paddingBottom: 0,
  },
  folder: { width: "100%" },
  folderHead: {
    paddingLeft: 0,
    paddingTop: 0,
    paddingBottom: 0,
    borderBottom: "1px solid #bcd",
    borderTop: "1px solid #bcd"
  },
  hide: { display: "none" },
  treeItem: {
    padding: theme.spacing(0.25),
    borderLeft: "1px solid #bcd",
  },
  icon: {
    verticalAlign: 'middle',
    height: theme.spacing(3),
  },
  toggle: {
    padding: 0,
    verticalAlign: 'middle',
    height: theme.spacing(4),
  }
});

class AnTreegridComp extends CrudCompW<TreeItemProps> {
  state = {
	  window: undefined,
    expandings: new Set(),
    selected: new Set<string>()
  };

  editForm: JSX.Element;

  constructor(props: AnTablistProps) {
    super(props);

    this.toExpandItem = this.toExpandItem.bind(this);
    this.treeNodes = this.treeNodes.bind(this);
    this.isSelected = this.isSelected.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  toExpandItem(e: React.MouseEvent<HTMLDivElement>) {
    e.stopPropagation();
    let id = e.currentTarget.id;

    let expandings = this.state.expandings;

    if (expandings.has(id)) expandings.delete(id);
    else expandings.add(id);
      this.setState({ expandings });
  }

  isSelected(k: string) {
		return this.state.selected.has(k);
	}

  updateSelectd (set: Set<string> | undefined) {
		if (typeof this.props.onSelectChange === 'function')
			this.props.onSelectChange(Array.from(set || []));
	}

	handleClick(e: React.UIEvent, newSelct: string) {
		let selected = this.state.selected;
		if (this.props.singleCheck) {
			selected.clear();
			selected.add(newSelct);
		}
		else {
			if (selected.has(newSelct)) {
				selected.delete(newSelct);
			}
			else selected.add(newSelct);
		}

		this.setState({});
		this.updateSelectd(selected);
	};

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
            hide(col.grid, media) ? undefined :
            <Grid item key={ix} {...col.grid} className={classes.thCell}>
              <Button onClick={(e) => opts.onThClick(e, ix)}
                data-me={undefined} date-parent={undefined}
                startIcon={<JsampleIcons.ListAdd />} color="primary" >
                {media.isMd && L('New')}
              </Button>
            </Grid>);
          else return (
            hide(col.grid, media) ? undefined :
            <Grid item key={ix} {...col.grid} className={classes.thCell}>
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

    let m = (this.props.tier as StreeTier).forest || this.props.testData;

    if (this.context.verbose)
      console.info('context.verbose', m);

    let expandItem = this.toExpandItem;
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
        <Grid container key={n.id}
            spacing={0} className={classes.row}
            onClick= { (e) => that.handleClick(e, n.id) }
        > {/* { that.props.columns */}
          { cols
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
                  TreeCardComp.actionFragment(n, col, cx, undefined, that.props));
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
            } )
          }
        </Grid>);
    }
  }

  render() {
    const { classes, width } = this.props;
		let media = CrudCompW.getMedia(width);

    return (
      <div className={classes.root}>
        {AnTreegridComp.th(this.props.columns, classes, media, {onThClick: this.props.th})}
        {this.props.tier && this.treeNodes(classes, media)}
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
