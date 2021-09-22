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
	minHeight: "40vh"
  },
  root: {},
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

		this.toSave = this.toSave.bind(this);
		this.toCancel = this.toCancel.bind(this);
		this.showOk = this.showOk.bind(this);
	}

	componentDidMount() {

		// if (this.tier.pkval) {
		// 	let that = this;
		// 	this.tier.relations( {
		// 			mtabl: 'a_roles',
		// 			reltabl: 'a_role_func',
		// 			fk: 'roleId',
		// 			sk: 'trees.role_funcs',
		// 			sqlArgs: this.tier.pkval,
		// 		}, (forest) => {
		// 			that.setState({forest});
		// 		} );
		// }

		// let that = this;
		// let sk = 'trees.role_funcs';
		// let t = stree_t.sqltree; // loading dataset reshaped to tree
		//
		// if (this.state.crud !== CRUD.c) {
		// 	// load
		// 	let queryReq = this.context.anClient.query(this.uri, 'a_roles', 'r')
		// 	queryReq.Body().whereEq('roleId', this.state.pk);
		// 	this.context.anReact.bindStateRec({req: queryReq,
		// 		onOk: (resp) => {
		// 				let {rows, cols} = AnsonResp.rs2arr(resp.Body().Rs());
		// 				that.state.record = rows[0];
		//
		// 				let ds = {sk, t, sqlArgs: [this.state.pk]};
		//
		// 				that.context.anReact.stree(ds, that.context.error, that);
		// 			}
		// 		},
		// 		this.context.error);
		// }
		// else {
		// 	// new, bind tree
		// 	let ds = {uri: this.props.uri,
		// 			  sk, t, sqlArgs: []};
		//
		// 	this.context.anReact.stree(ds, this.context.error, this);
		// }
	}

	toSave(e) {
		e.stopPropagation();

		if (!this.validate()) {
	    	this.setState({});
		}
		else
			this.tier.saveRec();

		// let client = this.context.anClient;
		// let rec = this.state.record;
		// let c = this.state.crud === CRUD.c;
		//
		// let req;
		//
		// // 1. collect role-func
		// // note 'nodeId' is not the same with DB as some fields are mapped in datase.xml
		// let columnMap = {
		// 	funcId: 'nodeId',
		// 	// roleId doesn't included in forest, the value be appended
		// 	roleId: c ? rec.roleId : this.state.pk,
		// };
		//
		// let rf = this.context.anReact.inserTreeChecked(
		// 			this.state.forest,
		// 			{ table: 'a_role_func',
		// 			  columnMap,
		// 			  check: 'checked',
		// 			  reshape: true  // middle nodes been corrected according to children
		// 			} );
		//
		// // 2. collect record
		// // nvs data must keep consists with jquery serializeArray()
		// // https://api.jquery.com/serializearray/
		// let nvs = [];
		// nvs.push({name: 'remarks', value: rec.remarks});
		// nvs.push({name: 'roleName', value: rec.roleName});
		//
		// nvs.push({name: 'orgId', value: '006'}) // TODO: got orgId from cbb?
		//
		// // 3. request (with del if updating)
		// if (this.state.crud === CRUD.c) {
		// 	nvs.push({name: 'roleId', value: rec.roleId});
		// 	req = client
		// 		.usrAct('roles', CRUD.c, 'save')
		// 		.insert(null, 'a_roles', nvs);
		// 	req.Body().post(rf);
		// }
		// else {
		// 	let del_rf = new DeleteReq(null, 'a_role_func', 'roleId')
		// 					.whereEq('roleId', rec['roleId']);
		//
		// 	req = client
		// 		.usrAct('roles', CRUD.u, 'save')
		// 		.update(null, 'a_roles', this.state.fields[0].field, nvs);
		// 	req.Body()
		// 		.whereEq('roleId', rec.roleId)
		// 		.post(del_rf.post(rf));
		// }
		//
		// let that = this;
		// client.commit(req, (resp) => {
		// 	that.state.crud = CRUD.u;
		// 	that.showOk(L('Role data saved!'));
		// 	if (typeof that.props.onOk === 'function')
		// 		that.props.onOk({code: resp.code, resp});
		// }, this.context.error);
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

		let crud = this.tier.crud;

		let title = crud === CRUD.c ? L('Create Role')
					: crud === CRUD.u ? L('Edit Role')
					: L('Role Details');

		return (<>
		  <Dialog className={classes.root}
			classes={{ paper: classes.dialogPaper }}
			open={true} fullWidth maxWidth="lg"
			onClose={this.handleClose}
		  >
			<DialogContent className={classes.content}>
			  <DialogTitle id="u-title" color="primary" >
				{title}
				{this.state.dirty ? <JsampleIcons.Star color="secondary"/> : ""}
			  </DialogTitle>
				<TRecordForm uri={this.props.uri}
					tier={this.props.tier}
					mtabl='a_roles' pk='roleId'
					fields={this.props.tier.fields()}
				/>
				<AnRelationTree uri={this.props.uri}
					tier={this.props.tier}
					mtabl='a_roles' reltabl='a_role_func' fk='roleId' relcol='funcId'
					sk='trees.role_funcs'
					sqlArgs={[this.state.pkval]}
				/>
			</DialogContent>
			<DialogActions className={classes.buttons}>
			  <Button onClick={this.toSave} variant="contained" color="primary">
				{crud && L("Save")}
			  </Button>
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
