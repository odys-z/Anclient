
import React from 'react';
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import withWidth from "@material-ui/core/withWidth";
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';

import { L } from '../../utils/langstr';
	import { Protocol, AnsonResp } from '../../protocol';
	import { AnConst } from '../../utils/consts';
	import { AnContext } from '../reactext.jsx';


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
class DatasetCombo extends React.Component {
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
					uri: this.props.uri,
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
			if (e) e.stopPropagation();
			// console.log('onCbbRefChange()', _cmb);
			_cmb.val = item ? item : AnConst.cbbAllItem;

			_that.setState({combo: _cmb});

			if (typeof _that.props.onSelect === 'function')
				_that.props.onSelect(_cmb.val);
		};
	}

	render() {
		let cmb = this.state.combo
		let refcbb = React.createRef();
		let v = cmb && cmb.val ? cmb.val : AnConst.cbbAllItem;
		console.log('render()', cmb);
		return (<Autocomplete
			// key={sk + this.state.uid}
			// id={String(x)} name={String(x)}
			ref={refcbb}
			onChange={ this.onCbbRefChange(refcbb) }
			// onInputChange={ this.onCbbRefChange(refcbb) }

			options={cmb.options}
			style={this.props.style}
			getOptionLabel={ (it) => it ? it.n || '' : '' }
			getOptionSelected={(opt, v) => opt && v && opt.v === v.v}
			filter={Autocomplete.caseInsensitiveFilter}
			renderInput={(params) => <TextField {...params} label={cmb.label} variant="outlined" />}
		/>);
	}
}
DatasetCombo.contextType = AnContext;

DatasetCombo.propTypes = {
	uri: PropTypes.string.isRequired
};
