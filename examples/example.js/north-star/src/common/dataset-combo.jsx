
import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import withWidth from "@material-ui/core/withWidth";
import { Grid, Card, Collapse, TextField, Button, Typography } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';

import { L, AnConst, Protocol, AnsonResp,
	 AnContext, AnError, CrudComp, AnQueryForm, AnTreeIcons, AnQueryFormComp
} from 'anclient'

import { StarIcons } from '../styles';

import { TreeCardDetails } from './treecard-details';

const styles = (theme) => ({
  root: {
	display: "flex",
	width: "100%",
  },
});

export
/**
 * Combobox automatically bind dataset, using AnContext.anClient.
 * Also can handling hard coded options.
 * @class DatasetCombo
 */
class DatasetCombo extends CrudComp {
	state = {
		// sk: undefined,
		combo: {val: undefined, options: []},

	}

	constructor(props) {
		super(props);
		// this.state.sk = props.sk;
		// this.state.uid = this.context.uuid();
		// this.state.nv = props.nv;
		this.state.combo.options = props.options;
		this.state.combo.label = props.label;

		this.onCbbRefChange = this.onCbbRefChange.bind(this);
	}

	componentDidMount() {
		if (!this.context || !this.context.anReact)
			throw new Error('DatasetCombo can\'t bind controls without AnContext initialized with AnReact.');

		if (this.state.sk )
			this.context.anReact.ds2cbbOptions({
					sk: this.props.sk,
					// user uses this, e.g. name and value to access data
					nv: this.props.nv,
					cond: this.state.combo
				},
				this.context.error, this);

	}

	onCbbRefChange( refcbb ) {
		let _ref = refcbb;
		let _that = this;
		let _cmb = this.state.combo;
		_cmb.ref = _ref;
		return (e, item) => {
			if (e) e.stopPropagation()
			// let cbb = _ref.current.getAttribute('name');
			// cbb = parseInt(cbb);
			// _cmb[cbb].val = item ? item : AnQueryFormComp.allItem;
			// _that.setState({combo: _that.state.cmb});
			_cmb.val = item ? item : AnConst.cbbAllItem;

			_that.setState({combo: _cmb});
		};
	}

	render() {
		let cmb = this.state.combo
		let refcbb = React.createRef();
		let v = cmb && cmb.val ? cmb.val : AnConst.cbbAllItem;
		return (<Autocomplete
			// key={sk + this.state.uid}
			// id={String(x)} name={String(x)}
			ref={refcbb}
			onChange={ this.onCbbRefChange(refcbb) }
			onInputChange={ this.onCbbRefChange(refcbb) }

			options={cmb.options}
			getOptionLabel={ (it) => it ? it.n || '' : '' }
			getOptionSelected={(opt, v) => opt && v && opt.v === v.v}
			filter={Autocomplete.caseInsensitiveFilter}
			// style={{ width: 300 }}
			renderInput={(params) => <TextField {...params} label={cmb.label} variant="outlined" />}
		/>);
	}
}
DatasetCombo.contextType = AnContext;
