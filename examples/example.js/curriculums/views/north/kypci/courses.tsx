import React from 'react';
import { Button } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';

import { AnsonMsg, AnsonResp, PageInf } from '@anclient/semantier';

import {
	L, ComboCondType, Comprops, CrudComp,
	AnQueryst, jsample, AnSpreadsheet, SpreadsheetRec, AnContext,
	QueryPage, toPageInf, Spreadsheetier, CellEditingStoppedEvent,
} from '@anclient/anreact';
const { JsampleIcons } = jsample;

import { Curriculum, CourseReq } from './tier';
import { StarTheme } from '../../../common/star-theme';

const styles = (_theme: StarTheme) => ({
	root: {
		// height: "calc(100vh - 92ch)"
		height: "72vh"
	},
	actionButton: {
	},
	usersButton: {
		// marginLeft: 20,
		// marginRight: 20,
		margin: 6,
		width: 120,
	}
});

class CourseComp extends CrudComp<Comprops & {conn_state: string}>{
	tier: Spreadsheetier;

	confirm: JSX.Element;

	conds = { pageInf: new PageInf(0, 20),
			  query: [
				{ type: 'cbb', sk: 'curr-cate', uri: this.uri,
				  label: L('Category'), field: 'cate', grid: {sm: 2, md: 2}} as ComboCondType,
				{ type: 'cbb', sk: 'curr-subj', uri: this.uri,
				  label: L('Subject'), field: 'subj', grid: {sm: 2, md: 2}} as ComboCondType,
			] } as QueryPage;

	constructor(props: Comprops & {conn_state: string}) {
		super(props);

		this.uri = props.uri;
		this.icon = this.icon.bind(this);
		this.queryConds = this.queryConds.bind(this);

		this.toAdd = this.toAdd.bind(this);
		this.toDel = this.toDel.bind(this);
		this.bindSheet = this.bindSheet.bind(this);
		this.onEdited = this.onEdited.bind(this);

		/** Let's move this to Spreadsheetier's constructor parameter */
		Spreadsheetier.registerReq((conds: PageInf, rec: Curriculum) => { return new CourseReq(conds, rec) });

		this.tier = new Spreadsheetier('curriculum',
			{ uri: this.uri,
			  pkval: {pk: 'cId', v: undefined, tabl: 'b_curriculums'},
			  cols: [
				{ field: 'cId', label: L("Id"), width: 120, editable: false },
				{ field: 'currName', label: L("curriculum"), width: 160 },
				{ field: 'clevel', label: L("Level"), width: 140, type: 'cbb', sk: 'curr-level',
				  onEditStop: this.onEdited },
				{ field: 'module', label: L('Module'), width: 120, type: 'cbb', sk: 'curr-modu' },
				{ field: 'cate', label: L("Category"), width: 120, type: 'cbb', sk: 'curr-cate' },
				{ field: 'remarks', label: L("Remarks"), width: 360, type: 'text' },
			] });
	}

	componentDidMount() {
		let uri = this.uri;
		console.log(uri);

		this.tier.setContext(this.context);

		this.setState({});
	}

	onEdited(p: CellEditingStoppedEvent): void {
		// TODO set background color
		this.tier.updateCell(p);
	}

	icon(e: SpreadsheetRec) {
		let {classes} = this.props;

		let color = e.css.color === 'secondary' ? 'secondary' : 'primary';

		return e.css?.alignContent === 'middle' || e.css?.alignSelf === 'middle'
			? <JsampleIcons.Search color={color} style={{veritalAlign: "middle"}}/>
			: <JsampleIcons.Star color={color} className={classes.svgicn}/>
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
		let that = this;
		// if (this.currentId)
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
			  <div className='ag-theme-alpine' style={{height: '68vh', width: '100%', margin:'auto'}}>
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
CourseComp.contextType = AnContext;

const Course = withStyles(styles)(CourseComp);
export { Course, CourseComp };
