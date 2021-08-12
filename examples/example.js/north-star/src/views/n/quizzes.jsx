
import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import withWidth from "@material-ui/core/withWidth";
import { Card, TextField, Typography } from '@material-ui/core';

import {
    an, AnClient, SessionClient, Protocol, L, Langstrs,
    AnContext, AnError, CrudCompW, AnReactExt
} from 'anclient';

const styles = (theme) => ( {
	root: {
	}
} );

class QuizzesComp extends CrudCompW {
	state = {
		students: []
	};

	constructor(props) {
		super(props);
	}

	render () {
		return (<>Quizz List</>);
	}
}
QuizzesComp.contextType = AnContext;

const Quizzes = withWidth()(withStyles(styles)(QuizzesComp));
export { Quizzes, QuizzesComp  }
