import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/Grid';

import { L } from '../../../lib/frames/react/utils/langstr';
	import { Protocol } from '../../../lib/protocol';
	import { AnConst } from '../../../lib/frames/react/utils/consts';
	import { AnContext, AnError } from '../../../lib/frames/react/reactext'
	import { AnsonResp } from '../../../lib/protocol';
	import { JsampleIcons } from '../styles'

const styles = theme => ({
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
		const { classes } = this.props;

		let title = this.props.c ? L('Create User')
					: this.props.u ? L('Edit User')
					: L('User Info');

		return (
			<Dialog className={classes.root}
				open={true}
				fullScreen={!!this.props.fullScreen}
				onClose={this.handleClose} >

				<DialogTitle id="u-title">
				  {this.state.dirty ? JsampleIcons.Star : ''}
				  {title} - {this.state.crud === Protocol.CRUD.c ? L('new') : L('edit')}
				</DialogTitle>
				<DialogContent>
					<Grid container >
						<Grid item xs= {2}>
							<TextField id="logid" label={L('Log Id')}
							  variant="outlined" color="primary"
							  fullWidth={true}
							  value={this.state.role? this.state.role.roleId : undefined}
							  onChange={(e) => {
								this.setState({logId: e.target.value, dirty: true});
							  }} />
						</Grid>
						<Grid item xs= {3}>
							<TextField id="logid" label={L('Log Id')}
							  variant="outlined" color="primary"
							  fullWidth={true}
							  value={this.state.role? this.state.role.roleId : undefined}
							  onChange={(e) => {
								this.setState({logId: e.target.value, dirty: true});
							  }} />
						</Grid>
						<Grid item xs= {2}>
							<TextField id="logid" label={L('Log Id')}
							  variant="outlined" color="primary"
							  fullWidth={true}
							  value={this.state.role? this.state.role.roleId : undefined}
							  onChange={(e) => {
								this.setState({logId: e.target.value, dirty: true});
							  }} />
						</Grid>
						<Grid item xs= {3}>
							<TextField id="logid" label={L('Log Id')}
							  variant="outlined" color="primary"
							  fullWidth={true}
							  value={this.state.role? this.state.role.roleId : undefined}
							  onChange={(e) => {
								this.setState({logId: e.target.value, dirty: true});
							  }} />
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

const RoleDetails = withStyles(styles)(RoleDetailsComp);
export { RoleDetails, RoleDetailsComp };
