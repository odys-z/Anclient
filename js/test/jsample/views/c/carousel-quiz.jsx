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
import { CarouselCard } from "./carousel-card";

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
		}
	};

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
				that.setState({quiz: centerResp.carouselQuiz()});
			},
			this.context.error);
	}

	toSubmit(e) {
		// save
		let reqBd = new UserReq();

		let client = this.context.anClient;
		let req = client.userReq( this.props.uri, 'center',
					new UserReq( this.uri, "center" )
						.A(CenterProtocol.A.submitPoll)
					 	.set(CenterProtocol.pollId, this.state.pollId)
					 	.set(CenterProtocol.pollResults, this.state.quiz.questions));
		this.state.req = req;

		let that = this;
		client.commit(req, (resp) => {
			that.state.crud = Protocol.CRUD.u;
			that.showOk(L('Quiz submitted!'));
			if (typeof that.props.onOk === 'function')
				that.props.onSubmit({pollId: this.state.pollId, resp});
		}, this.context.error);
	}

	render() {
		let props = this.props;
		return (
		  <Dialog
		    fullWidth={true}
		    maxWidth={'md'}
		    open={true}
		  >
			<Carousel>
				{questionCard( {title: this.state.quiz.title},
						this.state.quiz.questions, this.carousel)}
				<CarouselCard key={this.state.quiz.questions.lenght || 0}
					goPrev={() => carousel.slideNext()}
					goNext={() => carousel.slideNext()}
					quiz={{title: L('Thank you!')}}
					question={L('Please submit!')}
					toStart={props.goLink}
					toCancel={props.onClose}
					toSubmit={this.toSubmit}
				/>
			</Carousel>
		  </Dialog>
		);

		function questionCard(qz, qs, carousel) {
			return qs.map( (q, x) => (
			  <CarouselCard key={x}
				goPrev={() => carousel.slideNext()}
				goNext={() => carousel.slideNext()}
				quiz={qz}
				question={q}
				toCancel={x === 0 && props.onClose}
			  />)
			);
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
