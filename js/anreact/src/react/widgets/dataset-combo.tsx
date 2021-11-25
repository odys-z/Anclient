
import React from 'react';
import { Theme, withStyles } from "@material-ui/core/styles";
import withWidth from "@material-ui/core/withWidth";
import TextField from '@material-ui/core/TextField';
import Autocomplete, { AutocompleteClassKey } from '@material-ui/lab/Autocomplete';
import { AutocompleteChangeDetails, AutocompleteChangeReason, AutocompleteInputChangeReason, Value
} from '@material-ui/lab/useAutocomplete/useAutocomplete';

import { AnlistColAttrs, AnsonMsg, AnsonResp, InvalidClassNames, NV, OnLoadOk } from '@anclient/semantier-st';
import { AnConst } from '../../utils/consts';
import { AnContext, AnContextType } from '../reactext';
import { Comprops, CrudCompW } from '../crud';
import { AnReactExt, CompOpts, invalidStyles } from '../anreact';

export interface ComboItem {n: string, v: string};

/**E.g. form's combobox field declaration */
export interface TierComboField extends AnlistColAttrs<JSX.Element, CompOpts> {
	type: string;
    className: undefined | "root" | InvalidClassNames | AutocompleteClassKey;
	nv: {n: string; v: string};
	sk: string;

    options?: Array<ComboItem>;
}

export interface ComboProps extends Comprops {
	/**Intial options (default values), will be replaced after data binding with field's options */
	options?: Array<ComboItem>;
}

const styles = (theme: Theme) => (Object.assign(
	invalidStyles, {
		root: {}
	} )
);

/**
 * Combobox automatically bind dataset, using AnContext.anClient.
 * Also can handling hard coded options.
 * @class DatasetCombo
 */
class DatasetComboComp extends CrudCompW<ComboProps> {
	state = {
		// sk: undefined,
		// combo: {label: undefined, val: undefined, initVal: undefined, ref: undefined, options: []},
		// options: [] as Array<ComboItem>,


		selectedItem: undefined,
	};

	combo = {
		options: undefined as Array<ComboItem>,
		loading: false,
		// initVal: undefined
	};

	refcbb = React.createRef<HTMLDivElement>();
	loading = false;
	items: NV[];

	constructor(props: ComboProps) {
		super(props);
		this.combo.options = props.options;
		// this.state.combo.label = props.label;
		// this.combo.initVal = props.val;

		if (this.props.sk && !this.props.uri)
			console.warn("DatasetCombo is configured as loading data with sk, but uri is undefined.")

		this.onCbbRefChange = this.onCbbRefChange.bind(this);
	}

	componentDidMount() {
		let ctx = this.context as unknown as AnContextType;
		let anreact = ctx?.anReact as AnReactExt;
		if (!anreact)
			throw new Error('DatasetCombo can\'t bind controls without AnContext initialized with AnReact.');

		if (this.props.sk ) {
			let that = this;
			this.ds2cbbOptions({
				uri: this.props.uri,
				sk: this.props.sk,
				// user uses this, e.g. name and value to access data
				nv: this.props.nv || {n: 'name', v: 'value'},
				// cond: this.state.condits, TODO: not used?
				onDone: (cols, rows) => {
					that.combo.options = rows as Array<ComboItem>;
					that.setState({});
				}
			});
		}
	}

	onCbbRefChange( refcbb: React.RefObject<HTMLDivElement> ) : (
			event: React.ChangeEvent<{}>,
			value: Value<ComboItem, boolean, boolean, boolean>,
			reason: AutocompleteChangeReason | AutocompleteInputChangeReason,
			details?: AutocompleteChangeDetails<ComboItem>
	) => void {
		let _ref = refcbb;
		let _that = this;
		// let _cmb = this.state.combo;
		// _cmb.ref = _ref;
		return (e, item) => {
			if (e) e.stopPropagation();
			let selectedItem = item ? item : AnConst.cbbAllItem;

			if (typeof _that.props.onSelect === 'function')
				_that.props.onSelect(selectedItem);

			_that.setState({selectedItem});
		};
	}

	render() {
		// let cmb = this.state.combo
		let { classes, val } = this.props;

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
			selectedItem = findOption(this.combo.options || this.props.options, val);
			this.state.selectedItem = selectedItem;
		}
		let v = selectedItem ? selectedItem : AnConst.cbbAllItem;
		// avoid set defaultValue before loaded
		return (
		  this.props.sk && !this.props.options ? <></> :
		  <Autocomplete<ComboItem>
			ref={this.refcbb}
			disabled={this.props.disabled || this.props.readonly || this.props.readOnly}
			// defaultValue={this.props.val}
			value={v}
			onChange={ this.onCbbRefChange(this.refcbb) }
			// onInputChange={ this.onCbbRefChange(refcbb) }
			fullWidth size='small'
			options={this.combo.options}
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

	/**Bind dataset to combobox options (comp.state.condCbb).
	 * Option object is defined by opts.nv.
	 *
	 * <h6>About React Rendering Events</h6>
	 * This method will update opts.cond.loading and clean.
	 * When success, set loading false, clean true. this 2 flags are helper for
	 * handling react rendering / data-loading events asynchronously.
	 *
	 * <p> See AnQueryFormComp.componentDidMount() for example. </p>
	 *
	 * @param opts options
	 * @param opts.sk semantic key (dataset id)
	 * @param opts.cond the component's state.conds[#] of which the options need to be updated
	 * @param opts.nv {n: 'name', v: 'value'} option's name and value, e.g. {n: 'domainName', v: 'domainId'}
	 * @param opts.onDone on done event's handler: function f(cond)
	 * @param opts.onAll no 'ALL' otion item
	 * @param errCtx error handling context
	 * @return this
	 */
	public ds2cbbOptions(opts: { uri: string; sk: string; sqlArgs?: string[];
						nv: NV;
						//cond?: {loading: boolean, options: NV[], clean: boolean};
						onDone: OnLoadOk;
						/**don't add "-- ALL --" item */
						noAllItem?: boolean; } ): DatasetComboComp {
		let {uri, sk, sqlArgs, nv, onDone, noAllItem} = opts;
		if (!uri)
			throw Error('Since v0.9.50, uri is needed to access jserv.');

		nv = nv || {n: 'name', v: 'value'};

		// cond.loading = true;
		this.loading = true;

		let ctx = this.context as unknown as AnContextType;
		let an = ctx.anReact as AnReactExt;
		an.dataset( { port: 'dataset', uri, sqlArgs, sk },
			(dsResp: AnsonMsg<AnsonResp>) => {
				let rs = dsResp.Body().Rs();
				if (nv.n && !AnsonResp.hasColumn(rs, nv.n))
					console.error("Can't find data in rs for option label. column: 'name'.",
						"Must provide nv with data fileds name when using ds2cbbOtpions(), e.g. opts.nv = {n: 'labelFiled', v: 'valueFiled'}");

				let { cols, rows } = AnsonResp.rs2nvs( rs, nv );
				if (!noAllItem)
					rows.unshift(AnConst.cbbAllItem);
				this.items = rows;

				this.loading = false;

				if (onDone)
					onDone(cols, rows);
			} );
		return this;
	}
}
DatasetComboComp.contextType = AnContext;

const DatasetCombo = withStyles<any, any, ComboProps>(styles)(withWidth()(DatasetComboComp));
export { DatasetCombo, DatasetComboComp }

