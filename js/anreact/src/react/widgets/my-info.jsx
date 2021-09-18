import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Close from '@material-ui/icons/Close';

import {L} from '../../utils/langstr';
	import { AnContext } from '../reactext';
	import { AnTabs } from './tabs';

const styles = theme => ({
  root: {
	backgroundColor: "mint-cream",
	textAlign: "center",
	"&:hover": {
		backgroundColor: {
			opacity: 0.3
		}
	}
  },
  dialogTitle: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  centerbox: {
	  "justify-content": "center"
  }
});

class MyInfoComp extends React.Component {
	state = {
	};

	constructor (props = {}) {
		super(props);
		this.handleClose = this.handleClose.bind(this);
		this.textInfo = this.textInfo.bind(this);
	}

	handleClose(e) {
		this.setState({closed: true});
		if (typeof this.props.onClose === 'function')
			this.props.onClose(e.currentTarget);
	};

	textInfo() {
		let ssInf = this.context.anClient.ssInf;
		return (
			<DialogContentText id="myinfo-txt" component={'span'} spacing={1} >
				{ssInf ? ssInf.userName : 'User Info'}
				<TextField id="qtitle" label={L('User Name')}
				  variant="outlined" color="primary" disabled
				  onChange={e => this.setState({qtitle: e.currentTarget.value})}
				  value={ssInf.userName || ''} />

				<TextField id="quizinfo" label={L("Role")}
				  variant="outlined" color="secondary" disabled
				  onChange={e => this.setState({quizinfo: e.currentTarget.value})}
				  value={ssInf.roleName || ''} />
			</DialogContentText>
		);
	}

	render () {
		let props = this.props;
		this.state.closed = false;
		let title = props.title ? props.title : L('My Info');

		let txtLines = this.textInfo();

		const { classes } = this.props;

		return (
			<Dialog className={classes.root}
				open={true} // should be controld by upper level
				fullScreen={!!this.props.fullScreen}
				onClose={this.handleClose} >

				<DialogTitle id="myinfo-title" disableTypography className={classes.dialogTitle} >
					{title}
					<IconButton onClick={this.handleClose}>
						<Close />
					</IconButton>
				</DialogTitle>
				<DialogContent>
					<AnTabs panels={this.props.panels} />
				</DialogContent>
				<DialogActions>
					{/* <Button onClick={this.handleClose} color="inherit">
						{L('Save')}
					</Button>
					<Button onClick={this.handleClose} color="inherit" autoFocus>
						{L('Cancel')}
					</Button> */}
				</DialogActions>
			</Dialog>
		);
	}
}
MyInfoComp.contextType = AnContext;

const MyInfo = withStyles(styles)(MyInfoComp);
export {MyInfo, MyInfoComp};
