import React from 'react';
import { Theme, withStyles } from '@material-ui/core/styles';

import { Protocol, AnsonMsg, AnsonResp, PageInf } from '@anclient/semantier';

import { L, ComboCondType, Comprops, CrudComp,
	AnQueryst, jsample, AnSpreadsheet, SpreadsheetRec, AnContext, QueryPage, toPageInf, Spreadsheetier, SpreadsheetReq,
} from '@anclient/anreact';
import { ProgressReq } from './progress';
import Card from '@material-ui/core/Card';
import Typography from '@material-ui/core/Typography';
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

// class ProgressReq<R extends SpreadsheetRec> extends SpreadsheetReq {
// 	static mtabl: 'b_mydecisions';
// 	static pk: 'myId';

// 	rec: R;

// 	constructor(query?: PageInf, rec?: R) {
// 		super({type: 'io.oz.curr.north.ProgressReq', query});

// 		this.rec = rec;

// 		console.log(this.type);
// 	}
// }

class AllDecisionsComp extends CrudComp<Comprops & {conn_state: string}>{
	tier: Spreadsheetier;

	confirm: JSX.Element;

	conds = { pageInf: new PageInf(0, 20),
			  query: [
				{ type: 'cbb', sk: 'ann-evt', uri: this.uri,
				  label: L('Event'), field: 'eventId', grid: {sm: 2, md: 2}} as ComboCondType,
				{ type: 'cbb', sk: Protocol.sk.cbbClasses, uri: this.uri, nv: {n: 'text', v: 'value'},
				  label: L('My Class'), field: 'orgId', grid: {sm: 2, md: 2}} as ComboCondType,
				{ type: 'cbb', sk: 'curr-modu', uri: this.uri,
				  label: L('Module'), field: 'module', grid: {sm: 2, md: 2}} as ComboCondType,
			] } as QueryPage;

	constructor(props: Comprops & {conn_state: string}) {
		super(props);

		this.uri = props.uri;
		// this.icon = this.icon.bind(this);
		this.queryConds = this.queryConds.bind(this);

		this.bindSheet = this.bindSheet.bind(this);

		Spreadsheetier.registerReq((conds: PageInf) => { return new ProgressReq(conds) });

		this.tier = new Spreadsheetier('progress',
		{ uri: this.uri,
		  pkval: { pk: ProgressReq.pk, v: undefined, tabl: ProgressReq.mtabl },
		  cols: [
			{ field: 'cId', label: L("Id"), width: 100, editable: false, hide: true },
			{ field: 'userName', label: L("Student"), width: 160, noAllItem: true, editable: false },
			// { field: 'progress', label: L("Students Count"), width: 100, editable: false },
			{ field: 'module', label: L('Module'), width: 110, type: 'cbb', sk: 'curr-modu', editable: false },
			{ field: 'currName', label: L("Course Name"), width: 260, editable: false },
			{ field: 'clevel', label: L("Level"), width: 140, type: 'cbb', sk: 'curr-level', editable: false },
			{ field: 'cate', label: L("Category"), width: 260, type: 'cbb', sk: 'curr-cate', editable: false },
		] });
	}

	componentDidMount() {
		let uri = this.uri;
		console.log(uri);

		this.tier.setContext(this.context);

		this.setState({});
	}

	bindSheet(_resp: AnsonMsg<AnsonResp>) {
		let that = this;
		this.tier.records(toPageInf(this.conds),
			(_cols, rows) => {
				that.tier.rows = rows;
				that.setState({})
			});
	}

	render() {
		let that = this;
		let {classes} = this.props;

		return (<div>
			<Card className={classes.funcard}>
				<Typography variant="h6" gutterBottom>{}
					{this.props.funcName || this.props.title || L('Class Courses')}
				</Typography>
			</Card>
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
			{this.confirm}
		</div>);
	}

	queryConds(): PageInf {
		return toPageInf(this.conds);
	}
}
AllDecisionsComp.contextType = AnContext;

const AllDecisions = withStyles<any, any, Comprops>(styles)(AllDecisionsComp);
export { AllDecisions, AllDecisionsComp };
