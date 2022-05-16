import React from 'react';
import { withStyles } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';

import dateFormat from 'dateformat';

import { L,
	AnContext, ConfirmDialog, CrudComp,
	jsample, AnGridsheet, AnNumericEdit, AnIndicatorRenderer, addDays
} from '@anclient/anreact';
const { JsampleIcons } = jsample;

import { GPATier, GPAResp, GPARec } from '../n-tsx/gpa-tier'

const styles = (_theme) => ({
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
class GPAsheetComp extends CrudComp<any> {
	state = {
        addingNew: false,
		dirty: false,
		cols: [],
		rows: [],
	};

    tier: GPATier;
    api: any;
    columnApi: any;
    confirm: JSX.Element;
    currentId: any;

    avrow: GPARec;

	constructor (props) {
		super(props);

		this.tier = new GPATier(this);

		this.bindSheet = this.bindSheet.bind(this);
		this.toAdd = this.toAdd.bind(this);
		this.toDel = this.toDel.bind(this);
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
			try {
				let d = new Date(this.state.rows[this.state.rows.length - 1].gday.trim());
				newGday = dateFormat(addDays(d, 1), 'yyyy-mm-dd');
			} catch(e) {
				newGday = dateFormat(addDays(new Date(), 1), 'yyyy-mm-dd');
			}
		}

		let r = Object.assign({}, this.avrow) as GPARec;
		r.gday = newGday;

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

    // avrow(arg0: {}, avrow: any) : GPARec {
    //     throw new Error('Method not implemented.');
    // }

	toDel(e) {
		let that = this;
		if (this.currentId)
			this.tier.del({ids: [this.currentId]}, (resp) => {
				that.tier.records(null, that.bindSheet);
			});
	}

	bindSheet(gpaResp) {
		// Why we have to handle data at both side?
		// can date been specified as columens? - won't work if not generated (for js)
		let resp = new GPAResp(gpaResp.Body());
		let { kids, cols, rows } = GPAResp.GPAs(resp);
		this.tier.rows = rows;

		let ths = [{width: 120, cellEditor: undefined,
                    cellEditorParams: undefined,
                    field: 'gday', label: L('DATE'),
					editable: this.rowEditableChecker,
					anEditStop: this.changeLastDay,
                    cellRenderer: undefined }];

		this.avrow = {gday: L('mean')}; // average row
		kids.filter( k => !!k )
			.forEach( (k, x) => {
				ths.push( {
                    width: 120,
					field: k.kid as string, label: k.userName as string,
					cellEditor: 'anNumberEdit',
					editable: this.rowEditableChecker,
					anEditStop: this.changeGPA,
					cellEditorParams: {min: 0, max: 10},
					cellRenderer: AnIndicatorRenderer } );

				this.avrow[k.kid as string] = k.avg as string;
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
		else if (!this.state.addingNew && p.node.rowIndex > 0 &&
			p.colDef.field === 'gday' && p.node.rowIndex === rowIndex &&
			p.oldValue !== p.value ) {

			let that = this;
			this.tier.changeDay( {
					uri: this.uri,
					oldGday: p.oldValue,
					newGday: p.value },
				e => {
					that.setState({addingNew: false})
				});
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
					onCellClicked={
						(p) => {
							if (p.data && p.data.gday)
								that.currentId = p.data.gday;
						}
					}
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
