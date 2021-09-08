import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import Button from '@material-ui/core/Button';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';

import {AnContext} from '../reactext.jsx';

const styles = theme => ({
  root: {
	color: "wheat",
	// backgroundColor: "primary",
	textAlign: "center",
	"&: hover": {
		color: "linen"
	}
  },
});

class MyIconComp extends React.Component {
	state = {
		title: "Personal Settings",
	};

	constructor (props = {}) {
		super(props);
		this.onClick = this.onClick.bind(this);
		this.textInfo = this.textInfo.bind(this);
	}

	onClick(e) {
		e.stopPropagation();
		if (typeof this.props.onClick === 'function')
			this.props.onClick();
	}

	textInfo(ssInf) {
		return ssInf ? `${ssInf.uid}` : '...';
	}

	render () {
		let txtInfo = this.textInfo(this.context.anClient.ssInf);

		const { classes } = this.props;

		return (<>
		<Button
			variant="contained"
			className={classes.root}
			color="primary"
			onClick={this.onClick}
			startIcon={<AccountCircleIcon />} >
				{txtInfo}
			</Button>
		</>);
	}
}
MyIconComp.contextType = AnContext;

const MyIcon = withStyles(styles)(MyIconComp);
export {MyIcon, MyIconComp};
