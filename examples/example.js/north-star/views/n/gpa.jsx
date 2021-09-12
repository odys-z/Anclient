import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from "prop-types";

import Typography from '@material-ui/core/Button';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Box';

import { AgGridColumn, AgGridReact } from 'ag-grid-react';

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';

import {
	L, isEmpty, Protocol, AnsonBody, AnsonResp,
	AnContext, DatasetCombo, ConfirmDialog, CrudComp,
	jsample, Overlay, AnGridsheet, AnNumericEdit, AnIndicatorRenderer
} from 'anclient';
const { JsampleIcons } = jsample;

const styles = (theme) => ({
	root: {
		height: "calc(100vh - 12ch)"
	},
	actionButton: {
	}
});

/**
 * Bind gpa recodrs to sheet.
 * First row is gpa average, not editable.
 * input: tire.rows, kids. kids: [{id, name, average}].
 *
 * For ag-grid practice, go
 * https://stackblitz.com/edit/ag-grid-react-hello-world-8lxdjj?file=index.js
 * For public results, go
 * https://ag-grid-react-hello-world-8lxdjj.stackblitz.io
 */
class GPAsheetComp extends CrudComp {
	state = {
		dirty: false,
		cols: [],
		rows: [],
	};

	constructor (props) {
		super(props);

		this.tier = new GPATier(this);

		this.bindSheet = this.bindSheet.bind(this);
		this.toAdd = this.toAdd.bind(this);
		this.alert = this.alert.bind(this);
		this.toSave = this.toSave.bind(this);

		this.changeLastDay = this.changeLastDay.bind(this);
		this.rowEditableChecker = this.rowEditableChecker.bind(this);
	}

	componentDidMount() {
		console.log(this.props.uri);

		this.tier.setContext(this.context);
		this.tier.records(null, this.bindSheet);
	}

	toAdd(e) {

		let newGday = new Date().toISOStr();
		// avoid duplicated key
		let found = false;
		let x = this.state.rows.length - 1;
		for (; x > 0; x-- )
			if (newGday === this.state.rows[x].gday) {
				found = true;
				break;
			}

		if (found) {
			try {
				let d = new Date(this.state.rows[this.state.rows.length - 1].gday.trim());
				newGday = d.addDays(1).toISOStr();
			} catch(e) {
				newGday = new Date().addDays(1).toISOStr();
			}
		}

		let r = Object.assign({}, this.avrow);
		r.gday = newGday;

		// using stat.rows all because data are handled at both client and server.
		this.state.rows.push(r);

		this.api.setRowData(this.state.rows);

		// force edit gday, so new rows always be saved
		// way: https://stackoverflow.com/a/54547055
		let rowIndex = this.state.rows.length - 1;
		let firstEditCol = this.columnApi.getAllDisplayedColumns()[0];
		this.api.ensureColumnVisible(firstEditCol );
		this.api.setFocusedCell(rowIndex, firstEditCol);
		this.api.startEditingCell({ rowIndex, colKey: 'gday' });
	}

	bindSheet(gpaResp) {
		// Why we have to handle data at both side?
		// can date been specified as columens? - won't work if not generated (for js)
		let resp = new GPAResp(gpaResp.Body());
		let { kids, cols, rows } = GPAResp.GPAs(resp);

		let ths = [{ field: 'gday', label: L('DATE'), width: 120,
					editable: this.rowEditableChecker,
					anEditStop: this.changeLastDay }];

		this.avrow = {gday: L('mean / median')}; // average row
		kids.filter( k => !!k )
			.forEach( (k, x) => {
				ths.push( {
					field: k.kid, label: k.userName, width: 120,
					cellEditor: 'anNumberEdit',
					editable: this.rowEditableChecker,
					cellEditorParams: {min: 0, max: 10},
					cellRenderer: AnIndicatorRenderer } );

				this.avrow[k.kid] = k.avg;
			});

		rows.unshift(this.avrow);

		// state.rows !== tier.rows
		this.setState( { cols: ths, rows, kids } );
	}

	alert(msg) {
		let that = this;
		this.confirm = (
			<ConfirmDialog title={L('Info')}
				ok={L('Ok')} cancel={false} open
				onClose={() => {that.confirm = undefined;} }
				msg={msg} />);
		this.setState({});
	}

	changeLastDay(p) {
		console.log(p);

		let rowIndex = this.state.rows.length - 1;
		// last gday is always editable
		if (p.node.rowIndex > 0 &&
			p.colDef.field === 'gday' && p.node.rowIndex === rowIndex) {

			let that = this;
			this.tier.updateRow( {
					uri: this.uri,
					oldGday: p.oldValue,
					gpaRow: p.data },
				e => {
					that.setState({})
				});
		}
	}

	rowEditableChecker(p) {
		if (p.node.rowIndex > 0 &&
			p.colDef.field === 'gday' && p.node.rowIndex === this.tier.rows.length - 1) // last gday
			// last gday is editable
			return true;
		else
			// first average not editable
			return p.node.rowIndex > 0;
	}

	toSave(e) {
		e.stopPropagation();
		let that = this;
	}

	render () {
		let that = this;
		let props = this.props;
		let {classes} = props;

		return (
		  <Box className={classes.root}>
			<div className="ag-theme-alpine" style={{height: "100%", width: "100%", margin: "auto"}}>
			{this.state.cols && this.state.cols.length &&
				<AnGridsheet
					rows={this.state.rows}
					columns={this.state.cols}
					components={ {
						anNumberEdit: AnNumericEdit,
					} }
					defaultColDef={ {
						editable: this.rowEditableChecker
					} }
					contextMenu={ {
						name: L('Show Chart [TODO]'),
						action: p => { console.log(p); }
					} }
					onGridReady={
						p => {
							that.api = p.api;
							that.columnApi = p.columnApi;
						}
					}
				/>}

				<div style={{textAlign: 'center', background: '#f8f8f8'}}>
					<Button variant="outlined"
						className={classes.usersButton}
						color='primary'
						onClick={this.toAdd}
						endIcon={<JsampleIcons.Add />}
					>{L('Add Row')}
					</Button>
				</div>
			</div>
			{this.confirm}
		  </Box>);
	}
}
GPAsheetComp.contextType = AnContext;

const GPAsheet = withStyles(styles)(GPAsheetComp);
export { GPAsheet, GPAsheetComp };

class GPATier {
	port = 'gpatier';
	client = undefined;
	uri = undefined;
	kids = [
		{name: 'Alice Zhou', id: 'alice'},
		{name: 'George Zhang', id: 'george'},
		{name: 'James Hu', id: 'james'},
	];
	rows = [{date: 'yyyy', alice: 3, george: 5, james: 5}];
	ths_ = [];

	constructor(comp) {
		this.uri = comp.uri || comp.props.uri;
	}

	setContext(context) {
		this.client = context.anClient;
		this.errCtx = context.error;
	}

	records(conds, onLoad) {
		if (!this.client) return;

		let client = this.client;
		let that = this;

		let req = client.userReq( this.uri, this.port,
					new GPAReq( this.uri, conds )
					.A(GPAReq.A.gpas) );

		client.commit(req, onLoad, this.errCtx);
	}

	updateRow(opts, onOk) {
		if (!this.client) return;
		let client = this.client;
		let that = this;
		let { uri, gpaRow, oldGday } = opts;

		let req = client.userReq(uri, this.port,
						new GPAReq( {uri, gpaRow, gday: oldGday } )
						.A(GPAReq.A.updateRow) );

		client.commit(req, onOk, this.errCtx);
	}

	updateCell(opts, onOk) {
		if (!this.client) return;
		let client = this.client;
		let that = this;
		let { uri, date, kid, gpa } = opts;

		let req = client.userReq(uri, this.port,
						new GPAReq( uri, { gpa, date, kid } )
						.A(GPAReq.A.update) );

		client.commit(req, onOk, this.errCtx);
	}

	/**
	 * @param {Set} ids record id
	 * @param {function} onOk: function(AnsonResp);
	 */
	del(opts, onOk) {
		if (!this.client) return;
		let client = this.client;
		let that = this;
		let { uri, ids } = opts;

		if (ids && ids.size > 0) {
			let req = this.client.userReq(uri, this.port,
				new GPAReq( uri, { deletings: [...ids] } )
				.A(GPAReq.A.del) );

			client.commit(req, onOk, this.errCtx);
		}
	}
}

class GPAResp extends AnsonResp {
	static type = 'io.oz.ever.conn.n.gpa.GPAResp';

	constructor(jsonbd) {
		super(jsonbd);

		this.gpas = jsonbd.gpas;
		this.kids = jsonbd.kids;
		this.cols = jsonbd.cols;
	}

	static GPAs(body) {
		let gpas = AnsonResp.rs2arr(body.gpas);
		let kids = AnsonResp.rs2arr(body.kids);
		return {kids: kids.rows, cols: gpas.cols, rows: gpas.rows};
	}
}

class GPAReq extends AnsonBody {
	static type = 'io.oz.ever.conn.n.gpa.GPAReq';
	static __init__ = function () {
		// Design Note:
		// can we use dynamic Protocol?
		Protocol.registerBody(GPAReq.type, (jsonBd) => {
			return new GPAReq(jsonBd);
		});
		// because resp arrived before register triggered
		Protocol.registerBody(GPAResp.type, (jsonBd) => {
			return new GPAResp(jsonBd);
		});
		return undefined;
	}();

	static A = {
		gpas: 'r/gpas',
		update: 'u',
		updateRow: 'u/row',
		insert: 'c',
		del: 'd',
	};

	constructor(opts) {
		super();

		this.type = GPAReq.type;

		this.gpaRow = opts.gpaRow;
		this.kid = opts.kid;
		this.gpa = opts.gpa;
		this.dgay = opts.dgay;
	}
}
