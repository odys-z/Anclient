import React, { CSSProperties } from 'react';

import { AgGridReact } from 'ag-grid-react';
import { CellClickedEvent, ColDef, Column, ColumnApi,
	GetContextMenuItems, GetContextMenuItemsParams, GridApi, GridReadyEvent, ICellRendererParams, RowNode
} from 'ag-grid-community';

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import { Comprops, CrudComp } from '../crud';
import { TierCol, Tierec, Semantier, Semantext, NV, toBool, Inseclient, PkMeta,
	OnCommitOk, AnElemFormatter, PageInf, OnLoadOk, AnsonResp, UserReq, CRUD, ErrorCtx, Protocol, isEmpty } from '@anclient/semantier';
import { AnReactExt } from '../anreact';
import { AnConst } from '../../utils/consts';

/**
 * Short-cut for ag-grid-community (License: MID)
 */
 export interface AgEvent {
    /** Event identifier */
    type: string;
}

/**
 * Short-cut for ag-grid-community (License: MID)
 */
export interface AgGridEvent extends AgEvent {
    api: any;
    columnApi: any;
}

/**
 * Short-cut for ag-grid-community (License: MID)
 */
export interface RowEvent extends AgGridEvent {
    node: any;
    /** The user provided data for the row */
    data: any;
    /** The visible row index for the row */
    rowIndex: number | null;
    /** Either 'top', 'bottom' or null / undefined (if not set) */
    rowPinned: string | null;
    /** The context as provided on `gridOptions.context` */
    context: any;
    /** If event was due to browser event (eg click), this is the browser event */
    event?: Event | null;
}

/**
 * Short-cut for ag-grid-community (License: MID)
 */
export interface CellEvent extends RowEvent {
    column: any;
    colDef: any;
    /** The value for the cell */
    value: any;
}

/**
 * Short-cut for ag-grid-community (License: MID)
 */
export interface CellEditingStoppedEvent extends CellEvent {
    /** The old value before editing */
    oldValue: any;
    /** The new value after editing */
    newValue: any;
}

export interface SheetCol extends TierCol {
	label: string;
	field: string;

	/**cell type, default: text
	 * - cbb: bind options with sk
	 * - dynamic-cbb: options changing for each rows, work together with cbbOptions
	 */
	type?: 'text' | 'cbb' | 'dynamic-cbb';
	/** dynamic options per record. */
	cbbOptions?: (rec: SpreadsheetRec) => string[] 

	/** The semantic key - Spreadsheet load combobox options automaticall
	 * 
	 * A note about ag-grid warning:
	 * invalid colDef property 'sk' did you mean any of these: __v_skip, ...
	 * 
	 * This warning occures when rendering Spreadsheet before all comboboxes' loading triggered
	 * (where the sk be deleted). Currently avoiding this happening is depending on user's code.
	 * There is no plan to solve this.
	 */
	sk?  : string;
	sqlArgs?: string[],

	form?: JSX.Element;

	noAllItem?: boolean,

	/** An additional option item for clear the selection (an additonal clear button)
	 * 
	 * How this works: have encoder return a null value - so currently only works for relation table
	 */
	delText?: string;

	suppressSizeToFit?: boolean;
	resizable?: boolean;
	editable?: boolean;
	singleClickEdit?: boolean;
	width?: number;
	minWidth?: number;
	thFormatter?: () => SheetCol & {headerName: string};
	onEditStop?: (e: CellEditingStoppedEvent) => void;

	isEditable?: () => boolean | boolean;
}

export interface SpreadsheetRec extends Tierec {
	/**This is optional because subclass will rename it */
	id?: string,
	css?: CSSProperties,
}

export class SpreadsheetResp extends AnsonResp {
	rec: SpreadsheetRec;

	constructor(json) {
		super(json);
		this.rec = json.rec;
	}
}

Protocol.registerBody("io.odysz.jsample.semantier.SpreadsheetResp",
	(json) => {
		return new SpreadsheetResp(json);
	});

/**
 * According to ag-grid document, p's type is any: https://www.ag-grid.com/react-data-grid/cell-editors/#reference-CellEditorSelectorResult-params
 */
export interface CbbCellValue {
	api: GridApi;
	cellStartedEdit: boolean;
	charPress: any;
	colDef: ColDef;
	column: Column;
	columnApi: ColumnApi;
	context: any
	/**
	 * eg. {cid: '000006', parentId: null, currName: 'curr name', clevel: 'level', module: '[] - [[] - [module]]', …}
	 */
	data: SpreadsheetRec;
	/**
	 * div.ag-cell.ag-cell-normal-height.ag-cell-value.ag-cell-focus.ag-cell-not-inline-editing
	 */
	eGridCell: any;
	formatValue: () => any;
	keyPress: any;
	/**
	 * {rowIndex: 5, key: null, childrenMapped: {}, displayed: true, rowTop: 210, data: SpreadsheetRec}
	 */
	node: RowNode;
	onKeyDown: () => any;
	parseValue: () => any;
	rowIndex: number;
	stopEditing: () => any;

	/**
	 * current cell value
	 */
	value: any
}

export class SpreadsheetReq extends UserReq {
	// new (...args: any[]) : Req
	// { return new Req(args);}
	static A = {
		update: 'u',
		insert: 'c',
		delete: 'd',
		records: 'r',
		rec: 'rec',
	}
	page: PageInf;

	constructor(opts: {type: string, tabl?: string, query: PageInf}) {
		super(undefined, opts.tabl);

		if (!opts)
			throw Error("Argument opts is required. If this is not checked by Typescript, it's probably the registered constructor doesn't work.")

		if (!opts.type)
			throw Error("opts.type is undefined. Spreadsheet is a mimic of Generic type, but can only work with type explictly specified.");
		this.type = opts.type;

		this.page = opts.query;
	}
}

export class Spreadsheetier extends Semantier {
	static reqfactory: (conds: PageInf, rec?: SpreadsheetRec) => SpreadsheetReq;

	static registerReq(factory: (conds: PageInf, rec: SpreadsheetRec) => SpreadsheetReq) {
		Spreadsheetier.reqfactory = factory;
	}

	/**jserv port name, e.g. 'workbook' */
	port: string;
	// currentRecId: any;

	constructor(port: string, props: {uri: string, pkval: PkMeta, cols: SheetCol[]}) {
		super(props);
		this.port = port;
		this.pkval = props.pkval;

		this.rows = [];
		this._cols = props.cols;

		this.onCellClick = this.onCellClick.bind(this);
	}

    loadCbbOptions(ctx: Semantext): Semantier {
		let that = this;
		let an = ctx.anReact as AnReactExt;
		// load all options
		this._cols?.forEach((c: SheetCol, x: number) => {
			if (c.type === 'cbb') {
				if (c.sk) {
				  an.ds2cbbOptions({
					uri: this.uri,
					sk: c.sk as string,
					nv: {n: 'name', v: 'value'}, //c.nv,
					noAllItem: toBool(c.noAllItem, true),
					sqlArgs: c.sqlArgs,
					onLoad: (_cols, rows) => {
						if (rows) {
							let ns = [];
							rows.forEach( (nv: NV, x) => ns.push(nv.n) )
							that.cbbOptions[c.field] = ns;
							that.cbbItems[c.field] = rows;
						}
						else {
							that.cbbOptions[c.field] = [];
							that.cbbItems[c.field] = [];
						}
						if ( c.delText ) {
							that.cbbOptions[c.field].unshift(c.delText)
							that.cbbItems[c.field].unshift( { n: c.delText, v: undefined } );
						}
					}
				  });
				  delete c.sk;
				}
				else console.warn("Combobox cell's option loading ignored for null sk: ", c);
			}
			else if (c.type === 'text') {
				delete c.type;
			}
			else if (c.type === 'dynamic-cbb') {
				// that.cbbOptions[c.field] = c.cbbOptions;
				// delete c.cbbOptions;
			}
		});

		return this;
	}

	cbbOptions = {default: [AnConst.cbbAllItem.n]} as {[f: string]: string[]};
	cbbItems = {default: [AnConst.cbbAllItem]} as {[f: string]: NV[]};

	/**
	 * Providing options for AgSelectEditor's items.
	 *
	 * @param p parameter for colDef.cellEditorParams = (p: any) => string[] .
	 *
	 * According to ag-grid document, p's type is any: https://www.ag-grid.com/react-data-grid/cell-editors/#reference-CellEditorSelectorResult-params
	 *
	 * @returns options
	 */
	cbbCellOptions(p: CbbCellValue): string[] {
		return this.cbbOptions[p.colDef?.field] || [p.value];
	}

	/**
	 * Decode record's FK value for display cell content - called by AgSelectCell for rendering.
	 *
	 * @param field field name for finding NV records to decode.
	 * @param v
	 * @param rec current row (p.data)
	 * @returns showing element
	 */
	decode(field: string, v: string, rec: SpreadsheetRec): string | Element {
		v = rec[field] as string;
		let nvs = this.cbbItems[field];
		for (let i = 0; i < nvs?.length; i++)
			if (nvs[i].v === v)
				return nvs[i].n;
		return v;
	}

	/**
	 * Encode record's FK value to get db value - called by spread tier for updating.
	 *
	 * @param field
	 * @param n
	 * @param rec not used
	 * @returns
	 */
	encode(field: string, n: string, rec: SpreadsheetRec): string | object {
		let nvs = this.cbbItems[field];
		if (!nvs) // plain text
			return n;

		for (let i = 0; i < nvs.length; i++)
			if (nvs[i].n === n)
				return nvs[i].v;
		return `[${n}]`; // [] for tagging the invalid data in database
	}

	onCellClick (e: CellClickedEvent) {
		this.pkval.v = e.data[this.pkval.pk];
	};

	update(crud: CRUD, rec: SpreadsheetRec, ok: OnCommitOk, err: ErrorCtx) {
		console.log(rec);

		if (!this.client) return;
		let client = this.client;

		let req = client.userReq(this.uri, this.port,
						Spreadsheetier.reqfactory( undefined, rec)
						.A( crud === CRUD.d ? SpreadsheetReq.A.delete :
							crud === CRUD.c ? SpreadsheetReq.A.insert :
							SpreadsheetReq.A.update ) );

		client.commit(req, ok, err);
	}

	columns (modifier?: {[x: string]: AnElemFormatter}): Array<SheetCol> {
		return this._cols as Array<SheetCol>;
	}

	updateCell(p: CellEditingStoppedEvent, ok?: OnCommitOk) : void {
		if (!this.client) {
			console.error("somthing wrong ...");
			return;
		}

		if (!this.pkval)
			throw Error("Default auto updating only works when PkMeta is provided. Eighter provid it or override updateCell(CellEditingStoppedEvent).");

		if (this.client instanceof Inseclient)
			throw Error("Spreadsheetir.updateCell is using port.update, and can only work in session mode. To use in session less mode, user need override this method or provide SheetCol.onEditStop.");

		let rec = {} as SpreadsheetRec;
		// rec[this.pkval.pk] = this.currentRecId;
		rec[this.pkval.pk] = this.pkval.v;

		let {value, oldValue} = p;
		if (value !== oldValue && (value || oldValue)) {
			value = this.encode(p.colDef.field, value, p.data);

			rec[p.colDef.field] = value;
			this.update(CRUD.u, rec, ok, this.errCtx);
		}
	}

    record(conds: PageInf, onLoad: OnLoadOk<SpreadsheetRec>) : void {
		super.records(conds, onLoad);
	}

	records<T extends SpreadsheetRec>(conds: PageInf, onLoad: OnLoadOk<T>) {

		if (!this.client) return;

		let client = this.client;
		let that = this;

		let r = Spreadsheetier.reqfactory(conds);

		let req = client.userReq(this.uri, this.port,
					r.A(SpreadsheetReq.A.records) );

		client.commit(req,
			(resp) => {
				let {cols, rows} = AnsonResp.rs2arr(resp.Body().Rs());
				that.rows = rows;
				onLoad(cols, rows as T[]);
			},
			this.errCtx);
	}


	insert(onOk: OnCommitOk) {
		console.log('can be abstracted?');
		let bd = Spreadsheetier.reqfactory(undefined).A(SpreadsheetReq.A.insert);
		let req = this.client.userReq(this.uri,
			this.port, bd);
			// new MyBookReq( undefined ).A(MyBookReq.A.insert));

		this.client.commit(req, onOk, this.errCtx);
	}
}

export interface SpreadsheetProps extends Comprops {
	columns: SheetCol[];
	/** Initial rows - updated with jserv response */
	rows: Tierec[];

	tier: Spreadsheetier;

	/** not used - only for AgGridReact community version */
	contextMenu?: object;

    onCellClicked?: (e: CellClickedEvent) => void;

	onSheetReady?: (e: GridReadyEvent) => void;
}

/**
 * Thin wrapper of ag-grid.
 *
 * For ag-grid practice, go
 * https://stackblitz.com/edit/ag-grid-react-hello-world-8lxdjj?file=index.js
 *
 * For public results, go
 * https://ag-grid-react-hello-world-8lxdjj.stackblitz.io
 *
 * Desgin Note: But is it possible handled by Semantic-DA?
 */
export class AnSpreadsheet extends CrudComp<SpreadsheetProps> {
	state = {
		dirty: false,
		ready: false
	};

	coldefs = [] as ColDef[];
	defaultColDef = {
		resizable: true,
		editable: true,
		singleClickEdit: true,
		stopEditingWhenCellsLoseFocus: true,
	} as ColDef;

	editHandlers = {} as {[fname: string]: (p: CellEditingStoppedEvent) => void};

	gridApi: GridApi;
	gridColumnApi: ColumnApi;

	isEditable = true;
	tier: Spreadsheetier;

	ref: AgGridReact;
	api: GridApi;

	constructor(props: SpreadsheetProps) {
		super(props);

		this.tier = props.tier;

		let {resizable, editable, singleClickEdit} = props.defaultColDef || {};
		this.defaultColDef = Object.assign(
						this.defaultColDef,
						{resizable, editable, singleClickEdit});

		// columns = [{ field: 'id', label: '', hide: true }],
		this.onEditStop = this.onEditStop.bind(this);
		let that = this;

		if (this.props.columns) {
			this.props.columns.forEach( (c, x) =>  {
				let headerName = c.label;
				delete c.label;

				let anEditStop = c.onEditStop;
				if (anEditStop) {
					that.editHandlers[c.field] = anEditStop;
					delete c.onEditStop;
				}
				let width = 120;
				if (x === this.coldefs.length - 1)
					width = undefined;
				let col = Object.assign(
					  { headerName: '--',
						field: '--',
						suppressSizeToFit: true,
						resizable: true,
						editable: true,
						singleClickEdit: true,
						width,
						minWidth: 50 },
					  c.thFormatter ? c.thFormatter() :
						{ headerName, ...c}) as ColDef;

				if (col.type === 'cbb' || col.type === 'dynamic-cbb') {
					col.type = undefined; // 'agSelectEditor';
					col.cellEditor = 'agSelectCellEditor';
					// p type is any (May 2022):
					// https://www.ag-grid.com/react-data-grid/cell-editors/#reference-CellEditorSelectorResult-params
					col.cellEditorParams = (p: CbbCellValue) => {
						return { values: that.props.tier.cbbCellOptions(p) };
					  };
					col.cellRenderer = that.props.cbbCellRender || ((p: ICellRendererParams) => that.props.tier.decode(p.colDef.field, p.value, p.data))
					// col.onCellEditingStopped = anEditStop
					// (e: { value: any; data: SpreadsheetRec; }) => {
					// }
				}

				that.coldefs.push( col );
			} );
		}
		console.log(this.coldefs);
	}

	componentDidMount() {
		this.tier.setContext(this.context);
		this.tier.loadCbbOptions(this.context);

		let that = this;
		this.tier.records(undefined, () => that.setState({ready: true}));
	}

	getRef() { return this.ref; }
	getApi() { return this.api; }

	/** load default context menu, together with user's menu items.
	 * user's menu items defined in props like:
	 * {"qtype": {name: 'Format Answer', action}, ...}
	 * where the value of 'qtype' is the ag-gride context menu item:
	 * @deprecated context menu is a module of ag-grid enterprise.
	 */
	getContextMenuItems = ((para: GetContextMenuItemsParams) =>  {
		// cellval = param.value;
		let result = [
			{ name: 'cell ' + para.value,
			  action: function () { } },
			'copy', 'paste', 'cut', 'delete'
			];
		if (this.props.contextMenu) {
			result.push('separator');
			for (let colname in this.props.contextMenu)
				if (colname === para.column.getColDef().field)
					result.push(this.props.contextMenu[colname]);
		}

		return result;
	}) as GetContextMenuItems;

	/**<pre>
	  GetContextMenuItemsParams {
	    column: Column, // the column that was clicked
	    node: RowNode, // the node that was clicked
	    value: any, // the value displayed in the clicked cell
	    api: GridApi, // the grid API
	    columnApi: ColumnAPI, // the column API
	    context: any, // the grid context
	    defaultItems: string[] | undefined // names of the items that would be provided by default
	  }</pre>
	 */
	onGridReady = (params: { api: GridApi; columnApi: ColumnApi; }) => {
		this.gridApi = params.api;
		this.gridColumnApi = params.columnApi;

		params.api.sizeColumnsToFit();
		this.api = params.api;
	};

	onFirstDataRendered = (params: { api: { sizeColumnsToFit: () => void; }; }) => {
		params.api.sizeColumnsToFit();
	};

	/**
	api: GridApi,
	colDef: {headerName: 'DATE', field: 'gday', editable: ƒ, …},
	column: Column,
	columnApi: ColumnApi
	context: undefined
	data: {gday: '2021-09-14', alice: '2', ashley: '', caesar: null, george: '4', …}
	event: PointerEvent {isTrusted: true, pointerId: 1, width: 1, height: 1, pressure: 0, …}
	node: RowNode {rowIndex: 2, key: null, childrenMapped: {…}, displayed: true, rowTop: 84, …}
	rowIndex: 2
	rowPinned: undefined
	type: "cellClicked"
	value: "2021-09-14"
	*/
	onCellClicked = (p: CellClickedEvent) => {
		if (typeof this.props.onCellClicked === 'function')
			this.props.onCellClicked(p);
	};

	/** Grid event API:
	 * https://www.ag-grid.com/javascript-data-grid/grid-events/
	 */
	onEditStop (p: CellEditingStoppedEvent) {
		if (typeof this.editHandlers[p.colDef.field] === 'function')
			this.editHandlers[p.colDef.field](p);
		else if (this.props.autosave)
			this.tier.updateCell(p);
	}

	render () {
	  return (
		<AgGridReact
			ref={(ref) => this.ref = ref}
			onCellClicked={this.onCellClicked}
			columnDefs={this.coldefs}
			components={this.props.components}
			defaultColDef={this.defaultColDef}
			stopEditingWhenCellsLoseFocus={true}
			onCellEditingStopped={this.onEditStop}
			getContextMenuItems={this.getContextMenuItems}
			onGridReady={this.props.onSheetReady}
			rowData={this.tier.rows} >
		</AgGridReact> );
	}
}

export function anRowsRenderer (param: { value: string; }) {
	if (param.value)
		return `<p style="line-height: 1.2em" >${param.value.split('\n').join('<br/>')}</p>`;
}

// https://www.ag-grid.com/javascript-data-grid/component-cell-editor/#angular-cell-editing
export class AnNumerCellEdit {
  eInput: HTMLInputElement;
  cancelBeforeStart: boolean;

  /**
   * This is gets called once before the renderer is used.
   *
   * @param params
   */
  init(params: { charPress: string; value: string; }) {
    // create the cell
    this.eInput = document.createElement('input');

    if (this.isCharNumeric(params.charPress)) {
      this.eInput.value = params.charPress;
    } else {
      if (params.value !== undefined && params.value !== null) {
        this.eInput.value = params.value;
      }
    }

    this.eInput.addEventListener('keypress', (event): void => {
      if (!this.isKeyPressedNumeric(event)) {
        this.eInput.focus();
        if (event.preventDefault) event.preventDefault();
      } else if (this.isKeyPressedNavigation(event)) {
        event.stopPropagation();
      }
    });

    // only start edit if key pressed is a number, not a letter
    const charPressIsNotANumber =
      params.charPress && '1234567890'.indexOf(params.charPress) < 0;
    this.cancelBeforeStart = charPressIsNotANumber;
  }

  isKeyPressedNavigation(event: KeyboardEvent) {
    return event.keyCode === 39 || event.keyCode === 37;
  }

  // gets called once when grid ready to insert the element
  getGui() {
    return this.eInput;
  }

  // focus and select can be done after the gui is attached
  afterGuiAttached() {
    this.eInput.focus();
  }

  // returns the new value after editing
  isCancelBeforeStart() {
    return this.cancelBeforeStart;
  }

  // example - will reject the number if it contains the value 007
  // - not very practical, but demonstrates the method.
  isCancelAfterEnd() {
    const value = this.getValue();
    return value.indexOf('007') >= 0;
  }

  // returns the new value after editing
  getValue() {
    return this.eInput.value;
  }

  // any cleanup we need to be done here
  destroy() {
    // but this example is simple, no cleanup, we could  even leave this method out as it's optional
  }

  // if true, then this editor will appear in a popup
  isPopup() {
    // and we could leave this method out also, false is the default
    return false;
  }

  private getCharCodeFromEvent(event) {
    event = event || window.event;
    return typeof event.which == 'undefined' ? event.keyCode : event.which;
  }

  private isCharNumeric(charStr: string) {
    return !!/\d/.test(charStr);
  }

  isKeyPressedNumeric(event: KeyboardEvent) {
    const charCode = this.getCharCodeFromEvent(event);
    const charStr = String.fromCharCode(charCode);
    return this.isCharNumeric(charStr);
  }
}
