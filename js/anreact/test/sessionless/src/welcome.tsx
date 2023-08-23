import React from 'react';
import { Box, Card, IconButton, Link, Paper, Theme, Typography, withStyles, withWidth } from '@material-ui/core';

import { OnLoadOk, PageInf, Semantier, Tierec } from '@anclient/semantier';
import { ClassNames, Comprops, CrudComp, jsample } from '../../../src/an-components';

const styles = (theme: Theme) => ( {
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
		textAlign: "center" as const,
		margin: theme.spacing(1)
	},
	cartText: {
		width: "86%",
		margin: theme.spacing(1)
	},
	svgicn: {
		verticalAlign: "middle",
	}
});

class WelcomeComp extends CrudComp<Comprops>{
	tier: WelcomeTier;
	classes: ClassNames;
	uri: string;
	props: any;

	constructor(props: Comprops) {
		super(props);

		this.classes = props.classes;
		this.uri = props.uri;
		this.cards = this.cards.bind(this);
		this.icon = this.icon.bind(this);
	}

	componentDidMount() {
		let uri = this.uri;
		console.log("super.uri", uri);

		this.tier = new WelcomeTier({uri});
		this.setState({});
	}

	icon(e: WelcomeRec) {
		let color = e.css?.important ? 'secondary' : 'primary';

		return e.css?.type === 'auto'
			? <jsample.JsampleIcons.Search color={color} style={{veritalAlign: "middle"}}/>
			: <jsample.JsampleIcons.Star color={color} className={this.classes.svgicn}/>
			;
	}

	paper(e: WelcomeRec) {
		return (
			<Paper elevation={4} style={{ margin: 24 }}
				className={this.classes.welcome}>
				<IconButton onClick={this.props.showMenu} >
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
					<span>From:<br/></span>
					{this.icon(e)}
					<Link style={{ marginLeft: 4 }} target='_blank' href={this.props.hrefDoc || "https://odys-z.github.io/Anclient"} >
						{`${e.publisher || 'Anbox Robot'}`}</Link>
				</Box>
			</Paper>
		</Card>);
	}

	render() {
		return (<div>Welcome Example - I bet you will love this!
			{this.tier && this.cards(this.tier.myNotifies())}
		</div>);
	}
}

export default withStyles<any, any, Comprops>(styles)(withWidth()(WelcomeComp));

interface WelcomeRec extends Tierec {
	eid: string,
	ename: string, // card title
	publisher?: string | undefined,
	edate: string,
	css: any,
	extra: string
};

class WelcomeTier extends Semantier {
	/**
	 * @param props
	 */
	constructor(props: {uri: string}) {
		super(props);
		console.log(this.uri);
	}

	/**
	 * 
	 * @param conds 
	 * @param onLoad 
	 * @returns 
	 */
	override records<T extends Tierec>(conds: PageInf, onLoad: OnLoadOk<T>) {
		this.rows = [{eid: '01', ename: 'Abc@D', edate: '2021-10-10', extra: '100'}];
		onLoad([], this.rows as unknown as Array<T>);
		return this.rows;
	}

	myNotifies() {
		this.rows = [
			{eid: '01', ename: 'Action Required', css: {important: true}, edate: '2021-10-10', extra: '100'},
			{eid: '02', ename: 'Abc@E', publisher: '👉 Try the style', css: {type: 'auto'}, edate: '2021-10-10', extra: '100'}];
		return this.rows as Array<WelcomeRec>;
	}
}
