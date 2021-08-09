
import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import withWidth from "@material-ui/core/withWidth";
import { Card, TextField, Typography } from '@material-ui/core';

import {
    an, AnClient, SessionClient, Protocol, L, Langstrs,
    AnContext, AnError, CrudCompW, AnReactExt
} from 'anclient';

import { TreeCards } from '../../common/tree-cards';

const styles = (theme) => ( {
	root: {
	}
} );

class IndicatorsComp extends CrudCompW {
	state = {
		students: []
	};

	constructor(props) {
		super(props);
	}

	render () {
		return (<TreeCards uri={this.uri}/>);
	}
}
IndicatorsComp.contextType = AnContext;

const Indicators = withWidth()(withStyles(styles)(IndicatorsComp));
export { Indicators, IndicatorsComp }
