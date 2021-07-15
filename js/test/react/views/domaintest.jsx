
import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import { TextField } from '@material-ui/core';

import { CrudComp } from '../../../lib/frames/react/crud'
import { AnContext, AnError } from '../../../lib/frames/react/reactext'
import { AnTablist } from '../../../lib/frames/react/widgets/table-list.jsx'
import { AnQueryForm } from '../../../lib/frames/react/widgets/query-form.jsx'
import { AnsonResp } from '../../../lib/protocol';
import { L } from '../../../lib/frames/react/utils/langstr';
const styles = (theme) => ( {
	root: {
		"& :hover": {
			backgroundColor: '#777'
		}
	}
} );

class DomainComp extends CrudComp {
	state = {

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
			<AnQueryForm >
				<TextField />
			</AnQueryForm>
			<AnTablist className={classes.root} checkbox= {true} pk= "vid"
				columns = {[{ text: L('vid'), hide:true,field:"vid", color: 'primary', className: 'bold' },
				{ text: L('amount'), color: 'primary',field:"amount"},
				{ text: L('person'), color: 'primary',field:"person" },
				{ text: L('year'), color: 'primary',field:"year" },
				{ text: L('age'), color: 'primary', field:"age"},
				{ text: L('dim4'), color: 'primary',field:"dim4" },
				{ text: L('dim5'), color: 'primary',field:"dim5" },
				{ text: L('dim6'), color: 'primary',field:"dim6" }
			]}
			rows = {this.state.rows}
			/>
		</>);
	}
}
DomainComp.contextType = AnContext;

const Domain = withStyles(styles)(DomainComp);
export { Domain, DomainComp }
