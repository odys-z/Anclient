import React from 'react';
import { Theme, withStyles } from "@material-ui/core/styles";
import { Collapse, Grid, TextField, Switch, Button, FormControlLabel, withWidth } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { Search, Replay } from '@material-ui/icons';

import { toBool, AnlistColAttrs, NV, QueryConditions, TierComboField, TierCol, QueryCondition, QueryPage } from '@anclient/semantier';

import { L } from '../../utils/langstr';
import { AnConst } from '../../utils/consts';
import { AnContext, AnContextType } from '../reactext';
import { Comprops, CrudCompW } from '../crud'
import { AutocompleteChangeDetails, AutocompleteChangeReason, AutocompleteInputChangeReason, Value } from '@material-ui/lab/useAutocomplete/useAutocomplete';
import { ComboItem } from './dataset-combo';
import { AnReactExt, CompOpts } from '../anreact';

interface ComboCondType extends TierComboField<JSX.Element, CompOpts>, QueryCondition {
	/** is cbb clean */
	clean: boolean;
	sk: string,
	type: 'cbb' | 'autocbb';
};

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
  [ { type: 'text', val: '', label: 'text condition'},
    { type: 'autocbb', sk: 'lvl1.domain.jsample',
      val: AnConst.cbbAllItem,
      options: [AnConst.cbbAllItem, {n: 'first', v: 1}, {n: 'second', v: 2}, {n: 'third', v: 3} ],
      label: 'auto complecte'},
  ]
 */
class AnQuerystComp extends CrudCompW<QueryFormProps> {

	state = {
		checked: true,
	};

	qFields = [] as AnlistColAttrs<JSX.Element, CompOpts>[];

	constructor(props: QueryFormProps) {
		super(props);

		if (props.conds && !props.fields)
			throw Error("AnQuerystComp now is using [fields] for conditions's declaration.");

		this.bindConds = this.bindConds.bind(this);

		this.handleChange = this.handleChange.bind(this);
		this.onTxtChange = this.onTxtChange.bind(this);
		this.toSearch = this.toSearch.bind(this);
		this.toClear = this.toClear.bind(this);

		this.qFields = props.fields || [];
	}

	componentDidMount() {
		this.bindConds();

		// // trigger parent onLoaded event.
		// // It should be called after all cbb loaded, asynchronously.
		// // This will be done once query-form.tier implemented.
		// // as query form always initialized as empty condistions, let't trigger it now.
		// // Or just simply levelup buttons?
		// if (typeof this.props.onLoaded === 'function')
		// 	this.props.onLoaded();
	}

	/**TODO: all widgets should bind data by themselves, so this function shouldn't exits.
	 * Once the Autocomplete is replaced by DatasetCombo, this function should be removed.
	 */
	bindConds() {
		// if (!this.context || !this.context.anReact)
		// 	throw new Error('AnQueryFormComp can\'t bind controls without AnContext initialized with AnReact.');
		const ctx = this.context as unknown as AnContextType;
		const that = this;

		this.qFields
		  .filter((c: ComboCondType, x ) => !!c && !c.loading && !c.clean)
		  .forEach( (cond: ComboCondType, cx) => {
			if (cond.sk && (cond.type === 'cbb' || cond.type === 'autocbb')) {
				// cond.loading = true;
				(ctx.anReact as AnReactExt).ds2cbbOptions({
						uri: this.props.uri,
						sk: cond.sk as string,
						// user uses this, e.g. name and value to access data
						nv: cond.nv,
						sqlArgs: cond.sqlArgs,
						// cond,
						onLoad: (_cols, rows) => {
							cond.options = rows as NV[];
							that.setState({});
						}
					});
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

		// console.log(this.conds[ix], e.currentTarget.value);
		// let obj = this.conds[ix];
		this.qFields[ix].val = e.currentTarget.value;
		this.setState({});
	}

	onSwitchChange(e: React.ChangeEvent<HTMLInputElement>, x: number) {
		e.stopPropagation();
		this.qFields[x].val = e.currentTarget.checked;
	}

	onCbbRefChange( refcbb: React.RefObject<HTMLDivElement> ) : (
		event: React.ChangeEvent<{}>,
		value: Value<ComboItem, boolean, boolean, boolean>,
		reason: AutocompleteChangeReason | AutocompleteInputChangeReason,
		details?: AutocompleteChangeDetails<ComboItem>
	  ) => void {
		let _ref = refcbb;
		let _that = this;
		// let _conds = this.conds;
		// this.conds.ref = _ref;
		return (e, item) => {
			if (e) e.stopPropagation()
			let cbb = _ref.current.getAttribute('data-name');
			// cbb = parseInt(cbb);
			_that.qFields[cbb].val = item ? item : AnConst.cbbAllItem;

			_that.setState({conds: _that.qFields});
		};
	}

	toSearch( _e : React.UIEvent ) {
		let conds = query(this.qFields);
		this.props.onSearch(conds);

		function query(fields: AnlistColAttrs<JSX.Element, CompOpts>[]): QueryConditions {
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
			.filter( c => !!c )
			.forEach( (c: ComboCondType, x) => {
				c.val = c.options ? c.options[0] : '';
			} );
		this.setState({});
	}

	render() {
		this.bindConds(); // this makes condition data can be updated by parent, e.g. rebind cbb.

		let that = this;

		let { checked } = this.state;
		let { classes } = this.props;
		return (
		<div className={classes.root} >
			<Switch checked={checked} onChange={this.handleChange} />
			<Collapse in={checked} >
				<Grid container alignContent="flex-end" >
					<Grid item className={classes.container} >
						{ conditions(this.qFields) }
					</Grid>
					<Grid item className={classes.buttons} >
						<Button variant="contained"
							color="primary"
							className={classes.button}
							onClick={this.toSearch}
							startIcon={<Search />}
						>{(!this.props.buttonStyle || this.props.buttonStyle === 'norm') && L('Search')}
						</Button>
						<Button variant="contained"
							color="primary"
							className={classes.button}
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
		function conditions(conds: AnlistColAttrs<JSX.Element, CompOpts>[]) {
		  return conds
			.filter((c, _x ) => !!c)
			.map( (cond: ComboCondType, x) => {
				if (cond.type === 'cbb') {
					let refcbb = React.createRef<HTMLDivElement>();
					let v = cond && cond.val ? cond.val : AnConst.cbbAllItem;
					return (<Autocomplete<ComboItem> key={'cbb' + x}
						id={String(x)} data-name={String(x)} ref={refcbb}
						onChange={ that.onCbbRefChange(refcbb) }
						onInputChange={ that.onCbbRefChange(refcbb) }
						options={cond.options || [AnConst.cbbAllItem]}
						getOptionLabel={ (it) => it ? it.n || '' : '' }
						getOptionSelected={(opt, v) => opt && v && opt.v === v.v}
						style={{ width: 300 }}
						renderInput={(params) => <TextField {...params} label={cond.label} variant="outlined" />}
					/>);
				}
				else if (cond.type === 'autocbb') {
					let refcbb = React.createRef<HTMLDivElement>();
					let v = cond && cond.val ? cond.val : AnConst.cbbAllItem;
					return (<Autocomplete<ComboItem> key={'cbb' + x}
						id={String(x)} data-name={String(x)} ref={refcbb}
						onChange={ that.onCbbRefChange(refcbb) }
						options={cond.options}
						getOptionLabel={ (it) => it && it.n ? it.n || '' : '' }
						getOptionSelected={(opt, v) => opt && v && opt.v === v.v}
						style={{ width: 300 }}
						renderInput={(params) => <TextField {...params} label={cond.label} variant="outlined" />}
					/>);
				}
				else if(cond.type === "date"){
					//uncontrolled Components
					//let refDate = React.createRef();
					//uncontrolled Components to controlled component
					let v = cond && cond.val ? cond.val : '';
					let label = cond && cond.label ? cond.label : "date"
					return (
						<TextField key={x} value = {v} label={label}
							type="date" style={{ width: 300 }}
							onChange = {event => {that.onDateChange(event, x)}}
							InputLabelProps={{ shrink: true }}/>
					)
				}
				else if (cond.type === "switch") {
					// let v = cond && cond.val || false;
					let v = toBool(cond.val);
					return (
						<FormControlLabel key={'sch' + x}
					        control={ <Switch key={x}
										checked={v} color='primary'
										onChange = {e => {that.onSwitchChange(e, x)}} /> }
							label={cond.label} />
					);
				}
				else // if (cond.type === 'text')
					return (<TextField label={cond.label} key={'text' + x}
						id={String(x)} value={cond.val || ''}
						onChange={e => {that.onTxtChange(e, x)}}/>);
			} );
		}
	}
}
AnQuerystComp.contextType = AnContext;

export interface QueryFormProps extends Comprops {
	/** @deprecated replaced by conds */
	fields?: AnlistColAttrs<JSX.Element, CompOpts>[];

	conds?: QueryPage,

	/**User actions: search button clicked
	 * @deprecated replaced by onQuery
	 */
	onSearch?: (conds: QueryConditions) => void,
	onQuery? : (conds: QueryPage) => void,

	/**Bounding components successfully
	 * 
	 * @deprecated replaced by onQuery
	 */
	onLoaded?: (conds: QueryConditions) => void,
	onReady? : (conds: QueryPage) => void,

	/**@deprecated Render can get Mediat parameter and field can be defined by user data. */
	buttonStyle?: "norm" | "dense"
}

const AnQueryst = withStyles<any, any, QueryFormProps>(styles)(withWidth()(AnQuerystComp));
export { AnQueryst, AnQuerystComp }
