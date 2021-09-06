import React from "react";
import { withStyles } from '@material-ui/core/styles';
import withWidth from "@material-ui/core/withWidth";
import PropTypes from "prop-types";

import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

// import Carousel from "react-elastic-carousel";
import MobileStepper from "@material-ui/core/MobileStepper";
import KeyboardArrowLeft from "@material-ui/icons/KeyboardArrowLeft";
import KeyboardArrowRight from "@material-ui/icons/KeyboardArrowRight";

import {
	L, Langstrs, AnConst,
    AnClient, Protocol, UserReq, DatasetReq,
    AnContext, CrudCompW, AnReactExt
} from 'anclient';

import { CenterProtocol } from "../../common/protocol.quiz.js";
import { JQuiz } from '../../common/an-quiz.js';
import { CarouselCard, CarouselSubmitCard } from "./carousel-card";

const styles = (theme) => ( {
	root: {
		textAlign: "center",
	}
} );

/**Design Note:
 * As this component load the record (the poll) by ittself, submitting is also
 * handled here before quit.
 */
class CarouselQuizComp extends CrudCompW {
	state = {
		pollId: undefined,
		quiz: {
			quizId: undefined,
			questions: []
		},
	    activeStep: 0,
	};

	constructor(props) {
		super(props)

		this.state.pollId = this.props.pollId;

		this.loadQuiz = this.loadQuiz.bind(this);
		this.toSubmit = this.toSubmit.bind(this);

		this.handleNext = this.handleNext.bind(this);
		this.handleBack = this.handleBack.bind(this);
		this.handleStepChange = this.handleStepChange.bind(this);
		this.buildCards = this.buildCards.bind(this);
	}

	componentDidMount() {
		console.log(this.props.uri)

		this.loadQuiz();
	}

	loadQuiz() {
		let reqBd = new UserReq();

		let client = this.context.anClient;
		let req = client.userReq( this.props.uri, 'center',
					new UserReq( this.uri, "center" )
						.A(CenterProtocol.A.loadPoll)
					 	.set(CenterProtocol.pollId, this.state.pollId) );
		this.state.req = req;

		let that = this;
		client.commit(req,
			(resp) => {
				let centerResp = resp.Body()
				let quiz = centerResp.carouselQuiz();
				that.cards = quiz.questions;
				that.setState({ quiz, activeStep: 0 });
			},
			this.context.error);
	}

	toSubmit(e) {
		// save
		let that = this;
		if (!this.jquiz)
			this.jquiz = new JQuiz(this.context.anClient, this.context.error);

		this.jquiz.submitPoll(
			this.props.uri,
			{pollId: this.state.pollId, questions: this.state.quiz.questions},
			() => {
				that.state.crud = Protocol.CRUD.u;
				that.setState({submitted: true});
				// that.loadQuiz();
				that.props.onSubmit();
			},
			this.context.error
		);
	}


	handleNext() {
		this.setState({ activeStep: this.state.activeStep + 1 });
	}

	handleBack = () => {
		this.setState({ activeStep: this.state.activeStep - 1 });
	};

	handleStepChange(step) {
		this.setState({ step });
	}

	buildCards() {
		let that = this;
		let props = this.props;
		if (this.cards) {
		  let c = this.cards.map(
			(step, x) => (
			  <CarouselCard  m='auto' key={x}
				x={x} currentx={this.state.activeStep}
			    goPrev={that.handleBack} goNext={that.handleNext}
			    quiz={this.state.quiz} question={step}
			    onValueChanged={(e) => onChange(e)}
			    toCancel={x === 0 && props.onClose}
			  />
		    ));

		  c.push(
			  <CarouselSubmitCard m='auto' key={this.cards.length}
				x={this.cards.length} currentx={this.state.activeStep}
			    goPrev={that.handleBack}
				title={L('Almost done!')}
				question={{ question: L('Please submit!') }}
				submittedText={L('Thank you!')}
				toCancel={props.onClose}
				toClose={props.onClose}
				toSubmit={this.toSubmit}
				submitted={this.state.submitted}
			/>);
		return c;
	  }
	  else return (
		<CarouselCard m='auto' key={-1}
			x={-1} currentx={-1}
		    goNext={() => this.setState({})}
		    goPrev={() => this.setState({})}
		    quiz={{title: 'loading ...'}} question={{}}
		    toCancel={props.onClose}
		/>);

		function onChange(q) {
			if (that.cards)
				that.cards[that.state.activeStep].answer = q;
		}
	}

	render() {
		let props = this.props;
		let {classes} = this.props;
		let {activeStep} = this.state;
		let cardNum = this.cards ? this.cards.length + 1 : 1;
		let that = this;
		return (
		  <Dialog className={classes.root}
		    fullWidth={true}
		    maxWidth={'md'}
		    open={true}
		  >
			<DialogTitle id="alert-dialog-title"/>
			<DialogContent className={classes.root}>
				{this.buildCards()}
			</DialogContent>
			<MobileStepper variant="dots" steps={cardNum}
					position="static" className={classes.root}
					activeStep={activeStep}
					nextButton={
						<Button size="small"
						  onClick={this.handleNext}
						  disabled={activeStep === cardNum - 1}
						> Next
						  {<KeyboardArrowRight />}
						</Button>
					}
					backButton={
						<Button size="small"
						  onClick={this.handleBack}
						  disabled={activeStep === 0}
						> {<KeyboardArrowLeft />}
						  Back
						</Button>
					}
			/>
		  </Dialog>
		);
	}
}
CarouselQuizComp.context = AnContext;

CarouselQuizComp.propTypes = {
	uri: PropTypes.string.isRequired,
	pollId: PropTypes.string.isRequired,
	onClose: PropTypes.func.isRequired,
	onSubmit: PropTypes.func.isRequired,
	goLink: PropTypes.func
};

const CarouselQuiz = withWidth()(withStyles(styles)(CarouselQuizComp));
export { CarouselQuiz, CarouselQuizComp };
