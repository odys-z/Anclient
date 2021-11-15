import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import { Collapse, Grid, TextField, Switch, Button, FormControlLabel, withWidth } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { Search, Replay } from '@material-ui/icons';

import { QueryConditions } from '@anclient/semantier-st';

import { L } from '../../utils/langstr';
	import { AnConst } from '../../utils/consts';
	import { AnContext, AnContextType } from '../reactext';
	import { Comprops, CrudCompW } from '../crud'
import { AutocompleteChangeDetails, AutocompleteChangeReason, AutocompleteInputChangeReason, Value } from '@material-ui/lab/useAutocomplete/useAutocomplete';
import { ComboItem } from './dataset-combo';

const styles = (theme) => ( {
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

	conds = undefined as QueryConditions;

	// refcbb = undefined as React.RefObject<HTMLDivElement>;

	constructor(props: QueryFormProps) {
		super(props);

		this.bindConds = this.bindConds.bind(this);

		this.handleChange = this.handleChange.bind(this);
		this.onTxtChange = this.onTxtChange.bind(this);
		this.toSearch = this.toSearch.bind(this);
		this.toClear = this.toClear.bind(this);

		// this.onBound = this.onBound.bind(this);

		// this.refcbb = React.createRef<HTMLDivElement>();

		if (props.conds)
			this.conds = props.conds;
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

	bindConds() {
		// if (!this.context || !this.context.anReact)
		// 	throw new Error('AnQueryFormComp can\'t bind controls without AnContext initialized with AnReact.');
		const ctx = this.context as unknown as AnContextType;

		this.conds.filter((c, x ) => !!c && !c.loading && !c.clean)
		  .forEach( (cond, cx) => {
			if (cond.sk && (cond.type === 'cbb' || cond.type === 'autocbb')) {
				// reset by AnReact.ds2cbbOptions()
				cond.loading = true;
				ctx.anReact.ds2cbbOptions({
						uri: this.props.uri,
						sk: cond.sk,
						// user uses this, e.g. name and value to access data
						nv: cond.nv,
						sqlArgs: cond.sqlArgs,
						cond
					},
					ctx.error, this);
			}
		});
	}

	handleChange( e ) {
		this.setState({checked: !this.state.checked})
	}

	onTxtChange( e, x ) {
		e.stopPropagation()
		this.conds[x].val = e.currentTarget.value;
	}

	onDateChange(e, ix) {
		e.stopPropagation();

		console.log(this.conds[ix], e.currentTarget.value);
		// let obj = this.conds[ix];
		this.conds[ix].val = e.currentTarget.value;
	}

	onSwitchChange(e, x) {
		e.stopPropagation();
		this.conds[x].val = e.currentTarget.checked;
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
		this.conds.ref = _ref;
		return (e, item) => {
			if (e) e.stopPropagation()
			let cbb = _ref.current.getAttribute('data-name');
			// cbb = parseInt(cbb);
			_that.conds[cbb].val = item ? item : AnConst.cbbAllItem;

			_that.setState({conds: _that.conds});
		};
	}

	toSearch( e ) {
		this.props.onSearch(this.conds);
	}

	toClear( e ) {
		if (this.conds) {
			this.conds
				.filter( c => !!c )
				.forEach( (c, x) => {
					c.val = c.options ? c.options[0] : '';
				} );
			this.setState({conds: this.conds});
		}
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
						{ conditions(this.conds) }
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
		 * @return {<Autocomplete>} (auto complete) combobox
		 */
		function conditions(conds: QueryConditions) {
		  return conds
			.filter((c, x ) => !!c)
			.map( (cond, x) => {
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
					let v = cond && cond.val || false;
					return (
						<FormControlLabel key={'sch' + x}
					        control={ <Switch key={x} checked={v} color='primary'
										onChange = {e => {that.onSwitchChange(e, x)}} /> }
							label={cond.label} />
					);
				}
				else // if (cond.type === 'text')
					return (<TextField label={cond.label} key={'text' + x}
						id={String(x)}
						onChange={e => {that.onTxtChange(e, x)}}/>);
			} );
		}
	}
}
AnQuerystComp.contextType = AnContext;

// AnQuerystComp.propTypes = {
// 	/* TODO: DOCS
// 	 * Design Notes:
// 	 * All common widgets need this check, but main CRUD page's uri is been set
// 	 * by SysComp. Also check CrudComp's comments.
// 	 */
// 	uri: PropTypes.string.isRequired,
// 	conds: PropTypes.array.isRequired,
// 	onSearch: PropTypes.func.isRequired,
// 	onLoaded: PropTypes.func,
// 	buttonStyle: PropTypes.oneOf(["norm", "dense"])
// };

interface QueryFormProps extends Comprops {
	conds: QueryConditions,
	/**User actions: search button clicked */
	onSearch: (conds: QueryConditions) => void,
	/**Bounding components successfully */
	onLoaded: (conds: QueryConditions) => void,
	/**@deprecated Render can get Mediat parameter and field can be defined by user data. */
	buttonStyle?: "norm" | "dense"
}

// const AnQueryst = withWidth()(withStyles(styles)(AnQuerystComp));
// const AnQueryst = withWidth()(AnQuerystyle);
const AnQueryst = withStyles<any, any, QueryFormProps>(styles)(withWidth()(AnQuerystComp));
export { AnQueryst, AnQuerystComp }
