import React from 'react';
import { Button } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';

import { AnsonMsg, AnsonResp, PageInf } from '@anclient/semantier';

import {
	L, ComboCondType, Comprops, CrudComp,
	AnQueryst, jsample, AnSpreadsheet, AnContext,
	QueryPage, toPageInf, Spreadsheetier, CellEditingStoppedEvent, anMultiRowRenderer,
} from '@anclient/anreact';
const { JsampleIcons } = jsample;

import { Curriculum, CourseReq } from './tier';
import { addAgStyle, StarTheme } from '../../../common/star-theme';

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
				{ type: 'text', label: L('Course'), field: 'currName', grid: {sm: 3, md: 3}},
				{ type: 'cbb', sk: 'curr-modu', uri: this.uri,
				  label: L('Module'), field: 'module', grid: {sm: 3, md: 3}} as ComboCondType,
				{ type: 'cbb', sk: 'curr-cate', uri: this.uri,
				  label: L('Category'), field: 'cate', grid: {sm: 3, md: 3}} as ComboCondType,
				{ type: 'cbb', sk: 'curr-level', uri: this.uri,
				  label: L('Level'), field: 'clevel', grid: {sm: 3, md: 3}} as ComboCondType,
			] } as QueryPage;

	rowClassRules = {
		'c-l1': (params) => this.lvlColor(params, 'c-l1'),
		'c-l2': (params) => this.lvlColor(params, 'c-l2'),
		'c-l3': (params) => this.lvlColor(params, 'c-l3'),
	};

	lvlColor(p, className) {
        let lvl = p.data.clevel;
		lvl = this.tier ? this.tier.encode('clevel', lvl, p.data) : lvl; 
		return lvl === className || '[' + className + ']' === lvl;
	}

	constructor(props: Comprops & {conn_state: string}) {
		super(props);

		addAgStyle();

		this.uri = props.uri;
		this.lvlColor = this.lvlColor.bind(this);
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
				{ field: 'cId', label: L("Id"), width: 120, editable: false, hide: true },
				{ field: 'module', label: L('Module'), width: 120, type: 'cbb', sk: 'curr-modu' },
				{ field: 'currName', label: L("curriculum"), width: 160 },
				{ field: 'clevel', label: L("Level"), width: 140, type: 'cbb', sk: 'curr-level',
				  onEditStop: this.onEdited },
				{ field: 'cate', label: L("Category"), width: 120, type: 'cbb', sk: 'curr-cate' },
				{ field: 'remarks', label: L("Remarks"), width: 960, type: 'text',
				  wrapText: true, autoHeight: true,
				  minHeight: '1.1em',
				  cellEditor: 'agLargeTextCellEditor',
				  cellEditorParams: {cols: 80, rows: 12, maxLength: 4096 },
				  cellRenderer: anMultiRowRenderer,
				 },
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
					aggrid={{rowClassRules: this.rowClassRules}}
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
