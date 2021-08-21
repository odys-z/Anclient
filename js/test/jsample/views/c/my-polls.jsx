
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

import { CenterProtocol } from '../../common/protocol.quiz';
import { CarouselQuiz } from './carousel-quiz';

const styles = (theme) => ( {
	root: {
	}
} );

class MyPollsComp extends CrudCompW {
	state = {
		polls: {cols:[], rows: []},

		condTitl: { type: 'text', val: '', label: L('Title') },
		condTags: { type: 'text', val: '', label: L('Tags') },
		condIssr: { type: 'cbb',  val: AnConst.cbbAllItem,
					sk: 'center.my-polls.issuers', nv: {n: 'txt', v: 'val'},
					sqlArgs: undefined, //['pollee-id', 'pollee-role', 'issuer-role'],
					options: [ AnConst.cbbAllItem ],
					label: L('Issuers') },

		selectedIds: []
	};

	constructor(props) {
		super(props);

		this.toSearch = this.toSearch.bind(this);
		this.onSelect = this.onSelect.bind(this);
		this.takePoll = this.takePoll.bind(this);
	}

	componentDidMount() {
		console.log(this.uri, this.context.anClient.userInfo.uid);

		this.state.condIssr.sqlArgs = [this.context.anClient.userInfo.uid, 'r03', 'r01'];
		this.state.condIssr.clean = false;  // trigger AnQueryFormComp reloading

		this.toSearch();
	}

	toSearch(e, query) {
		let reqBd = new UserReq();

		let client = this.context.anClient;
		let req = client.userReq( this.uri, 'center',
					new UserReq( this.uri, "center" )
						.A(CenterProtocol.A.myPolls) );
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

	onSelect(selectedIds, newIt) {
		this.setState({selectedIds});
	}

	takePoll(e) {
		if (e) e.stopPropagation();

		let that = this;
		this.quizForm = (
			<CarouselQuiz uri={this.uri}
				pollId={this.state.selectedIds[0]} // load by itself
				// quiz are loaded by CarouselQuizComp, so committed by itself
				onSubmit={() => {that.quizForm = undefined;}} // no thanks?
				onClose={ () => {that.quizForm = undefined;}}
			/>);
		this.setState({});
	}

	render () {
		let { classes } = this.props;
		let polls = this.state.polls && this.state.polls.rows;
		let tasks = polls && polls.length;
		return (<>
			{ this.state.condIssr.sqlArgs && // must load userId before reandering issuers cbb.
			  <AnQueryForm uri={this.uri}
				onSearch={this.toSearch}
				conds={[ this.state.condTitl, this.state.condTags, this.state.condIssr ]}
				query={ (q) => { return {
					qTitl: q.state.conds[0].val ? q.state.conds[0].val : undefined,
					qTags: q.state.conds[1].val ? q.state.conds[1].val : undefined,
					qIssr: q.state.conds[2].val ? q.state.conds[2].val.v : undefined,
				}} }
			/>}

			<Typography color='secondary' >
				{ tasks > 0 ? L('Your have {tasks} {quiz} to finish.',
								{tasks, quiz: tasks > 1 ? 'quizzes' : 'quiz'})
				  : ""}
			</Typography>
			<Button variant="contained" color='secondary'
				onClick={this.takePoll}
				disabled={this.state.selectedIds.length <= 0}
			> {L('Take Poll')}
			</Button>
			<AnTablist pk='pid' checkbox
				className={classes.root}
				columns={[
					{ text: L('chk'), hide: true, field: "checked" },
					{ text: L('pid'), hide: true, field: "pid" },
					{ text: L('Title'), field: "title", color: 'primary', className: 'bold'},
					{ text: L('Progress'), field: "progress", color: 'primary' },
					{ text: L('Questions'), field: "questions", color: 'primary' },
					{ text: L('DDL'), field: "ddl", color: 'primary' }
				]}
				rows={polls}
				onSelectChange={this.onSelect}
			/>
			{this.quizForm}
			</>);
	}
}
MyPollsComp.contextType = AnContext;

const MyPolls = withWidth()(withStyles(styles)(MyPollsComp));
export { MyPolls, MyPollsComp  }
