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

import SvgIcon from "@material-ui/core/SvgIcon";
import Avatar from '@material-ui/core/Avatar';

import { L } from '../../utils/langstr';
	import { Protocol, InsertReq, UpdateReq, DeleteReq, stree_t } from '../../protocol';
	import { DetailFormW } from '../../react/crud';
	import { AnConst } from '../../utils/consts';
	import { AnContext, AnError } from '../../react/reactext'
	import { AnsonResp } from '../../protocol';
	import { ConfirmDialog } from '../../react/widgets/messagebox.jsx'
	import { RecordForm } from '../../react/widgets/record-form';

import { JsampleIcons } from '../styles';

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

class UserDetailsComp extends DetailFormW {
	state = {
		crud: Protocol.CRUD.r,
		dirty: false,
		closed: false,

		fields: [
			{type: 'text', validator: {len: 12}, field: 'userId', label: 'User Name'},
			{type: 'text', validator: {len: 200}, field: 'userName', label: 'User Name'},
			{type: 'text', validator: {len: 500}, field: 'remarks', label: 'Remarks'}
		],
		pk: undefined,
		record: {},
	};

	constructor (props = {}) {
		super(props);

		this.state.crud = props.c ? Protocol.CRUD.c
					: props.u ? Protocol.CRUD.u
					: Protocol.CRUD.r;
		this.state.pk = props.userId;

		this.validate = this.validate.bind(this);
		this.toSave = this.toSave.bind(this);
		this.toCancel = this.toCancel.bind(this);
		this.showOk = this.showOk.bind(this);
	}

	componentDidMount() {
		console.log(this.props.uri);
		let that = this;
		// let sk = 'trees.user_funcs';
		// let t = stree_t.sqltree; // loading dataset reshaped to tree

		if (this.state.crud !== Protocol.CRUD.c) {
			// load
			let queryReq = this.context.anClient.query(this.uri, 'a_users', 'r')
			queryReq.Body().whereEq('userId', this.state.pk);
			this.context.anReact.bindStateRec({req: queryReq,
				onOk: (resp) => {
						let {rows, cols} = AnsonResp.rs2arr(resp.Body().Rs());
						that.state.record = rows[0];

						// let ds = {sk, t, sqlArgs: [this.state.pk]};

						// that.context.anReact.stree(ds, that.context.error, that);
						console.error('Let\'s bind role id here');
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
		let rec = this.state.record;
		let c = this.state.crud === Protocol.CRUD.c;

		let req;

		// 1. collect record
		// nvs data must keep consists with jquery serializeArray()
		// https://api.jquery.com/serializearray/
		let nvs = [];
		nvs.push({name: 'userName', value: rec.userName});
		nvs.push({name: 'birthday', value: rec.birthday});
		nvs.push({name: 'pswd', value: 'initial'});
		nvs.push({name: 'orgId', value: rec.orgId});
		nvs.push({name: 'roleId', value: rec.roleId});

		// 2. request insert / update
		if (this.state.crud === Protocol.CRUD.c) {
			nvs.push({name: 'userId', value: rec.userId});
			req = client
				.usrAct('users', Protocol.CRUD.c, 'save')
				.insert(this.props.uri, 'a_users', nvs);
		}
		else {
			req = client
				.usrAct('users', Protocol.CRUD.u, 'save')
				.update(this.props.uri, 'a_users', this.state.fields[0].field, nvs);
			req.Body()
				.whereEq('userId', rec.userId);
		}

		let that = this;
		client.commit(req, (resp) => {
			that.state.crud = Protocol.CRUD.u;
			that.showOk(L('User data saved!'));
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

		let c = this.state.crud === Protocol.CRUD.c;
		let u = this.state.crud === Protocol.CRUD.u;
		let rec = this.state.record;

		let title = c ? L('Create User')
					: u ? L('Edit User')
					: L('User Details');

		return (<>
		  <Dialog className={classes.root}
			classes={{ paper: classes.dialogPaper }}
			open={true} fullWidth maxWidth="lg"
			onClose={this.handleClose}
		  >
			<DialogContent className={classes.content}>
			  <DialogTitle id="u-title" color="primary" >
				{title} - {c ? L("New") : u ? L("Edit") : ''}
				{this.state.dirty ? <JsampleIcons.Star color="secondary"/> : ""}
			  </DialogTitle>
			  <Grid container className={classes.content} direction="row">
				<Grid item sm={6} className={classes.left}>
				  <Box className={classes.rowBox}>
					{!smallSize && (
					  <Typography className={classes.formLabel}>
						{L("User Id")}
					  </Typography>
					)}
					<TextField id="userId"
						label={smallSize ? L("User Id") : undefined}
						disabled={!c}
						variant="outlined" color="primary" fullWidth
						placeholder="User ID" margin="dense"
						value={rec[this.state.fields[0].field] || ""}
						inputProps={{ style: this.state.fields[0].style }}
						onChange={(e) => {
							if (c)
							this.setState({
								record: Object.assign(rec, { userId: e.target.value }),
								dirty : true });
						}}
					/>
				  </Box>
				</Grid>
				<Grid item sm={6} className={classes.right} >
				  <Box className={classes.rowBox}>
					{!smallSize && (
					  <Typography className={classes.formLabel} >
						{L("User Name")}
					  </Typography>
					)}
					<TextField id="userName" className={classes.formText}
						label={smallSize ? L("User Name") : undefined}
						variant="outlined" color="primary" fullWidth
						placeholder="User Name" margin="dense"
						value={rec[this.state.fields[1].field] || ""}
						inputProps={{ style: this.state.fields[1].style }}
						onChange={(e) => {
							this.setState({
								record: Object.assign(rec, { userName: e.target.value }),
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
				{(c || u) && L("Save")}
			  </Button>
			  <Button onClick={this.toCancel} variant="contained" color="primary">
				{(c || u) ? L('Close') : L("Cancel")}
			  </Button>
			</DialogActions>
		  </Dialog>
		  {this.ok}
	  </>);
	}
}
UserDetailsComp.contextType = AnContext;

UserDetailsComp.propTypes = {
	uri: PropTypes.string.isRequired,
	width: PropTypes.oneOf(["lg", "md", "sm", "xl", "xs"]).isRequired
};

const UserDetails = withWidth()(withStyles(styles)(UserDetailsComp));
export { UserDetails, UserDetailsComp };

const avatarIcon = function AvIcon(props) {
  return (
	<SvgIcon style={{ width: 64, height: 64 }} fontSize="inherit" {...props}>
		<g> <path d="M76.8,121.6C34.385,121.6,0,155.985,0,198.4V480h89.6V121.6H76.8z"/>
			<path d="M435.2,121.6H128V480h384V198.4C512,155.985,477.615,121.6,435.2,121.6z M288,422.4c-67.05,0-121.6-54.55-121.6-121.6
					S220.95,179.2,288,179.2s121.6,54.55,121.6,121.6S355.05,422.4,288,422.4z M435.2,224c-14.139,0-25.6-11.461-25.6-25.6
					c0-14.139,11.461-25.6,25.6-25.6c14.139,0,25.6,11.461,25.6,25.6C460.8,212.539,449.339,224,435.2,224z"/>
			<path d="M288,217.6c-45.876,0-83.2,37.324-83.2,83.2S242.124,384,288,384s83.2-37.324,83.2-83.2S333.876,217.6,288,217.6z"/>
			<polygon points="320,32 192,32 166.4,83.2 345.6,83.2 "/>
		</g>
	</SvgIcon>
  );
}
/** Simple session info card. Jsample use this to show user's personal info.
 * As UserDetails handling data binding by itself, and quit with data persisted
 * at jserv, this component is used to try the other way - no data persisting,
 * but with data automated data loading and state hook.
 */
class SsInfCardComp extends React.Component {

	state = {
		record: { uid: undefined, roleId: undefined },
	}

	constructor (props) {
		super(props);

		let {uid, roleId} = props;
		this.state.rec = {uid, roleId}
	}

	componentDidMount() {
		console.log(this.props.uri);
		let that = this;
		// this senario is an illustrating of general query's necessity.
		let req = this.context.anClient.query(this.props.uri, 'a_users', 'u')
		req.Body()
			.l("a_roles", "r", "r.roleId=u.roleId")
			.l("a_orgs", "o", "o.orgId=u.orgId")
			.whereEq('userId', this.props.ssInf.uid);
		this.context.anReact.bindStateRec({uri: this.props.uri, req}, undefined, that);
	}

	render() {
		return <RecordForm uri={this.props.uri} mtabl='a_users'
			fields={ [
				{ field: 'userId',   label: L('Log ID'), grid: {sm: 6, lg: 4}, disabled: true },
				{ field: 'userName', label: L('Name'),   grid: {sm: 6, lg: 4} },
				{ field: 'roleName', label: L('Role'),   grid: {sm: 6, lg: 4} },
				{ field: 'avatar',   label: L('Avatar'), grid: {md: 6}, formatter: loadAvatar } // probably another component
			] }
			record={this.state.record} />

		function loadAvatar() {
			return avatarIcon({ color: "primary", viewBox: "0 0 512 512" });
		}
	}
}
SsInfCardComp.contextType = AnContext;

SsInfCardComp.propTypes = {
	uri: PropTypes.string.isRequired,
	width: PropTypes.oneOf(["lg", "md", "sm", "xl", "xs"]).isRequired,
	ssInf: PropTypes.object.isRequired,
};

const SsInfCard = withWidth()(withStyles(styles)(SsInfCardComp));
export { SsInfCard, SsInfCardComp };
