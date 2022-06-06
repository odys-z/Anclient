import React from 'react';
import { Theme, withStyles } from '@material-ui/core/styles';

import { AnsonMsg, AnsonResp, PageInf } from '@anclient/semantier';

import {
	L, ComboCondType, Comprops, CrudComp,
	AnQueryst, jsample, AnSpreadsheet, SpreadsheetRec, AnContext, QueryPage, toPageInf, Spreadsheetier, SpreadsheetReq,
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

interface Progress extends SpreadsheetRec {

}

class ProgressReq<R extends SpreadsheetRec> extends SpreadsheetReq {
	rec: R;

	constructor(query?: PageInf, rec?: R) {
		super({type: 'io.oz.curr.north.ProgressReq', query});

		this.rec = rec;

		console.log(this.type);
	}
}

class ProgressComp extends CrudComp<Comprops & {conn_state: string, tier: Spreadsheetier}>{
	tier: Spreadsheetier;

	confirm: JSX.Element;

	conds = { pageInf: new PageInf(0, 20),
			  query: [
				{ type: 'cbb', sk: 'ann-evt', uri: this.uri,
				  label: L('Event'), field: 'eventId', grid: {sm: 2, md: 2}} as ComboCondType,
				{ type: 'cbb', sk: 'curr-cate', uri: this.uri,
				  label: L('Category'), field: 'cate', grid: {sm: 2, md: 2}} as ComboCondType,
				{ type: 'cbb', sk: 'curr-modu', uri: this.uri,
				  label: L('Module'), field: 'module', grid: {sm: 2, md: 2}} as ComboCondType,
			] } as QueryPage;

	constructor(props: Comprops & {conn_state: string, tier: Spreadsheetier}) {
		super(props);

		this.uri = props.uri;
		this.icon = this.icon.bind(this);
		this.queryConds = this.queryConds.bind(this);

		this.toAdd = this.toAdd.bind(this);
		this.toDel = this.toDel.bind(this);
		this.bindSheet = this.bindSheet.bind(this);

		Spreadsheetier.registerReq((conds: PageInf) => { return new ProgressReq(conds) });

		this.tier = new Spreadsheetier('progress',
		{ uri: this.uri,
		  pkval: {pk: 'myId', v: undefined, tabl: 'b_mydecisions'},
		  cols: [
			{ field: 'cId', label: L("Id"), width: 100, editable: false },
			{ field: 'eventName', label: L("AP Event"), width: 160, noAllItem: true, editable: false },
			{ field: 'progress', label: L("Students Count"), width: 120, editable: false },
			{ field: 'currName', label: L("Course Name"), width: 160, editable: false },
			{ field: 'clevel', label: L("Level"), width: 140, type: 'cbb', sk: 'curr-level', editable: false },
			{ field: 'module', label: L('Module'), width: 120, type: 'cbb', sk: 'curr-modu', editable: false },
			{ field: 'cate', label: L("Category"), width: 120, type: 'cbb', sk: 'curr-cate', editable: false },
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

	toAdd(_e: React.UIEvent) {
		this.tier.insert(this.bindSheet);
	}

	toDel(e: React.UIEvent) {
		this.tier.del({ids: [this.tier.pkval?.v]}, this.bindSheet);
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
			{this.confirm}
		</div>);
	}

	queryConds(): PageInf {
		return toPageInf(this.conds);
	}
}
ProgressComp.contextType = AnContext;

const Progress = withStyles<any, any, Comprops>(styles)(ProgressComp);
export { Progress, ProgressComp };
