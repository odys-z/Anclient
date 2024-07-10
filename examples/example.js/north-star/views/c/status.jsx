
import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import withWidth from "@material-ui/core/withWidth";
import { Typography } from '@material-ui/core';

import { Protocol, UserReq } from '@anclient/semantier'
import {L, AnContext, CrudCompW, AnTablist
} from '@anclient/anreact';

import { CenterProtocol } from '../../common/protocol.quiz.js';
import { myMsgFromIssuer } from '../../common/mui-helpers';
import { starTheme } from '../../common/star-theme';

const styles = (theme) => Object.assign(starTheme(theme), theme => {
	root: {}
});

class MyStatusComp extends CrudCompW {
	state = {
		my: [],
		selected: {ids: new Set()}
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
				that.state.selected.ids.clear();
			},
			this.context.error);
	}

	onSelectChange(opt) {
		// if (selectedIds)
		//  	this.quizForm = (
		// 		<></>
		// 	);
	}

	render () {
		let {classes} = this.props;
		let tasks = this.state.my.tasks;
		return (<>My Status
			{tasks > 0 && <>
				<Typography color='secondary' >
					{L('Your have {tasks} {quiz} to finish.', {tasks, quiz: tasks > 1 ? 'quizzes' : 'quiz'})}
				</Typography>
				<AnTablist pk='qid' selected={this.state.selected}
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
				</>
			}
		</>);

	}
}
MyStatusComp.contextType = AnContext;

const MyStatus = withWidth()(withStyles(styles)(MyStatusComp));
export { MyStatus, MyStatusComp }
