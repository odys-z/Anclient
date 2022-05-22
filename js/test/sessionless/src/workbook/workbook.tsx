import React from 'react';
import { Button, Theme, withStyles, withWidth } from '@material-ui/core';

import { AnsonMsg, AnsonResp, QueryPage } from '../../../../semantier/anclient';

import {
	L, ComboCondType, ClassNames, Comprops, CrudComp,
	AnQueryst, jsample, AnSpreadsheet, SpreadsheetRec,
} from '../../../../anreact/src/an-components';
import { MyWorkbookTier } from './workbook-tier';
import { JsampleIcons } from '../../../../anreact/src/jsample/styles';

const styles = (theme: Theme) => ( {
	root: {
	},
	button: {
		marginLeft: theme.spacing(1),
		marginRight: theme.spacing(1),
		marginTop: 6,
		width: 150,
	},
	// card: {
	// 	width: "28vw",
	// 	margin: theme.spacing(1)
	// },
	// cbbCate: {
	// 	color: "blue",
	// 	width: 80,
	// 	margin: theme.spacing(1)
	// },
	// cbbSubj: {
	// 	width: 60,
	// 	margin: theme.spacing(1)
	// },
	// svgicn: {
	// 	verticalAlign: "middle",
	// }
});

class WorkbookComp extends CrudComp<Comprops & {conn_state: string}>{
	tier: MyWorkbookTier;
	classes: ClassNames;

	confirm: JSX.Element;

	// uri: string;
	conds = { pageInf: {page: 0, size: 20},
			  query: [
				{ type: 'cbb', sk: 'curr-cate', uri: this.uri,
				  label: L('Category'), field: 'cate', grid: {sm: 2, md: 2}} as ComboCondType,
				{ type: 'cbb', sk: 'curr-subj', uri: this.uri,
				  label: L('Subject'), field: 'subj', grid: {sm: 2, md: 2}} as ComboCondType,
			] } as QueryPage;

	currentId: string;

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

	bindSheet(_resp: AnsonMsg<AnsonResp>) {
		let that = this;
		this.tier.records(this.conds,
			(_cols, rows) => {
				that.tier.rows = rows;
				that.setState({})
			});
	}

	toAdd(_e: React.UIEvent) {
		this.tier.insert(this.bindSheet);
	}

	toDel(e: React.UIEvent) {
		let that = this;
		if (this.currentId)
			this.tier.del({ids: [this.currentId]}, this.bindSheet);
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
		let {classes} = this.props;

		return (<div>
			{<AnQueryst
				// stopBinding={this.props.conn_state !== Protocol.MsgCode.ok}
				uri={this.uri}
				fields={this.conds.query}
				onSearch={() => that.tier.records(that.queryConds(), () => {that.setState({})}) }
				onReady={() => that.tier.records(that.queryConds(), () => {that.setState({})}) }
			/>}
			{this.tier &&
			  <div className='ag-theme-alpine' style={{height: '78vh', width: '100%', margin:'auto'}}>
				<AnSpreadsheet tier={this.tier} columns={this.tier.columns()} rows={this.tier.rows} />
			  </div>}
			<div style={{textAlign: 'center', background: '#f8f8f8'}}>
				<Button variant="outlined"
					className={classes.button}
					color='primary'
					onClick={this.toAdd}
					endIcon={<JsampleIcons.Add />}
				>{L('Append')}
				</Button>
				<Button variant="outlined"
					className={classes.button}
					color='secondary'
					onClick={this.toDel}
					endIcon={<JsampleIcons.Delete />}
				>{L('Delete')}
				</Button>
			</div>
			{this.confirm}
		</div>);
	}

	queryConds(): QueryPage {
		return this.conds;
	}
}

export default withStyles<any, any, Comprops>(styles)(withWidth()(WorkbookComp));
