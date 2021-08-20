
import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import withWidth from "@material-ui/core/withWidth";
import { Card, Button, Typography } from '@material-ui/core';

import {
	L, Langstrs, AnConst,
    AnClient, SessionClient, Protocol, UserReq,
    AnContext, AnError, CrudCompW, AnReactExt,
	AnQueryForm, AnTablist
} from 'anclient';

import { center_a } from '../../common/protocol.quiz';
import { CarouselQuiz } from './carousel-quiz';

const styles = (theme) => ( {
	root: {
	}
} );

class MyPollsComp extends CrudCompW {
	state = {
		polls: [],

		condTitl: { type: 'text', val: '', label: L('Title') },
		condTags: { type: 'text', val: '', label: L('Tags') },
		condIssr: { type: 'cbb',  val: AnConst.cbbAllItem,
					sk: 'center.my-polls.issuers', nv: {n: 'userName', v: 'uid'},
					sqlArgs: ['kidId', 't-year'],
					options: [ AnConst.cbbAllItem ],
					label: L('Issuers') },

		selectedIds: []
	};

	constructor(props) {
		super(props);

		this.toSearch = this.toSearch.bind(this);
		this.takePoll = this.takePoll.bind(this);
	}

	componentDidMount() {
		console.log(this.uri)

		this.toSearch();
	}

	toSearch(e, query) {
		let reqBd = new UserReq();

		let client = this.context.anClient;
		let req = client.userReq( this.uri, 'center',
					new UserReq( this.uri, "center" )
						.A(center_a.myPolls) );
		this.state.req = req;

		let that = this;
		client.commit(req,
			(resp) => {
				let centerResp = resp.Body()
				that.setState({polls: centerResp.polls()});
				that.state.selectedIds.splice(0);
			},
			this.context.error);
	}

	takePoll(e) {
		if (e) e.stopPropagation();

		let that = this;
		this.quizForm = (<CarouselQuiz uri={this.uri}
				quiz={this.selectedIds[0]}
				toClose={() => {that.quizForm = undefined;}}
			/>);
		this.setState({});
	}

	render () {
		let { classes } = this.props;
		let polls = this.state.polls;
		return (<>
			<AnQueryForm uri={this.uri}
				onSearch={this.toSearch}
				conds={[ this.state.condTitl, this.state.condTags, this.state.condIssr ]}
				query={ (q) => { return {
					qTitl: q.state.conds[0].val ? q.state.conds[0].val : undefined,
					qTags: q.state.conds[1].val ? q.state.conds[1].val : undefined,
					qIssr: q.state.conds[2].val ? q.state.conds[2].val.v : undefined,
				}} }
			/>

			<Button onClick={this.takePoll} >{L('Take Poll')}</Button>
			{polls > 0 && <>
				<Typography color='secondary' >
					L(`Your have ${tasks} ${tasks > 1 ? 'quizzes' : 'quiz'} to finish.`, {tasks})
				</Typography>
				<AnTablist pk='pid'
					className={classes.root}
					columns={[
						{ text: L('pid'), hide: true, field: "pid" },
						{ text: L('Quiz Name'), field: "quizName", color: 'primary', className: 'bold'},
						{ text: L('Progress'), field: "progress", color: 'primary' },
						{ text: L('Questions'), field: "questions", color: 'primary' },
						{ text: L('DDL'), field: "ddl", color: 'primary' }
					]}
					rows={this.state.rows}
					onSelectChange={this.onTableSelect}
				/>
			</>}
			{this.quizForm}
			</>);
	}
}
MyPollsComp.contextType = AnContext;

const MyPolls = withWidth()(withStyles(styles)(MyPollsComp));
export { MyPolls, MyPollsComp  }
