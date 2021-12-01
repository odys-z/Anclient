import React from 'react';
import withStyles from "@material-ui/core/styles/withStyles";
import withWidth from "@material-ui/core/withWidth";

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';

import { CRUD, Tierec } from '@anclient/semantier-st';

import { L } from '../../utils/langstr';
import { AnContext, } from '../../react/reactext'
import { JsampleIcons } from '../styles'
import { Comprops, DetailFormW } from '../../react/crud'
import { ConfirmDialog } from '../../react/widgets/messagebox'
import { AnRelationTree } from '../../react/widgets/relation-tree';
import { TRecordForm } from '../../react/widgets/t-record-form';

const styles = theme => ({
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
	}
  },
});

class RoleDetailsComp extends DetailFormW<Comprops & { relsk: string }> {

	state = {
		crud: CRUD.r,
		dirty: false,
		closed: false,

		pk: undefined,
		pkval: '',
		record: undefined as Tierec,
	};

	tier: any;
	ok: JSX.Element;

	constructor (props: Comprops) {
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
			this.tier.saveRec({crud: this.state.crud},
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
					tier={this.tier} sk={undefined}
					mtabl='a_roles' reltabl='a_role_func'
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

const RoleDetails = withStyles<any, any, Comprops>(styles)(withWidth()(RoleDetailsComp));
export { RoleDetails, RoleDetailsComp };
