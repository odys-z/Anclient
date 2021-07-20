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
import TextField from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import { L } from '../../../lib/frames/react/utils/langstr';
	import { Protocol } from '../../../lib/protocol';
	import { AnConst } from '../../../lib/frames/react/utils/consts';
	import { AnContext, AnError } from '../../../lib/frames/react/reactext'
	import { AnsonResp } from '../../../lib/protocol';
	import { JsampleIcons } from '../styles'
	import { AnTree } from '../../../lib/frames/react/widgets/tree';

const styles = theme => ({
  dialogPaper: {
        minHeight: '80vh',
        // maxHeight: '80vh',
  },
  root: {
  },
  title: {
    backgroundColor: "linen",
    height: "5ch",
    width: "100%",
	color: "primary",
  },
  left: {
    backgroundColor: "lightblue",
    height: "4ch"
  },
  right: {
    height: "4ch"
  },
  content: {
    height: "100%",
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
	};

	constructor (props = {}) {
		super(props);
		this.toSave = this.toSave.bind(this);
		this.toCancel = this.toCancel.bind(this);
		this.showOk = this.showOk.bind(this);
	}

	toSave(e) {
		e.stopPropagation();

		let client = this.context.anClient;
		let u = this.state.c ? client.create()
				: client.update();
		// ...
		this.context.anReact.commit(u, (resp) => {
			this.state.crud = Protocol.CRUD.c;
			that.showOk(L('Saved!'));
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
		if (typeof this.props.onClose === 'function')
			this.props.onClose({code: 'cancel'});
	}

	render () {
		const { classes, width } = this.props;
		const smallSize = new Set(["xs", "sm"]).has(width);

		let c = !!this.props.c;

		let title = c ? L('Create User')
					: this.props.u ? L('Edit User')
					: L('User Info');

		return (
			<Dialog className={classes.root} classes={{ paper: classes.dialogPaper }} open={true}
				fullWidth maxWidth='lg'
				onClose={this.handleClose} >

				<DialogContent className={classes.content} >
					<DialogTitle id="u-title" >
					  {this.state.dirty ? JsampleIcons.Star : ''}
					  {title} - {this.state.crud === Protocol.CRUD.c ? L('new') : L('edit')}
					</DialogTitle>
					<Grid container >
						<Grid item xs={6} sm={12} className={classes.left} >
							{!smallSize && <Typography className={classes.formLabel} >{L('Role Id')}</Typography>}
							<TextField id="role-id"
								label={smallSize ? L('Role Id') : undefined}
								variant="outlined" color="primary"
								placeholder="role-0001"
								value={this.state.roleId}
								onChange={(e) => {
									this.setState({logId: e.target.value, dirty: true});
								}} />
						</Grid>
						<Grid item xs={6} sm={12} className={classes.right} >
							{!smallSize && <Typography className={classes.formLabel} >{L('Role Name')}</Typography>}
							<TextField id="role-name"
								label={smallSize ? L('Role Name') : undefined}
								variant="outlined" color="primary"
								placeholder="Role Name"
								value={this.state.roleName}
								onChange={(e) => {
									this.setState({roleName: e.target.value, dirty: true});
								}} />
						</Grid>
						<Grid item xs={12} className={classes.content} >
							<AnTree id="functions" checkbox label={L('Role Functions')}
								variant="outlined" color="primary"
								checkbox tree={this.state.roleFuncs} />
						</Grid>
					</Grid>
				</DialogContent>
				<DialogActions>
				  <Button onClick={this.toSave} color="primary">
					{L('Save')}
				  </Button>
				  <Button onClick={this.toCancel} color="primary">
					{L('Cancel')}
				  </Button>
				</DialogActions>
			</Dialog>
		);
	}
}
RoleDetailsComp.contextType = AnContext;

RoleDetailsComp.propTypes = {
	width: PropTypes.oneOf(["lg", "md", "sm", "xl", "xs"]).isRequired
};

const RoleDetails = withWidth()(withStyles(styles)(RoleDetailsComp));
export { RoleDetails, RoleDetailsComp };
