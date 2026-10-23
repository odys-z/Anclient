import React from 'react';
import { withStyles, withWidth } from '@anclient/anreact';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';

import { AnlistColAttrs, CRUD, PkVal, Tierec } from '@anclient/semantier';

import { L, AnContext, Comprops, DetailFormW, ConfirmDialog, TRecordForm, AnTablist, stateFormatter, jsample
} from '@anclient/anreact';
import { OrgDomainsTier } from './org-domains';
import { synodeStates } from '../common/central-tier';
import { DomxResp, RegistResp } from '../common/registry';
import { Theme } from '@mui/material/styles';

/**
 * Copied from ./org-details.tsx (from @anclient/anreact/jsample/views/role-details.tsx).
 *
 * Creating: the domain is created with the central's domx.serv (OrgDomainsTier.createDomain()),
 * which also inserts the synodes planned by the central, <domid>-hub, <domid>-1, <domid>-2,
 * listed below the form while the domain id is typed; or loads the domain if it exists,
 * the same as synode.py's Create / Join Domain.
 *
 * Updating: saved with the central's community.serv (OrgDomainsTier.port);
 * the domain's synodes are listed with the states, jserv, etc. reported by the synodes.
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

		/** synodes of the domain, or planned ones while creating */
		synodes: [] as Tierec[],
		selected: {ids: new Map<string, Tierec>()},
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
		this.onFieldChange = this.onFieldChange.bind(this);
	}

	componentDidMount() {
		if (this.state.crud !== CRUD.c && this.tier.pkval.v)
			this.loadSynodes(this.tier.pkval.v as string);
	}

	loadSynodes(domid: string) {
		this.tier.synodes(domid, (_cols, rows) => this.setState({synodes: rows}));
	}

	/**
	 * While creating, the domain id is checked as it's typed (red if invalid),
	 * and the planned synodes follow a valid one.
	 */
	onFieldChange(rec: Tierec, f: {field: string}, _v: any) {
		if (this.state.crud === CRUD.c && f.field === 'domid') {
			let err = OrgDomainsTier.checkDomid(rec.domid as string);
			let fdomid = this.tier._fields.find(c => c.field === 'domid');
			if (fdomid) fdomid.style = err ? 'anyErr' : undefined;
			this.setState({synodes: err ? [] : OrgDomainsTier.plan(rec.domid as string)});
		}
	}

	handleClose (event: {}, reason: "backdropClick" | "escapeKeyDown") {
		this.ok = undefined;
	};

	toSave(e: React.MouseEvent<HTMLElement>) {
		e.stopPropagation();

		if (!this.tier.validate()) {
	    	this.setState({});
		}
		else if (this.state.crud === CRUD.c) {
			let err = OrgDomainsTier.checkDomid(this.tier.rec.domid as string);
			if (err)
				return this.showMsg(err);

			let that = this;
			this.tier.createDomain((rsp: DomxResp) => {
				that.setState({ crud: CRUD.u });
				that.loadSynodes(rsp.domid);
				that.showOk(rsp.r === RegistResp.R.ok
					? L('Domain created: {domid}', {domid: rsp.domid})
					: L('Domain already exists: {domid}', {domid: rsp.domid}));
			});
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

	/** A message without saving, e.g. invalid data. */
	showMsg(txt: string | string[]) {
		let that = this;
		this.ok = (
			<ConfirmDialog ok={L('OK')} open={true}
				title={L('Info')}
				cancel={false} msg={txt}
				onClose={() => {
					that.ok = undefined;
					that.setState({});
				}}
			/>);
		this.setState({});
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
					onChange={this.onFieldChange}
				/>
				<Typography variant='subtitle1' color='primary' style={{marginTop: 16}}>
					{L('Synodes')}
				</Typography>
				<Typography variant='caption' color='textSecondary' sx={{display: 'block'}}>
					{crud === CRUD.c
					  ? L('Planned by the central for the new domain. Each synode runs as the hub or a peer once installed.')
					  : L('States are what the synodes last reported to the central.')}
				</Typography>
				{/* copied from ./central-lists.tsx, SynodesList */}
				<AnTablist uri={this.props.uri} pk='sid' singleCheck
					selected={this.state.selected}
					rows={this.state.synodes}
					columns={[
						{ field: 'sid',    label: L('Synode'), grid: {} },
						{ field: 'mode',   label: L('Mode'), grid: {} },
						{ field: 'stat',   label: L('State'), formatter: stateFormatter(synodeStates), grid: {} },
						{ field: 'jserv',  label: L('Jserv'), grid: {} },
						{ field: 'ip',     label: L('IP (reported from)'), grid: {} },
						{ field: 'optime', label: L('Last reported'), grid: {} },
						{ field: 'oper',   label: L('By'), grid: {} },
					]}
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
