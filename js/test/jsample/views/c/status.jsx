
import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import withWidth from "@material-ui/core/withWidth";
import { Card, TextField, Typography } from '@material-ui/core';

import {L, Langstrs, Protocol,
    AnClient, SessionClient,
    AnContext, AnError, CrudCompW, AnReactExt
} from 'anclient';

const styles = (theme) => ( {
	root: {
	}
} );

class MyStatusComp extends CrudCompW {
	state = {
		my: []
	};

	constructor(props) {
		super(props);
	}

	render () {
		let tasks = my.task && my.task.length;
		return (<>
			{tasks > 0 && <>
				<Typography color='secondary' >
					L(`Your have ${tasks} ${tasks > 1 ? 'quizzes' : 'quiz'} to finish.`, {tasks})
				</Typography>
				<AnTablist pk='qid'
					className={classes.root}
					columns={[
						{ text: L('qid'), hide:true, field: "qid" },
						{ text: L('Quiz Name'), field: "quizName", color: 'primary', className: 'bold'},
						{ text: L('Progress'), field: "progress", color: 'primary' },
						{ text: L('Questions'), field: "questions", color: 'primary' },
						{ text: L('DDL'), field: "ddl", color: 'primary' }
					]}
					rows={this.state.rows}
					onSelectChange={this.onTableSelect} />
				{this.quizForm}
				</>
			}
		</>);
	}
}
MyStatusComp.contextType = AnContext;

const MyStatus = withWidth()(withStyles(styles)(MyStatusComp));
export { MyStatus, MyStatusComp }
