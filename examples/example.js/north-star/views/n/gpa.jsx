import React from 'react';
import { withStyles } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';

import dateFormat from 'dateformat';

import { L,
	AnContext, ConfirmDialog, CrudComp,
	jsample, AnGridsheet, AnNumericEdit, AnIndicatorRenderer
} from '@anclient/anreact';
const { JsampleIcons } = jsample;

import { GPATier, GPAResp } from '../n-tsx/gpa-tier'

const styles = (theme) => ({
	root: {
		height: "calc(100vh - 18ch)"
	},
	actionButton: {
	},
	usersButton: {
		marginLeft: 20,
		marginRight: 20,
		marginTop: 6,
		width: 150,
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
		// this.toSave = this.toSave.bind(this);

		this.changeLastDay = this.changeLastDay.bind(this);
		this.rowEditableChecker = this.rowEditableChecker.bind(this);
		this.changeGPA = this.changeGPA.bind(this);
	}

	componentDidMount() {
		console.log(this.props.uri);

		this.tier.setContext(this.context);
		this.tier.records(null, this.bindSheet);
	}

	toAdd(e) {
		let newGday = dateFormat('yyyy-mm-dd'); //. new Date().toISOStr();
		// avoid duplicated key
		let found = false;
		let x = this.state.rows.length - 1;
		for (; x > 0; x-- )
			if (newGday === this.state.rows[x].gday) {
				found = true;
				break;
			}

		if (found) {
			/*
			try {
				let d = new Date(this.state.rows[this.state.rows.length - 1].gday.trim());
				newGday = d.addDays(1).toISOStr();
			} catch(e) {
				newGday = new Date().addDays(1).toISOStr();
			}
			*/
			try {
				let d = new Date(this.state.rows[this.state.rows.length - 1].gday.trim(), 'yyyy-mm-dd');
				newGday = dateFormat(addDays(d, 1), 'yyyy-mm-dd');
			} catch(e) {
				newGday = dateFormat(new Date().addDays(1), 'yyyy-mm-dd');
			}

		}

		let r = Object.assign({}, this.avrow);
		r.gday = newGday;

		// using stat.rows all because data are handled at both client and server.
		this.state.rows.push(r);
		this.state.addingNew = true;

		this.api.setRowData(this.state.rows);

		// force edit gday, so new rows always be saved
		// way: https://stackoverflow.com/a/54547055
		let rowIndex = this.state.rows.length - 1;
		let firstEditCol = this.columnApi.getAllDisplayedColumns()[0];
		this.api.ensureColumnVisible(firstEditCol );
		this.api.setFocusedCell(rowIndex, firstEditCol);
		this.api.startEditingCell({ rowIndex, colKey: 'gday' });
	}

	toDel(e) {
		let newGday = dateFormat('yyyy-mm-dd');
		console.log(newGday);
	}

	bindSheet(gpaResp) {
		// Why we have to handle data at both side?
		// can date been specified as columens? - won't work if not generated (for js)
		let resp = new GPAResp(gpaResp.Body());
		let { kids, cols, rows } = GPAResp.GPAs(resp);
		this.tier.rows = rows;

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
					anEditStop: this.changeGPA,
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
				ok={L('OK')} cancel={false} open
				onClose={() => {that.confirm = undefined;} }
				msg={msg} />);
		this.setState({});
	}

	changeLastDay(p) {
		let rowIndex = this.state.rows.length - 1;
		// last gday is always editable
		if (this.state.addingNew && p.node.rowIndex > 0 &&
			p.colDef.field === 'gday' && p.node.rowIndex === rowIndex) {

			let that = this;
			this.tier.updateRow( {
					uri: this.uri,
					oldGday: p.oldValue,
					gpaRow: p.data },
				e => {
					that.setState({addingNew: false})
				});
		}
		// else if (!this.state.addingNew && p.node.rowIndex > 0 &&
		// 	p.colDef.field === 'gday' && p.node.rowIndex === rowIndex) {

		// 	let that = this;
		// 	this.tier.updateGDay( {
		// 			uri: this.uri,
		// 			oldGday: p.oldValue,
		// 			newGday: p.value },
		// 		e => {
		// 			that.setState({addingNew: false})
		// 		});

		}
	}

	changeGPA(p) {
		console.log(p);

		let gday = p.data.gday;
		let kid = p.colDef.field;

		this.tier.updateCell( {
					uri: this.uri,
					gday, kid,
					gpa: p.value },
				e => { });
	}

	rowEditableChecker(p) {
		if (p.node.rowIndex > 0 &&
			p.colDef.field === 'gday' && p.node.rowIndex === this.tier.rows.length - 1) // last gday
			// last gday is editable
			return true;
		else
			// first average not editable
			return p.colDef.field !== 'gday' && p.node.rowIndex > 0;
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
					>{L('Add GPA')}
					</Button>
					<Button variant="outlined"
						className={classes.usersButton}
						color='secondary'
						onClick={this.toDel}
						endIcon={<JsampleIcons.Delete />}
					>{L('Delete GPA')}
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
