
import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import withWidth from "@material-ui/core/withWidth";

import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';

import { CRUD, TierCol } from '@anclient/semantier-st';

import { L } from '../../utils/langstr';
	import { Comprops, CrudComp, CrudCompW, DetailFormW } from '../../react/crud';
	import { ConfirmDialog } from '../../react/widgets/messagebox';
	import { TRecordForm } from '../../react/widgets/t-record-form';

import { UsersTier } from './users';

const styles = (theme) => ({
  root: {
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
class UserDetailstComp extends DetailFormW<Comprops & {tier: UsersTier}> {
	state = {
		record: {},
	};
	crud: any;
	tier: UsersTier;
	confirm: JSX.Element;
	handleClose: (event: {}, reason: "backdropClick" | "escapeKeyDown") => void;

	fields: TierCol[];

	constructor (props: Comprops & {tier: UsersTier}) {
		super(props);

		this.crud = props.crud;

		this.tier = props.tier;

		this.toCancel = this.toCancel.bind(this);
		this.toSave = this.toSave.bind(this);
		this.showConfirm = this.showConfirm.bind(this);
	}

	componentDidMount() {
		// statically load fields - style wil be updated each time of validating.
		this.fields = this.tier.fields( { remarks: {grid: {sm: 12, md: 12, lg: 12}} } );
		this.setState({});
	}

	toSave(e: React.MouseEvent<HTMLElement>) {
		if (e) e.stopPropagation();

		let that = this;

		if (this.tier.validate(this.tier.rec, this.fields))
			this.tier.saveRec(
				{ uri: this.props.uri,
				  crud: this.crud,
				  pkval: this.props.tier.pkval.v,
				},
				resp => {
					// NOTE should crud be moved to tier, just like the pkval?
					if (that.crud === CRUD.c) {
						that.crud = CRUD.u;
					}
					that.showConfirm(L('Saving Succeed!\n') + (resp.Body().msg() || ''));
					that.tier.rec.pswd = undefined;
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
				ok={L('OK')} cancel={false} open
				onClose={() => {
					that.confirm = undefined;
					that.setState({});
				} }
				msg={msg} />);
		this.setState({});
	}

	render () {
		const { classes, width } = this.props;

		let media = CrudCompW.getMedia(width);

		let c = this.crud === CRUD.c;
		let u = this.crud === CRUD.u;
		let title = c ? L('Create User')
					  : u ? L('Edit User')
					  : L('User Details');

		// let rec = this.state.record;

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
					fields={this.fields || []}
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

const UserDetailst = withWidth()(withStyles(styles)(UserDetailstComp));
export { UserDetailst, UserDetailstComp };
