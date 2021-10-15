import React, { ReactNode } from 'react';
import { withStyles } from '@material-ui/styles';
import { withWidth } from '@material-ui/core';

import { Semantier } from '@anclient/semantier';
import { AnContext } from '@anclient/anreact';


const styles = (theme) => ( {
	root: {
	},
	button: {
		marginLeft: theme.spacing(1)
	}
});

class WelcomeComp extends React.Component {
	tier: Semantier;

	constructor(props) {
		super(props);
	}

	componentDidMount() {
		this.tier = new WelcomeLess();
	}

	render() : ReactNode {

		return (<>Welcome Less</>);
	}
}

class WelcomeLess extends Semantier {

}

export default withWidth()(withStyles(styles)(WelcomeComp));
