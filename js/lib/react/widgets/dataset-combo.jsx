
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

		selectedItem: undefined,
	}

	constructor(props) {
		super(props);
		// this.state.sk = props.sk;
		// this.state.uid = this.context.uuid();
		// this.state.nv = props.nv;
		this.state.combo.options = props.options;
		this.state.combo.label = props.label;
		//this.state.selectedItem = this.findOption(props.options, props.val) || props.options[0];
		this.state.initVal = props.val;

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
		// else if (this.state.combo.options && this.state.initVal != undefined) {
		// 	let selectedItem = findOption(this.state.combo.options, this.state.initVal);
		// 	this.setState(selectedItem);
		// }
	}

	onCbbRefChange( refcbb ) {
		let _ref = refcbb;
		let _that = this;
		let _cmb = this.state.combo;
		_cmb.ref = _ref;
		return (e, item) => {
			if (e) e.stopPropagation();
			// console.log('onCbbRefChange()', _cmb);
			let selectedItem = item ? item : AnConst.cbbAllItem;

			if (typeof _that.props.onSelect === 'function')
				_that.props.onSelect(selectedItem);
				
			_that.setState({selectedItem});
		};
	}

	render() {
		let cmb = this.state.combo
		let refcbb = React.createRef();
		/** Desgin Notes:
		 * SimpleForm's first render triggered this constructor and componentDidMount() been called, first.
		 * When it called render again when data been loaded in it's componentDidMount() (then render),
		 * this constructor and componentDidMount() won't be called.
		 * So here is necessary to check the initial selected value
		 */
		let selectedItem = this.state.selectedItem;
		if (!selectedItem && this.props.val != undefined) {
			selectedItem = findOption(this.state.combo.options, this.props.val);
			this.state.selectedItem = selectedItem;
		}
		let v = selectedItem ? selectedItem : AnConst.cbbAllItem;
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
			renderInput={(params) => <TextField {...params} label={v ? v.n : ''} variant="outlined" />}
		/>);

		function findOption (opts, v) {
			if (opts && v !== undefined) {
				for (let i = 0; i < opts.length; i++) {
					if (opts[i].v === v || opts[i].v === v.v)
						return opts[i];
				}
			}
		}
	}
}
DatasetCombo.contextType = AnContext;

DatasetCombo.propTypes = {
	uri: PropTypes.string.isRequired
};
