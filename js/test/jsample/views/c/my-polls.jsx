
import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import withWidth from "@material-ui/core/withWidth";
import { Card, Button, Typography } from '@material-ui/core';

import {
    AnClient, SessionClient, Protocol, L, Langstrs,
    AnContext, AnError, CrudCompW, AnReactExt, AnTablist
} from 'anclient';

import { CarouselQuiz } from './carousel-quiz';

const styles = (theme) => ( {
	root: {
	}
} );

class MyPollsComp extends CrudCompW {
	state = {
		my: {
			polls: 0
		}
	};

	constructor(props) {
		super(props);

		this.takePoll = this.takePoll.bind(this);
	}

	componentDidMount() {
		console.log(this.uri)
	}


	takePoll(e) {
		if (e) e.stopPropagation();

		let that = this;
		this.quizForm = (
            <CarouselQuiz uri={this.uri}
				toClose={() => {that.quizForm = undefined;}}
			/>);
		this.setState({});
	}

	render () {
		let { classes } = this.props;
		let polls = this.state.my.polls;
		return (<>Polls List
			<Button onClick={this.takePoll} >{L('Take Poll')}</Button>
			{polls > 0 && <>
				<Typography color='secondary' >
					L(`Your have ${tasks} ${tasks > 1 ? 'quizzes' : 'quiz'} to finish.`, {tasks})
				</Typography>
				<AnTablist pk='pid'
					className={classes.root}
					columns={[
						{ text: L('qid'), hide:true, field: "qid" },
						{ text: L('Title'), field: "title", color: 'primary', className: 'bold'},
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
