
import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import withWidth from "@material-ui/core/withWidth";
import { Card, TextField, Typography } from '@material-ui/core';

import {L, Langstrs, Protocol, UserReq,
    AnClient, SessionClient,
    AnContext, AnError, CrudCompW, AnReactExt,
	AnTablist
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
				.A(center_a.getStatus) );
		this.state.statusReq = req;

		let that = this;
		client.commit(req, (resp) => {
			let centerResp = resp.Body()
			that.setState({my: centerResp.my()});
		}, this.context.error);
	}

	onSelectChange(opt) {
		let {e, selectedIds, val} = opt;
		if (selectedIds)
		 	this.pollForm = (
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
						// { text: L('Message'), field: "msg"},
						{ text: L('Message'), field: "msg", formatter: showMsg },
						{ text: L('Subject'), field: "subject"},
						{ text: L('DDL'), field: "ddl", color: 'primary' }
					]}
					rows={this.state.my.polls}
					onSelectChange={this.onTableSelect} />
					{this.pollForm}
				</>
			}
		</>);

		function showMsg( extra, rx ) {
			let json = JSON.parse(extra);
			return (
			<Typography key={rx}>
				{L('Msg from North:')}
                {json.msg}
			</Typography>);
		}
	}
}
MyStatusComp.contextType = AnContext;

const MyStatus = withWidth()(withStyles(styles)(MyStatusComp));
export { MyStatus, MyStatusComp }
