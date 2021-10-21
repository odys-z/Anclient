import React from 'react';
import { ReactNode } from 'react';
import { withStyles } from '@material-ui/styles';
import { Box, Card, IconButton, Link, Paper, Typography, withWidth } from '@material-ui/core';

import { Semantier } from '@anclient/semantier';
import { CrudComp, jsample } from '@anclient/anreact';

const styles = (theme) => ( {
	root: {
	},
	button: {
		marginLeft: theme.spacing(1)
	},
	card: {
		width: "28vw",
		margin: theme.spacing(1)
	},
	cardTitle: {
		color: "blue",
		textShadow: "4px 4px 3px #688a8a",
		textAlign: "center",
		margin: theme.spacing(1)
	},
	cartText: {
		width: "86%",
		margin: theme.spacing(1)
	}
});

class WelcomeComp extends CrudComp {
	tier: WelcomeTier;
	classes: any;

	constructor(props: {classes: any, uri: string}) {
		super(props);

		this.classes = props.classes;
		this.uri = props.uri;
		this.cards = this.cards.bind(this);
		this.icon = this.icon.bind(this);
	}

	componentDidMount() {
		// FIXME ignore vscode warning?
		let uri = this.uri || super.uri;
		console.log("super.uri", uri);

		this.tier = new WelcomeTier({uri});
		this.setState({});
	}

	icon(e: WelcomeRec) {
		// return jsample.JsampleIcons[e.css?.icon || 'Star'] || jsample.JsampleIcons['Star']
		let color = e.css?.important ? 'secondary' : 'primary'; 

		return e.css?.type === 'auto'
			? <jsample.JsampleIcons.Search color={color} />
			: <jsample.JsampleIcons.Star color={color} />
			;
	}

	paper(e: WelcomeRec) {
		return (
			<Paper elevation={4} style={{ margin: 24 }}
				className={this.classes.welcome}>
				<IconButton onClick={this.showMenu} >
					{this.icon(e)}
					<Box component='span' display='inline' className={this.classes.cardText} >
						Please click menu to start.
					</Box>
				</IconButton>
			</Paper>);
	}

	cards(events: Array<WelcomeRec>) {
		return events?.map( (e) =>
		<Card key={e.eid} className={this.classes.card}>
			<Typography gutterBottom variant='h4' className={this.classes.cardTitle}>
				{e.ename}
			</Typography>
			<Paper elevation={4} className={this.classes.cardText}>
				<Box component='span' className={this.classes.cardText} >
					<span>By:<br/></span>
					{this.icon(e)}
					<Link style={{ marginLeft: 4 }} target='_blank' href={this.props.hrefDoc || "https://odys-z.github.io/Anclient"} >
						{`${e.publisher || 'Anbox Robot'}`}</Link>
				</Box>
			</Paper>
		</Card>);
	}

	render() : ReactNode {
		return (<div>Welcome Example - I bet you will love this!
			{this.tier && this.cards(this.tier.myNotifies())}
		</div>);
	}
}

// at least compiled results is working, wait for #8447 (https://github.com/mui-org/material-ui/issues/8447#issuecomment-519952099)
export default withWidth()(withStyles(styles)(WelcomeComp));

type WelcomeRec = {
	eid: string,
	ename: string, // card title
	publisher?: string | undefined,
	edate: string,
	css: any,
	extra: string
};

class WelcomeTier extends Semantier {
	rows: WelcomeRec[];
	/**
	 * 
	 * @param props 
	 */
	constructor(props: {uri: string}) {
		super(props);
		console.log(super.uri);
	}

	/**
	 * @override(Semantier)
	 */
	records<WelcomeRec>(): Array<WelcomeRec> {
		super.rows = [{eid: '01', ename: 'Abc@D', edate: '2021-10-10', extra: '100'}];
		return super.rows;
	}

	myNotifies<WelcomeRec>() {

		this.rows = [
			{eid: '01', ename: 'Action Required', css: {important: true}, edate: '2021-10-10', extra: '100'},
			{eid: '02', ename: 'Abc@E', publisher: 'Becky', css: {type: 'auto'}, edate: '2021-10-10', extra: '100'}];
		return this.rows;
	}
}
