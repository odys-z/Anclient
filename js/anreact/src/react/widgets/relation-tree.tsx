
import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import withWidth from "@material-ui/core/withWidth";
import { Theme } from '@material-ui/core/styles';

import Grid from '@material-ui/core/Grid';
import Box from "@material-ui/core/Box";
import Collapse from "@material-ui/core/Collapse";
import Checkbox from "@material-ui/core/Checkbox";
import Typography from "@material-ui/core/Typography";

import { AnDatasetResp, AnsonMsg, AnTreeNode, Semantier, toBool } from '@anclient/semantier';
import { L } from '../../utils/langstr';
import { Comprops, CrudCompW } from '../crud';
import { AnTreeIcons } from "./tree";
import { ClassNames } from '../anreact';
import { AnContextType } from '../reactext';

const styles = (theme: Theme) => ({
  root: {
	display: "flex",
	flexDirection: "column" as const,
	// textAlign: "left",
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
	textAlign: 'center' as const,
	paddingLeft: '8ch',
  }
});

/** FIXME shouldn't merge with relTree? */
interface RelationTreeProps extends Comprops {
	reltabl?: string;
	sk?: string;

	/**Semantier.formatRel() use this name to format relationship records,
	 * where in UI component the FK value comes from
	 *
	 * FIXME shouldn't be changed to colProp
	 * */
	// relcolumn?: string;
	colProp?: string;
};

/**
 * Tiered relationshp tree is a component for UI relation tree layout, automaitcally bind data,
 * resolving FK's auto-cbb.
 *
 * See also {@link AnRelationTreeComp}
 */
class AnRelationTreeComp extends CrudCompW<RelationTreeProps> {
	state = {
		dirty: false,

		expandings: new Set(),
	};
	tier: Semantier;

	constructor(props) {
		super(props);

		this.tier = this.props.tier;

		this.toExpandItem = this.toExpandItem.bind(this);
		this.buildTree = this.buildTree.bind(this);
	}

	componentDidMount() {
		let that = this;
		this.tier.relations((this.context as unknown as AnContextType).anClient,
			{ uri: this.props.uri,
			  reltabl: this.props.reltabl,
			  sqlArg: this.tier.pkval.v,
			},
			(rels: AnsonMsg<AnDatasetResp>) => {
				// that.forest = rels.Body().forest as AnTreeNode[];
				that.setState({});
			} );
	}

	toExpandItem(e: React.MouseEvent<HTMLElement>) {
		e.stopPropagation();
		let f = e.currentTarget.getAttribute("data-nid");

		let expandings = this.state.expandings;
		if (expandings.has(f)) expandings.delete(f);
		else expandings.add(f);
		this.setState({ expandings });
	}

	/**
	 * @param classes
	 */
	buildTree(forest: AnTreeNode[], classes: ClassNames) {
		let that = this;

		let expandItem = this.toExpandItem;
		let checkbox = !this.props.disableCheckbox;

		return forest.map(
			(tree, tx) => {return treeItems(tree);}
		);

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
				  <Box  data-nid={id}
						onClick={expandItem}
						className={classes.folderHead}
				  >
					<Grid container spacing={0}>
					  <Grid item xs={11}>
						<Typography>
						  {leadingIcons(level)}
						  {node.css && node.css.icon && icon(node.css.icon)}
					  	  {checkbox
						   && <Checkbox color="primary" checked={toBool(node.checked)}
								onClick={e => e.stopPropagation()}
								onChange={(e) => {
								  e.stopPropagation();
								  node.checked = !toBool(node.checked);
								  // if (typeof that.props.onCheck === 'function')
									// that.props.onCheck(e);

									// checkAll(e.target.checked, node.children)
									node.children.forEach( c => { c.node.checked = e.target.checked } );
									that.setState({});
								}}/>
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
					  {checkbox
						  && <Checkbox color="primary" checked={toBool(node.checked)}
							onChange={(e) => {
									node.checked = e.target.checked;
									that.setState({});
								}} />
					  }
					  {node.text}
					</Typography>
				  </Grid>
				  <Grid item xs={3} className={classes.treeItem} >
					<Typography className={classes.treeLabel} >
						{itemLabel(node.label || node.text, level, node.css)}
					</Typography>
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
			return L(txt);
		}
	}

	render() {
		const { classes } = this.props;
		const forest = this.tier.rels[this.props.reltabl];

		return (
			<div className={classes.root}>
				{forest && this.buildTree(forest, classes)}
			</div> );
	}
}

const AnRelationTree = withStyles<any, any, RelationTreeProps>(styles)(withWidth()(AnRelationTreeComp));
export { AnRelationTree, AnRelationTreeComp, RelationTreeProps }
