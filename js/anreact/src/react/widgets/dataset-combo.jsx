
import React from 'react';
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import withWidth from "@material-ui/core/withWidth";
// import clsx from 'clsx';
// import withWidth from "@material-ui/core/withWidth";
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';

import { Protocol, AnsonResp } from '@anclient/semantier';

import { L } from '../../utils/langstr';
	import { AnConst } from '../../utils/consts';
	import { AnContext } from '../reactext.jsx';
	import { Semantier } from '@anclient/semantier';


const styles = (theme) => (Object.assign(
	Semantier.invalidStyles, {
		root: {
		},
	} )
);

/**
 * Combobox automatically bind dataset, using AnContext.anClient.
 * Also can handling hard coded options.
 * @class DatasetCombo
 */
class DatasetComboComp extends React.Component {
	state = {
		// sk: undefined,
		combo: {val: undefined, options: []},

		selectedItem: undefined,
	}

	constructor(props) {
		super(props);
		this.state.combo.options = props.options;
		this.state.combo.label = props.label;
		this.state.initVal = props.val;

		if (this.props.sk && !this.props.uri)
			console.warn("DatasetCombo is configured as loading data with sk, but uri is undefined.")

		this.onCbbRefChange = this.onCbbRefChange.bind(this);
	}

	componentDidMount() {
		if (!this.context || !this.context.anReact)
			throw new Error('DatasetCombo can\'t bind controls without AnContext initialized with AnReact.');

		if (this.props.sk )
			this.context.anReact.ds2cbbOptions({
					uri: this.props.uri,
					sk: this.props.sk,
					// user uses this, e.g. name and value to access data
					nv: this.props.nv || {n: 'name', v: 'value'},
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
			let selectedItem = item ? item : AnConst.cbbAllItem;

			if (typeof _that.props.onSelect === 'function')
				_that.props.onSelect(selectedItem);

			_that.setState({selectedItem});
		};
	}

	render() {
		let cmb = this.state.combo
		let { classes } = this.props;

		let refcbb = React.createRef(); // FIXME why not this.refcbb?

		/** Desgin Notes:
		 * SimpleForm's first render triggered this constructor and componentDidMount() been called, first.
		 * When it called render again when data been loaded in it's componentDidMount() (then render),
		 * this constructor and componentDidMount() won't be called.
		 * So here is necessary to check the initial selected value.
		 * This shouldn't be an issue in semantier pattern?
		 */
		let selectedItem = this.state.selectedItem;
		if (!selectedItem && this.props.val != undefined) {
			selectedItem = findOption(this.state.combo.options, this.props.val);
			this.state.selectedItem = selectedItem;
		}
		let v = selectedItem ? selectedItem : AnConst.cbbAllItem;
		return (<Autocomplete
			ref={refcbb}
			onChange={ this.onCbbRefChange(refcbb) }
			// onInputChange={ this.onCbbRefChange(refcbb) }
			fullWidth size='small'
			options={cmb.options}
			style={ this.props.style }
			className={classes[this.props.invalidStyle || 'ok']}
			getOptionLabel={ (it) => it ? it.n || '' : '' }
			getOptionSelected={ (opt, v) => opt && v && opt.v === v.v }
			filter={ Autocomplete.caseInsensitiveFilter }
			renderInput={
				(params) => <TextField {...params}
					label={this.props.showLable && v ? v.n : ''}
					variant="outlined" /> }
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
DatasetComboComp.contextType = AnContext;

DatasetComboComp.propTypes = {
	uri: PropTypes.string
};

const DatasetCombo = withWidth()(withStyles(styles)(DatasetComboComp));
export { DatasetCombo, DatasetComboComp }
