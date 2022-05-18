import React from 'react';
import { Box, IconButton, Paper, Theme, withStyles, withWidth } from '@material-ui/core';

import { OnLoadOk, QueryPage, Semantier, Tierec } from '../../../semantier/anclient';
import { ClassNames, Comprops, CrudComp, AnQueryst, jsample, AnSpreadsheet, SheetCol } from '../../../anreact/src/an-components';
import { CSSProperties } from '@material-ui/core/styles/withStyles';

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

class WorkbookComp extends CrudComp<Comprops>{
	tier: WorkbookTier;
	classes: ClassNames;
	uri: string;
	conds = {pageInf: {page: 0, size: 20}} as QueryPage;

	constructor(props: Comprops) {
		super(props);

		this.classes = props.classes;
		this.uri = props.uri;
		this.icon = this.icon.bind(this);
		this.queryConds = this.queryConds.bind(this);
	}

	componentDidMount() {
		let uri = this.uri;
		console.log(uri);

		this.tier = new WorkbookTier(this);
		this.setState({});
	}

	icon(e: WorkbookRec) {
		let color = e.css?.important ? 'secondary' : 'primary';

		return e.css?.type === 'auto'
			? <jsample.JsampleIcons.Search color={color} style={{veritalAlign: "middle"}}/>
			: <jsample.JsampleIcons.Star color={color} className={this.classes.svgicn}/>
			;
	}

	paper(e: WorkbookRec) {
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

	render() {
		let that = this;
		return (<div>
			{<AnQueryst {...this.props}
				conds={this.conds}
				onSearch={() => that.props.onQuery(that.queryConds()) }
				onLoaded={() => that.props.onQuery(that.queryConds()) }
			/>}
			{this.tier && <AnSpreadsheet columns={this.tier.columns()} rows={this.tier.rows} />}
		</div>);
	}

	queryConds(): QueryPage {
		return this.conds;
	}
}

export default withStyles<any, any, Comprops>(styles)(withWidth()(WorkbookComp));

interface WorkbookRec extends Tierec {
	id: string,
	css: CSSProperties,
};

class WorkbookTier extends Semantier {
	/**
	 * @param props
	 */
	constructor(props: {uri: string}) {
		super(props);
		console.log(this.uri);
	}

	/**
	 * @override(Semantier)
	 */
	records<T extends Tierec>(conds: QueryPage, onLoad: OnLoadOk<T>) {
		this.rows = [{eid: '01', ename: 'Abc@D', edate: '2021-10-10', extra: '100'}];
		onLoad([], this.rows as Array<T>);
		return this.rows;
	}

	columns (): Array<SheetCol> {
		return [];
	}
}

export { WorkbookTier, WorkbookRec, WorkbookComp };