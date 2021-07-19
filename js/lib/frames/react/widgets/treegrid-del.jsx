import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { withStyles } from "@material-ui/core/styles";

import MaterialTable from 'material-table'
import TablePagination from '@material-ui/core/TablePagination';

const styles = (theme) => ( {
} );

class AnTreegridComp extends Component {
	state = {
		pageInf: {size: 25, page: 0, total: 0},
		sizeOptions: {}
	}

	render() {
		return (
		<div >
			<MaterialTable
				columns={[
					{ title: 'Adı', field: 'name' },
					{ title: 'Soyadı', field: 'surname' },
					{ title: 'Doğum Yılı', field: 'birthYear', type: 'numeric' },
					{ title: 'Doğum Yeri', field: 'birthCity', lookup: { 34: 'İstanbul', 63: 'Şanlıurfa' } }
				]}
				data={[{ name: 'Mehmet', surname: 'Baran', birthYear: 1987, birthCity: 63 }]}
				title="Demo Title"
				paging={false}
			/>
			<TablePagination
				count = {this.state.pageInf.total}
				onPageChange={this.changePage}
				onRowsPerPageChange={this.changeSize}
				page={this.state.pageInf.page}
				rowsPerPage={this.state.pageInf.size}
				component="div"
				rowsPerPageOptions={this.state.sizeOptions}
			/>
			</div>
		)
	}
}
const AnTreegrid = withStyles(styles)(AnTreegridComp);
export { AnTreegrid, AnTreegridComp }
