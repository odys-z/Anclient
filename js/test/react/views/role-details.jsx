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
import Box from "@material-ui/core/Box";
import TextField from "@material-ui/core/TextField";
import Typography from '@material-ui/core/Typography';

import { L } from '../../../lib/frames/react/utils/langstr';
	import { Protocol, stree_t } from '../../../lib/protocol';
	import { AnConst } from '../../../lib/frames/react/utils/consts';
	import { AnContext, AnError } from '../../../lib/frames/react/reactext'
	import { AnsonResp } from '../../../lib/protocol';
	import { JsampleIcons } from '../styles'
	import { ConfirmDialog } from '../../../lib/frames/react/widgets/messagebox.jsx'
	import { AnTree } from '../../../lib/frames/react/widgets/tree';

const styles = theme => ({
  dialogPaper: {
	minHeight: "80vh"
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

class RoleDetailsComp extends React.Component {
	state = {
		crud: Protocol.CRUD.r,
		dirty: false,
		closed: false,

		fields: [
			{type: 'text', validator: {len: 12}, field: 'roleId', label: 'Role Name'},
			{type: 'text', validator: {len: 200}, field: 'roleName', label: 'Role Name'},
			{type: 'text', validator: {len: 500}, field: 'remarks', label: 'Remarks'}
		],
		record: {},
	};

	constructor (props = {}) {
		super(props);

		this.state.crud = props.c ? Protocol.CRUD.c
					: props.u ? Protocol.CRUD.u
					: Protocol.CRUD.r;
		this.state.roleId = props.roleId;

		this.validate = this.validate.bind(this);
		this.toSave = this.toSave.bind(this);
		this.toCancel = this.toCancel.bind(this);
		this.showOk = this.showOk.bind(this);
	}

	componentDidMount() {
		let that = this;

		if (this.state.crud !== Protocol.CRUD.c) {
			// load
			let queryReq = this.context.anClient.query(null, 'a_roles', 'r')
			queryReq.Body().whereEq('roleId', this.state.roleId);
			this.context.anReact.bindSimpleForm({req: queryReq,
				onOk: (resp) => {
						let {rows, cols} = AnsonResp.rs2arr(resp.Body().Rs());
						that.state.record = rows[0];

						let sk = 'trees.role_funcs';
						let ds = {sk,
							t: stree_t.sqltree, // load dataset reshape to tree
							sqlArgs: [this.state.roleId]};

						that.context.anReact.stree(ds, that.context.error, that);
					}
				},
				this.context.error);
		}
	}

	validate() {
		let that = this;

	    const invalid = { border: "2px solid red" };

		let valid = true;
	    this.state.fields.forEach( (f, x) => {
			// let field = f.field;
			f.valid = validField(f, {validator: (v) => !!v});
			f.style = f.valid ? undefined : invalid;
			valid &= f.valid;
	    } );
		return valid;

		function validField (f, valider) {
			let v = that.state.record[f.field];

			if (typeof valider === 'function')
				return valider(v);
			else if (f.validator) {
				let vd = f.validator;
				if(vd.notNull && (v === undefined || v.length === 0))
					return false;
				if (vd.len && v !== undefined && v.length > vd.len)
					return false;
				return true;
			}
		}
	}

	toSave(e) {
		e.stopPropagation();

		if (!this.validate()) {
	    	this.setState({});
			return;
		}

		let client = this.context.anClient;

		let req;
		let nvs = [];

		// 1. collect role-func
		let rf = this.context.anReact.insTreeChecked(
					this.state.forest,
					{ check: 'checked',
					  columns: ['roleId', 'funcId'],
					  reshape: true  // middle nodes been corrected according to children
					} );

		// 2. collect record
		// nvs data must keep consists with jquery serializeArray()
		// https://api.jquery.com/serializearray/
		nvs.push({name: 'remarks', value: this.state.record.remarks});
		nvs.push({name: 'roleName', value: this.state.record.roleName});

		// 3. request (with del if updating)
		if (this.state.crud === Protocol.CRUD.c) {
			nvs.push({name: 'roleId', value: this.state.record.roleId});
			req = client
				.usrAct('roles', Protocol.CURD.c, 'save')
				.insert(null, 'a_roles', nvs)
				.post(rf);
		}
		else {
			let del_rf = new UpdateReq(null, 'a_role_func', 'roleId')
							.whereEq('roleId', this.state.record['roleId']);

			req = client
				.usrAct('roles', Protocol.CRUD.u, 'save')
				.update(null, 'a_roles', this.state.fields[0].field, nvs)
				.post(del_rf.post(rf));
			req.Body().whereEq('roleId', this.state.record.roleId);
		}


		let that = this;
		client.commit(req, (resp) => {
			that.state.crud = Protocol.CRUD.u;
			that.showOk(L('Role data saved!'));
			if (typeof that.props.onOk === 'function')
				that.props.onOk({code: resp.code, resp});
		}, this.context.error);
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

		let c = !!this.state.crud;
		let rec = this.state.record;

		let title = c ? L('Create Role')
					: this.state.crud === Protocol.CRUD.u ? L('Edit Role')
					: L('Role Details');

		return (<>
		  <Dialog className={classes.root}
			classes={{ paper: classes.dialogPaper }}
			open={true} fullWidth maxWidth="lg"
			onClose={this.handleClose}
		  >
			<DialogContent className={classes.content}>
			  <DialogTitle id="u-title" color="primary" >
				{title} - {c ? L("New") : L("Edit")}
				{this.state.dirty ? <JsampleIcons.Star color="secondary"/> : ""}
			  </DialogTitle>
			  <Grid container className={classes.content} direction="row">
				<Grid item sm={6} className={classes.left}>
				  <Box className={classes.rowBox}>
					{!smallSize && (
					  <Typography className={classes.formLabel}>
						{L("Role Id")}
					  </Typography>
					)}
					<TextField id="roleId"
						label={smallSize ? L("Role Id") : undefined}
						disabled={c}
						variant="outlined" color="primary" fullWidth
						placeholder="Role ID" margin="dense"
						value={rec[this.state.fields[0].field] || ""}
						inputProps={{ style: this.state.fields[0].style }}
						onChange={(e) => {
							if (c)
							this.setState({
								record: Object.assign(rec, { roleId: e.target.value }),
								dirty : true });
						}}
					/>
				  </Box>
				</Grid>
				<Grid item sm={6} className={classes.right} >
				  <Box className={classes.rowBox}>
					{!smallSize && (
					  <Typography className={classes.formLabel} >
						{L("Role Name")}
					  </Typography>
					)}
					<TextField id="roleName" className={classes.formText}
						label={smallSize ? L("Role Name") : undefined}
						variant="outlined" color="primary" fullWidth
						placeholder="Role Name" margin="dense"
						value={rec[this.state.fields[1].field] || ""}
						inputProps={{ style: this.state.fields[1].style }}
						onChange={(e) => {
							this.setState({
								record: Object.assign(rec, { roleName: e.target.value }),
								dirty : true });
						}}
					/>
				  </Box>
				</Grid>
			  </Grid>
			  <Grid item sm={12} className={classes.formObject} >
				  <Box className={classes.rowBox}>
					{!smallSize && (
					  <Typography className={classes.formLabel} >
						{L("Remarks")}
					  </Typography>
					)}
					<TextField id="remarks" className={classes.formText}
						label={smallSize ? L("Remarks") : undefined}
						variant="outlined" color="primary" fullWidth
						placeholder="Remarks" margin="dense"
						value={rec[this.state.fields[2].field] || ""}
						inputProps={{ style: this.state.fields[2].style }}
						onChange={(e) => {
							this.setState({
								record: Object.assign(rec, { remarks: e.target.value }),
								dirty : true });
						}}
					/>
				  </Box>
			  </Grid>
			  <Grid item xs={12} className={classes.formObject} >
				  {this.state.forest && <AnTree checkbox
					  forest={this.state.forest}
					  onCheck={(e, v) => {this.setState({dirty: true})}} />}
			  </Grid>
			</DialogContent>
			<DialogActions className={classes.buttons}>
			  <Button onClick={this.toSave} variant="contained" color="primary">
				{(c || this.state.crud === Protocol.CRUD.u) && L("Save")}
			  </Button>
			  <Button onClick={this.toCancel} variant="contained" color="primary">
				{(c || this.state.crud === Protocol.CRUD.u) ? L('Close') : L("Cancel")}
			  </Button>
			</DialogActions>
		  </Dialog>
		  {this.ok}
	  </>);
	}
}
RoleDetailsComp.contextType = AnContext;

RoleDetailsComp.propTypes = {
	width: PropTypes.oneOf(["lg", "md", "sm", "xl", "xs"]).isRequired
};

const RoleDetails = withWidth()(withStyles(styles)(RoleDetailsComp));
export { RoleDetails, RoleDetailsComp };
