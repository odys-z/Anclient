import React from 'react';
import { ReactNode } from 'react';
import { withStyles } from '@material-ui/styles';
import { withWidth } from '@material-ui/core';

import { Semantier } from '@anclient/semantier';
import { CrudComp } from '@anclient/anreact';

const styles = (theme) => ( {
	root: {
	},
	button: {
		marginLeft: theme.spacing(1)
	}
});

class WelcomeComp extends CrudComp {
	tier: WelcomeTier;
	// uri: string;
	// props: { uri?: string; };

	componentDidMount() {
		this.tier = new WelcomeTier({...this.props, uri: this.uri});
	}

	render() : ReactNode {

		return (<div>Welcome Less</div>);
	}
}

export default withWidth()(withStyles(styles)(WelcomeComp));

class WelcomeTier extends Semantier {
	/**
	 * 
	 * @param {uri: sring} props 
	 */
	constructor(props: {uri: string}) {
		super(props);
	}

	/// @override(Semantier)
	records(): Array<Object> {
		super.rows = [{eid: '01', ename: 'ABC', edate: '2021-10-10', extra: '100'}];
		return super.rows;
	}
}
