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
	import { Protocol } from '../../../lib/protocol';
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
  left: {
	height: "11ch",
  },
  right: {
	height: "11ch",
  },
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
  lower: {
	height: "15%"
  }
});
class RoleDetailsComp extends React.Component {
	state = {
		crud: Protocol.CRUD.r,
		dirty: false,
		closed: false,

		fields: {},
	};

	meta = [
		{type: 'text', validator: 'len12', field: 'roleId', label: 'Role Name'},
		{type: 'text', validator: 'len200', field: 'roleName', label: 'Role Name'}
	];

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


		this.meta.forEach( (m, i) => {
			this.state.fields[m.field] = {v: undefined, meta: i, label: m.label};
		} );
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

						let sk = 'trees.role_funcs';
						let ds = {port: 'dataset', sk, sqlArgs: [this.state.roleId]},
						// ... ...
						that.context.anReact.stree({req: q}, that.context.error, that);
					}
				},
				this.context.error);
		}
	}

	validate() {
	    const invalid = { border: "2px solid red" };

		let valid = true;
	    for(let fn in this.state.fields) {
			let f = this.state.fields[fn];
			f.valid = validField(f, {validator: (v) => !!v});
			f.style = invalid;
			valid &= f.valid;
	    }
		return valid;

		function validfield (f, valider) {
			return valider(f.v);
		}
	}

	toSave(e) {
		e.stopPropagation();

		if (!this.validate()) {
	    	this.setState({});
			return;
		}

		let client = this.context.anClient;
		let u = this.state.c ? client.create()
				: client.update();
		u.Body().nv('roleName', this.fields.roleName.v)
		// ...

		this.context.anReact.commit(u, (resp) => {
			this.state.crud = Protocol.CRUD.c;
			that.showOk(L('Role data saved!'));
			if (typeof this.props.onOk === 'function')
				this.props.onOk({code: resp.code, resp});
		}, this.context.error);
	}

	toCancel (e) {
		e.stopPropagation();
		if (typeof this.props.onClose === 'function')
			this.props.onClose({code: 'cancel'});
	}

	showOk(txt) {
		let that = this;
		this.ok = (<ConfirmDialog ok={L('OK')} title={L('Info')}
					cancel={false} msg={txt}
					onClose={() => {that.ok === undefined} } />);

		if (typeof this.props.onSave === 'function')
			this.props.onSave({code: 'ok'});
	}

	render () {
		const { classes, width } = this.props;
		const smallSize = new Set(["xs", "sm"]).has(width);

		let c = !!this.props.c;

		let title = c ? L('Create User')
					: this.props.u ? L('Edit User')
					: L('User Info');

		return (<>
		  <Dialog className={classes.root}
			classes={{ paper: classes.dialogPaper }}
			open={true} fullWidth maxWidth="lg"
			onClose={this.handleClose}
		  >
			<DialogContent className={classes.content}>
			  <DialogTitle id="u-title">
				{this.state.dirty ? <JsampleIcons.Star color="secondary"/> : ""}
				{title} - {c ? L("new") : L("edit")}
			  </DialogTitle>
			  <Grid container className={classes.content} direction="row">
				<Grid item className={classes.left}>
				  <Box className={classes.rowBox}>
					{!smallSize && (
					  <Typography className={classes.formLabel}>
						{L("Role Id")}
					  </Typography>
					)}
					<TextField id="roleId"
					  label={smallSize ? L("Role Id") : undefined}
					  variant="outlined" color="primary" margin="dense"
					  value={this.state.roleId}
					  inputProps={{ style: this.state.fields['roleId'].style }}
					  onChange={(e) => {
						this.setState({ roleId: e.target.value, dirty: true });
					  }}
					/>
				  </Box>
				</Grid>
				<Grid item className={classes.right} sx={{ maxWidth: 1200 }}>
				  <Box className={classes.rowBox}>
					{!smallSize && (
					  <Typography className={classes.formLabel} >
						{L("Role Name")}
					  </Typography>
					)}
					<TextField id="roleName" className={classes.formText}
					  label={smallSize ? L("Role Name") : undefined}
					  variant="outlined" color="primary" margin="dense"
					  placeholder="Role Name" margin="dense"
					  value={this.state.roleName || ""}
					  inputProps={{ style: this.state.fields['roleName'].style }}
					  onChange={(e) => {
						this.setState({ roleName: e.target.value, dirty: true });
					  }}
					/>
				  </Box>
				</Grid>
			  </Grid>
			  <Grid item xs={12} className={classes.formObject} >
				  <AnTree checkbox onCheck={(e, v) => {this.setState({dirty: true})}}/>
			  </Grid>
			</DialogContent>
			<DialogActions className={classes.buttons}>
			  <Button onClick={this.toSave} variant="contained" color="primary">
				{L("Save")}
			  </Button>
			  <Button onClick={this.toCancel} variant="contained" color="primary">
				{L("Cancel")}
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
