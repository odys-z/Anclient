import React, { CSSProperties } from 'react';

import { AgGridReact } from 'ag-grid-react';
import { CellClickedEvent, CellEditingStoppedEvent, ColDef, Column, ColumnApi,
	GetContextMenuItems, GetContextMenuItemsParams, GridApi, GridReadyEvent, ICellRendererParams, RowNode
} from 'ag-grid-community';
export { CellEditingStoppedEvent, CellClickedEvent };

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import { Comprops, CrudComp } from '../crud';
import { TierCol, Tierec, Semantier, Semantext, NV, toBool, UpdateReq, Inseclient, UIComponent, PkMeta } from '@anclient/semantier';
import { AnReactExt } from '../anreact';
import { AnConst, ComboCondType } from '../../an-components';

export interface SheetCol extends TierCol {
	label: string; 
	field: string;

	/**cell type, default: text */
	type?: 'text' | 'cbb';
	sk?  : string;
	form?: JSX.Element;

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

export class Spreadsheetier extends Semantier {
	/**jserv port name, e.g. 'workbook' */
	port: string;
	currentRecId: any;

	constructor(port: string, props: UIComponent & {pkval: PkMeta}) {
		super(props);
		this.port = port;
		this.pkval = props.pkval;
	}

    loadCbbOptions(ctx: Semantext): Semantier {
		let that = this;
		let an = ctx.anReact as AnReactExt;
		// load all options
		this._cols?.forEach((c: ComboCondType, x: number) => {
			if (c.type === 'cbb') {
				if (c.sk) {
				  an.ds2cbbOptions({
					uri: this.uri,
					sk: c.sk as string,
					nv: c.nv,
					noAllItem: toBool(c.noAllItam, true),
					sqlArgs: c.sqlArgs,
					onLoad: (_cols, rows) => {
						if (rows) {
							let ns = [];
							rows.forEach( (nv: NV, x) => ns.push(nv.n) )
							that.cbbOptions[c.field] = ns;
							that.cbbItems[c.field] = rows;
						}
					}
				  });
				  delete c.sk;
				}
				else console.warn("Combobox cell's option loading ignored for null sk: ", c);
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
	 * docde record value for display cell content - called by AgSelectCell for rendering.
	 * 
	 * @param field field name for finding NV records to decode. 
	 * @param v 
	 * @returns showing element
	 */
	decode(field: string, v: string): string | Element {
		let nvs = this.cbbItems[field];
		for (let i = 0; i < nvs?.length; i++)
			if (nvs[i].v === v)
				return nvs[i].n;
		return v;
	}

	encode(field: string, n: string): string | object {
		let nvs = this.cbbItems[field];
		if (!nvs) // plain text
			return n;

		for (let i = 0; i < nvs.length; i++)
			if (nvs[i].n === n)
				return nvs[i].v;
		return `[${n}]`; // [] for tagging the invalid data in database
	}

	onCellClick (e: CellClickedEvent) {
		this.currentRecId = e.data[this.pkval.pk];
	};

	updateCell(p: CellEditingStoppedEvent) {
		if (!this.client) {
			console.error("somthing wrong ...");
			return;
		}

		if (!this.pkval)
			throw Error("Default auto updating only works when PkMeta is provided. Eighter provid it or override updateCell(CellEditingStoppedEvent).");
		
		if (this.client instanceof Inseclient)
			throw Error("Spreadsheetir.updateCell is using port.update, and can only work in session mode. To use in session less mode, user need override this method or provide SheetCol.onEditStop.");

		let client = this.client;
		let pkv = p.data[this.pkval?.pk]
		let v   = p.data[p.colDef.field]

		let req = client.userReq(this.uri, 'update',
						new UpdateReq( this.uri, this.pkval.tabl, {pk: this.pkval.pk, v: pkv} )
						.nv(p.colDef.field, v) );

		client.commit(req, () => {}, this.errCtx);
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

/**Thin wrapper of ag-grid.
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
				
				if (col.type === 'cbb') {
					col.type = undefined; // 'agSelectEditor';
					col.cellEditor = 'agSelectCellEditor';
					// p type is any (May 2022):
					// https://www.ag-grid.com/react-data-grid/cell-editors/#reference-CellEditorSelectorResult-params
					col.cellEditorParams = (p: CbbCellValue) => {
						return { values: that.props.tier.cbbCellOptions(p) };
					  };
					col.cellRenderer = that.props.cbbCellRender || ((p: ICellRendererParams) => that.props.tier.decode(p.colDef.field, p.value))
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

		let that = this;
		this.tier.records(undefined, () => that.setState({}));
	}

	/** load default context menu, together with user's menu items.
	 * user's menu items defined in props like:
	 * {"qtype": {name: 'Format Answer', action}, ...}
	 * where the value of 'qtype' is the ag-gride context menu item:
	 * @deprecated context menu is a module of ag-grid enterprise.
	 */
	getContextMenuItems = ((para: GetContextMenuItemsParams) =>  {
		// cellval = param.value;
		debugger
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

// export function anIndicatorRenderer (param) {
// 	if (param.rowIndex === 0)
// 		return `<p style="line-height: 1.2em" >[avg] : ${param.value}</p>`;
// 	else return param.value;
// }

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
