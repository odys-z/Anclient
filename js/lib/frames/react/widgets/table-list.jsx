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

const styles = (theme) => ( {
	root: {
	}
} );
//import { AnContext } from '../reactext.jsx';
/**
 * props:
 * 	{array} columns must need
 * 	{array}  rows  must need
 * 	{string} pk must need
 * 	{boolean} checkbox
 * 	{function} updateSelectd 
 * 	{array} selected
 */
class AnTablistComp extends React.Component {

	state = {
		selected: []
	}

	constructor(props){
		super(props)

		this.isSelected = this.isSelected.bind(this);
		this.handleSelectAllClick = this.handleSelectAllClick.bind(this);
		//this.handleClick = this.handleClick.bind(this);
		//this.handleChangePage = this.handleChangePage.bind(this);
		//this.handleChangeRowsPerPage = this.handleChangeRowsPerPage.bind(this);

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
		  } else if (selectedIndex === 0) {
			newSelected = newSelected.concat(selected.slice(1));
		  } else if (selectedIndex === selected.length - 1) {
			newSelected = newSelected.concat(selected.slice(0, -1));
		  } else if (selectedIndex > 0) {
			newSelected = newSelected.concat(
			  selected.slice(0, selectedIndex),
			  selected.slice(selectedIndex + 1),
			);
		  }
		this.setState({selected:newSelected});
		this.updateSelectd([...newSelected]);
	};
	handleSelectAllClick = (event) => {
		if (event.target.checked) {
			let key = this.props.pk;
		  const newSelecteds = this.props.rows.map((n) => n[key]);
		  this.setState({selected:newSelecteds});
		  this.updateSelectd([...newSelecteds]);
		  return;
		}
		this.setState({selected:[]});
		this.updateSelectd([]);
	  };

	  updateSelectd(arr){
		if(typeof this.props.updateSelectd  === "function"){
			this.props.updateSelectd(arr);
		}
	  }
	/**
	 * 
	 * @param {array} columns table columns
	 * @returns [<TableCell>,...]
	 */
	th(columns) {
		
		return columns.filter( v => v.hide !== true).map( colObj => <TableCell>{colObj.text || colObj.field}</TableCell>)
		

	}

	tr(rows, colums) {
		//console.log(rows);
		
		return rows.map(row => this.renderRow(row,colums)) 
	}
	renderRow(row,columns){
		let key = this.props.pk;
		let isItemSelected = this.isSelected(row[key]);
		return (<TableRow key= {row[key]} hover  selected={isItemSelected} onClick= {(event) => this.handleClick(event, row[key])} role="checkbox" aria-checked={isItemSelected} >
			{this.props.checkbox && (<TableCell component="th" scope="row" padding="checkbox">		
					<Checkbox
						color="primary"
						checked ={isItemSelected}
					/>
			</TableCell>)
			}
			{columns.filter( v => v.hide !== true).map( colObj => <TableCell>{row[colObj.field]}</TableCell>)}
		</TableRow>)
	}

	
	static getDerivedStateFromProps(props, state){
		if(Array.isArray(props.selected)){
			return {selected:[...props.selected]}
		}
		
		return null;
	}
	render() {
		
		return (
		
			<TableContainer>
			<Table style={{width:"100%"}} aria-label="simple table">
			  <TableHead>
				<TableRow>
					{ 	
						this.props.checkbox && ( <TableCell padding="checkbox" ><Checkbox 
						indeterminate={this.state.selected.length > 0 && this.state.selected.length < this.props.rows.length}
						checked={this.state.selected.length > 0 && this.state.selected.length === this.props.rows.length}
						color="primary"
						inputProps={{ 'aria-label': 'checkAll' }}
						onChange={this.handleSelectAllClick}/></TableCell>)
					}
					{this.th(this.props.columns)}
			 		
				</TableRow>
			  </TableHead>
			  <TableBody>
				{
				this.tr(this.props.rows, this.props.columns)
				}
			  </TableBody>
			</Table>
			</TableContainer>)
			
		
	}
}
//AnTablistComp.contextType = AnContext;
class AnTablePagination extends React.Component {
	state = {
		page: 0,
		count: 10,
		rowsPerPage:5
	}
	constructor(props){
		super(props);
		this.handleChangePage =  this.handleChangePage.bind(this);
		this.handleChangeRowsPerPage =  this.handleChangeRowsPerPage.bind(this);
	}
	handleChangePage(event, newPage) {
		this.setState({page: newPage});
		//todo server page  newPage query
	}
	handleChangeRowsPerPage = (event) => {
		
		let rowsPerPage = parseInt(event.target.value, 10); 
		this.setState({rowsPerPage:rowsPerPage});
		this.setState({page:0})
		//todo server page  reload 
	  };
	render(){

		return(

			<TablePagination
				rowsPerPageOptions={[5, 20, 50]}
				component="div"
				count={this.state.count}
				rowsPerPage={this.rowsPerPage}
				page={this.state.page}
				onRowsPerPageChange = {this.handleChangeRowsPerPage}
				onChangePage = {this.handleChangePage} 
			/>
		)
	}
}
const AnTablist = withStyles(styles)(AnTablistComp);
export { AnTablist, AnTablistComp,AnTablePagination }
