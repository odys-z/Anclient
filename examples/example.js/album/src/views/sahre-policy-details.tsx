import React from 'react';
import withStyles from "@material-ui/core/styles/withStyles";
import withWidth from "@material-ui/core/withWidth";

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import { Theme } from '@material-ui/core';

import { CRUD, PkVal, Protocol } from '@anclient/semantier';

import { L, AnContext, jsample, Comprops, DetailFormW, ConfirmDialog, AnRelationTree, TRecordForm
} from '@anclient/anreact'
import { AlbumEditier } from '../album-editier';
const {JsampleIcons} = jsample;

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

class SharePolicyDetailsComp extends DetailFormW<Comprops & {tier: AlbumEditier} & { relsk: string }> {

	state = {
		crud: CRUD.r,
		dirty: false,
		closed: false,

		pk: undefined,
		record: undefined,
	};

	// pkval: PkVal = {pk: undefined, v: undefined};
	tier: AlbumEditier;
	ok: JSX.Element | undefined;

	constructor (props: Comprops & {tier: AlbumEditier} & { relsk: string }) {
		super(props);

		this.tier  = props.tier;
		this.tier.pkval = { pk: 'pid', v: props.pk };

		this.state.crud = props.crud || CRUD.c;

		this.toSave = this.toSave.bind(this);
		this.toCancel = this.toCancel.bind(this);
		this.comfirm = this.comfirm.bind(this);
	}

	componentDidMount() {
	}

	handleClose = ((event: {}, reason: "backdropClick" | "escapeKeyDown") => {
		this.tier.rec = undefined;
	});

	toSave(e: React.MouseEvent<HTMLElement>) {
		e.stopPropagation();

		if (!this.tier.validate()) {
			this.setState({});
		}
		else {
			let that = this;
			this.tier.saveRec({crud: this.state.crud, reltabl: 'a_role_func'},
				() => {
					if (that.state.crud === CRUD.c)
						that.setState({ crud: CRUD.u} );
					that.comfirm(L('Data Saved!'));
				});
		}
	}

	toCancel (e: React.MouseEvent<HTMLElement>) {
		e.stopPropagation();
		if (typeof this.props.onClose === 'function')
			this.props.onClose({code: 'cancel'});
        else console.warn('OnClose event ignored.');
	}

	comfirm(txt: string | string[]) {
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
		const { classes, width } = this.props;
		let crud = this.state.crud;

		return (<>
		  <Dialog className={classes?.root}
			classes={{ paper: classes?.dialogPaper }}
			open={true} fullWidth maxWidth="lg"
			onClose={this.handleClose}
			scroll='paper'
		  >
			<DialogTitle id="u-title" color="primary" >
				{ L('Sharing with Groups') }
				{ this.state.dirty ? <JsampleIcons.Star color="secondary"/> : "" }
			</DialogTitle>
			<DialogContent className={classes?.content}>
				<TRecordForm uri={this.props.uri}
					tier={this.tier}
					mtabl='h_photos' pk='pid'
					fields={[
						{type: 'switch', field: 'shareFlag', grid: {sm: 6, md: 4}},
						{type: 'text',   field: 'shareby',   grid: {sm: 6, md: 4}},
						{type: 'text',   field: 'remarks',   grid: {sm: 12}}
					]}
				/>
				<AnRelationTree uri={this.props.uri}
					relMeta={{h_photo_user: {
                        stree: {sk: Protocol.sk.rel_photo_user, col: '', fk: 'org'},
                        childField: 'pid',
                        fk: {tabl: 'a_orgs', pk: 'orgId', col: 'org', relcolumn: 'org'}}
                    }}
					tier={this.tier}
					mtabl='h_photos' reltabl='h_photo_user'
					sqlArgs={[this.tier.pkval.v]}
				/>
			</DialogContent>
			<DialogActions className={classes?.buttons}>
			  { crud &&
				<Button onClick={this.toSave} variant="contained" color="primary">
					{L("Save")}
				</Button> }
			  <Button onClick={this.toCancel} variant="contained" color="primary">
				{crud ? L('Close') : L("Cancel")}
			  </Button>
			</DialogActions>
		  </Dialog>
		  {this.ok}
	  </>);
	}
}
SharePolicyDetailsComp.contextType = AnContext;

const SharePolicyDetails = withStyles<any, any, Comprops>(styles)(withWidth()(SharePolicyDetailsComp));
export { SharePolicyDetails, SharePolicyDetailsComp };
