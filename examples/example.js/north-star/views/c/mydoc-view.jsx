
import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import withWidth from "@material-ui/core/withWidth";
import PropTypes from "prop-types";

import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';

import { Protocol } from '@anclient/semantier';
import { L, AnContext,
	DetailFormW, ConfirmDialog, utils
} from '@anclient/anreact';

import { starTheme } from '../../common/star-theme';
import { docListyle } from '../n/docshares';

const { CRUD } = Protocol;
const { regex } = utils;

const styles = (theme) => Object.assign(starTheme(theme),
	Object.assign(docListyle(theme), {
    title: {
      backgroundColor: "linen",
      height: "5ch",
      width: "100%",
      color: "primary"
    },
    content: {
      height: "100%",
    },
} ));

class MyDocViewComp extends DetailFormW {
	state = {
		record: {},
	};

	constructor (props = {}) {
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
			this.tier.record(cond, (cols, rows, fkOpts) => {
				that.setState({record: rows[0]});
			} );
		}
	}

	toSave(e) {
		if (e) e.stopPropagation();

		let that = this;

		if (this.tier.validate(this.tier.rec, this.recfields)) // field style updated
			this.tier.saveRec(
				{ crud: CRUD.u,
				  disableForm: true },
				resp => {
					// NOTE should crud moved to tier, just like the pkval?
					if (that.state.crud === Protocol.CRUD.c) {
						that.state.crud = Protocol.CRUD.u;
					}
					that.showConfirm(L('Saving Succeed!\n') + (resp.Body().msg() || ''));
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
				onClose={() => {that.confirm = undefined;} }
				msg={msg} />);
		this.setState({});
	}

	preview = () => {
		let rec = this.tier && this.tier.rec;
		if (rec && rec.uri64) {
			let typ = regex.mime2type(rec.mime);
			if (typ === '.pdf')
				return <object width="100%" height="650" type="application/pdf"
							data={this.tier.docData()} />;
			else if (typ === 'image')
				return <img width="100%" src={this.tier.docData()} />;
		}
		else return <></>;
	}

	render () {
		const { tier, classes, width } = this.props;

		let c = this.state.crud === Protocol.CRUD.c;
		let u = this.state.crud === Protocol.CRUD.u;
		let title = L('Share Documents');

		let rec = this.state.record;

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
				{this.preview()}
			</DialogContent>
			<DialogActions className={classes.buttons}>
			  <Button onClick={this.toCancel} variant="contained" color="primary">
				{L("Close")}
			  </Button>
			</DialogActions>
		  </Dialog>
		  {this.confirm}
		</>);
	}
}
MyDocViewComp.contextType = AnContext;

MyDocViewComp.propTypes = {
	uri: PropTypes.string.isRequired,
	tier: PropTypes.object.isRequired,
	crud: PropTypes.string,
	c: PropTypes.bool,
	u: PropTypes.bool,
	dense: PropTypes.bool
};

const MyDocView = withWidth()(withStyles(styles)(MyDocViewComp));
export { MyDocView, MyDocViewComp };
