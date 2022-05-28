import React from 'react';
import { Button } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';

import { AnsonMsg, AnsonResp, PageInf } from '@anclient/semantier';

import {
	L, Comprops, CrudComp,
	jsample, AnSpreadsheet, SpreadsheetRec, AnContext,
	toPageInf, Spreadsheetier, CellEditingStoppedEvent, SpreadsheetReq,
} from '@anclient/anreact';
const { JsampleIcons } = jsample;

import { StarTheme } from '../../../common/star-theme';
import { ThreeSixtySharp } from '@material-ui/icons';

const styles = (_theme: StarTheme) => ({
	root: {
		// height: "calc(100vh - 92ch)"
		height: "82vh"
	},
	actionButton: {
	},
	usersButton: {
		margin: 6,
		width: L("events-btn-width"),
	}
});

interface EventRec extends SpreadsheetRec {

}

class EventReq extends SpreadsheetReq {
    rec: EventRec;

    constructor(conds?: PageInf, rec?: EventRec) {
        super({type: 'io.oz.curr.north.APEventReq', query: conds});
        this.rec = rec;
    }
}

class EventsComp extends CrudComp<Comprops & {conn_state: string}>{
	tier: Spreadsheetier;

	confirm: JSX.Element;

	// conds = { pageInf: new PageInf(0, 20),
	// 		  query: [
	// 			{ type: 'cbb', sk: 'curr-cate', uri: this.uri,
	// 			  label: L('Category'), field: 'cate', grid: {sm: 2, md: 2}} as ComboCondType,
	// 			{ type: 'cbb', sk: 'curr-subj', uri: this.uri,
	// 			  label: L('Subject'), field: 'subj', grid: {sm: 2, md: 2}} as ComboCondType,
	// 		] } as QueryPage;

	constructor(props: Comprops & {conn_state: string}) {
		super(props);

		this.uri = props.uri;
		this.icon = this.icon.bind(this);
		this.queryConds = this.queryConds.bind(this);

		this.toAdd = this.toAdd.bind(this);
		this.toDel = this.toDel.bind(this);
		this.bindSheet = this.bindSheet.bind(this);

		/** Let's move this to Spreadsheetier's constructor parameter */
		Spreadsheetier.registerReq((conds: PageInf, rec: EventRec) => { return new EventReq(conds, rec) });

		this.tier = new Spreadsheetier('apevents',
			{ uri: this.uri,
			  pkval: {pk: 'eId', v: undefined, tabl: 'b_currevents'},
			  cols: [
				{ field: 'eId', label: L("Event Id"), width: 120, editable: false },
				{ field: 'eventName', label: L("Event"), width: 160 },
				{ field: 'yyyymm', label: L("Year"), width: 120 },
				{ field: 'estate', label: L("estate"), width: 80, type: 'cbb', sk: 'evt-state' },
				{ field: 'remarks', label: L("Remarks"), width: 400 },
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
		this.tier.records( undefined,
			(_cols, rows) => {
				that.tier.rows = rows;
                that.tier.resetFormSession();
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
		let {classes} = this.props;

		return (<div>
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
				>{L('Add AP Event')}
				</Button>
				<Button variant="outlined"
					className={classes.usersButton}
					color='secondary'
					onClick={this.toDel}
					endIcon={<JsampleIcons.Delete />}
				>{L('Delete Event')}
				</Button>
			</div>
			{this.confirm}
		</div>);
	}

	queryConds(): PageInf {
		return toPageInf(undefined);
	}
}
EventsComp.contextType = AnContext;

const APEvents = withStyles(styles)(EventsComp);
export { APEvents, EventsComp };
