import React from 'react';
import withStyles from "@material-ui/core/styles/withStyles";
import withWidth from "@material-ui/core/withWidth";

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';

import { Theme } from '@material-ui/core';

import { CRUD, Protocol } from '@anclient/semantier';

import { L, AnContext, jsample, Comprops, DetailFormW, ConfirmDialog, AnRelationTree } from '@anclient/anreact'
import { AlbumEditier } from '../tiers/album-tier';
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

/**
 * TODO
 */
class ConnectionDetailsComp extends DetailFormW<Comprops & {tier: AlbumEditier} & { relsk: string }> {

	state = {
		dirty: false,
		closed: false,
		record: undefined,
	};

	tier: AlbumEditier;
	ok: JSX.Element | undefined;

	constructor (props: Comprops & {tier: AlbumEditier} & { relsk: string }) {
		super(props);

		this.tier  = props.tier;
		this.tier.pkval = { pk: 'pid', v: props.pk, tabl: 'h_photos' };

		// this.state.crud = props.crud || CRUD.c;

		this.saveConnect = this.saveConnect.bind(this);
		this.toCancel = this.toCancel.bind(this);
		this.comfirm = this.comfirm.bind(this);
	}

	componentDidMount() {
	}

	handleClose = ((_event: {}, _reason: "backdropClick" | "escapeKeyDown") => {
		this.tier.rec = undefined;
	});

	saveConnect(e: React.MouseEvent<HTMLElement>) {
		e.stopPropagation();

		if (!this.tier.validate()) {
			this.setState({});
		}
		else {
			let that = this;

			this.tier.saveRec({crud: CRUD.u, reltabl: 'h_coll_filter', clearelation: false},
				() => {
					// if (that.state.crud === CRUD.c)
					// 	that.setState({ crud: CRUD.u} );
					that.comfirm(L('Data Saved!'));
					that.setState({});
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
		return (<>
		  <Dialog className={classes?.root}
			classes={{ paper: classes?.dialogPaper }}
			open={true} fullWidth maxWidth="lg"
			onClose={this.handleClose}
			scroll='paper'
		  >
			<DialogTitle id="u-title" color="primary" >
				{ L('Filter Groups') }
				{ this.state.dirty ? <JsampleIcons.Star color="secondary"/> : "" }
			</DialogTitle>
			<DialogContent className={classes?.content}>
			  <AnRelationTree uri={this.props.uri}
				relMeta={{ h_coll_filter: {
					stree: {sk: Protocol.sk.rel_photo_orgs,
						fk: 'pid',
						col: 'oid' as string,
						colProp: 'nodeId',
						childTabl : 'h_coll_filter',
						sqlArgs: [this.tier.pkval.v] },
					childField: 'pid',
				}}}
				tier={this.tier}
				mtabl='h_photos' reltabl='h_coll_filter'
				sqlArgs={[this.tier.pkval.v]}
			  /> 
			</DialogContent>
			<DialogActions className={classes?.buttons}>
			  <Button onClick={this.saveConnect} variant="contained" color="primary">
				{L("Save")}
			  </Button>
			  <Button onClick={this.toCancel} variant="contained" color="primary">
				{L('Close')}
			  </Button>
			</DialogActions>
		  </Dialog>
		  {this.ok}
	  </>);
	}
}
ConnectionDetailsComp.contextType = AnContext;

const ConnectionDetails = withStyles<any, any, Comprops>(styles)(withWidth()(ConnectionDetailsComp));
export { ConnectionDetails, ConnectionDetailsComp };
