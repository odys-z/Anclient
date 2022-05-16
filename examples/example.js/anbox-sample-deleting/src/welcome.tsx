import React from 'react';
import { ReactNode } from 'react';
import { withStyles } from '@material-ui/styles';
import { withWidth } from '@material-ui/core';

import { Semantier } from '@anclient/semantier';
import { CrudComp } from '@anclient/anreact';

const styles = (theme: { spacing: (arg0: number) => any; }) => ( {
	root: {
	},
	button: {
		marginLeft: theme.spacing(1)
	}
});

class WelcomeComp extends CrudComp {
	tier: WelcomeTier | undefined;

	componentDidMount() {
		// FIXME ignore vscode waring?
		let uri = this.uri || super.uri;
		console.log("super.uri", uri);

		this.tier = new WelcomeTier({uri});
	}

	render() : ReactNode {

		return (<div>Welcome Less</div>);
	}
}

// at least compiled results is working, wait for #8447 (https://github.com/mui-org/material-ui/issues/8447#issuecomment-519952099)
export default withWidth()(withStyles(styles)(WelcomeComp));

class WelcomeTier extends Semantier {
	/**
	 * 
	 * @param props 
	 */
	constructor(props: {uri: string}) {
		super(props);
		console.log(super.uri);
	}

	/**
	 * @override(Semantier)
	 */
	records(): Array<Object> {
		super.rows = [{eid: '01', ename: 'ABC', edate: '2021-10-10', extra: '100'}];
		return super.rows;
	}
}
