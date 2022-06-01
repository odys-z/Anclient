import React, { useRef } from 'react';
import { Button } from '@material-ui/core';
import { Theme, withStyles } from '@material-ui/core/styles';

import { CRUD, PkMeta, NV, AnsonMsg, AnsonResp, PageInf, isEmpty, OnCommitOk, Tierec } from '@anclient/semantier';

import {
	L, ComboCondType, Comprops, CrudComp,
	jsample, AnSpreadsheet, SpreadsheetRec, AnContext, QueryPage, toPageInf, Spreadsheetier, SpreadsheetReq, ConfirmDialog, SheetCol, DatasetCombo, AnContextType, CbbCellValue,
} from '@anclient/anreact';
import { CellEditingStoppedEvent } from 'ag-grid-community';
import { Course } from '../north/kypci/tier';
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

	dirty: boolean;
	cId: string;
	myCourses: Course[];
}

interface MyScore extends Tierec {

}

export class MyReq<T extends SpreadsheetRec> extends SpreadsheetReq {
	rec?: T;

	myscore?: MyScore;

	static A = Object.assign(SpreadsheetReq.A,
		{ courses: 'r/courses',
		  scores: 'u/scores',
		});

	constructor(query?: PageInf, rec?: T) {
		super({type: 'io.oz.curr.decision.MyReq', tabl: 'b_mydecissions', query});
		this.rec = rec;
	}

	scores(score: MyScore) {
		this.myscore = score;
		this.myscore.type = "io.oz.curr.decision.MyScore";
		return this;
	}
}

class MyCoursesTier extends Spreadsheetier {
	myId?: string;
	/** client buffer for updating rows */
	courses: {[cId: string]: Course[]};

	coursesPerModule: {[m: string]: string[]}
	courseItemsPerModule: {[m: string]: NV[]}

	skCourses = 'couse-templ';

	constructor(props: {uri: string, pkval: PkMeta, cols: SheetCol[]}) {
		super('mydecisions', props);

		this.coursesPerModule = {};
		this.courseItemsPerModule = {};
	}

	loadCourses(ctx: AnContextType) {
		// let an = ctx.anReact as AnReactExt;
		// let uri = this.uri;
		let that = this;

		let client = this.client;
		
		let bdy = new MyReq(undefined, undefined)
				.A(MyReq.A.courses);
		
		let req = client.userReq(this.uri, this.port, bdy);

		client.commit(req,
			(resp) => {
				let {rows} = AnsonResp.rs2arr(resp.Body().Rs());
					// that.courses = rows as Course[];
					that.courses = {};
					that.courseItemsPerModule = {};
					that.coursesPerModule = {};

					rows?.forEach( (r: Course, x: number) => {
						if (!that.courseItemsPerModule[r.module]) {
							that.courseItemsPerModule[r.module] = [];
							that.coursesPerModule[r.module] = [];
						}
						if (!that.courses[r.module])
							that.courses[r.module] = []

						that.courses[r.module][r.cId] = r;
						that.courseItemsPerModule[r.module].push({n: r.currName, v: r.cId});
						that.coursesPerModule[r.module].push(r.currName);
					});
			},
			this.errCtx);
	}

	cbbCellOptions(p: CbbCellValue): string[] {
		if (p.colDef.field === 'cId')
			return this.coursesPerModule[(p.data as Course).module];
		return this.cbbOptions[p.colDef?.field] || [p.value];
	}

	encode(field: string, n: string, rec: Course): string | object {
		if (field === 'cId') {
			let nvs = this.courseItemsPerModule[rec.module];
			if (!nvs) // plain text
				return n;

			for (let i = 0; i < nvs.length; i++)
				if (nvs[i].n === n)
					return nvs[i].v;
			return `[${n}]`; // [] for tagging the invalid data in database
		}

		return super.encode(field, n, rec);
	}

	decode(field: string, v: string, rec: Course): string | Element { 
		if (field === 'cId') {
			let nvs = this.courseItemsPerModule[rec.module];
			for (let i = 0; i < nvs?.length; i++)
				if (nvs[i].v === v)
					return nvs[i].n;
			return v;
		}
		return super.decode(field, v, rec);
	}

	updateCell(p: CellEditingStoppedEvent, onOk: OnCommitOk) : void {
		if (!this.client || isEmpty(this.pkval?.v)) {
			console.error("sholdn't be here");
			return;
		}

		let {value, oldValue} = p;
		if (value !== oldValue) {
			let row = this.rows[p.rowIndex] as Course;
			row = Object.assign(row, this.courses[row.module]?.[this.encode('cId', row.cId, row) as string]);
			console.log('new course', row);
			row.dirty = true;

			onOk(undefined);
		}

		// let rec = {myId: this.myId} as Decision;
		// rec[this.pkval.pk] = this.pkval.v;

		// let {value, oldValue} = p;
		// if (value !== oldValue) {
		// 	value = this.encode(p.colDef.field, value);

		// 	rec[p.colDef.field] = value;
		// 	this.update(CRUD.u, rec, onOk, this.errCtx);
		// }
	}
}

class MyComp extends CrudComp<Comprops & {conn_state: string, tier: MyCoursesTier}>{
	tier: MyCoursesTier;

	confirm: JSX.Element;

	conds = { pageInf: new PageInf(0, 20),
			  query: [
				{ type: 'cbb', sk: 'ann-evt', uri: this.uri,
				  sqlArgs: [this.getUserId()],
				  noAllItem: true,
				  label: L('AP Events'), field: 'eId', grid: {sm: 8, md: 8}} as ComboCondType,
			] } as QueryPage;

	gridRef: React.MutableRefObject<undefined>;
	
	getUserId() {
		return this.props.ssInf.uid;
	}

	constructor(props: Comprops & {conn_state: string, tier: MyCoursesTier}) {
		super(props);

		this.uri = props.uri;
		this.icon = this.icon.bind(this);
		this.queryConds = this.queryConds.bind(this);

		this.toSave = this.toSave.bind(this);
		this.toDel = this.toDel.bind(this);
		this.edited = this.edited.bind(this);
		this.bindSheet = this.bindSheet.bind(this);

		Spreadsheetier.registerReq((conds: PageInf, rec: Decision) => { return new MyReq(conds, rec);});

		this.tier = new MyCoursesTier(
			{ uri: this.uri,
			  pkval: {pk: 'module', v: undefined, tabl: 'b_mycourses'},
			  cols: [
				{ field: 'myId', label: L("decision Id"), width: 10, visible: false },
				{ field: 'module', label: L('Module'), width: 120, type: 'cbb', sk: 'curr-modu', editable: false },
				{ field: 'cId', label: L("curriculum"), width: 160, type: 'dynamic-cbb', onEditStop: this.edited },
				{ field: 'clevel', label: L("Level"), width: 140, type: 'cbb', sk: 'curr-level', editable: false },
				{ field: 'cate', label: L("Category"), width: 120, type: 'cbb', sk: 'curr-cate', editable: false },
				{ field: 'remarks', label: L("Remarks"), width: 360, type: 'text' },
			] });
		
		this.gridRef = useRef();

	}

	componentDidMount() {
		let uri = this.uri;
		console.log(uri);

		this.tier.setContext(this.context);
		this.tier.loadCourses(this.context);

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

	edited (p: CellEditingStoppedEvent) : void {
		this.tier.updateCell(p, () => {
			if (p.colDef.field === 'cId')
				this.setState({});
		});
	};

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
	}

	render() {
		let that = this;
		let {classes} = this.props;

		return (<div>
			<DatasetCombo uri={this.uri} sk={'ann-evt'} noAllItem={true} />
			{this.tier &&
			  <div className='ag-theme-alpine' style={{height: '60vh', width: '100%', margin:'auto'}}>
				<AnSpreadsheet
					tier={this.tier as Spreadsheetier}
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
