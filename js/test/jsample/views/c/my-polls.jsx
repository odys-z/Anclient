
import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import withWidth from "@material-ui/core/withWidth";
import { Card, Button, Typography } from '@material-ui/core';

import {
	L, Langstrs, AnConst,
    AnClient, SessionClient, Protocol, UserReq,
    AnContext, AnError, CrudCompW, AnReactExt,
	AnQueryForm, AnTablistLevelUp
} from 'anclient';

import { CenterProtocol } from '../../common/protocol.quiz';
import { myMsgFromIssuer } from '../../common/mui-helpers';
import { CarouselQuiz } from './carousel-quiz';

const styles = (theme) => ( {
	root: {
	}
} );

/**
 * This component uses children's level upped state to collect question cards' data.
 */
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
		condWait: { type: 'switch', val: true, label: L('Only Waiting') },

		selected: {Ids: new Set()},
		waitingPollIds: new Set(),
	};

	constructor(props) {
		super(props);

		this.toSearch = this.toSearch.bind(this);
		this.takePoll = this.takePoll.bind(this);
	}

	componentDidMount() {
		console.log(this.uri, this.context.anClient.userInfo.uid);

		this.state.condIssr.sqlArgs = [ this.context.anClient.userInfo.uid,
										CenterProtocol.PollState.wait ];
		this.state.condIssr.clean = false;  // trigger AnQueryFormComp reloading

		this.toSearch();
	}

	toSearch(e, query) {

		let client = this.context.anClient;
		let req = client.userReq( this.uri, 'center',
					new UserReq( this.uri, "center" )
						.A(CenterProtocol.A.myPolls) );

		let reqBd = req.Body();

		if (query && query.qWait)
			reqBd.set(CenterProtocol.pollState, CenterProtocol.PollState.wait);

		if (query && query.qIssr.val && query.qIssr.val != AnConst.cbbAllItem.v)
			reqBd.set(CenterProtocol.pollIssuer, qIssr.val);

		this.state.req = req;

		let that = this;
		client.commit(req,
			(resp) => {
				let centerResp = resp.Body()
				let polls = centerResp.polls();
				that.setState({polls});
				that.state.selected.Ids.clear(0);

				// reset flags
				let myTaskIds = centerResp.myTaskIds();
				console.log(myTaskIds);
				that.state.waitingPollIds = myTaskIds;
			},
			this.context.error);
	}

	takePoll(e) {
		if (e) e.stopPropagation();

		let that = this;
		this.quizForm = (
			<CarouselQuiz uri={this.uri}
				pollId={[...this.state.selected.Ids][0]} // load by itself
				// quiz are loaded by CarouselQuizComp, so committed by itself
				onSubmit={() => {that.quizForm = undefined;}} // no thanks?
				onClose={ () => {that.quizForm = undefined;}}
			/>);
		this.setState({});
	}

	render () {
		let { classes } = this.props;
		let polls = this.state.polls && this.state.polls.rows;
		let tasks = this.state.waitingPollIds.size;
		return (<>
			{ this.state.condIssr.sqlArgs && // must load userId before reandering issuers cbb.
			  <AnQueryForm uri={this.uri}
				onSearch={this.toSearch}
				conds={[ this.state.condTitl, this.state.condTags, this.state.condIssr, this.state.condWait ]}
				query={ (q) => { return {
					qTitl: q.state.conds[0].val,
					qTags: q.state.conds[1].val,
					qIssr: q.state.conds[2].val && q.state.conds[2].val.v,
					qWait: q.state.conds[3].val,
				}} }
			/>}

			<Typography color='secondary' >
				{ tasks > 0 ? L('Your have {tasks} {quiz} to finish.',
								{tasks, quiz: tasks > 1 ? 'quizzes' : 'quiz'})
				  : ""}
			</Typography>
			<Button variant="outlined" color='secondary'
				onClick={this.takePoll}
				disabled={this.state.selected.Ids.size <= 0 ||
						!this.state.waitingPollIds.has([...this.state.selected.Ids][0] ) }
			> {L('Take Poll')}
			</Button>
			<AnTablistLevelUp pk='pid' checkbox singleCheck
				selectedIds={this.state.selected}
				className={classes.root}
				columns={[
					{ text: L('chk'), hide: true, field: "checked" },
					{ text: L('pid'), hide: true, field: "pid" },
					{ text: L('Title'), field: "title", color: 'primary', className: 'bold'},
					{ text: L('Title'), field: "title", color: 'primary' },
					{ text: L('Questions'), field: "questions", color: 'primary' },
					{ text: L('Message'), field: "extra", formatter: myMsgFromIssuer, color: 'primary' }
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
