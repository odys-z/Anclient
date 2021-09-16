
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
	import Collapse from "@material-ui/core/Collapse";

import {
	L, Langstrs, Protocol, UserReq,
    AnClient, SessionClient,
    AnContext, AnError, AnReactExt
} from '@anclient/anreact';

import { QuizProtocol } from '../../common/protocol.quiz.js';


/**
 * Style refernece: https://codesandbox.io/s/quiz-card-testing-p5212?file=/demo.js
 */
const styles = (theme) => ({
  root: {
    height: 560,
    // minWidth: 520,
    maxWidth: 720,
	margin: "auto",
    "& :hover": {
      backgroundColor: "#ddd"
    }
  },
  title: {
    textAlign: "center",
    marginTop: 20,
    marginBottom: 40
  },
  content: {
    height: 480
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
  submitButton: {
    margin: 12,
    width: "92%",
    height: 40,
    textAlign: "center",
    border: "solid 0.2ch #cce"
  },
  ranks: {
    width: "80%",
    textAlign: "left"
  },
  optionTxt: {
    textTransform: "none"
  },
  actions: {
    spacing: theme.spacing(10),
    verticalAlign: "bottom",
    width: "99%",
    textAlign: "center",
    marginTop: 20
    // border: "solid 1px grey"
  }
});

export function isEmpty(str) {
  return typeof str === "undefined" || str === null || str === "";
}

class CarouselCardComp extends React.Component {
  state = {
    closed: false,
    quiz: {},
    question: []
  };

  constructor(props) {
    super(props);

    this.formatAnswer = this.formatAnswer.bind(this);
    this.formatSingleOptions = this.formatSingleOptions.bind(this);
    this.formatMultipleOptions = this.formatMultipleOptions.bind(this);
    this.formatRank = this.formatRank.bind(this);
    this.formatMultiRanks = this.formatMultiRanks.bind(this);
    this.formatNumber = this.formatNumber.bind(this);

    let { question, quiz } = this.props;
    this.state = { quiz: quiz.poll || quiz, question };

  }

  formatAnswer(question, classes) {
    let { qtype, answers } = question;
    if (qtype === "s") return this.formatSingleOptions(classes, question);
    if (qtype === "m") return this.formatMultipleOptions(classes, question);
    else if (qtype === "r5") return this.formatRank(classes, question, [5]);
    else if (qtype === "r10") return this.formatRank(classes, question, [10]);
    else if (qtype === "mr5")
      return this.formatMultiRanks(classes, question, 5);
    else if (qtype === "mr10")
      return this.formatMultiRanks(classes, question, 10);
    else if (qtype === "n") return this.formatNumber(classes, question);
    else return answers;
  }

  formatSingleOptions(classes, question) {
    let { answers } = question;
    let ss = answers.split("\n");
    let that = this;
    if (ss)
      return ss.map((s, x) => (
        <Button
          color="primary"
          key={`${question.qid} ${x}`}
          className={classes.button}
          variant="contained"
          onClick={(e) => {
            this.state.question.answer = x;
            this.setState({});
            this.props.onValueChanged(x);
            this.props.goNext();
          }}
        >
          {s}
        </Button>
      ));
  }

  formatMultipleOptions(classes, question) {
    let { answers } = question;
    let ss = answers.split("\n");
    if (ss) {
      let that = this;
      let s = new Set();
      question.answer = s;
      return ss.map((txt, x) => (
        <Button
          key={`${question.qid} ${x}`}
          variant="outlined"
          className={classes.button}
          color="primary"
          onClick={(e) => {
            (s.has(x) && !!s.delete(x)) || s.add(x);
            that.setState({ question });
          }}
        >
          <Checkbox value="" color="primary" />
          <Typography className={classes.optionTxt} variant="body2">
            {txt}
          </Typography>
        </Button>
      ));
    }
  }

  formatNumber(classes, question) {
    let that = this;
    return (
      <TextField
        key={question.qid}
        color="primary"
        type="number"
        label={L("Please fill in a number!")}
        variant="outlined"
        inputProps={{ style: {} }}
        onChange={(e) => {
          let answer = e.target.value;
		  this.state.question.answer = answer;
          this.setState({ answer });
          this.props.onValueChanged(answer);
        }}
      />
    );
  }

  formatRank(classes, question, r) {
    let rank;
    if (typeof r === "number") rank = r;
    else rank = r[0];
    if (isEmpty(this.state.answer)) this.state.answer = 3;
    return (
      <div className={classes.ranks} key={question.qid + "." + question.qorder}>
        <Box component="fieldset" ml={9} mt={1} mb={1} borderColor="transparent" >
          <Rating
            name={"r" + r + question.qid}
            value={this.state.answer}
            onChange={ (event, newValue) => {
              // console.log(newValue);
              this.state.question.answer = newValue;
              this.setState({ answer: newValue });
              this.props.onValueChanged(newValue);
              this.props.goNext();
            }}
            defaultValue={rank / 2}
            precision={0.5}
            max={rank}
            emptyIcon={<StarBorderIcon fontSize="inherit" />}
            size="large"
          />
        </Box>
      </div>
    );
  }

  formatMultiRanks(classes, question, r) {

    let rank = 5;
    if (typeof r === "number") rank = r;
    else rank = r[0];
    let that = this;

    let ss = question.answers.trim().split("\n");
	this.state.answer = new Array(ss.length).fill(rank / 2);

    return ss.map((v, x) => (
      <div className={classes.ranks} key={`${question.qid} ${x}`}>
        <Box component="fieldset" mt={1} mb={1} borderColor="transparent">
          <Typography color="primary">{v}</Typography>
          <Rating name={question.qid + 'mr' + x}
            onChange={ (e, newValue) => {
              let ans_i = e.target.value;
              this.state.answer[x] = newValue;
              this.setState({ answer: this.state.answer });
              this.props.onValueChanged(this.state.answer);

              if (this.state.answer.length <= 1)
                	this.props.goNext();
            } }
            defaultValue={rank / 2}
            precision={0.5}
            max={rank}
            emptyIcon={<StarBorderIcon fontSize="inherit" />}
            size="large"
          />
        </Box>
      </div>
    ));
  }

  render() {
    let { classes, toCancel, toSubmit } = this.props;
    let { question, quiz } = this.state;
    return (
      <Collapse in={this.props.x === this.props.currentx}>
        <Card key={"a"} className={classes.root}>
          <Paper className={classes.content}>
            <Typography variant="h4" className={classes.title}>
              {quiz.title || L("Quiz Title")}
            </Typography>
            <Typography variant="subtitle2" className={classes.question}>
              {question.question}
            </Typography>
            <Box className={classes.answers}>
              {this.formatAnswer(question, classes)}
            </Box>
          </Paper>
          <Box className={classes.actions}>
            {toCancel && (
              <Button color="secondary" onClick={toCancel}>
                {"Cancel"}
              </Button>
            )}
          </Box>
        </Card>
      </Collapse>
    );
  }
}
CarouselCardComp.context = AnContext;

CarouselCardComp.propTypes = {
	goNext: PropTypes.func.isRequired,
	goPrev: PropTypes.func.isRequired,
	question: PropTypes.object.isRequired,
	quiz: PropTypes.object.isRequired,
};

const CarouselCard = withWidth()(withStyles(styles)(CarouselCardComp));
export { CarouselCard, CarouselCardComp }

class CarouselSubmitCardComp extends React.Component {
	render () {
		let that = this;
		let { classes, question,
			title, submitted, submittedText,
			toClose, toCancel, toSubmit } = this.props;
		if (toSubmit)
			toSubmit = function (e) {
				question.question = L('Thank you!');
				that.props.toSubmit(e);
				toSubmit = undefined;
				that.setState({});
			};

		return (
      	<Collapse in={this.props.x === this.props.currentx}>
		  <Card key={"a"} className={classes.root}>
			<Paper className={classes.content}>
				<Typography variant="h4" className={classes.title}>
					{submitted ? submittedText : title || L('Final Check')}
				</Typography>
				{submitted ?
					<>
						<Typography variant="subtitle2" className={classes.title}>
							{submittedText}
						</Typography>
						<Button color="primary" variant="contained"
							className={classes.submitButton}
							onClick={toClose}>{L('Close')}</Button>
					</>
					:
					<>
						<Typography variant="subtitle2" className={classes.title}>
							{question.question}
						</Typography>
						<Button variant="contained" color="primary"
							className={classes.submitButton}
							onClick={toSubmit}>{"Submit"}</Button>
					</>
				}
			</Paper>
			<Box className={classes.actions}>
			{ !submitted &&
				<Button color="secondary" onClick={toCancel}>{L('Cancel')}</Button> }
			</Box>
		  </Card>
    	</Collapse>
		);
	}
}
CarouselSubmitCardComp.context = AnContext;

CarouselSubmitCardComp.propTypes = {
	submitted: PropTypes.bool,
	submittedText: PropTypes.string.isRequired,
	goPrev: PropTypes.func.isRequired,
	toClose: PropTypes.func.isRequired,
	toSubmit: PropTypes.func.isRequired,
	toCancel: PropTypes.func.isRequired
};

const CarouselSubmitCard = withWidth()(withStyles(styles)(CarouselSubmitCardComp));
export { CarouselSubmitCard, CarouselSubmitCardComp }
