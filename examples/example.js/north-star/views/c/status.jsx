
import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import withWidth from "@material-ui/core/withWidth";
import { Card, TextField, Typography } from '@material-ui/core';

import { Protocol, UserReq, SessionClient, AnClient } from '@anclient/semantier'
import {L, Langstrs, AnConst,
    AnContext, AnError, CrudCompW, AnReactExt,
	AnTablist
} from '@anclient/anreact';

import { CenterProtocol, CenterResp } from '../../common/protocol.quiz.js';
import { JQuiz } from '../../common/an-quiz.js';
import { myMsgFromIssuer } from '../../common/mui-helpers';

const styles = (theme) => ( {
	root: {
	}
} );

class MyStatusComp extends CrudCompW {
	state = {
		my: [],
		selectedIds: []
	};

	constructor(props) {
		super(props);

		this.onSelectChange = this.onSelectChange.bind(this);
	}

	componentDidMount() {
		console.log(this.uri);
		this.toLoad();
	}

	toLoad(e, query) {
		let reqBd = new UserReq();

		let client = this.context.anClient;
		let req = client.userReq(this.uri, 'center',
				new UserReq( this.uri, "center" )
				.A(CenterProtocol.A.getStatus) );
		this.state.req = req;

		let that = this;
		client.commit(req,
			(resp) => {
				let centerResp = resp.Body()
				that.setState({my: centerResp.my()});
				that.state.selectedIds.splice(0);
			},
			this.context.error);
	}

	onSelectChange(opt) {
		let {e, selectedIds, val} = opt;
		if (selectedIds)
		 	this.quizForm = (
				<></>
			);
	}

	render () {
		let {classes} = this.props;
		let tasks = this.state.my.tasks;
		return (<>My Status
			{tasks > 0 && <>
				<Typography color='secondary' >
					{L('Your have {tasks} {quiz} to finish.', {tasks, quiz: tasks > 1 ? 'quizzes' : 'quiz'})}
				</Typography>
				<AnTablist pk='qid'
					className={classes.root}
					columns={[
						{ text: L('dump'), hide: true, field: "checked" },
						{ text: L('qid'), hide: true, field: "qid" },

						{ text: L('Quiz Name'), field: "title", color: 'primary', className: 'bold'},
						{ text: L('Message'), field: "extra", formatter: myMsgFromIssuer },
						{ text: L('Subject'), field: "subject"},
						{ text: L('DDL'), field: "ddl", color: 'primary' }
					]}
					rows={this.state.my.polls}
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
