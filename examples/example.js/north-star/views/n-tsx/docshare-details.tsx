
import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import withWidth from "@material-ui/core/withWidth";

import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';

import { CRUD, TierCol, Tierec } from '@anclient/semantier';
import { L, AnContext,
	DetailFormW, ConfirmDialog, TRecordForm, AnRelationTree, Comprops
} from '@anclient/anreact';

import { starTheme } from '../../common/star-theme';
import { DocsTier } from './docshares';

const DocshareStyle = (theme) => ({
	dialogPaper: {
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
    content: {
      height: "100%",
    },
    buttons: {
      justifyContent: "center",
      verticalAlign: "middle",
      "& > button": {
        width: "20ch"
    },
  },
});

const styles = (theme) => Object.assign(starTheme(theme), DocshareStyle(theme));


export interface DocshareDetailProps extends Comprops {
	c?: boolean;
	u?: boolean;
	dense?: boolean;
	onOk: () => void;
	onClose: () => void;
};

/**
 * Tiered record form is a component for UI record layout, automaitcally bind data,
 * resolving FK's auto-cbb. As to child relation table, this component currently
 * is not planned to supprt.
 * <p>A kid always been saved as a "Dynamo"</p>
 */
class DocshareDetailsComp extends DetailFormW<DocshareDetailProps> {
	state = {
		record: {},
        crud: undefined
	};

    tier: DocsTier;
    confirm: JSX.Element;
    handleClose: (event: {}, reason: "backdropClick" | "escapeKeyDown") => void;

	constructor (props) {
		super(props);

		this.state.crud = props.crud ? props.crud
				: props.c ? CRUD.c
				: props.u ? CRUD.u
				: CRUD.r;

		this.tier = props.tier;

		this.toCancel = this.toCancel.bind(this);
		this.toSave = this.toSave.bind(this);
		this.showConfirm = this.showConfirm.bind(this);
	}

	componentDidMount() {
		if (this.tier.pkval) {
			let that = this;
			let cond = {};
			cond[this.tier.pk] = this.tier.pkval;
			this.tier.record(cond, () => {
				that.setState({});
			} );
		}
	}

	toSave(e: React.UIEvent) {
		if (e) e.stopPropagation();

		let that = this;

		if (this.tier.validate(this.tier.rec, this.tier.fields())) // field style updated
			this.tier.saveRec(
				{ crud: CRUD.u,
				  disableForm: true,
				  reltabl: 'n_doc_kid'
				},
				resp => {
					// NOTE should crud moved to tier, just like the pkval?
					if (that.state.crud === CRUD.c) {
						that.state.crud = CRUD.u;
					}
					that.showConfirm(L('Saving Succeed!\n') + (resp.Body().msg() || ''));
				} );
		else this.setState({});
	}

	toCancel (e: React.UIEvent) {
		e.stopPropagation();
		if (typeof this.props.onClose === 'function')
			this.props.onClose();
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
		const { tier, classes, width } = this.props;

		let c = this.state.crud === CRUD.c;
		let u = this.state.crud === CRUD.u;
		let title = L('Share Documents');

		// let rec = this.state.record;

		return (<>
		  <Dialog className={classes.root}
			classes={{ paper: classes.dialogPaper }}
			open={true} fullWidth maxWidth="lg"
			onClose={this.handleClose}
		  >
			<DialogTitle id="u-title" color="primary" >
				{title}
			</DialogTitle>
			<DialogContent className={classes.content}>
			  <Box className={classes.smalltip}>
				  {L('Tip: Document can been replaced by uploading another file.')}
			  </Box>
			  <TRecordForm uri={this.props.uri}
				  tier={this.tier}
				  mtabl='n_docs' pk='docId'
				  fields={this.tier.fields({
					  docId: {grid: {sm: 3, md: 2}},
					  mime: {grid: {sm: 4, md: 3}} })}
			  />
			  <AnRelationTree uri={this.props.uri}
				  tier={this.tier}
				  mtabl='n_doc_kid (optional)' reltabl='n_doc_kid'
				  sqlArgs={[this.tier.pkval]}
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
DocshareDetailsComp.contextType = AnContext;

const DocshareDetails = withWidth()(withStyles(styles)(DocshareDetailsComp));
export { DocshareDetails, DocshareDetailsComp };
