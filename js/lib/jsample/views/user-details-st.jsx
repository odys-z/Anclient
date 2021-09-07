
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

import {
	L, toBool,
	AnConst, CrudCompW, DatasetCombo,
	TRecordFormComp, TRelationTreeComp,
	JsampleIcons,
} from 'anclient';

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
 * Tiered record form is a component for UI record layout, automaitcally bind data,
 * resolving FK's auto-cbb. As to child relation table, this component currently
 * is not planned to supprt. See performance issue: https://stackoverflow.com/a/66934465
 * <p>Issue: FK binding are triggered only once ? What about cascade cbbs ineraction?</p>
 */
class UserDetailstComp extends CrudCompW {
	state = {
	};

	recHook = {record: undefined, relations: [], collect: undefined}
	relHook = {record: undefined, relations: [], collect: undefined}

	constructor (props = {}) {
		super(props);

		this.tier = props.tier;

		if (props.stateHook)
			props.stateHook.collect = function (me) {
				let that = me;
				return function(hookObj){
					let rec = {};
					that.recHook.collect(rec);
					hookObj.record = rec.state;

					that.relHook.collect(rec);
					hookObj.relations.push(rec.state);
				}; }(this);
	}

	componentDidMount() {
		this.tier.record()
	}

	render () {
		const { tier, classes, width } = this.props;
		let media = CrudCompW.setWidth(width);

		let rec = this.props.record;

		return (
		  <Dialog className={classes.root}
			classes={{ paper: classes.dialogPaper }}
			open={true} fullWidth maxWidth="lg"
			onClose={this.handleClose}
		  >
			<DialogContent className={classes.content}>
			  <DialogTitle id="u-title" color="primary" >
				{title} - {c ? L("New") : u ? L("Edit") : ''}
			  </DialogTitle>
				<TRecordFormComp uri={this.props.uri}
					tier={this.tier}
					stateHook={recHook}/>
				<TRelationTreeComp uri={this.props.uri}
					tier={this.tier}
					stateHook={relHook}/>
			</DialogContent>
			<DialogActions className={classes.buttons}>
			  <Button onClick={this.toSave} variant="contained" color="primary">
				{(c || u) && L("Save")}
			  </Button>
			  <Button onClick={this.toCancel} variant="contained" color="primary">
				{(c || u) ? L("Close") : L("Cancel")}
			  </Button>
			</DialogActions>
		  </Dialog>);
	}
}

UserDetailstComp.propTypes = {
	uri: PropTypes.string.isRequired,	// because cbb binding needs data access
	tier: PropTypes.object.isRequired,
	stateHook: PropTypes.object,		// readonly is not required
	dense: PropTypes.bool
};

const UserDetailst = withWidth()(withStyles(styles)(UserDetailstComp));
export { UserDetailst, UserDetailstComp };
