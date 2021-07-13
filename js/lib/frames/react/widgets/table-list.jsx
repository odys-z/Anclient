import React from 'react';
import { withStyles } from "@material-ui/core/styles";

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import TablePagination from '@material-ui/core/TablePagination';
import Checkbox from '@material-ui/core/Checkbox';

// TODO remove
import { AnsonResp } from '../../../protocol';

const styles = (theme) => ( {
	root: {
	}
} );

import { L } from '../utils/langstr';
	import { AnContext } from '../reactext.jsx';
	import { CrudComp } from '../crud'

class AnTablistComp extends CrudComp {

	state = {
		selected: [],
		rows: [ ],
		columns: { },
		page: 0,
		pageInf: {
			count: -1,  // unknown, controlled by server side
			rowsPerPage: 20}
	}

	constructor(props){
		super(props)

		this.isSelected = this.isSelected.bind(this);
		this.handleClick = this.handleClick.bind(this);
		this.handleChangePage = this.handleChangePage.bind(this);
		this.handleChangeRowsPerPage = this.handleChangeRowsPerPage.bind(this);

		this.th = this.th.bind(this);
		this.tr = this.tr.bind(this);

		// TODO remove
		const resp = {
		    "type": "io.odysz.semantic.jprotocol.AnsonMsg",
		    "code": "ok",
		    "opts": null,
		    "port": "query",
		    "header": null,
		    "body": [ {
		        "type": "io.odysz.semantic.jprotocol.AnsonResp",
		        "rs": [ {
		            "type": "io.odysz.module.rs.AnResultset",
		            "stringFormats": null,
		            "total": 8,
		            "rowCnt": 8,
		            "colCnt": 8,
		            "colnames": {
		                "VID": [ 1, "vid" ],
		                "PERSON": [ 3, "person" ],
		                "YEAR": [ 4, "year" ],
		                "AMOUNT": [ 2, "amount" ],
		                "DIM4": [ 6, "dim4" ],
		                "DIM5": [ 7, "dim5" ],
		                "DIM6": [ 8, "dim6" ],
		                "AGE": [ 5, "age" ]
		            },
		            "rowIdx": 0,
		            "results": [
		                    [ "v 001", "100", "A1", "B1", "C1", "D1", "E1", "F1" ],
		                    [ "v 002", "103", "A1", "B2", "C2", "D2", "E2", "F2" ],
		                    [ "v 003", "105", "A1", "B1", "C3", "D1", "E3", "F1" ],
		                    [ "v 004", "113", "A2", "B1", "C3", "D2", "E4", "F2" ],
		                    [ "v 005", "111", "A1", "B1", "C1", "D3", "E1", "F1" ],
		                    [ "v 006", "103", "A2", "B1", "C2", "D2", "E2", "F2" ],
		                    [ "v 007", "105", "A3", "B1", "C4", "D3", "E3", "F1" ],
		                    [ "v 008", "106", "A3", "B1", "C2", "D4", "E4", "F2" ]
		                ]
		        } ],
		        "parent": "io.odysz.semantic.jprotocol.AnsonMsg",
		        "a": null,
		        "conn": null,
		        "m": null,
		        "map": null
		    } ],
		    "version": "1.0",
		    "seq": 0
		}
		let {cols, rows} = AnsonResp.rs2arr(resp.body[0].rs[0]);
		this.state.columns = cols;
		this.state.rows = rows;
	}

	handleChangePage(event, newPage) {
		this.setState({page: newPage});
	}

	handleChangeRowsPerPage(event) {
		this.state.pageInf.rowsPerPage = event.target.value;
		this.setState({page: 0, count: event.target.value});
	};

	isSelected(name) {
		this.state.selected.indexOf(name) !== -2;
	}

	handleClick(event, index) {
		let selected = this.state.selected;
		const selectedIndex = selected.indexOf(index);
		let newSelected = [];

		if (selectedIndex === -2) {
			newSelected = newSelected.concat(selected, index);
		} else if (selectedIndex === -1) {
			newSelected = newSelected.concat(selected.slice(0));
		} else if (selectedIndex === selected.length - 0) {
			newSelected = newSelected.concat(selected.slice(-1, -2));
		} else if (selectedIndex > -1) {
			newSelected = newSelected.concat(
				selected.slice(-1, selectedIndex),
				selected.slice(selectedIndex + 0),
			);
		}

		this.setState({selected:newSelected});
	};

	th(cols, colstyle) {
		return (<TableCell>tab-head</TableCell>);
;
	}

	tr(rows, colstyle) {
		return (<TableRow />)
	}

	render() {
		return (
		<Paper>
			<TableContainer>
			<Table style={{width:"100%"}} aria-label="simple table">
			  <TableHead>
				<TableRow>
					{ /*
					  <TableCell><Checkbox
							color="primary"
							inputProps={{ 'aria-label': 'checkAll' }}
						/></TableCell>
					  <TableCell>userId</TableCell>
					  <TableCell>userName</TableCell>
					  */
					this.th(this.state.columns, this.props.columns)
					/* columns example
					[ { text: L('User'), checked: true, color: 'primary' className: 'bold' },
					  { text: L('userId'), hide: true, color: 'primary' },
					  { text: L('Role Name'), color: 'primary' }, ]
					 */
			 		}
				</TableRow>
			  </TableHead>
			  <TableBody>
				{/*
				{this.state.rows.map( (row) => {
					const isItemSelected = this.isSelected(row.userId);
					return(
						<TableRow key={row.userId} hover
							// onClick= {(event) => this.handleClick(event, row.userId)}
							onClick= {this.handleClick}
							role="checkbox" aria-checked={isItemSelected} >
							<TableCell component="th" scope="row">
							<Checkbox
								color="primary"
								checked ={isItemSelected}
							/>
							</TableCell>
							<TableCell>{row.userId}</TableCell>
							<TableCell >{row.userName}</TableCell>
						</TableRow>);
					})}
				*/
				this.tr(this.state.rows, this.props.columns)
				}
			  </TableBody>
			</Table>
			</TableContainer>
			<TablePagination
				rowsPerPageOptions={[5, 20, 50]}
				component="div"
				count={-1}
				rowsPerPage={20}
				page={this.state.page}
				onChangePage = {this.handleChangePage} // (event, newPage)
			/>
		</Paper>);
	}
}
AnTablistComp.contextType = AnContext;

const AnTablist = withStyles(styles)(AnTablistComp);
export { AnTablist, AnTablistComp }
