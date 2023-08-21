import React from 'react';
import { Theme, withStyles } from "@material-ui/core/styles";
import { Collapse, Grid, TextField, Switch, Button, FormControlLabel, withWidth } from '@material-ui/core';
import { AutocompleteChangeDetails, AutocompleteChangeReason, AutocompleteInputChangeReason, Value } from '@material-ui/lab/useAutocomplete/useAutocomplete';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { Search, Replay } from '@material-ui/icons';

import { toBool, AnlistColAttrs, NV, TierComboField, PageInf, len } from '@anclient/semantier';

import { L } from '../../utils/langstr';
import { AnConst } from '../../utils/consts';
import { AnContext, AnContextType } from '../reactext';
import { Comprops, CrudCompW } from '../crud'
import { ComboItem } from './dataset-combo';
import { AnReactExt, ClassNames, CompOpts, Media } from '../anreact';

// export interface ComboCondType extends TierComboField<JSX.Element, CompOpts> {
// 	/** is cbb clean */
// 	clean?: boolean; 
// 	// sk: string,
// 	type: 'cbb' | 'autocbb';
// 	/** Without '-- ALL --' option */
// 	noAllItem?: boolean;
// };

const styles = (theme: Theme) => ( {
	root: {
		"& :hover": {
			backgroundColor: '#eef'
		},
	},
	container: {
		display: 'flex',
		'& > *': {
			margin: theme.spacing(0.5),
		}
	},
	buttons: {
		display: 'flex',
		justifyContent: "flex-end",
		'& > *': {
			margin: theme.spacing(0.5),
		}
	},
	button: {
		height: '2.4em',
		verticalAlign: 'middle',
		margin: theme.spacing(1),
	}
} );

/**
 * Bind query conditions to React Components.
 * @example conds example:
 * {pageInf: {page, size},
  [ { type: 'text', val: '', label: 'text condition'},
    { type: 'autocbb', sk: 'lvl1.domain.jsample',
      val: AnConst.cbbAllItem,
      options: [AnConst.cbbAllItem, {n: 'first', v: 1}, {n: 'second', v: 2}, {n: 'third', v: 3} ],
      label: 'auto complecte'},
  ]}
 */
class AnQuerystComp extends CrudCompW<QueryFormProps> {

	state = {
		checked: true,
	};

	qFields = [] as TierComboField[];

	constructor(props: QueryFormProps) {
		super(props);

		this.bindConds = this.bindConds.bind(this);

		this.handleChange = this.handleChange.bind(this);
		this.onTxtChange = this.onTxtChange.bind(this);
		this.toSearch = this.toSearch.bind(this);
		this.toClear = this.toClear.bind(this);

		this.qFields = props.conds?.query || props.fields || [];
	}

	componentDidMount() {
		this.bindConds();
	}

	/**
	 * TODO: all widgets should bind data by themselves, so this function shouldn't exits.
	 * 
	 * Once the Autocomplete is replaced by DatasetCombo, this function should be removed.
	 */
	bindConds() {
		const ctx = this.context as unknown as AnContextType;
		const that = this;

		this.qFields
		  .filter ( (c: AnlistColAttrs<any, any>, x ) => !!c && !(c as TierComboField).loading && !(c as TierComboField).clean)
		  .forEach( (c: AnlistColAttrs<any, any>, cx) => {
			let cond = c as TierComboField;
			if (cond.sk && (cond.type === 'cbb' || cond.type === 'autocbb')) {
				cond.loading = true; // prevent re-loading
				(ctx.uiHelper as AnReactExt).ds2cbbOptions({
					uri: this.props.uri,
					sk: cond.sk as string,
					// user uses this, e.g. name and value to access data
					nv: cond.nv,
					sqlArgs: cond.sqlArgs,
					noAllItem: cond.noAllItem,
					// cond,
					onLoad: (_cols, rows) => {
						cond.options = rows as NV[];
						that.setState({});
					}
				});
			}
			else if (!cond.sk && (cond.type === 'cbb' || cond.type === 'autocbb') && len(cond.options) === 0) {
				// warning for old version usages
				console.warn("Looks like this field is intend to be a combbox but no cond.sk proviced.",
							cond);
			}
		});
	}

	handleChange( e: React.ChangeEvent<HTMLInputElement> ) {
		this.setState({checked: !this.state.checked})
	}

	onTxtChange( e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, x: number ) {
		e.stopPropagation()
		this.qFields[x].val = e.currentTarget.value;
		this.setState({});
	}

	onDateChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, ix: number) {
		e.stopPropagation();

		this.qFields[ix].val = e.currentTarget.value;
		this.setState({});
	}

	onSwitchChange(e: React.ChangeEvent<HTMLInputElement>, x: number) {
		e.stopPropagation();
		this.qFields[x].val = e.currentTarget.checked;
	}

	onCbbRefChange( refcbb: HTMLDivElement ) : (
		event: React.ChangeEvent<{}>,
		value: Value<ComboItem, boolean, boolean, boolean>,
		reason: AutocompleteChangeReason | AutocompleteInputChangeReason,
		details?: AutocompleteChangeDetails<ComboItem>
	  ) => void {
		let _ref = refcbb;
		let _that = this;
		return (e, item, reason : 'reset' | 'clear' | 'select-option') => {
			if (e) e.stopPropagation();

			let x = _ref?.getAttribute('data-name');
			if (x && reason === 'clear') 
				_that.qFields[x].val = '';
			else if (x && reason === 'select-option') 
				_that.qFields[x].val = item ? item : AnConst.cbbAllItem;
			_that.setState({});
		}
	}

	toSearch( _e : React.UIEvent ) {
		if (!this.props?.onSearch) {
			console.warn("Search handler is undefined.");
			return;
		}

		let conds = query(this.qFields);
		this.props?.onSearch(conds);

		function query(fields: TierComboField[]) {
			conds = {};
			fields?.forEach( (f, x) => {
				if (!f.name && !f.field)
					console.error("Condition field ignored: ", f);
				else
					conds[f.name || f.field] = f.type == 'cbb' || f.type == 'autocbb' ? f.val?.v : f.val;
			} );
			return conds;
		}
	}

	toClear( _e : React.UIEvent ) {
		this.qFields
			.filter ( c => !!c )
			.forEach((cond: AnlistColAttrs<any, any>, x) => {
				let c = cond as TierComboField;
				c.val = c.options ? c.options[0] : '';

				if (c.ref) c.ref.current = '';
			} );
		this.setState({});
	}

	render() {
		this.bindConds(); // this makes condition data can be updated by parent, e.g. rebind cbb.

		let that = this;

		let { checked } = this.state;
		let { classes, media } = this.props;
		return (
		<div className={classes?.root} >
			<Switch checked={checked} onChange={this.handleChange} />
			<Collapse in={checked} >
				<Grid container alignContent="flex-end" >
					{ conditions(this.qFields, classes, media) }
					<Grid item className={classes?.buttons} >
						<Button variant="contained"
							color="primary"
							className={classes?.button}
							onClick={this.toSearch}
							startIcon={<Search />}
						>{(!this.props.buttonStyle || this.props.buttonStyle === 'norm') && L('Search')}
						</Button>
						<Button variant="contained"
							color="primary"
							className={classes?.button}
							onClick={this.toClear}
							startIcon={<Replay />}
						>{(!this.props.buttonStyle || this.props.buttonStyle === 'norm') && L('Reset')}
						</Button>
					</Grid>
				</Grid>
			</Collapse>
		</div>);

		/** Render query form controls
		 * @param{array} [conds] conditions
		 * @return (auto complete) combobox
		 */
		function conditions(conds: TierComboField[], classes: ClassNames, media: Media) {
		  return conds
			.filter((c, _x ) => !!c)
			.map( (cond: TierComboField, x) => {
				if (cond.type === 'cbb') {
					return (
					<Grid key={'q-' + x} item className={classes?.container} {...cond.grid}>
					<Autocomplete<ComboItem> key={'cbb' + x}
						id={String(x)} data-name={String(x)} ref={(ref) => {cond.ref=ref}}
						value={cond.val}
						onChange={ that.onCbbRefChange(cond.ref) }
						onInputChange={ that.onCbbRefChange(cond.ref) }
						options={cond.options || [AnConst.cbbAllItem]}
						getOptionLabel={ (it) => it ? it.n || '' : '' }
						getOptionSelected={(opt, v) => opt && v && opt.v === v.v}
						style={{ width: classes?.width || 300 }}
						renderInput={(params) => <TextField {...params} label={cond.label} variant="outlined" />}
					/>
					</Grid>);
				}
				else if (cond.type === 'autocbb') {
					return (
					  <Grid key={'q-' + x} item className={classes?.container} {...cond.grid}>
						<Autocomplete<ComboItem> key={'cbb' + x}
							id={String(x)} data-name={String(x)} ref={ref => cond.ref = ref}
							onChange={ that.onCbbRefChange(cond.ref) }
							options={cond.options as ComboItem[]}
							getOptionLabel={ (it) => it && it.n ? it.n || '' : '' }
							getOptionSelected={(opt, v) => opt && v && opt.v === v.v}
							style={{ width: classes?.width || 300 }}
							renderInput={(params) => <TextField {...params} label={cond.label} variant="outlined" />}
						/>
					  </Grid>);
				}
				else if(cond.type === "date"){
					let v = cond && cond.val ? cond.val : '';
					let label = cond && cond.label ? cond.label : "date"
					return (
					<Grid key={'q-' + x} item className={classes?.container} {...cond.grid}>
						<TextField key={x} value = {v} label={label}
							type="date" style={{ width: 300 }}
							onChange = {event => {that.onDateChange(event, x)}}
							InputLabelProps={{ shrink: true }}/>
					</Grid>);
				}
				else if (cond.type === "bool") {
					let v = toBool(cond.val);
					return (
					<Grid key={'q-' + x} item className={classes?.container} {...cond.grid}>
						<FormControlLabel key={'sch' + x}
					        control={ <Switch key={x}
										checked={v} color='primary'
										onChange = {e => {that.onSwitchChange(e, x)}} /> }
							label={cond.label} />
					</Grid>);
				}
				else // if (cond.type === 'text')
					return (
					<Grid key={'q-' + x} item className={classes?.container} {...cond.grid}>
					<TextField label={cond.label} key={'text' + x}
						id={String(x)} value={cond.val || ''}
						onChange={e => {that.onTxtChange(e, x)}}/>
					</Grid>);
			} );
		}
	}
}
AnQuerystComp.contextType = AnContext;

export interface QueryFormProps extends Comprops {
	uri: string;

	/** @deprecated replaced by conds */
	fields?: AnlistColAttrs<JSX.Element, CompOpts>[];

	/**
	 * User actions: search button clicked
	 */
	onSearch?: (page: PageInf) => void,

	/**Bounding components successfully
	 *
	 * This event can even be triggered early than componentDidMount.
	 *
	 */
	onLoaded?: (page: PageInf) => void,
}

const AnQueryst = withStyles<any, any, QueryFormProps>(styles)(withWidth()(AnQuerystComp));
export { AnQueryst, AnQuerystComp }
