import React from 'react';
import { Theme, withStyles } from '@material-ui/core/styles';

import { Protocol, CRUD, AnsonMsg, AnsonResp, PageInf } from '@anclient/semantier';

import { L, ComboCondType, Comprops, CrudComp,
	AnQueryst, jsample, AnSpreadsheet, SpreadsheetRec, AnContext,
    QueryPage, toPageInf, Spreadsheetier, SpreadsheetReq,
} from '@anclient/anreact';
import { CellClickedEvent } from 'ag-grid-community';

import { MyDocView } from '../center/mydoc-view';

const { JsampleIcons } = jsample;
const { sk } = Protocol;


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

class MyClassReq<R extends SpreadsheetRec> extends SpreadsheetReq {
	static mtabl = 'v_mykids';
	static pk = 'kid';

	rec: R;

	constructor(query?: PageInf, rec?: R) {
		super({type: 'io.oz.curr.north.MyClassReq', query});

		this.rec = rec;

		console.log(this.type);
	}
}

class MyClassComp extends CrudComp<Comprops & {conn_state: string, tier: Spreadsheetier}>{
	tier: Spreadsheetier;

	confirm: JSX.Element;

	conds = { pageInf: new PageInf(0, 20),
			  query: [
				{ type: 'cbb', sk: 'ann-evt', uri: this.uri,
				  label: L('Event'), field: 'eId', grid: {sm: 4, md: 3}} as ComboCondType,
				{ type: 'cbb', sk: Protocol.sk.cbbOrg, uri: this.uri, nv: {n: 'text', v: 'value'},
				  label: L('My Class'), field: 'orgId', grid: {sm: 4, md: 3}} as ComboCondType,
			] } as QueryPage;

    docForm: JSX.Element;

	constructor(props: Comprops & {conn_state: string, tier: Spreadsheetier}) {
		super(props);

		this.uri = props.uri;
		this.icon = this.icon.bind(this);
		this.queryConds = this.queryConds.bind(this);

		this.bindSheet = this.bindSheet.bind(this);
		this.showDoc = this.showDoc.bind(this);

		Spreadsheetier.registerReq((conds: PageInf) => { return new MyClassReq(conds) });

		this.tier = new Spreadsheetier('myclass',
		{ uri: this.uri,
		  pkval: {pk: MyClassReq.pk, v: undefined, tabl: MyClassReq.mtabl},
		  cols: [
			{ field: 'kid', label: L("Id"), width: 100, editable: false },
			{ field: 'userName', label: L("Student"), width: 160, editable: false },
			{ field: 'courses', label: L("Count"), width: 80, editable: false },
			{ field: 'optime', label: L("Date"), width: 180, editable: false },
			{ field: 'uri', label: L("Signature"), width: 120, type: 'text',
              cellRenderer: this.imgCellRederer,
              onCellClicked: this.showDoc, editable: false },
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

    // imgCellRedere: string | (new () => ICellRendererComp) | ICellRendererFunc;
    imgCellRederer(p: { value: string; }) {
        if (p.value && p.value.length > 1)
            return "<img src='favicon.ico'></img>";
        else 
            return "<div>&nbsp;</div>";
    }

    showDoc(p: CellClickedEvent) {
        console.log('.......................');

        let that = this;
        this.tier.pkval = {pk: MyClassReq.pk, v: p.data[MyClassReq.pk], tabl: MyClassReq.mtabl}
        // let docId = this.tier.pkval.v;
        
		this.docForm = (<MyDocView 
			uri={this.uri}
			tier={this.tier}
			onClose={() => {
                that.docForm = undefined;
                that.setState({});
            }} />);
        this.setState({});
    }

	render() {
		let that = this;

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
			{this.confirm}
			{this.docForm}
		</div>);
	}

	queryConds(): PageInf {
		return toPageInf(this.conds);
	}
}
MyClassComp.contextType = AnContext;

const MyClass = withStyles<any, any, Comprops>(styles)(MyClassComp);
export { MyClass, MyClassComp };
