import React from 'react';
import withStyles from "@material-ui/core/styles/withStyles";
import withWidth from "@material-ui/core/withWidth";

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';

import { AnlistColAttrs, CRUD, PkVal, Tierec } from '@anclient/semantier';

import { L, AnContext, Comprops, DetailFormW, ConfirmDialog, TRecordForm, jsample } from '@anclient/anreact';
import { OrgDomainsTier } from './org-domains';
import { Theme } from '@material-ui/core';

/**
 * Copied from ./org-details.tsx (from @anclient/anreact/jsample/views/role-details.tsx).
 * Both create and update are saved with the central's community.serv (OrgDomainsTier.port).
 */
const styles = (theme: Theme) => {
	return ({
		dialogPaper: {
			height: "100%"
		},
		root: {
			marginTop: theme.spacing(7.5),
			minHeight: "60vh",
			maxHeight: "86vh",
			maxWidth: "70vw",
			minWidth: theme.spacing(75),
			margin: "auto"
		},
		title: {
			backgroundColor: "linen",
			height: "5ch",
			width: "100%",
			color: "primary"
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
};

class DomainDetailsComp extends DetailFormW<Comprops & {tier: OrgDomainsTier}> {

	state = {
		crud: CRUD.r,
		dirty: false,
		closed: false,

		pk: undefined,
		record: undefined as Tierec,
	};

	pkval: PkVal = {pk: undefined, v: undefined};
	tier: OrgDomainsTier;
	ok: JSX.Element;

	constructor (props: Comprops & {tier: OrgDomainsTier}) {
		super(props);

		this.tier = props.tier;

		this.state.crud = props.crud;

		this.toSave = this.toSave.bind(this);
		this.toCancel = this.toCancel.bind(this);
		this.showOk = this.showOk.bind(this);
		this.handleClose = this.handleClose.bind(this);
	}

	componentDidMount() {
	}

	handleClose (event: {}, reason: "backdropClick" | "escapeKeyDown") {
		this.ok = undefined;
	};

	toSave(e: React.MouseEvent<HTMLElement>) {
		e.stopPropagation();

		if (!this.tier.validate()) {
	    	this.setState({});
		}
		else {
			let that = this;
			this.tier.saveRec({crud: this.state.crud, disableRelations: true, port: OrgDomainsTier.port},
				() => {
					if (that.state.crud === CRUD.c)
						that.setState({ crud: CRUD.u} );
					that.showOk(L('Data Saved!'));
				});
		}
	}

	toCancel (e: React.MouseEvent<HTMLElement>) {
		e.stopPropagation();
		if (typeof this.props.onClose === 'function')
			this.props.onClose({code: 'cancel'});
	}

	showOk(txt: string | string[]) {
		let that = this;
		this.ok = (
			<ConfirmDialog ok={L('OK')} open={true}
				title={L('Info')}
				cancel={false} msg={txt}
				onClose={() => {
					that.ok = undefined;
					that.setState( {dirty: false} );
				}}
			/>);

		if (typeof this.props.onSave === 'function')
			this.props.onSave({code: 'ok'});

		that.setState({dirty: false});
	}

	render () {
		const { classes } = this.props;

		let crud = this.state.crud;

		let title = crud === CRUD.c ? L('Create Domain')
					: crud === CRUD.u ? L('Edit Domain')
					: L('Domain Details');

		return (<>
		  <Dialog className={classes.root}
			classes={{ paper: classes.dialogPaper }}
			open={true} fullWidth maxWidth="lg"
			onClose={this.handleClose}
			scroll='paper'
		  >
			<DialogTitle id="u-title" color="primary" >
				{title}
				{this.state.dirty ? <jsample.JsampleIcons.Star color="secondary"/> : ""}
			</DialogTitle>
			<DialogContent className={classes.content}>
				<TRecordForm uri={this.props.uri}
					tier={this.tier}
					mtabl='c_syndomx' pk='domid'
					fields={this.tier.fields({
						domname: {grid: {sm: 12, md: 12, lg: 12}}
					}) as AnlistColAttrs<JSX.Element, Comprops>[]}
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
DomainDetailsComp.contextType = AnContext;

const DomainDetails = withStyles<any, any, Comprops>(styles)(withWidth()(DomainDetailsComp));
export { DomainDetails, DomainDetailsComp };
