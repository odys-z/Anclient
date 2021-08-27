import React from "react";
import { withStyles } from '@material-ui/core/styles';
import withWidth from "@material-ui/core/withWidth";
import PropTypes from "prop-types";

import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';

import Carousel from "react-elastic-carousel";

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
	};

	quizHook = {quiz: [], collect: undefined};

	constructor(props) {
		super(props)

		this.state.pollId = this.props.pollId;

		this.loadQuiz = this.loadQuiz.bind(this);
		this.toSubmit = this.toSubmit.bind(this);
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
				that.quizHook.quiz = quiz;
				that.setState({ quiz });
			},
			this.context.error);
	}

	toSubmit(e) {
		// save
		let that = this;
		if (!this.jquiz)
			this.jquiz = new JQuiz(this.context.anClient, this.context.error);

		// collect
		this.quizHook.collect(this.state);

		this.jquiz.submitPoll(
			this.props.uri,
			{pollId: this.state.pollId, questions: this.state.quiz.questions},
			() => {
				that.state.crud = Protocol.CRUD.u;
				that.setState({submitted: true});
				that.loadQuiz();
			},
			this.context.error
		);
	}

	render() {
		let props = this.props;
		return (
		  <Dialog
		    fullWidth={true}
		    maxWidth={'md'}
		    open={true}
		  >
			<Carousel ref={ref => (this.carousel = ref)}>
				{questionCards( {title: this.state.quiz.title},
						this.state.quiz.questions, this.carousel)}
				<CarouselSubmitCard key={this.state.quiz.questions.length || -1}
					goPrev={() => carousel.slideNext()}
					goNext={() => carousel.slideNext()}
					title={L('Almost done!')}
					question={{ question: L('Please submit!') }}
					submittedText={L('Thank you!')}
					toCancel={props.onClose}
					toClose={props.onClose}
					toSubmit={this.toSubmit}
					submitted={this.state.submitted}
				/>
			</Carousel>
		  </Dialog>
		);

		function questionCards(qz, qs, carousel) {
			/*
			return qs.map( (q, x) => (
			  <CarouselCard key={x}
				goPrev={() => carousel.slideNext()}
				goNext={() => carousel.slideNext()}
				quiz={qz}
				question={q}
				onValueChanged={function(q) { let _q = q; return (v) => console.log('onchange', _q.question, v) && (_q.answer = v)}(q)}
				toCancel={x === 0 && props.onClose}
			  />)
			);
			*/
			let cards = [];
			if (qs) {
				qs.forEach( (q, x) => {
					cards.push(
						<CarouselCard key={x}
							stateHook={q}
							goPrev={() => carousel.slideNext() }
							goNext={() => carousel.slideNext() }
							quiz={qz}
							question={q}
							onValueChanged={() => onChange(x)}
							toCancel={x === 0 && props.onClose}
						/>);
				} );
			}
			return cards;

			function getOnchange(q) {
				console.log("parent: question", q.question);
				let _q = q;
				return (v) => console.log('onchange', _q.question, v)
								&& (_q.answer = v);
			}
			function onChange(q) {
				// q.collect(q);
				// console.log(q.answer);
				console.log(q);
			}
		}
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
