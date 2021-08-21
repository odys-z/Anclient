
import React from 'react';
	import { withStyles } from '@material-ui/core/styles';
	import withWidth from "@material-ui/core/withWidth";
	import Typography from "@material-ui/core/Typography";
	import Card from "@material-ui/core/Card";
	import Checkbox from "@material-ui/core/Checkbox";
	import Button from "@material-ui/core/Button";
	import Paper from "@material-ui/core/Paper";
	import PropTypes from "prop-types";
	import Box from '@material-ui/core/Box';
	import TextField from '@material-ui/core/TextField';
	import Rating from "@material-ui/lab/Rating";
	import StarBorderIcon from "@material-ui/icons/StarBorder";

import {L, Langstrs, Protocol, UserReq,
    AnClient, SessionClient,
    AnContext, AnError, AnReactExt
} from 'anclient';

import { QuizProtocol } from '../../common/protocol.quiz.js';

/**
 * Style refernece: https://codesandbox.io/s/quiz-card-testing-p5212?file=/demo.js
 */
const styles = (theme) => ({
  root: {
    height: 480,
    minWidth: 360,
    maxWidth: 600,
    align: "center",
    itemAlign: "center",
    "& :hover": {
      backgroundColor: "#ddf"
    }
  },
  title: {
    textAlign: "center",
	marginTop: 20,
	marginBottom: 40
  },
  content: {
    height: 400
  },
  question: {
    fontSize: 18,
    paddingBottom: 25
  },
  answers: {
    spacing: theme.spacing(1),
    width: "90%",
    textAlign: "center"
    // border: "solid 1px green"
  },
  button: {
    margin: 3,
    width: "80%",
    textAlign: "center",
    border: "solid 0.2ch #cce"
  },
  ranks: {
    width: "80%",
    textAlign: "left"
  },
  optionTxt: {
    textTransform: 'none',
  },
  actions: {
    spacing: theme.spacing(10),
    verticalAlign: "bottom",
    width: "99%",
    textAlign: "center",
    marginTop: 50
    // border: "solid 1px grey"
  }
});

class CarouselCardComp extends React.Component {
	state = {
		closed: false,
	}

	constructor(props) {
		super(props);

		this.formatAnswer = this.formatAnswer.bind(this);
		this.formatSingleOptions = this.formatSingleOptions.bind(this);
		this.formatMultipleOptions = this.formatMultipleOptions.bind(this);
		this.formatRank = this.formatRank.bind(this);
		this.formatMultiRanks = this.formatMultiRanks.bind(this);
		this.formatNumber = this.formatNumber.bind(this);
	}

	formatAnswer(question, classes) {
		let {qtype, answers} = question;
		if (qtype === QuizProtocol.Qtype.single)
			return this.formatSingleOptions(classes, question)
		if (qtype === QuizProtocol.Qtype.multiple)
			return this.formatMultipleOptions(classes, question)
		else if (qtype === QuizProtocol.Qtype.rank5)
			return this.formatRank(classes, [5]);
		else if (qtype === QuizProtocol.Qtype.rank10)
			return this.formatRank(classes, [10]);
		else if (qtype === QuizProtocol.Qtype.multiR5)
			return this.formatMultiRanks(classes, question, 5);
		else if (qtype === QuizProtocol.Qtype.multiR10)
			return this.formatMultiRanks(classes, question, 10);
		else if (qtype === QuizProtocol.Qtype.num)
			return this.formatNumber(classes, question);
		else return answers;
	}

	formatSingleOptions(classes, question) {
		let {answers} = question;
		let ss = answers.split('\n');
		if (ss)
			return ss.map( (s, x) => (
				<Button color='primary' key={`${question.qid} ${x}`}
					className={classes.button}
					variant="contained"
					onClick={ e => question.answer = x } >
					{s}
				</Button>)
			);
	}

	formatMultipleOptions(classes, question) {
		let {answers} = question;
		let ss = answers.split('\n');
		if (ss) {
			let s = new Set();
			question.answer = s;
			return ss.map( (txt, x) => (
				<Button key={`${question.qid} ${x}`}
					variant='outlined' className={classes.button}
					color='primary'
					onClick={(e) => (s.has(x) && !!s.delete(x)) || s.add(x) }
				>
				  <Checkbox
					checked={this.state.checkedA}
					onChange={(e) => (s.has(x) && !!s.delete(x)) || s.add(x) }
					value="checkedA" color="primary"
				  />
				  <Typography className={classes.optionTxt}
					variant="body2">{txt}
				  </Typography>
				</Button> )
			);
		}
	}

	formatNumber(classes, question) {
		return (
		<TextField key={question.qid} color='primary'
			type='number'
			label={L('Please fill in a number!')}
			variant='outlined'
			inputProps={{style: {}} }
			onChange={(e) => { this.setState({ dirty : true });}}
		/>);
	}

	formatRank(classes, r) {
		let ranks;
		if (typeof r === 'number')
			ranks = [r];
		else
			ranks = r;
		return ranks.map( (v, x) => (
		  <div className={classes.ranks} key={"r5-10" + v + "." + x} >
			<Box component="fieldset" ml={9} mt={1} mb={1}
				borderColor="transparent" >
				<Rating name="size-large"
					onChange={(e) => console.log(e.target.value)}
					defaultValue={v / 2}
					precision={0.5}
					max={v}
					emptyIcon={<StarBorderIcon fontSize="inherit" />}
					size="large" />
			</Box>
		  </div>
		) );
	}

	formatMultiRanks(classes, question, r) {
		let ss = question.answers.split('\n');

		let rank = 5;
		if (typeof r === 'number')
			rank = r;
		else
			rank = r[0];

		return ss.map( (v, x) => (
		  <div className={classes.ranks} key={`${question.qid} ${x}`} >
			<Box component="fieldset" mt={1} mb={1}
				borderColor="transparent" >
				<Typography color='primary' >
					{v}
				</Typography>
				<Rating name="size-large"
					onChange={(e) => console.log(e.target.value)}
					defaultValue={rank / 2}
					precision={0.5}
					max={rank}
					emptyIcon={<StarBorderIcon fontSize="inherit" />}
					size="large" />
			</Box>
		  </div>
		) );
	}

	render () {
		let { classes, question, quiz, toCancel, toSubmit } = this.props;
		return (
		  <Card key={"a"} className={classes.root}>
			<Paper className={classes.content}>
				<Typography variant="h4" className={classes.title}>
					{quiz.title || L('Quiz Title')}
				</Typography>
				<Typography variant="subtitle2" className={classes.question}>
					{question.question}
				</Typography>
				<Box className={classes.answers}>
					{this.formatAnswer(question, classes)}
				</Box>
			</Paper>
			<Box className={classes.actions}>
			{ toCancel &&
				<Button color="primary" onClick={toCancel}>{"Cancel"}</Button> }
			{ toSubmit &&
				<Button color="secondary" onClick={toSubmit}>{"Submit"}</Button> }
			</Box>
		  </Card>
		);
	}
}
CarouselCardComp.context = AnContext;

CarouselCardComp.propTypes = {
	goNext: PropTypes.func.isRequired,
	goPrev: PropTypes.func.isRequired
};

const CarouselCard = withWidth()(withStyles(styles)(CarouselCardComp));
export { CarouselCard, CarouselCardComp }
