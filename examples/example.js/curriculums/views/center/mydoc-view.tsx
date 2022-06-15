
import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import withWidth from "@material-ui/core/withWidth";

import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';

import { PageInf } from '@anclient/semantier';
import { L, AnContext,
	DetailFormW, ConfirmDialog, utils, CompOpts, Spreadsheetier
} from '@anclient/anreact';

import { Theme } from '@material-ui/core/styles';

const { regex } = utils;

const styles = (_theme: Theme) => ({
    title: {
      backgroundColor: "linen",
      height: "70vh",
      width: "80%",
      color: "primary"
    },
    content: {
      height: "100%",
    },
} );

class MyDocViewComp extends DetailFormW<CompOpts & {uri: string, tier: Spreadsheetier, onClose: Function}> {
	state = {
	};

	tier: Spreadsheetier;
	confirm: JSX.Element;

	constructor (props: CompOpts & {uri: string, tier: Spreadsheetier, onClose: Function} ) {
		super(props);

		this.tier = props.tier;

		this.toCancel = this.toCancel.bind(this);
		// this.toSave = this.toSave.bind(this);
		this.showConfirm = this.showConfirm.bind(this);
	}

	componentDidMount() {
		if (this.tier.pkval.v) {
			let that = this;
			let page = new PageInf(0, -1)
				.nv(this.tier.pkval.pk, this.tier.pkval.v);
			this.tier.record(page, () => {
				that.setState({});
			} );
		}
	}

	toCancel (e: React.UIEvent) {
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
			let typ = rec.mime ? regex.mime2type(rec.mime as string) : 'image';
			if (typ === '.pdf')
				return <object width="100%" height="650" type="application/pdf"
							data={this.tier.rec?.uri as string} />;
			else if (typ === 'image')
				return <img width="100%" src={this.tier.rec?.uri as string} />;
		}
		else return <></>;
	}

	render () {
		const { classes } = this.props;

		let title = L('Signature');

		return (<>
		  <Dialog className={classes.root}
			classes={{ paper: classes.dialogPaper }}
			open={true} fullWidth maxWidth="lg"
			onClose={this.toCancel}
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

const MyDocView = withWidth()(withStyles(styles)(MyDocViewComp));
export { MyDocView, MyDocViewComp };
