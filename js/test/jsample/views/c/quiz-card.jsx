
import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import withWidth from "@material-ui/core/withWidth";
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';

const styles = (theme) => ({
  root: {
  }
});

class QuizFormComp extends React.Component {
	state = {
		closed: false,
	}

	constructor(props) {
		super(props);

		this.goNext = this.goNext.bind();
	}

	goNext() {
	}

	render () {
		return (
			<Typography>
				{this.props.question}
				<Button onClick={this.props.goNext}>next</Button>
			<Typography>
		);
	}
}
QuizCardComp.context = AnContext;

QuizCardComp.propTypes = {
	uri: PropTypes.string.isRequired,
	goNext: PropTypes.func.isRequired,
	goPrev: PropTypes.func.isRequired
};

const QuizCard = withWidth()(withStyles(styles)(QuizCardComp));
export { QuizCard, QuizCardComp }
