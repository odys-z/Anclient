import React from 'react';
import PropTypes from "prop-types";

import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';

import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import { Overlay } from '../../patch/react-portal-overlay';

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';

// import { L, isEmpty, Protocol, AnContext, DatasetCombo, ConfirmDialog } from 'anclient';
// import { JQuiz } from '../../common/an-quiz.js';
import { L } from '../../utils/langstr';

/**Thin wrapper of ag-grid.
 * For ag-grid practice, go
 * https://stackblitz.com/edit/ag-grid-react-hello-world-8lxdjj?file=index.js
 * For public results, go
 * https://ag-grid-react-hello-world-8lxdjj.stackblitz.io
 *
 * Desgin Note: But is it possible handled by Semantic-DA?
 */
export class AgGridsheet extends React.Component {
	state = {
		dirty: false,

		rows: [{id: ''}]
	};

	coldefs = [];
	defaultColDef = {
		resizable: true, editable: true,
		singleClickEdit: true,
	};

	constructor(props) {
		super(props);

		props.stateHook.collect = function (me) {
			let that = me;
			return function(hookObj) {
				hookObj.rows = that.state.rows;
				hookObj.cols = that.coldefs;
			}; }(this);

		let {resizable, editable, singleClickEdit} = props.defaultCol || {};
		this.defaultColDef = Object.assign(
						this.defaultColDef,
						{resizable, editable, singleClickEdit});

		// columns = [{ field: 'id', label: '', hide: true }],
		if (props.columns) {
			props.columns.forEach( (c, x) => that.coldefs.push(
				Object.assign(
				  { headerName: '',
					field: 'not-null',
					width: 120,
					suppressSizeToFit: true,
					minWidth: 50,
					maxWidth: 200 },
				  c.thFormatter ? c.thFormatter () :
				  { headerName: c.label, ...c}
			) ) );
		}

	}

	/** load default context menu, together with user's menu items.
	 * user's menu items defined in props like:
	 * {"qtype": {name: 'Format Answer', action}, ...}
	 * where the value of 'qtype' is the ag-gride context menu item:
	 */
	getContextMenuItems = (para) =>  {
		// cellval = param.value;
		let result = [
			{ name: 'cell ' + params.value,
			  action: function () { } },
			'copy', 'paste', 'cut', 'delete'
			];
		if (props.contextMenu) {
			result.push('separator');
			for (let colname in props.contextMenu)
				if (colname === para.column.field)
					result.push(props.contextMenu[name]);
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

	onCellClicked = (p) => {
	};

	/** Grid event API:
	 * https://www.ag-grid.com/javascript-data-grid/grid-events/
	 */
	onEditStop = (p) => {
		// { "indId": "", "indName": "", "command": "b" }
		// console.log(p.data);
		// if (p.data.command === 'close')
		// 	that.setState({ open: false });
	}

	render () {
	  return (
		<AgGridReact
			onCellClicked={this.onCellClicked}
			columnDefs={this.coldefs}
			defaultColDef={this.defaultColDef}
			onCellEditingStopped={this.onEditStop}
			getContextMenuItems={getContextMenuItems}
			rowData={this.props.rows} >
		</AgGridReact> );
	}
}

AgGridsheet.propTypes = {
	columns: PropTypes.array.isRequired,
	rows: PropTypes.array.isRequired,
	stateHook: PropTypes.object.isRequired,
	contextMenu: PropTypes.object
};
