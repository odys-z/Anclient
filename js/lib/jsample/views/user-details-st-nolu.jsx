
import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import withWidth from "@material-ui/core/withWidth";
import PropTypes from "prop-types";

import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';

import { L } from '../../utils/langstr';
	import { Protocol } from '../../protocol';
	import { DetailFormW } from '../../react/crud';
	import { AnConst } from '../../utils/consts';
	import { AnContext, AnError } from '../../react/reactext'
	import { ConfirmDialog } from '../../react/widgets/messagebox.jsx'
	import { TRecordForm } from '../../react/widgets/t-record-form-lu.jsx'
	import { TRelationTree } from '../../react/widgets/t-relation-tree.jsx'

const styles = (theme) => ({
  root: {
	// display: 'flex',
	// width: '100%',
	maxWidth: 720,
	margin: 'auto',
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
class UserDetailstComp extends DetailFormW {
	state = {
		record: {},
	};

	// recHook = {record: undefined, relations: [], collect: undefined}
	// relHook = {record: undefined, relations: [], collect: undefined}

	// NOTE
	// DESGIN MEMO: Users use this to customize the css & items to be visualized.
	// Actually field's type, validator should be semantics.
	recfields = [
		{ type: 'text', field: 'userId', label: L('Log ID'),
		  validator: {len: 12, notNull: true} },
		{ type: 'text', field: 'userName', label: L('User Name') },
		{ type: 'password', field: 'pswd', label: L('Password'),
		  validator: {notNull: true} },
		{ type: 'cbb', field: 'roleId', label: L('Role'),
		  grid: {md: 5}, style: {marginTop: "8px", width: 220 },
		  sk: Protocol.sk.cbbRole, nv: {n: 'text', v: 'value'},
		  validator: {notNull: true} },
		{ type: 'cbb', field: 'orgId', label: L('Organization'),
		  grid: {md: 5}, style: {marginTop: "8px", width: 220 },
		  sk: Protocol.sk.cbbOrg, nv: {n: 'text', v: 'value'},
		  validator: {notNull: true} },
	];

	// relfields = [
	// 	{ type: 'text', field: 'checked', label: L('checked') },
	// 	{ type: 'text', field: 'orgName', label: L('Organization') },
	// 	{ type: 'text', field: 'orgId',   label: L('orgId'), hide: 1 },
	// ];

	constructor (props = {}) {
		super(props);

		this.state.crud = props.crud;

		this.tier = props.tier;

		// if (props.stateHook)
		// 	props.stateHook.collect = function (me) {
		// 		let that = me;
		// 		return function(hookObj) {
		// 			let rec = {};
		// 			that.recHook.collect(rec);
		// 			hookObj.record = rec.state;
		//
		// 			that.relHook.collect(rec);
		// 			hookObj.relations.push(rec.state);
		// 		}; }(this);

		this.toCancel = this.toCancel.bind(this);
		this.toSave = this.toSave.bind(this);
		this.showConfirm = this.showConfirm.bind(this);
	}

	componentDidMount() {
		if (this.tier.pkval) {
			let that = this;
			let cond = {};
			cond[this.tier.pk] = this.tier.pkval;
			this.tier.record(cond, (cols, rows, fkOpts) => {
				that.setState({record: rows[0]});
			} );
		}
	}

	toSave(e) {
		if (e) e.stopPropagation();

		let that = this;

		// not used in level-up
		// if (typeof this.recHook.collect === 'function')
		// 	this.recHook.collect(this.recHook);
		//
		// if (typeof this.relHook.collect === 'function')
		// 	this.relHook.collect(this.relHook);

		if (this.tier.validate(this.tier.rec, this.recfields))
			this.tier.saveRec(
				{ uri: this.props.uri,
				  crud: this.state.crud,
				  pkval: this.props.tier.pkval,
				  // record: this.recHook.record,
				  // relations: this.relHook.relations
				},
				resp => {
					// NOTE should crud be moved to tier, just like the pkval?
					if (that.state.crud === Protocol.CRUD.c) {
						that.state.crud = Protocol.CRUD.u;
					}
					that.showConfirm(L('Saving Succeed!\n') + (resp.Body().msg() || ''));
					if (typeof that.props.onSaved === 'function')
						that.props.onSaved(resp);
				} );
		else this.setState({});
	}

	toCancel (e) {
		e.stopPropagation();
		if (typeof this.props.onClose === 'function')
			this.props.onClose({code: 'cancel'});
	}

	showConfirm(msg) {
		let that = this;
		this.confirm = (
			<ConfirmDialog title={L('Info')}
				ok={L('Ok')} cancel={false} open
				onClose={() => {that.confirm = undefined;} }
				msg={msg} />);
		this.setState({});
	}

	render () {
		const { tier, classes, width } = this.props;

		let c = this.state.crud === Protocol.CRUD.c;
		let u = this.state.crud === Protocol.CRUD.u;
		let title = c ? L('Create User')
					  : u ? L('Edit User')
					  : L('User Details');

		let rec = this.state.record;

		return (<>
		  <Dialog className={classes.root}
			classes={{ paper: classes.dialogPaper }}
			open={true} fullWidth maxWidth="lg"
			onClose={this.handleClose}
		  >
			<DialogContent className={classes.content}>
			  <DialogTitle id="u-title" color="primary" >
				{title} - {c ? L("New") : u ? L("Edit") : ''}
			  </DialogTitle>
				<TRecordForm uri={this.props.uri}
					tier={this.tier}
					fields={this.recfields}
				/>
			</DialogContent>
			<DialogActions className={classes.buttons}>
			  {(c || u) &&
				<Button onClick={this.toSave} variant="contained" color="primary">
					{L("Save")}
				</Button>
			  }
			  <Button onClick={this.toCancel} variant="contained" color="primary">
				{(c || u) ? L("Close") : L("Cancel")}
			  </Button>
			</DialogActions>
		  </Dialog>
		  {this.confirm}
		</>);
	}
}

UserDetailstComp.propTypes = {
	uri: PropTypes.string.isRequired,	// because cbb binding needs data access
	tier: PropTypes.object.isRequired,
	crud: PropTypes.string.isRequired,
	stateHook: PropTypes.object,		// not required for readonly mode
	dense: PropTypes.bool
};

const UserDetailst = withWidth()(withStyles(styles)(UserDetailstComp));
export { UserDetailst, UserDetailstComp };
