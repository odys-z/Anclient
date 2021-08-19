import React from "react";
import ReactDOM from "react-dom";
import Carousel from "react-elastic-carousel";

import { AnContext, CrudCompW } from "anclient";
import { QuizCard } from "./quiz-card";

class CarouselQuizComp extends CrudCompW {
  render() {
    return (
      <div>
        <Carousel ref={ref => (this.carousel = ref)}>
            <QuizCard goNext={() => this.carousel.slideNext()}
                question={'Who am I?'}
            />
            <QuizCard goNext={() => this.carousel.slideNext()}
                question={'Who are you?'}
            />
            <QuizCard goNext={() => this.carousel.slideNext()}
                question={'Who is next?'}
            />
            <QuizCard goNext={() => this.carousel.slideNext()}
                question={'Who is next?'}
				onFinish={this.props.toClose}
            />
        </Carousel>
      </div>
  	);
  }
}
CarouselQuizComp.context = AnContext;

CarouselQuizComp.propTypes = {
	uri: PropTypes.string.isRequired,
	goNext: PropTypes.func.isRequired,
	goPrev: PropTypes.func.isRequired,
	toClose: PropTypes.func.isRequired
};

const CarouselQuiz = withWidth()(withStyles(styles)(CarouselQuizComp));
export { CarouselQuiz, CarouselQuizComp };
