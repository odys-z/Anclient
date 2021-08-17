
import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import withWidth from "@material-ui/core/withWidth";
import { Card, TextField, Typography } from '@material-ui/core';

import {L, Langstrs, Protocol, UserReq,
    AnClient, SessionClient,
    AnContext, AnError, CrudCompW, AnReactExt
} from 'anclient';

import { center_a, CenterResp } from '../../common/protocol.quiz.js';
import { JQuiz } from '../../common/an-quiz.js';

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

	componentDidMount() {
		console.log(this.uri);
		this.toLoad();
	}

	toLoad(e, query) {
		let reqBd = new UserReq();

		let client = this.context.anClient;
		let req = client.userReq(this.uri, 'center',
			new UserReq( this.uri, "center" ).A(center_a.getStatus) );
		this.state.statusReq = req;

		let that = this;
		client.commit(req, (resp) => {
			let centerResp = resp.Body()
			that.setState({my: centerResp.my()});
		}, this.context.error);
	}

	render () {
		let tasks = this.state.my.task && this.state.my.task.length;
		return (<>My Status
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
					{this.pollForm}
				</>
			}
		</>);
	}
}
MyStatusComp.contextType = AnContext;

const MyStatus = withWidth()(withStyles(styles)(MyStatusComp));
export { MyStatus, MyStatusComp }
