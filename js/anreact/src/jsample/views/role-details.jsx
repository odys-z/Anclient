import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import withWidth from "@material-ui/core/withWidth";
import PropTypes from "prop-types";

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';

import { Protocol, AnsonResp } from '@anclient/semantier';

import { L } from '../../utils/langstr';
	import { AnConst } from '../../utils/consts';
	import { AnContext, AnError } from '../../react/reactext'
	import { JsampleIcons } from '../styles'
	import { DetailFormW } from '../../react/crud'
	import { ConfirmDialog } from '../../react/widgets/messagebox'
	import { AnRelationTree } from '../../react/widgets/relation-tree';
	import { TRecordForm } from '../../react/widgets/t-record-form';

const { CRUD } = Protocol;

const styles = theme => ({
  dialogPaper: {
	// minHeight: "76vh"
	height: "100%"
  },
  root: {
	marginTop: 60,
	minHeight: "60vh",
	maxHeight: "86vh",
	maxWidth: "70vw",
	minWidth: 600,
	margin: "auto"
  },
  title: {
	backgroundColor: "linen",
	height: "5ch",
	width: "100%",
	color: "primary"
  },
  centre: { alignItems: "center" },
  lower: { height: "15%" },

  left: { alignItems: "center" },
  right: { alignItems: "center" },
  largeText: { width: "100%" },
  rowBox: {
	display: "flex",
	flexDirection: "row",
	alignItems: "center"
  },

  formLabel: {
	width: "12ch",
	textAlign: "right",
    paddingRight: theme.spacing(1),
  },
  formText: {
	textAlign: "right",
    paddingLeft: theme.spacing(1),
  },
  content: {
	height: "100%",
  },
  buttons: {
	justifyContent: "center",
	verticalAlign: "middle",
	"& > button": {
	  width: "20ch"
	}
  },
});

class RoleDetailsComp extends DetailFormW {
	state = {
		crud: CRUD.r,
		dirty: false,
		closed: false,

		pk: undefined,
		record: {},
	};

	constructor (props = {}) {
		super(props);

		this.tier = props.tier;

		this.state.crud = props.c ? CRUD.c : props.u ? CRUD.u : undefined;

		this.toSave = this.toSave.bind(this);
		this.toCancel = this.toCancel.bind(this);
		this.showOk = this.showOk.bind(this);
	}

	componentDidMount() {
	}

	toSave(e) {
		e.stopPropagation();

		if (!this.tier.validate()) {
	    	this.setState({});
		}
		else
			this.tier.saveRec({crud: this.state.crud},
				() => { this.showOk(L('Data Saved!')); });
	}

	toCancel (e) {
		e.stopPropagation();
		if (typeof this.props.onClose === 'function')
			this.props.onClose({code: 'cancel'});
	}

	showOk(txt) {
		let that = this;
		this.ok = (<ConfirmDialog ok={L('OK')} open={true}
					title={L('Info')}
					cancel={false} msg={txt}
					onClose={() => {that.ok === undefined} } />);

		if (typeof this.props.onSave === 'function')
			this.props.onSave({code: 'ok'});

		that.setState({dirty: false});
	}

	render () {
		const { classes, width } = this.props;
		const smallSize = new Set(["xs", "sm"]).has(width);

		let crud = this.state.crud;

		let title = crud === CRUD.c ? L('Create Role')
					: crud === CRUD.u ? L('Edit Role')
					: L('Role Details');

		return (<>
		  <Dialog className={classes.root}
			classes={{ paper: classes.dialogPaper }}
			open={true} fullWidth maxWidth="lg"
			onClose={this.handleClose}
			scroll='paper'
		  >
			<DialogTitle id="u-title" color="primary" >
				{title}
				{this.state.dirty ? <JsampleIcons.Star color="secondary"/> : ""}
			</DialogTitle>
			<DialogContent className={classes.content}>
				<TRecordForm uri={this.props.uri}
					tier={this.tier}
					mtabl='a_roles' pk='roleId'
					fields={this.tier.fields({
						remarks: {grid: {sm: 12, md: 12, lg: 12}}
					})}
				/>
				<AnRelationTree uri={this.props.uri}
					tier={this.tier}
					mtabl='a_roles (optional)' reltabl='a_role_func'
					sqlArgs={[this.state.pkval]}
				/>
			</DialogContent>
			<DialogActions className={classes.buttons}>
			  {crud &&
				<Button onClick={this.toSave} variant="contained" color="primary">
					{L("Save")}
				</Button>}
			  <Button onClick={this.toCancel} variant="contained" color="primary">
				{crud ? L('Close') : L("Cancel")}
			  </Button>
			</DialogActions>
		  </Dialog>
		  {this.ok}
	  </>);
	}
}
RoleDetailsComp.contextType = AnContext;

const RoleDetails = withWidth()(withStyles(styles)(RoleDetailsComp));
export { RoleDetails, RoleDetailsComp };
