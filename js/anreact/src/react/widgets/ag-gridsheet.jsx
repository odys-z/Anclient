import React from 'react';
import PropTypes from "prop-types";

import { AgGridReact } from 'ag-grid-react';

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';

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
export class AnGridsheet extends React.Component {
	state = {
		dirty: false,

		rows: [{id: ''}]
	};

	coldefs = [];
	defaultColDef = {
		resizable: true,
		editable: true,
		singleClickEdit: true,
		stopEditingWhenCellsLoseFocus: true,
	};

	editHandlers = {};

	constructor(props) {
		super(props);

		let {resizable, editable, singleClickEdit} = props.defaultColDef || {};
		this.defaultColDef = Object.assign(
						this.defaultColDef,
						{resizable, editable, singleClickEdit});

		// columns = [{ field: 'id', label: '', hide: true }],
		this.onEditStop = this.onEditStop.bind(this);
		let that = this;

		let coldefs = this.coldefs;
		if (props.columns) {
			props.columns.forEach( (c, x) =>  {
				let headerName = c.label;
				delete c.label;

				let anEditStop = c.anEditStop;
				if (anEditStop) {
					that.editHandlers[c.field] = anEditStop;
					delete c.anEditStop;
				}
				let width = 120;
				if (x === coldefs.length - 1)
					width = undefined;
				coldefs.push(
					Object.assign(
					  { headerName: '--',
						field: '--',
						suppressSizeToFit: true,
						resizable: true,
						editable: true,
						singleClickEdit: true,
						width,
						minWidth: 50 },
					  c.thFormatter ? c.thFormatter () :
						{ headerName, ...c}
					) )
			} );
		}
	}

	/** load default context menu, together with user's menu items.
	 * user's menu items defined in props like:
	 * {"qtype": {name: 'Format Answer', action}, ...}
	 * where the value of 'qtype' is the ag-gride context menu item:
	 * @deprecated context menu is a module of ag-grid enterprise.
	 */
	getContextMenuItems = (para) =>  {
		// cellval = param.value;
		debugger
		let result = [
			{ name: 'cell ' + params.value,
			  action: function () { } },
			'copy', 'paste', 'cut', 'delete'
			];
		if (props.contextMenu) {
			result.push('separator');
			for (let colname in props.contextMenu)
				if (colname === para.column.getColDef().field)
					result.push(props.contextMenu[colname]);
		}

		return result;
	}

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
	onGridReady = (params) => {
		this.gridApi = params.api;
		this.gridColumnApi = params.columnApi;

		params.api.sizeColumnsToFit();
	};

	onFirstDataRendered = (params) => {
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
	onCellClicked = (p) => {
		if (typeof this.props.onCellClicked === 'function')
			this.props.onCellClicked(p);
	};

	/** Grid event API:
	 * https://www.ag-grid.com/javascript-data-grid/grid-events/
	 */
	onEditStop (p) {
		// { "indId": "", "indName": "", "command": "b" }
		// console.log(p.data, p.value, p.data.qtype);
		// if (p.data.command === 'close')
		// 	that.setState({ open: false });

		if (typeof this.editHandlers[p.colDef.field] === 'function')
			this.editHandlers[p.colDef.field](p);
	}

	render () {
	  return (
		<AgGridReact
			editable={this.isEditable}
			onCellClicked={this.onCellClicked}
			columnDefs={this.coldefs}
			components={this.props.components}
			defaultColDef={this.defaultColDef}
			stopEditingWhenCellsLoseFocus={true}
			onCellEditingStopped={this.onEditStop}
			getContextMenuItems={this.getContextMenuItems}
			onGridReady={this.props.onGridReady}
			rowData={this.props.rows} >
		</AgGridReact> );
	}
}

AnGridsheet.propTypes = {
	columns: PropTypes.array.isRequired,
	rows: PropTypes.array.isRequired,
	// stateHook: PropTypes.object.isRequired,
	contextMenu: PropTypes.object,
	onCellClicked: PropTypes.func,
};

export function anMultiRowRenderer (param) {
	if (param.value)
		return `<p style="line-height: 1.2em" >${param.value.split('\n').join('<br/>')}</p>`;
}

export function AnIndicatorRenderer (param) {
	if (param.rowIndex === 0)
		return `<p style="line-height: 1.2em" >[avg] : ${param.value}</p>`;
	else return param.value;
}

// https://www.ag-grid.com/javascript-data-grid/component-cell-editor/#angular-cell-editing
export class AnNumericEdit {
  // gets called once before the renderer is used
  init(params) {
    // create the cell
    this.eInput = document.createElement('input');

    if (this.isCharNumeric(params.charPress)) {
      this.eInput.value = params.charPress;
    } else {
      if (params.value !== undefined && params.value !== null) {
        this.eInput.value = params.value;
      }
    }

    this.eInput.addEventListener('keypress', (event) => {
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

  isKeyPressedNavigation(event) {
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

  getCharCodeFromEvent(event) {
    event = event || window.event;
    return typeof event.which == 'undefined' ? event.keyCode : event.which;
  }

  isCharNumeric(charStr) {
    return !!/\d/.test(charStr);
  }

  isKeyPressedNumeric(event) {
    const charCode = this.getCharCodeFromEvent(event);
    const charStr = String.fromCharCode(charCode);
    return this.isCharNumeric(charStr);
  }
}
