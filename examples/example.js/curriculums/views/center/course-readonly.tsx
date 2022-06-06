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

import { Curriculum, CourseReq } from '../north/kypci/tier'
import { StarTheme } from '../../common/star-theme';

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

class CourseReadonlyComp extends CrudComp<Comprops & {conn_state: string}>{
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

	constructor(props: Comprops & {conn_state: string}) {
		super(props);

		this.uri = props.uri;
		// this.icon = this.icon.bind(this);
		this.queryConds = this.queryConds.bind(this);

		// this.toAdd = this.toAdd.bind(this);
		// this.toDel = this.toDel.bind(this);
		this.bindSheet = this.bindSheet.bind(this);

		/** Let's move this to Spreadsheetier's constructor parameter */
		Spreadsheetier.registerReq((conds: PageInf, rec: Curriculum) => { return new CourseReq(conds, rec) });

		this.tier = new Spreadsheetier('curriculum',
			{ uri: this.uri,
			  pkval: {pk: 'cId', v: undefined, tabl: 'b_curriculums'},
			  cols: [
				{ field: 'cId', label: L("Id"), width: 120, editable: false, hide: true },
				{ field: 'module', label: L('Module'), width: 100, type: 'cbb', sk: 'curr-modu', editable: false },
				{ field: 'currName', label: L("curriculum"), width: 160, editable: false },
				{ field: 'clevel', label: L("Level"), width: 100, type: 'cbb', sk: 'curr-level', editable: false },
				{ field: 'cate', label: L("Category"), width: 160, type: 'cbb', sk: 'curr-cate', editable: false },
				{ field: 'remarks', label: L("Remarks"), width: 1500, type: 'text',
				  wrapText: true, autoHeight: true, editable: false,
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

	// onEdited(p: CellEditingStoppedEvent): void {
	// 	// TODO set background color
	// 	this.tier.updateCell(p);
	// }

	bindSheet(_resp: AnsonMsg<AnsonResp>) {
		let that = this;
		this.tier.records(toPageInf(this.conds),
			(_cols, rows) => {
				that.tier.rows = rows;
				that.setState({})
			});
	}

	// toAdd(_e: React.UIEvent) {
	// 	this.tier.insert(this.bindSheet);
	// }

	// toDel(e: React.UIEvent) {
	// 	let that = this;
	// 	this.tier.del({ids: [this.tier.pkval.v]}, this.bindSheet);
	// }

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
			{/* <div style={{textAlign: 'center', background: '#f8f8f8'}}>
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
			</div> */}
			{/* {this.confirm} */}
		</div>);
	}

	queryConds(): PageInf {
		return toPageInf(this.conds);
	}
}
CourseReadonlyComp.contextType = AnContext;

const CourseReadonly = withStyles(styles)(CourseReadonlyComp);
export { CourseReadonly, CourseReadonlyComp };
