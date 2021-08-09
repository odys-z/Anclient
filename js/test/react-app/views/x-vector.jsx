
import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import { TextField } from '@material-ui/core';

// import { L } from '../../../lib/utils/langstr';
// import { CrudComp } from '../../../lib/react/crud'
// import { AnContext, AnError } from '../../../lib/react/reactext'
// import { AnTablist } from '../../../lib/react/widgets/table-list.jsx'
// import { AnQueryForm } from '../../../lib/react/widgets/query-form.jsx'
// import { AnsonResp } from '../../../lib/protocol';
import { L, AnContext, AnError,
	CrudComp, AnTablist, AnQueryForm,
	AnsonResp
} from 'anclient';

// const AnTablePagination = wrapTablePagination(TablePagination);
const styles = (theme) => ( {
	root: {
		"& :hover": {
			backgroundColor: '#777'
		}
	}
} );

class RolesComp extends CrudComp {

	state = {
		total: 0,
		pageInf: { page: 0, size: 25, total: 0 },
	};

	constructor(props) {
		super(props);
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
		const {cols, rows} = AnsonResp.rs2arr(resp.body[0].rs[0]);
		this.state.columns = cols;
		this.state.rows = rows;
	}

	render() {
		let args = {};
		const { classes } = this.props;
		return ( <>
			<AnQueryForm onSearch={this.toSearch}
				conds={[ this.state.condName, this.state.condOrg, this.state.condRole ]}
				query={ (q) => { return {
					uName: q.state.conds[0].val ? q.state.conds[0].val.v : undefined,
					orgId: q.state.conds[1].val ? q.state.conds[1].val.v : undefined,
					roleId: q.state.conds[2].val ? q.state.conds[2].val.v : undefined,
				}} }
			/>
			<AnTablist
				className={classes.root} checkbox= {true} pk= "vid"
				columns={[
					{ text: L('vid'), hide:true,field:"vid", color: 'primary', className: 'bold' },
					{ text: L('VALUE'), color: 'primary',field:"amount"},
					{ text: L('Identity'), color: 'primary',field:"person" },
					{ text: L('Year'), color: 'primary',field:"year" },
					{ text: L('Age'), color: 'primary', field:"age"},
					{ text: L('AAA'), color: 'primary',field:"dim4" },
					{ text: L('BBB'), color: 'primary',field:"dim5" },
					{ text: L('CCC'), color: 'primary',field:"dim6" }
				]}
				rows={this.state.rows} pk='roleId'
				pageInf={this.state.pageInf}
				sizeOptions={[5, 25, 50]}
				onPageInf={this.onPageInf}
			/>
		</>);
	}

	// render() {
	// 	let args = {};
	// 	const { classes } = this.props;
	// 	return ( <>
	// 		<AnQueryForm onSearch={this.toSearch}
	// 			conds={[ this.state.condName, this.state.condOrg, this.state.condRole ]}
	// 			query={ (q) => { return {
	// 				uName: q.state.conds[0].val ? q.state.conds[0].val.v : undefined,
	// 				orgId: q.state.conds[1].val ? q.state.conds[1].val.v : undefined,
	// 				roleId: q.state.conds[2].val ? q.state.conds[2].val.v : undefined,
	// 			}} }
	// 		/>
	// 		<AnTablist
	// 			className={classes.root} checkbox= {true} pk= "vid"
	// 			columns = {[
	// 				{ text: L('vid'), hide:true,field:"vid", color: 'primary', className: 'bold' },
	// 				{ text: L('VALUE'), color: 'primary',field:"amount"},
	// 				{ text: L('Identity'), color: 'primary',field:"person" },
	// 				{ text: L('Year'), color: 'primary',field:"year" },
	// 				{ text: L('Age'), color: 'primary', field:"age"},
	// 				{ text: L('AAA'), color: 'primary',field:"dim4" },
	// 				{ text: L('BBB'), color: 'primary',field:"dim5" },
	// 				{ text: L('CCC'), color: 'primary',field:"dim6" }
	// 			]}
	// 			rows = {this.state.rows}
	// 		/>
	// 		<AnTablePagination
	// 			count = {this.state.count}
	// 			onPageChange={this.handleChangePage}
	// 			onRowsPerPageChange={this.handleChangeRowsPerPage}
	// 			page={this.state.page}
	// 			rowsPerPage={this.state.rowsPerPage}
	// 			component="div"
	// 			rowsPerPageOptions={this.state.rowsPerPageOptions}
	// 		/>
	// 	</>);
	// }
}
RolesComp.contextType = AnContext;

const Roles = withStyles(styles)(RolesComp);
export { Roles, RolesComp }
