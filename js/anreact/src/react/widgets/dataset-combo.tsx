
import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import withWidth from "@material-ui/core/withWidth";
import TextField from '@material-ui/core/TextField';
import Autocomplete, { AutocompleteClassKey } from '@material-ui/lab/Autocomplete';
import { AnlistColAttrs, InvalidClassNames } from '@anclient/semantier-st';

import { AnConst } from '../../utils/consts';
import { AnContext, AnContextType } from '../reactext';
import { Comprops, CrudCompW } from '../crud';
import { CSSProperties } from '@material-ui/styles';
import { CompOpts, invalidStyles } from '../anreact';

/**E.g. form's combobox field declaration */
export interface TierComboField extends AnlistColAttrs<JSX.Element, CompOpts> {
	type: string;
    className: undefined | "root" | InvalidClassNames | AutocompleteClassKey;
	nv: {n: string; v: string};
	sk: string;

    options?: [];
}

const styles = (theme) => (Object.assign(
	invalidStyles, {
		root: {
		},
	} )
);

/**
 * Combobox automatically bind dataset, using AnContext.anClient.
 * Also can handling hard coded options.
 * @class DatasetCombo
 */
class DatasetComboComp extends CrudCompW<Comprops> {
	state = {
		// sk: undefined,
		combo: {label: undefined, val: undefined, initVal: undefined, ref: undefined, options: []},

		selectedItem: undefined,
	}
	refcbb = React.createRef();

	constructor(props: Comprops) {
		super(props);
		this.state.combo.options = props.options;
		this.state.combo.label = props.label;
		this.state.combo.initVal = props.val;

		if (this.props.sk && !this.props.uri)
			console.warn("DatasetCombo is configured as loading data with sk, but uri is undefined.")

		this.onCbbRefChange = this.onCbbRefChange.bind(this);
	}

	componentDidMount() {
		let ctx = this.context as unknown as AnContextType;
		if (!ctx?.anReact)
			throw new Error('DatasetCombo can\'t bind controls without AnContext initialized with AnReact.');

		if (this.props.sk ) {
			let that = this;
			ctx.anReact.ds2cbbOptions({
					uri: this.props.uri,
					sk: this.props.sk,
					// user uses this, e.g. name and value to access data
					nv: this.props.nv || {n: 'name', v: 'value'},
					cond: this.state.combo,
					onDone: () => that.setState({})
				},
				ctx.error, this);
		}
	}

	onCbbRefChange( ) {
		let _ref = this.refcbb;
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

		// let refcbb = React.createRef(); // FIXME why not this.refcbb?

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
		// avoid set defaultValue before loaded
		return (
		  this.props.sk && !cmb.options ? <></> :
		  <Autocomplete
			ref={this.refcbb}
			disabled={this.props.disabled || this.props.readonly || this.props.readOnly}
			// defaultValue={this.props.val}
			value={v}
			onChange={ this.onCbbRefChange() }
			// onInputChange={ this.onCbbRefChange(refcbb) }
			fullWidth size='small'
			options={cmb.options}
			style={this.props.style}
			className={classes[this.props.invalidStyle || 'ok']}
			getOptionLabel={ (it) => it ? it.n || '' : '' }
			getOptionSelected={ (opt, v) => opt && v && opt.v === v.v }
			// filter={Autocomplete.caseInsensitiveFilter}
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

const DatasetCombo = withStyles<any, any, Comprops>(styles)(withWidth()(DatasetComboComp));
export { DatasetCombo, DatasetComboComp }
