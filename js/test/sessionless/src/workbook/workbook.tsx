import React from 'react';
import { Button } from '@material-ui/core';
import { Theme, withStyles } from '@material-ui/core/styles';

import { AnsonMsg, AnsonResp, PageInf } from '../../../../semantier/anclient';

import {
	L, ComboCondType, Comprops, CrudComp,
	AnQueryst, jsample, AnSpreadsheet, SpreadsheetRec, AnContext, QueryPage, toPageInf, AnContextType, Spreadsheetier,
} from '../../../../anreact/src/an-components';
// import { MyWorkbookTier } from './workbook-tier';
import { JsampleIcons } from '../../../../anreact/src/jsample/styles';

const styles = (_theme: Theme) => ({
	root: {
		height: "calc(100vh - 18ch)"
	},
	actionButton: {
	},
	usersButton: {
		marginLeft: 20,
		marginRight: 20,
		marginTop: 6,
		width: 150,
	}
});

class WorkbookComp extends CrudComp<Comprops & {conn_state: string, tier: Spreadsheetier}>{
	// tier: MyWorkbookTier;
	tier: Spreadsheetier;

	confirm: JSX.Element;

	conds = { pageInf: new PageInf(0, 20),
			  query: [
				{ type: 'cbb', sk: 'curr-cate', uri: this.uri,
				  label: L('Category'), field: 'cate', grid: {sm: 2, md: 2}} as ComboCondType,
				{ type: 'cbb', sk: 'curr-subj', uri: this.uri,
				  label: L('Subject'), field: 'subj', grid: {sm: 2, md: 2}} as ComboCondType,
			] } as QueryPage;

	constructor(props: Comprops & {conn_state: string, tier: Spreadsheetier}) {
		super(props);

		this.uri = props.uri;
		this.icon = this.icon.bind(this);
		this.queryConds = this.queryConds.bind(this);

		this.toAdd = this.toAdd.bind(this);
		this.toDel = this.toDel.bind(this);
		this.bindSheet = this.bindSheet.bind(this);
	}

	componentDidMount() {
		let uri = this.uri;
		console.log(uri);

		this.tier = this.props.tier;
		this.tier.setContext(this.context as AnContextType);

		this.setState({});
	}

	icon(e: SpreadsheetRec) {
		let {classes} = this.props;

		let color = e.css.color === 'secondary' ? 'secondary' : 'primary';

		return e.css?.alignContent === 'middle' || e.css?.alignSelf === 'middle'
			? <jsample.JsampleIcons.Search color={color} style={{veritalAlign: "middle"}}/>
			: <jsample.JsampleIcons.Star color={color} className={classes.svgicn}/>
			;
	}

	bindSheet(_resp: AnsonMsg<AnsonResp>) {
		let that = this;
		this.tier.records(toPageInf(this.conds),
			(_cols, rows) => {
				that.tier.rows = rows;
				that.setState({})
			});
	}

	toAdd(_e: React.UIEvent) {
		this.tier.insert(this.bindSheet);
	}

	toDel(e: React.UIEvent) {
		// let that = this;
		// // if (this.currentId)
		// this.tier.del({ids: [this.tier.currentRecId]}, this.bindSheet);
		
		this.tier.del({ids: [this.tier.pkval.v]}, this.bindSheet);
	}

	render() {
		let that = this;
		let {classes} = this.props;

		return (<div>
			{<AnQueryst
				uri={this.uri}
				fields={this.conds.query}
				onSearch={() => that.tier.records(that.queryConds(), () => {that.setState({})}) }
				onReady={() => that.tier.records(that.queryConds(), () => {that.setState({})}) }
			/>}
			{this.tier &&
			  <div className='ag-theme-alpine' style={{height: '78vh', width: '100%', margin:'auto'}}>
				<AnSpreadsheet
					tier={this.tier}
					autosave={true}
					onCellClicked={this.tier.onCellClick}
					columns={this.tier.columns()}
					rows={this.tier.rows} />
			  </div>}
			<div style={{textAlign: 'center', background: '#f8f8f8'}}>
				<Button variant="outlined"
					className={classes.usersButton}
					color='primary'
					onClick={this.toAdd}
					endIcon={<JsampleIcons.Add />}
				>{L('Append')}
				</Button>
				<Button variant="outlined"
					className={classes.usersButton}
					color='secondary'
					onClick={this.toDel}
					endIcon={<JsampleIcons.Delete />}
				>{L('Delete')}
				</Button>
			</div>
			{this.confirm}
		</div>);
	}

	queryConds(): PageInf {
		return toPageInf(this.conds);
	}
}
WorkbookComp.contextType = AnContext;

const Workbook = withStyles(styles)(WorkbookComp);
export { Workbook, WorkbookComp };
