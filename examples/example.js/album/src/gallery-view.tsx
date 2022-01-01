import React from 'react';
import { Box, Card, IconButton, Link, Paper, Theme, Typography, withStyles, withWidth } from '@material-ui/core';

import { Comprops, CrudComp, jsample } from '@anclient/anreact';
import { GalleryTier, PhotoCollect, PhotoRec } from './gallerytier-less';

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

export default class GalleryView extends CrudComp<Comprops>{
	tier: GalleryTier | undefined;
	classes: any;
	uri: any;

	constructor(props: Comprops) {
		super(props);

		this.classes = props.classes;
		this.uri = props.uri;
		// this.cards = this.cards.bind(this);
		this.icon = this.icon.bind(this);
	}

	componentDidMount() {
		let uri = this.uri;
		console.log("super.uri", uri);

		this.tier = new GalleryTier({uri});
		this.setState({});
	}

	icon(e: PhotoRec) {
		// return jsample.JsampleIcons[e.css?.icon || 'Star'] || jsample.JsampleIcons['Star']
		let color = e.css?.important ? 'secondary' : 'primary';

		return e.css?.type === 'auto'
			? <jsample.JsampleIcons.Search color={color} style={{veritalAlign: "middle"}}/>
			: <jsample.JsampleIcons.Star color={color} className={this.classes.svgicn}/>
			;
	}

	paper(e: PhotoRec) {
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

	// cards(events: Array<PhotoRec>) {
	// 	return events?.map( (e) =>
	// 	<Card key={e.eid} className={this.classes.card}>
	// 		<Typography gutterBottom variant='h4' className={this.classes.cardTitle}>
	// 			{e.ename}
	// 		</Typography>
	// 		<Paper elevation={4} className={this.classes.cardText}>
	// 			<Box component='span' className={this.classes.cardText} >
	// 				<span>From:<br/></span>
	// 				{this.icon(e)}
	// 				<Link style={{ marginLeft: 4 }} target='_blank' href={this.props.hrefDoc || "https://odys-z.github.io/Anclient"} >
	// 					{`${e.publisher || 'Anbox Robot'}`}</Link>
	// 			</Box>
	// 		</Paper>
	// 	</Card>);
	// }

	gallery(collections: Array<PhotoCollect>) {

	}

	render() {
		return (<div>Welcome Example - I bet you will love this!
			{this.tier && this.gallery(this.tier.myAlbum())}
		</div>);
	}
}
