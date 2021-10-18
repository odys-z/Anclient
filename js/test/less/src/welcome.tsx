import React from 'react';
import { ReactNode } from 'react';
import { withStyles } from '@material-ui/styles';
import { withWidth } from '@material-ui/core';

import { Semantier } from '@anclient/semantier';


const styles = (theme) => ( {
	root: {
	},
	button: {
		marginLeft: theme.spacing(1)
	}
});

class WelcomeComp extends React.Component<{uri: string}> {
	tier: Semantier;

	constructor(props) {
		super(props);
	}

	componentDidMount() {
		this.tier = new WelcomeTier({...this.props});
	}

	render() : ReactNode {

		return (<div>Welcome Less</div>);
	}
}

class WelcomeLess extends Semantier {

	/// @override(Semantier)
	records(): void {

	}
}

export default withWidth()(withStyles(styles)(WelcomeComp));

class WelcomeTier extends Semantier {

	/**
	 * 
	 * @param {uri: sring} props 
	 */
	constructor(props) {
		super(props);
	}
}
