
import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import withWidth from "@material-ui/core/withWidth";
import Typography from "@material-ui/core/Typography";
import Card from "@material-ui/core/Card";
import Paper from "@material-ui/core/Paper";
import PropTypes from "prop-types";

import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import {L, Langstrs, Protocol, UserReq,
    AnClient, SessionClient,
    AnContext, AnError, AnReactExt
} from 'anclient';


const styles = (theme) => ({
  root: {
    height: 500,
  }
});

class CarouselCardComp extends React.Component {
	state = {
		closed: false,
	}

	constructor(props) {
		super(props);

		this.goNext = this.goNext.bind();
	}

	render () {
		let { classes } = this.props;
		return (
			<Card>
			<Paper>
				<Typography variant='h2' className={classes.root}>
					{this.props.question}
				</Typography>
			</Paper>
			<Button onClick={this.props.goNext}>next</Button>
			{ this.props.toFinish &&
			  <Button onClick={this.props.toFinish}>{L('Submit')}</Button> }
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
