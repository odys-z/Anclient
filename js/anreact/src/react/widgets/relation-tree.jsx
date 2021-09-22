
import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import withWidth from "@material-ui/core/withWidth";
import PropTypes from "prop-types";

import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Box from "@material-ui/core/Box";
import TextField from "@material-ui/core/TextField";
import Typography from '@material-ui/core/Typography';
import Input from '@material-ui/core/Input';

import { L } from '../../utils/langstr';
	import { toBool } from '../../utils/helpers';
	import { AnConst } from '../../utils/consts';
	import { CrudCompW } from '../crud';
	import { DatasetCombo } from './dataset-combo'
	import { JsampleIcons } from '../../jsample/styles';

const styles = (theme) => ({
	root: {
	display: 'flex',
	width: '100%',
	backgroundColor: '#fafafaee'
	},
	row: {
	width: '100%',
	'& :hover': {
	  backgroundColor: '#ced'
	}
	},
	rowHead: {
	padding: theme.spacing(1),
	},
	folder: {
	width: '100%'
	},
	hide: {
	display: 'none'
	},
	labelText: {
	padding: theme.spacing(1),
	borderLeft: '1px solid #bcd',
	},
	labelText_dense: {
	paddingLeft: theme.spacing(1),
	paddingRight: theme.spacing(1),
	borderLeft: '1px solid #bcd',
	}
});

/**
 * Tiered relationshp tree is a component for UI relation tree layout, automaitcally bind data,
 * resolving FK's auto-cbb.
 *
 * See also {@link AnRelationTreeComp}
 */
export class AnRelationTreeComp extends CrudCompW {
	state = {
		dirty: false,
		pk: undefined,
		pkval: undefined,
		record: {},
	};

	constructor(props) {
		super(props);

		this.toExpandItem = this.toExpandItem.bind(this);
		this.buildTree = this.buildTree.bind(this);
	}

	componentDidMount() {
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
			return txt;
		}
	}

	render() {
		const { classes } = this.props;
		this.state.forest = this.props.forest;

		return <div className={classes.root}>{this.buildTree(classes)}</div>;
	}
}

AnRelationTreeComp.propTypes = {
	uri: PropTypes.string.isRequired,	// because cbb binding needs data access
	tier: PropTypes.object.isRequired,
	dense: PropTypes.bool,
};

const AnRelationTree = withWidth()(withStyles(styles)(AnRelationTreeComp));
export { AnRelationTree }
