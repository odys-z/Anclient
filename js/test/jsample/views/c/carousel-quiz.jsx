import React from "react";
import { withStyles } from '@material-ui/core/styles';
import withWidth from "@material-ui/core/withWidth";
import PropTypes from "prop-types";

import Dialog from '@material-ui/core/Dialog';


import Carousel from "react-elastic-carousel";

import { AnContext, CrudCompW } from "anclient";
import { CarouselCard } from "./carousel-quiz";

const styles = (theme) => ( {
	root: {
	}
} );

class CarouselQuizComp extends CrudCompW {
	state = {
		pollId: undefined,
		quiz: {
			quizId: undefined,
			questions: []
		}
	};

	constructor(props) {
		super(props)

		this.state.pollId = this.props.pollId;

		this.loadQuiz = this.loadQuiz.bind(this);
		this.toSubmit = this.toSubmit.bind(this);
	}

	/*
	render() {
	return (
	  <Dialog
	    fullWidth={true}
	    maxWidth={'md'}
	    open={true}
	  >
	    <Carousel ref={ref => (this.carousel = ref)}>
	        <QuizCard
	            goPrev={() => this.carousel.slideNext()}
	            goNext={() => this.carousel.slideNext()}
	            question={'Who am I?'}
	        />
	        <QuizCard
	            goPrev={() => this.carousel.slideNext()}
	            goNext={() => this.carousel.slideNext()}
	            question={'Who are you?'}
	        />
	        <QuizCard
	            goPrev={() => this.carousel.slideNext()}
	            goNext={() => this.carousel.slideNext()}
	            question={'Who is next?'}
	        />
	        <QuizCard
	            goPrev={() => this.carousel.slideNext()}
	            goNext={() => this.carousel.slideNext()}
	            question={'How about close?'}
	            toFinish={this.props.toClose}
	        />
	    </Carousel>
	  </Dialog> );
	}
	*/
	componentDidMount() {
		console.log(this.props.uri)

		this.loadQuiz();
	}

	loadQuiz() {
		let reqBd = new UserReq();

		let client = this.context.anClient;
		let req = client.userReq( this.uri, 'center',
					new UserReq( this.uri, "center" )
						.A(CenterProtocol.A.loadPoll)
					 	.set(CenterProtocol.pollId, this.state.pollId) );
		this.state.req = req;

		let that = this;
		client.commit(req,
			(resp) => {
				let centerResp = resp.Body()
				that.setState({quiz: centerResp.quiz()});
				that.state.selectedIds.splice(0);
			},
			this.context.error);
	}

	render() {
		return (
		  <Dialog
		    fullWidth={true}
		    maxWidth={'md'}
		    open={true}
		  >
			<Carousel>
				{questionCard(this.state.quiz.questions, this.carousel)}
			</Carousel>
		  </Dialog> );

		function questionCard(qs, carousel) {
			return qs.map( (q, x) => {
		        <QuizCard key={x}
		            goPrev={() => carousel.slideNext()}
		            goNext={() => carousel.slideNext()}
		            question={q.question}
		            toStart={x === 0 && this.props.toStart}
		            toFinish={x === qs.length - 1 && this.props.toClose}
		        />
			});
		}
	}
}
CarouselQuizComp.context = AnContext;

CarouselQuizComp.propTypes = {
	uri: PropTypes.string.isRequired,
	pollId: PropTypes.string.isRequired,
	toClose: PropTypes.func.isRequired
};

const CarouselQuiz = withWidth()(withStyles(styles)(CarouselQuizComp));
export { CarouselQuiz, CarouselQuizComp };
