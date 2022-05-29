import React from 'react';
import { Button } from '@material-ui/core';
import { Theme, withStyles } from '@material-ui/core/styles';

import { CRUD, AnsonMsg, AnsonResp, PageInf } from '@anclient/semantier';

import {
	L, ComboCondType, Comprops, CrudComp,
	AnQueryst, jsample, AnSpreadsheet, SpreadsheetRec, AnContext, QueryPage, toPageInf, Spreadsheetier, SpreadsheetReq, ConfirmDialog,
} from '@anclient/anreact';
const { JsampleIcons } = jsample;

const styles = (_theme: Theme) => ({
	root: {
		// height: "calc(100vh - 92ch)"
		height: "72vh"
	},
	actionButton: {
	},
	usersButton: {
		// marginLeft: 20,
		// marginRight: 20,
		// marginTop: 6,
		margin: 6,
		width: 150,
	}
});

interface Decision extends SpreadsheetRec {

}

class MyReq<T extends SpreadsheetRec> extends SpreadsheetReq {
	rec: T;

	constructor(query: PageInf, rec: T) {
		super({type: 'io.oz.curr.decision.MyReq', tabl: 'b_mydecissions', query});
		this.rec = rec;
	}
}

class MyComp extends CrudComp<Comprops & {conn_state: string, tier: Spreadsheetier}>{
	tier: Spreadsheetier;

	confirm: JSX.Element;

	conds = { pageInf: new PageInf(0, 20),
			  query: [
				{ type: 'cbb', sk: 'kypc/modul', uri: this.uri, sqlArgs: [this.getUserId()],
				  label: L('AP Events'), field: 'eId', grid: {sm: 8, md: 8}} as ComboCondType,
			] } as QueryPage;
	
	getUserId() {
		return this.props.ssInf.uid;
	}

	constructor(props: Comprops & {conn_state: string, tier: Spreadsheetier}) {
		super(props);

		this.uri = props.uri;
		this.icon = this.icon.bind(this);
		this.queryConds = this.queryConds.bind(this);

		this.toSave = this.toSave.bind(this);
		this.toDel = this.toDel.bind(this);
		this.bindSheet = this.bindSheet.bind(this);

		Spreadsheetier.registerReq((conds: PageInf, rec: Decision) => { return new MyReq(conds, rec);});

		this.tier = new Spreadsheetier('mydecisions',
			{ uri: this.uri,
			  pkval: {pk: 'module', v: undefined, tabl: 'b_mycourses'},
			  cols: [
				{ field: 'myId', label: L("decision Id"), width: 10, visible: false },
				{ field: 'module', label: L('Module'), width: 120, type: 'cbb', sk: 'curr-modu', editable: false },
				{ field: 'cId', label: L("curriculum"), width: 160, type: 'cbb', sk: 'kypc/modul' },
				{ field: 'clevel', label: L("Level"), width: 140, editable: false },
				{ field: 'cate', label: L("Category"), width: 120, editable: false },
				{ field: 'subject', label: L("Subject"), width: 160, editable: false },
			] });
	}

	componentDidMount() {
		let uri = this.uri;
		console.log(uri);

		this.tier.setContext(this.context);

		this.setState({});
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

	toSave(_e: React.UIEvent) {
		let that = this;
		this.tier.update(
			this.tier.pkval.v ? CRUD.u : CRUD.c,
			this.tier.rec, 
			(resp: AnsonMsg<AnsonResp>) => {
				that.tier.pkval.v = resp.Body().data['rec']['myId'];

				let msg = resp.Body().msg;
				this.confirm = (
					<ConfirmDialog title={L('Info')}
						ok={L('OK')} cancel={false} open
						onClose={() => {that.confirm = undefined;} }
						msg={msg} />);
				this.setState({});
			}, this.context.error);
	}

	toDel(e: React.UIEvent) {
		console.error("shouldn't here");
		// this.tier.del({ids: [this.tier.pkval.v]}, this.bindSheet);
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
			  <div className='ag-theme-alpine' style={{height: '60vh', width: '100%', margin:'auto'}}>
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
					onClick={this.toSave}
					endIcon={<JsampleIcons.Add />}
				>{L('Save')}
				</Button>
			</div>
			{this.confirm}
		</div>);
	}

	queryConds(): PageInf {
		return toPageInf(this.conds);
	}
}
MyComp.contextType = AnContext;

const My = withStyles<any, any, Comprops>(styles)(MyComp);
export { My, MyComp };
