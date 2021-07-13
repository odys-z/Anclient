import React from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import TablePagination from '@material-ui/core/TablePagination';
import Checkbox from '@material-ui/core/Checkbox';
//const Users = 
class TableList  extends React.Component {
	//contextType = AuthContext;
	constructor(props){
		super(props)
	}
	//table = "a_users"
	//field = ["userId","userName"]
	state = {
		selected:[],
		rows:[],
		page:0,
		pageinfo:{page:0,count:10,rowsPerPage}
	}
	handleChangePage(event, newPage){
		this.setState({page:newPage})
	}
	handleChangeRowsPerPage = (event) => {
		//setRowsPerPage(parseInt(event.target.value, 10));
		//setPage(0);
	  };
	render(){
		
		return (
			
		<Paper>
			<TableContainer>
			<Table style={{width:"100%"}} aria-label="simple table">
			  <TableHead>
				<TableRow>
					<TableCell><Checkbox
						color="primary"
						inputProps={{ 'aria-label': 'checkAll' }}
					/></TableCell>											
				  <TableCell>userId</TableCell>
				  <TableCell>userName</TableCell>
				</TableRow>
			  </TableHead>
			  <TableBody>
				{this.state.rows.map((row) => {
					const isItemSelected = this.isSelected(row.userId);
				  //console.log(isItemSelected);
				  return(<TableRow key={row.userId} hover  onClick= {(event) => this.handleClick(event, row.userId)} role="checkbox" aria-checked={isItemSelected} >
					<TableCell component="th" scope="row">		
					<Checkbox
						color="primary"
						checked ={isItemSelected}
					/>
					</TableCell>
					<TableCell>{row.userId}</TableCell>
					<TableCell >{row.userName}</TableCell>
					
				  </TableRow>)
				  })}
			  </TableBody>
			</Table>
		  </TableContainer>
		   <TablePagination
		   rowsPerPageOptions={[5, 10, 25]}
		   component="div"
		   count={10}
		   rowsPerPage={5}
		   page={this.state.page}
		   onPageChange = {(event,newPage)=>this.handleChangePage(event,newPage)}
		  // onRowsPerPageChange= ()
		 />
		 </Paper>
		)
	}
	isSelected = (name) => this.state.selected.indexOf(name) !== -1;

	handleClick = (event, index) => {
		let selected = this.state.selected;
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
	  };
	
	}

	export {TableList}