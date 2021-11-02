import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import PropTypes from "prop-types";

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
		sizeOptions:[10, 25, 50],
		total: 0,
		page: 0,
		size: 10,

		selected: undefined
	}

	constructor(props){
		super(props)

		let {sizeOptions, selectedIds} = props;
		this.state.selected = selectedIds.Ids || selectedIds.ids;
		if (!this.state.selected || this.state.selected.constructor.name !== 'Set')
			throw Error("selectedIds.Ids must be a set");
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

	componentDidMount() {
	}

	isSelected(k) {
		return this.state.selected.has(k);
	}

	handleClick(event, newSelct) {
		let selected = this.state.selected;
		if (this.props.singleCheck) {
			selected.clear();
			selected.add(newSelct);
		}
		else {
			if (selected.has(newSelct)) {
				selected.delete(newSelct);
			}
			else selected.add(newSelct);
		}

		this.setState({});
		this.updateSelectd(selected);
	};

	toSelectAll (event) {
		let ids = this.props.selectedIds.Ids || this.props.selectedIds.ids;
		if (event.target.checked) {
			this.props.rows.forEach((r) => ids.add(r[this.props.pk]));
			this.updateSelectd(ids);
		}
		else {
			ids.clear();
			this.setState({});
			this.updateSelectd(ids);
		}
	};

	updateSelectd (set) {
		if (typeof this.props.onSelectChange === 'function')
			this.props.onSelectChange([...set]);
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
		// return columns.filter( (v, x) => !toBool(v.hide)
		// 					|| this.props.checkbox && x !== 0) // first columen as checkbox
		return columns.filter( (v, x) => toBool(v.hide) ? false
							: !(this.props.checkbox && x === 0)) // first columen as checkbox
			.map( (colObj, index) =>
				<TableCell key={index}>
					{/* {colObj.text || colObj.field} */}
					{colObj.label || colObj.text || colObj.field}
				</TableCell>);
	}

	tr(rows = [], columns = []) {
		return rows.map(row => {
			let pkv = typeof this.props.pk === 'string' ? row[this.props.pk]
					: row[this.props.pk.field];

			if (this.props.checkbox && toBool(row.checked)) {
				this.state.selected.add(pkv)
				row.checked = 0; // later events don't need ths
			}
			let isItemSelected = this.isSelected(pkv);

			return (
				<TableRow key= {row[this.props.pk]} hover
					selected={isItemSelected}
					onClick= { (event) => {
						this.handleClick(event, pkv);
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
					{columns.filter( (v, x) => !toBool(v.hide)
									&& (!this.props.checkbox || x !== 0)) // first columen as checkbox
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
						  <Checkbox ref={ref => (this.checkAllBox = ref)}
							indeterminate={this.state.selected.size > 0 && this.state.selected.size < this.props.rows.length}
							checked={this.state.selected.size > 0 && this.state.selected.size === this.props.rows.length}
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
AnTablistComp.propTypes = {
	pk: PropTypes.string.isRequired,
	selectedIds: PropTypes.object.isRequired,
	onSelectChange: PropTypes.func
};

const AnTablist = withStyles(styles)(AnTablistComp);
export { AnTablist, AnTablistComp }
