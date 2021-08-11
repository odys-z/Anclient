
import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import { Card, TextField, Typography } from '@material-ui/core';

import {
    an, AnClient, SessionClient, Protocol, L, Langstrs,
    AnContext, AnError, CrudComp, AnReactExt
} from 'anclient';

const styles = (theme) => ( {
	root: {
	}
} );

class MyStudentsComp extends CrudComp {
	state = {
		students: []
	};

	constructor(props) {
		super(props);
	}

	render () {
		return (<>Quizzes</>);
	}
}
MyStudentsComp.contextType = AnContext;

const MyStudents = withStyles(styles)(MyStudentsComp);
export { MyStudents, MyStudentsComp  }
