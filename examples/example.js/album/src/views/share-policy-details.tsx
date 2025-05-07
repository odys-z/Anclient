import React from 'react';
import withStyles from "@material-ui/core/styles/withStyles";
import withWidth from "@material-ui/core/withWidth";

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import ViewQuiltIcon from '@material-ui/icons/ViewQuilt'
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';

import { Theme } from '@material-ui/core';

import { CRUD, Protocol, Tierec, AnlistColAttrs, DbCol } from '@anclient/semantier';

import { L, AnContext, jsample, Comprops, DetailFormW, ConfirmDialog, AnRelationTree,
	TRecordForm, Media, ClassNames } from '@anclient/anreact'
import { AlbumEditier, Share } from '../tiers/album-tier';
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

class SharePolicyDetailsComp extends DetailFormW<Comprops & {tier: AlbumEditier, relsk: string, recType: 'doc' | 'folder' }> {

	state = {
		dirty: false,
		closed: false,

		// chkFolder : undefined as string | undefined,
		switchOn  : undefined as boolean | undefined,
		toggleOn  : undefined as boolean | undefined,
		toggleView: undefined as string | undefined,
	};

	tier: AlbumEditier;
	ok: JSX.Element | undefined;

	constructor (props: Comprops & {tier: AlbumEditier} & { relsk: string }) {
		super(props);

		this.tier  = props.tier;
		// this.tier.pkval = { pk: 'pid', v: props.pk, tabl: 'h_photos' };
		this.tier.pkval.tabl = 'h_photos';

		this.saveSharing = this.saveSharing.bind(this);
		this.toCancel = this.toCancel.bind(this);
		this.comfirm = this.comfirm.bind(this);
	}

	componentDidMount() {
	}

	handleClose = ((_event: {}, _reason: "backdropClick" | "escapeKeyDown") => {
		this.tier.rec = undefined;
	});

	/**
	 * Save relationships (checked items)
	 * 
	 * DESIGN MEMO this should be the complementary use case for Prism.
	 * @param e 
	 */
	saveSharing(e: React.MouseEvent<HTMLElement>) {
		e.stopPropagation();

		if (!this.tier.validate()) {
			this.setState({});
		}
		else if (this.props.rectype === 'p') {
			let that = this;
			this.tier.rec = Object.assign( this.tier.rec || {},
										  {shareFlag: this.state.switchOn && this.state.toggleOn ? Share.pub : Share.priv});
			let clearelation = this.tier.rec.shareFlag === Share.priv || !this.state.toggleOn;

			this.tier.saveRec({crud: CRUD.u, disableForm: true, reltabl: 'h_photo_org', clearelation},
				() => {
					that.comfirm(L('Data Saved!'));
					that.setState({});
				});
		}
		else if (this.props.rectype === 'folder') {
			let that = this;
			// this.tier.rec = {shareFlag: this.state.switchOn && this.state.toggleOn ? Share.pub : Share.priv};
			this.tier.rec = Object.assign( this.tier.rec || {},
										  {shareFlag: this.state.switchOn && this.state.toggleOn ? Share.pub : Share.priv});
			let clearelation = this.tier.rec.shareFlag === Share.priv || !this.state.toggleOn;
			this.tier.saveFolderPolicy({clearelation, subfolder: this.props.pk},
				() => {
					that.comfirm(L('Folder\'s sharing policy Saved!'));
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
		let that = this;

		return (<>
		  <Dialog className={classes?.root}
			classes={{ paper: classes?.dialogPaper }}
			open={true} fullWidth maxWidth="lg"
			onClose={this.handleClose}
			scroll='paper'
		  >
			<DialogTitle id="u-title" color="primary" >
				{ L('Sharing {t} with Groups', {t: this.props.recType === 'folder' ? L('folder') : L('doc')}) }
				{ this.state.dirty ? <JsampleIcons.Star color="secondary"/> : "" }
			</DialogTitle>
			<DialogContent className={classes?.content}>
				<TRecordForm uri={this.props.uri}
					tier={this.tier}
					mtabl='h_photos' pk='pid'
					fields={[
						{type: 'text',      field: 'shareby',   grid: {xs: 7,  lg: 9}, readOnly: true},
						{type: 'formatter', field: 'shareFlag', grid: {xs: 5,  lg: 3}, fieldFormatter: this.buttonSwitch},
						{type: 'text',      field: 'pname',     grid: {xs: 12, md: 6}, readOnly: true},
						{type: 'datetime',  field: 'createDate',grid: {xs: 12, md: 6}, readOnly: true}
					]}
					onLoad={(_cols: Array<DbCol>, rows: Array<Tierec>) => {
						that.setState({
							switchOn: rows[0].shareFlag !== Share.priv, 
							toggleOn: rows[0].shareFlag !== Share.priv && (rows[0].orgs as number) > 0 });
					}}
					onToggle={(_r: Tierec, _f: AnlistColAttrs<any, Comprops>, _state: boolean, toggled: boolean) => {
						that.setState({toggleOn: !toggled});
					}}
				/>
				{ this.state.switchOn && this.state.toggleOn && 
				  <AnRelationTree uri={this.props.uri}
				    // onFolderChange={(n: AnTreeNode, check: boolean) => {this.state.chkFolder = check ? n.nodeId as string : undefined;}}
					relMeta={{ h_photo_org: {
                        stree: {sk: this.props.rectype === 'folder' ?
									Protocol.sk.rel_folder_org : Protocol.sk.rel_photo_org,
								fk: 'pid',  colProp: 'nodeId',
								col: 'oid', childTabl : 'h_photo_org',
								sqlArgs: [this.tier.pkval.v] },
                        childField: 'pid',
                    }}}
					tier={this.tier}
					mtabl='h_photos' reltabl='h_photo_org'
					sqlArgs={[this.tier.pkval.v]}
				  /> }
			</DialogContent>
			<DialogActions className={classes?.buttons}>
			  <Button onClick={this.saveSharing} variant="contained" color="primary">
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

	buttonSwitch = ( (rec: Tierec, f: DbCol, fx: number,
		opts?: Comprops & {classes?: ClassNames, media?: Media}) => {
		let label = rec[f.field];
		let {classes, media} = opts || {};

		let that = this;

		let isSharing = that.state.switchOn === undefined ? rec.shareFlag !== Share.priv : that.state.switchOn;
		let isCustomi = that.state.toggleOn === undefined ? rec.shareFlag !== Share.priv && rec.orgs as number > 0 : that.state.toggleOn;
		return (
			<FormControlLabel key={'swch' + fx} className={classes?.rowBox}
				control={<>
					<Switch key={f.field}
						checked={isSharing}
						color='primary'
						onChange = { _e => {
							that.setState({switchOn: !isSharing});
						} } />
					{ isSharing && 
						<Button variant='contained'
							color={isCustomi? 'secondary' : 'primary'} size='small'
							className={classes?.button}
							onClick={toggle}
							startIcon={<ViewQuiltIcon />}
						> { toggleLabel(isCustomi) }
						</Button>
					}
				</> }
				label={ switchLabel(isSharing) } />
		);
		
		function toggle ( _e: React.UIEvent ) {
			that.setState( {toggleOn: !isCustomi});
		}

		function switchLabel( isharing: boolean ) {
			return isharing ? undefined : L('Share');
		}

		function toggleLabel( isCustom: boolean ) {
			return isCustom ? L('Customize') : L('Publice');
		}
	});
}
SharePolicyDetailsComp.contextType = AnContext;

const SharePolicyDetails = withStyles<any, any, Comprops>(styles)(withWidth()(SharePolicyDetailsComp));
export { SharePolicyDetails, SharePolicyDetailsComp };
