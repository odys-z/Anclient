import React from 'react';
import { Button } from '@material-ui/core';
import { Theme, withStyles } from '@material-ui/core/styles';

import { CRUD, PkMeta, NV, AnsonMsg, AnsonResp, PageInf, isEmpty, OnCommitOk } from '@anclient/semantier';

import {
	L, ComboCondType, Comprops, CrudComp, AnContextType,
	jsample, AnSpreadsheet, SpreadsheetRec, AnContext, QueryPage, toPageInf, DatasetCombo,
	Spreadsheetier, SpreadsheetReq, ConfirmDialog, SheetCol, CbbCellValue, SpreadsheetResp,
} from '@anclient/anreact';
import { CellEditingStoppedEvent, GridApi } from 'ag-grid-community';
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

const setPrinterFriendly = (api: GridApi) => {
    const eGridDiv = document.querySelector('#myGrid') as any;
    eGridDiv.style.height = '';
    api.setDomLayout('print');
};
  
const setNormal = (api) => {
    const eGridDiv = document.querySelector('#myGrid') as any;
    eGridDiv.style.width = '700px';
    eGridDiv.style.height = '200px';
    api.setDomLayout();
};
 

interface Decision extends SpreadsheetRec {
	/** client only */
	dirty?: boolean;

	/** optional for myId = eventId + kid */
	myId?: string;
	eventId: string;
	cIds: String[];
}

class MyReq<T extends SpreadsheetRec> extends SpreadsheetReq {
	rec: T;

	static A = Object.assign(SpreadsheetReq.A,
		{ courses: 'r/courses', });

	constructor(query: PageInf, rec: T) {
		super({type: 'io.oz.curr.decision.MyReq', tabl: 'b_mydecissions', query});
		this.rec = rec;
	}
}

class MyCoursesTier extends Spreadsheetier {
	eventId?: string;
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

	/**
	 * Enocde name to code according cbb items data.
	 * 
	 * @param field 
	 * @param n 
	 * @param rec current row for dynamic encoding (current module for each course groups)
	 * @returns 
	 */
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
		v = rec[field] as string;
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
			row = Object.assign(row, this.courses[row.module]?.[this.encode('cId', value, row) as string]);
			console.log('new course', row);
			row.dirty = true;

			onOk(undefined);
		}
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
    sheetRef: AnSpreadsheet;
    api: GridApi;
	buttons = {save: false, export: false, upload: false};
	
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
		this.toPrint = this.toPrint.bind(this);
		this.edited = this.edited.bind(this);
		this.bindSheet = this.bindSheet.bind(this);
		this.onSelectDecision = this.onSelectDecision.bind(this);

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
		
        this.gridRef = React.createRef();

	}

	componentDidMount() {
		let uri = this.uri;
		console.log(uri);

		this.tier.setContext(this.context);
		this.tier.loadCourses(this.context);

		// Spreadsheet + MyReq will load course pre module for last active event (mydecision : records)
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
		// this.tier.records(toPageInf(this.conds),
        this.tier.records(new PageInf(0, -1, 0, [['eventId', this.tier.eventId]]),
			(_cols, rows) => {
				that.tier.rows = rows;
				that.api.redrawRows();
				that.setState({})
			});
	}

    onSelectDecision (event: NV) : void {
		let ename = event.n;
		let isActive = ename.startsWith("Active: ");

		this.buttons.save = isActive;
		this.buttons.export = isActive;
		this.buttons.upload = isActive;

		this.setState({})

        this.tier.eventId = event.v as string;

        this.bindSheet(undefined);
        // this.tier.records(new PageInf(0, -1, 0, [['myId', this.tier.myId]]),
		// 	(_cols, rows) => {
		// 		that.tier.rows = rows;
		// 		that.setState({})
		// 	});
    };

	edited (p: CellEditingStoppedEvent) : void {
		this.tier.updateCell(p, () => {
			if (p.colDef.field === 'cId') {
				p.api.redrawRows();
				this.setState({});
			}
		});
	};

	toSave(_e: React.UIEvent) {
		let that = this;
        this.tier.rec = {
			eventId: this.tier.eventId,
			cIds: collectCourses(this.tier.rows as Course[])
		} as Decision;

        // update id: eventId + usrId
		this.tier.update(
			this.tier.pkval.v ? CRUD.u : CRUD.c,
			this.tier.rec, 
			(resp: AnsonMsg<SpreadsheetResp>) => {
				console.log(resp.Body());
				that.tier.pkval.v = resp.Body().rec.myId;

				let msg = resp.Body().msg();
				this.confirm = (
					<ConfirmDialog title={L('Info')}
						ok={L('OK')} cancel={false} open
						onClose={() => {
							that.confirm = undefined;
							that.setState({});
						} }
						msg={msg} />);
				this.setState({});
			}, this.context.error);
		
		function collectCourses(rows: Course[]) {
			let cIds = [];
			rows?.forEach( (c, x) => {
				if (!isEmpty(c.cId))
					cIds.push( c.cId );
			});
			return cIds;
		}
	}

	toDel(e: React.UIEvent) {
		console.error("shouldn't here");
	}

    toPrint(_e: React.UIEvent) {
        setPrinterFriendly(this.api);
        print();
    }

    toUpload(_e: React.UIEvent) {
        setPrinterFriendly(this.api);
        print();
    }

	render() {
		let that = this;
		let {classes} = this.props;

		return (<div>
            <div className='noPrint'>
				<DatasetCombo uri={this.uri}
					sk={'ann-evt'}
					noAllItem={true}
					className='noPrint'
					onSelect={this.onSelectDecision} />
            </div>
            <div className='onlyPrint'>
                <h1>{L('Signature')}</h1>
            </div>
			{ this.tier &&
			  <div id="myGrid" className='ag-theme-alpine' style={{height: '60vh', width: '100%', margin:'auto'}}>
				<AnSpreadsheet
				 	ref={ (ref) => this.sheetRef = ref }
					tier={this.tier as Spreadsheetier}
                    onSheetReady={(params) => this.api = params.api}
					autosave={true}
					onCellClicked={this.tier.onCellClick}
					columns={this.tier.columns()}
					rows={this.tier.rows} />
			  </div>}
			<div style={{textAlign: 'center', background: '#f8f8f8'}} className={'noPrint'}>
				<Button variant="outlined"
					disabled={!this.buttons.save}
					className={classes.usersButton}
					color='primary'
					onClick={this.toSave}
					endIcon={<JsampleIcons.Edit />}
				>{L('Save')}
				</Button>
				<Button variant="outlined"
					disabled={!this.buttons.export}
					className={classes.usersButton}
					color='primary'
					onClick={this.toPrint}
					endIcon={<JsampleIcons.Export />}
				>{L('Print')}
                </Button>
				<Button variant="outlined"
					disabled={!this.buttons.upload}
					className={classes.usersButton}
					color='primary'
					onClick={this.toUpload}
					endIcon={<JsampleIcons.Up />}
				>{L('Upload')}
                </Button>
			</div>
			{ this.confirm }
		</div>);
	}

	queryConds(): PageInf {
		return toPageInf(this.conds);
	}
}
MyComp.contextType = AnContext;

const My = withStyles<any, any, Comprops>(styles)(MyComp);
export { My, MyComp };
