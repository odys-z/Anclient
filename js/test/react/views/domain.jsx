
import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import { TextField } from '@material-ui/core';

import { CrudComp } from '../../../lib/frames/react/crud'
import { AnContext, AnError } from '../../../lib/frames/react/reactext'
import { AnTablist } from '../../../lib/frames/react/widgets/table-list.jsx'
import { AnQueryForm } from '../../../lib/frames/react/widgets/query-form.jsx'

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

		this.toSearch = this.toSearch.bind(this);
		this.toClearForm = this.toClearForm.bind(this);
	}

	toSearch(e, query) {
		console.log('Text', query.condTxt);
		console.log('Item value', query.condCbb);
	}

	toClearForm(e) {

	}

	render() {
		let args = {};
		const { classes } = this.props;
		return ( <>
			<AnQueryForm onSearch={this.toSearch} onClear={this.toClearForm}
				conds={[
					{ type: 'text', val: '', text: 'No', label: 'text condition (dynamic)'},
					{ type: 'cbb', val: '', options: [
						{n: 'first', v: 1}, {n: 'second', v: 2}, {n: 'third', v: 3} ],
					  label: 'auto complecte (dynamic)'},
				]}
				query={(q) => { return {condTxt: q.state.conds[0].val, condCbb: q.state.conds[1].val }} }
				>
				<TextField />
			</AnQueryForm>
			<AnTablist className={classes.root}
				t={'query'}
			/>
		</>);
	}
}
DomainComp.contextType = AnContext;

const Domain = withStyles(styles)(DomainComp);
export { Domain, DomainComp }
