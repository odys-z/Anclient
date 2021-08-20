import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TablePagination from '@material-ui/core/TablePagination';
import Checkbox from '@material-ui/core/Checkbox';

import { AnContext, AnError } from '../reactext';

import { toBool } from '../../utils/helpers';

const styles = (theme) => ( {
	root: {
	}
} );

/**
 * props:
 * 	{array} columns must need
 * 	{array}  rows  must need
 * 	{string} pk must need
 * 	{object} pageInf {page, size, total, sizeOptions}
 * 	{boolean} checkbox  - if true, first field alwasy been treaded as checkbox
 * 	{function} updateSelectd
 * 	{array} selected
 */
class AnTablistComp extends React.Component {

	state = {
		selected: [],

		sizeOptions:[10, 25, 50],
		total: 0,
		page: 0,
		size: 10,

		selected: []
	}

	constructor(props){
		super(props)

		let {sizeOptions} = props;
		if (sizeOptions)
			this.state.sizeOptions = sizeOptions;

		let {total, page, size} = props.pageInf || {};
		this.state.total = total || -1;
		this.state.page = page || 0;
		this.state.size = size || 25;

		this.isSelected = this.isSelected.bind(this);
		this.toSelectAll = this.toSelectAll.bind(this);

		this.changePage = this.changePage.bind(this);
		this.changeSize = this.changeSize.bind(this);
		this.handleClick = this.handleClick.bind(this);
		this.updateSelectd = this.updateSelectd.bind(this);

		this.th = this.th.bind(this);
		this.tr = this.tr.bind(this);
	}

	isSelected(name) {
		return this.state.selected.indexOf(name) !== -1;
	}

	handleClick(event, index) {
		let selected = [...this.state.selected];
		const selectedIndex = selected.indexOf(index);
		let newSelected = [];

		if (selectedIndex === -1) {
			newSelected = newSelected.concat(selected, index);
		}
		else if (selectedIndex === 0) {
			newSelected = newSelected.concat(selected.slice(1));
		}
		else if (selectedIndex === selected.length - 1) {
			newSelected = newSelected.concat(selected.slice(0, -1));
		}
		else if (selectedIndex > 0) {
			newSelected = newSelected.concat(
				selected.slice(0, selectedIndex),
				selected.slice(selectedIndex + 1),
			);
		}
		this.setState({ selected: newSelected });

		this.updateSelectd([ ...newSelected ]);
	};

	toSelectAll (event) {
		if (event.target.checked) {
			let key = this.props.pk;
			const newSelecteds = this.props.rows.map((n) => n[key]);
			this.setState({selected: newSelecteds});
			this.updateSelectd([ ...newSelecteds ]);
			return;
		}
		this.setState({ selected: [] });
		this.updateSelectd([]);
	};

	updateSelectd (arr) {
		if (typeof this.props.onSelectChange === 'function')
			this.props.onSelectChange(arr);
	}

	changePage(event, page) {
		this.setState({page});
		if (typeof this.props.onPageInf === 'function')
			this.props.onPageInf (this.state.page, this.state.size);
	}

	changeSize (event, s) {
		let size = parseInt(event.target.value, 10);
		this.setState({size});
		if (typeof this.props.onPageInf  === 'function')
			this.props.onPageInf (this.state.page, this.state.size);
	}

	/**
	 * Render table head.
	 * @param {array} [columns] table columns
	 * @returns [<TableCell>,...]
	 */
	th(columns = []) {
		return columns.filter( (v, x) => v.hide !== true
							|| this.props.checkbox && x !== 0) // first columen as checkbox
			.map( (colObj, index) =>
				<TableCell key={index}>
					{colObj.text || colObj.field}
				</TableCell>);
	}

	tr(rows = [], columns = []) {
		return rows.map(row => {
			let key = this.props.pk;

			if (this.props.checkbox && toBool(row.checked)) {
				this.state.selected.push(row[key])
				row.checked = 0; // later events don't need ths
			}
			let isItemSelected = this.isSelected(row[key]);

			return (
				<TableRow key= {row[this.props.pk]} hover
					selected={isItemSelected}
					onClick= { (event) => {
						this.handleClick(event, row[key]);
						if (typeof this.props.onSelectChange === 'function')
							this.props.onSelectChange(this.state.selected, row[key]);
					} }
					role="checkbox" aria-checked={isItemSelected}
				>
					{this.props.checkbox && (
						<TableCell component="th" scope="row" padding="checkbox">
							<Checkbox
								color="primary"
								checked ={isItemSelected}
							/>
						</TableCell>)
					}
					{columns.filter( (v, x) => v.hide !== true
									|| this.props.checkbox && x !== 0) // first columen as checkbox
							.map( (colObj, x) => {
								if (colObj.field === undefined)
									throw Error("Column field is required: " + JSON.stringify(colObj));
								let v = row[colObj.field];
								let cell = colObj.formatter && colObj.formatter(v, x, row);
								if (cell)
									cell = <TableCell key={colObj.field + x}>{cell}</TableCell>;
								return cell || <TableCell key={colObj.field + x}>{v}</TableCell>;
							} )}
				</TableRow>)
		});
	}

	render() {
		return (<>
		<TableContainer>
		<Table style={{width:"100%"}} aria-label="simple table">
			<TableHead>
				<TableRow>
					{ this.props.checkbox &&
						(<TableCell padding="checkbox" >
						  <Checkbox
							indeterminate={this.state.selected.length > 0 && this.state.selected.length < this.props.rows.length}
							checked={this.state.selected.length > 0 && this.state.selected.length === this.props.rows.length}
							color="primary"
							inputProps={{ 'aria-label': 'checkAll' }}
							onChange={this.toSelectAll}/>
						</TableCell>)
					}
					{this.th(this.props.columns)}
				</TableRow>
			</TableHead>
			<TableBody>
				{this.tr(this.props.rows, this.props.columns)}
			</TableBody>
		</Table>
		</TableContainer>
		{!!this.props.paging && <TablePagination
			count = {this.props.pageInf ? this.props.pageInf.total || 0 : 0}
			rowsPerPage={this.state.size}
			onPageChange={this.changePage}
			onRowsPerPageChange={this.changeSize}
			page={this.state.page}
			component="div"
			rowsPerPageOptions={this.state.sizeOptions}
		/>}
		</>);
	}
}

const AnTablist = withStyles(styles)(AnTablistComp);
export { AnTablist, AnTablistComp }
