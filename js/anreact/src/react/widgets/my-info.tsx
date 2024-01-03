import React from 'react';
import { Theme, withStyles } from "@material-ui/core/styles";
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import Close from '@material-ui/icons/Close';

import {L} from '../../utils/langstr';
import { AnContext, AnContextType } from '../reactext';
import { AnTabs, TabPanel } from './tabs';
import { Comprops, DetailFormW } from '../crud';
import { DialogProps } from './messagebox';

const styles = (_theme: Theme) => ({
  root: {
	backgroundColor: "mint-cream",
	textAlign: "center" as const,
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

interface MyInfoProps extends DialogProps {
	panels: Array<TabPanel>
}

class MyInfoComp extends DetailFormW<MyInfoProps> {
	state = {
		closed: false
	};

	constructor (props: Comprops) {
		super(props);
		this.handleClose = this.handleClose.bind(this);
		this.textInfo = this.textInfo.bind(this);
	}

	handleClose(e) {
		this.setState({closed: true});
		if (typeof this.props.onClose === 'function')
			this.props.onClose();
	};

	textInfo() {
		const ctx = this.context as unknown as AnContextType;
		let ssInf = ctx.anClient.ssInf;
		return (
			<DialogContentText id="myinfo-txt" component={'span'} >
				{ssInf ? ssInf.usrName : 'User Info'}
				<TextField id="qtitle" label={L('User Name')}
				  variant="outlined" color="primary" disabled
				  onChange={e => this.setState({qtitle: e.currentTarget.value})}
				  value={ssInf.usrName || ''} />

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
				</DialogActions>
			</Dialog>
		);
	}
}
MyInfoComp.contextType = AnContext;

const MyInfo = withStyles(styles)(MyInfoComp);
export {MyInfo, MyInfoComp};
