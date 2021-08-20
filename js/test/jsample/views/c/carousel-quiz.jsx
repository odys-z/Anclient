import React from "react";
import { withStyles } from '@material-ui/core/styles';
import withWidth from "@material-ui/core/withWidth";
import Dialog from '@material-ui/core/Dialog';
import PropTypes from "prop-types";


import Carousel from "react-elastic-carousel";

import { AnContext, CrudCompW } from "anclient";
import { QuizCard } from "./quiz-card";

const styles = (theme) => ( {
	root: {
	}
} );

class CarouselQuizComp extends CrudCompW {
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
}
CarouselQuizComp.context = AnContext;

CarouselQuizComp.propTypes = {
	uri: PropTypes.string.isRequired,
	quizId: PropTypes.string.isRequired,
	toClose: PropTypes.func.isRequired
};

const CarouselQuiz = withWidth()(withStyles(styles)(CarouselQuizComp));
export { CarouselQuiz, CarouselQuizComp };
