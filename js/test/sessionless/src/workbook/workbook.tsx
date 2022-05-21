import React from 'react';
import { Theme, withStyles, withWidth } from '@material-ui/core';

import { Protocol, QueryPage } from '../../../../semantier/anclient';

import {
	L, ComboCondType, ClassNames, Comprops, CrudComp,
	AnQueryst, jsample, AnSpreadsheet, SpreadsheetRec,
} from '../../../../anreact/src/an-components';
import { MyWorkbookTier } from './workbook-tier';

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

class WorkbookComp extends CrudComp<Comprops & {conn_state: string}>{
	tier: MyWorkbookTier;
	classes: ClassNames;
	// uri: string;
	conds = { pageInf: {page: 0, size: 20},
			  query: [
				{ type: 'cbb', sk: 'curr-cate', uri: this.uri,
				  label: L('Category'), field: '--'} as ComboCondType,
				{ type: 'cbb', sk: 'curr-subj', uri: this.uri,
				  label: L('Subject'), field: '--'} as ComboCondType,
			] } as QueryPage;

	constructor(props: Comprops & {conn_state: string}) {
		super(props);

		this.classes = props.classes;
		this.uri = props.uri;
		this.icon = this.icon.bind(this);
		this.queryConds = this.queryConds.bind(this);
	}

	componentDidMount() {
		let uri = this.uri;
		console.log(uri);

		this.tier = this.props.tier as MyWorkbookTier;

		this.setState({});
	}

	icon(e: SpreadsheetRec) {
		let color = e.css.color === 'secondary' ? 'secondary' : 'primary';

		return e.css?.alignContent === 'middle' || e.css?.alignSelf === 'middle'
			? <jsample.JsampleIcons.Search color={color} style={{veritalAlign: "middle"}}/>
			: <jsample.JsampleIcons.Star color={color} className={this.classes.svgicn}/>
			;
	}

	// paper(e: SpreadsheetRec) {
	// 	return (
	// 		<Paper elevation={4} style={{ margin: 24 }}
	// 			className={this.classes.welcome}>
	// 			<IconButton onClick={this.props.showMenu} >
	// 				{this.icon(e)}
	// 				<Box component='span' display='inline' className={this.classes.cardText} >
	// 					Please click menu to start.
	// 				</Box>
	// 			</IconButton>
	// 		</Paper>);
	// }

	render() {
		let that = this;
		return (<div>
			{<AnQueryst
				stopBinding={this.props.conn_state !== Protocol.MsgCode.ok}
				uri={this.uri}
				fields={this.conds.query}
				onSearch={() => that.tier.records(that.queryConds(), () => {that.setState({})}) }
				onReady={() => that.tier.records(that.queryConds(), () => {that.setState({})}) }
			/>}
			{this.tier &&
			  <div className='ag-theme-alpine' style={{height: '78vh', width: '100%', margin:'auto'}}>
				<AnSpreadsheet columns={this.tier.columns()} rows={this.tier.rows} />
			  </div>}
		</div>);
	}

	queryConds(): QueryPage {
		return this.conds;
	}
}

export default withStyles<any, any, Comprops>(styles)(withWidth()(WorkbookComp));
