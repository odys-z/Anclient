import React from 'react';
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import { Collapse, Grid, TextField, Switch, Button, FormControlLabel } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { Search, Replay } from '@material-ui/icons';

import { L } from '../../utils/langstr';
	import { AnConst } from '../../utils/consts';
	import { AnContext } from '../reactext.jsx';
	import { CrudComp } from '../crud'

const styles = (theme) => ( {
	root: {
		// height: '1.5em,
		"& :hover": {
			backgroundColor: '#eef'
		},
	},
	container: {
		display: 'flex',
		// width: '100%',
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

class AnQueryFormComp extends CrudComp {

	state = {
		checked: true,
		conds: [
			/* example
			{ type: 'text', val: '', text: 'No', label: 'text condition'},
			{ type: 'autocbb', sk: 'lvl1.domain.jsample',
			  val: AnConst.cbbAllItem,
			  options: [AnConst.cbbAllItem, {n: 'first', v: 1}, {n: 'second', v: 2}, {n: 'third', v: 3} ],
			  label: 'auto complecte'},
			 */
		]
	};

	constructor(props) {
		super(props);

		this.bindConds = this.bindConds.bind(this);

		this.handleChange = this.handleChange.bind(this);
		this.onTxtChange = this.onTxtChange.bind(this);
		this.toSearch = this.toSearch.bind(this);
		this.toClear = this.toClear.bind(this);

		this.onBound = this.onBound.bind(this);

		this.refcbb = React.createRef();

		if (props.conds)
			this.state.conds = props.conds;

		if (typeof props.query === 'function')
			this.query = () => {return props.query(this);};
	}

	componentDidMount() {
		this.bindConds();
	}

	bindConds() {
		if (!this.context || !this.context.anReact)
			throw new Error('AnQueryFormComp can\'t bind controls without AnContext initialized with AnReact.');
		this.state.conds.filter((c, x ) => !!c && !c.loading && !c.clean)
		  .forEach( (cond, cx) => {
			if (cond.sk && (cond.type === 'cbb' || cond.type === 'autocbb')) {
				// reset by AnReact.ds2cbbOptions()
				cond.loading = true;
				this.context.anReact.ds2cbbOptions({
						uri: this.props.uri,
						sk: cond.sk,
						// user uses this, e.g. name and value to access data
						nv: cond.nv,
						sqlArgs: cond.sqlArgs,
						cond,
						onDone: this.onBound
					},
					this.context.error, this);
			}
		});
	}

	/** Check all binding tasks, if all are ok, fire onDone event.
	 * Called by AnReact.ds2ds2cbbOptions, etc. Should call parent component's
	 * onDone handler.
	 * @param {object} cond the curreent condition
	 */
	onBound(cond) {
		let conds = this.state.conds;
		if (conds) {
			for (let i = 0; i < conds.length; i++) {
				if (conds[i] && conds[i].loading)
					return;
			}
		}

		if (typeof this.props.onDone === 'function')
			this.props.onDone(this.query());
	}

	handleChange( e ) {
		this.setState({checked: !this.state.checked})
	}

	query = () => {
		console.warn('Subclass must override this function, query() - composing query conditions');
		return this.state.conds.map( (c, x) => {
			let o = {}
			o[c.type] = c.val;
			return o;
		});
	}

	onTxtChange( e, x ) {
		e.stopPropagation()
		// let qx = e.currentTarget.id;
		// qx = parseInt(qx);
		// this.state.conds[qx].val = e.currentTarget.value;
		this.state.conds[x].val = e.currentTarget.value;
	}

	onDateChange(e, ix) {
		e.stopPropagation();

		// let arr = this.state.conds.map((obj, ix) => {
		// 	if(ix === index){
		// 		obj.val = e.currentTarget.value
		// 	}
		// 	return obj;
		// });
		// this.setState({conds: arr});

		console.log(this.state.conds[ix], e.currentTarget.value);
		let obj = this.state.conds[ix];
		this.state.conds[ix].val = e.currentTarget.value;
	}

	onSwitchChange(e, x) {
		e.stopPropagation();
		// let arr = this.state.conds.map((obj, ix) => {
		// 	if(ix === x){
		// 		obj.val = e.currentTarget.value
		// 	}
		// 	return obj;
		// });
		// this.setState({conds: arr});

		this.state.conds[x].val = e.currentTarget.checked;
	}

	onCbbRefChange( refcbb ) {
		let _ref = refcbb;
		let _that = this;
		let _conds = this.state.conds;
		_conds.ref = _ref;
		return (e, item) => {
			if (e) e.stopPropagation()
			let cbb = _ref.current.getAttribute('name');
			cbb = parseInt(cbb);
			_conds[cbb].val = item ? item : AnConst.cbbAllItem;

			_that.setState({conds: _that.state.conds});
		};
	}

	toSearch( e ) {
		/// conds.clean & cond.loading are used for guarding re-entry the query, e.g. when error occured
		this.state.conds.forEach(
			(c, x) => {
				c.clean = false;
				c.loading = false;
			} );

		this.props.onSearch(e, this.query());
	}

	toClear( e ) {
		if (this.state.conds) {
			this.state.conds.forEach( (c, x) => {
				c.val = c.options ? c.options[0] : '';
			} );
			this.setState({conds: this.state.conds});
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
			<Collapse in={checked} direction="row"  >
				<Grid container alignContent="flex-end" >
					<Grid item className={classes.container} >
						{ conditions(this.state.conds) }
					</Grid>
					<Grid item className={classes.buttons} >
						<Button variant="contained"
							color="primary"
							className={classes.button}
							onClick={this.toSearch}
							startIcon={<Search />}
						>{L('Search')}</Button>
						<Button variant="contained"
							color="primary"
							className={classes.button}
							onClick={this.toClear}
							startIcon={<Replay />}
						>{L('Reset')}</Button>
					</Grid>
				</Grid>
			</Collapse>
		</div>);

		/** Render query form controls
		 * @param{array} [conds] conditions
		 * @return {<Autocomplete>} (auto complete) combobox
		 */
		function conditions(conds = []) {
		  return conds
			.filter((c, x ) => !!c)
			.map( (cond, x) => {
				if (cond.type === 'cbb') {
					/* TODO FIXME let's use cbb widget, <DatasetCombo />
					sample usage (north/common/treecards-details):
					(<DatasetCombo options={[
						{n: L('Single Opt'), v: 's'},
						{n: L('Multiple'), v: 'm'},
						{n: L('Text'), v: 't'} ]}
						label={f.label} style={f.style}
						onSelect={ (v) => {
							rec[f.field] = v.v;
							that.setState({dirty: true});
						}}
					/>)
					*/
					let refcbb = React.createRef();
					let v = cond && cond.val ? cond.val : AnConst.cbbAllItem;
					return (<Autocomplete key={'cbb' + x}
						id={String(x)} name={String(x)} ref={refcbb}
						onChange={ that.onCbbRefChange(refcbb) }
						onInputChange={ that.onCbbRefChange(refcbb) }

						options={cond.options}
						getOptionLabel={ (it) => it ? it.n || '' : '' }
						getOptionSelected={(opt, v) => opt && v && opt.v === v.v}
						filter={Autocomplete.caseInsensitiveFilter}
						style={{ width: 300 }}
						renderInput={(params) => <TextField {...params} label={cond.label} variant="outlined" />}
					/>);
				}
				else if (cond.type === 'autocbb') {
					let refcbb = React.createRef();
					let v = cond && cond.val ? cond.val : AnConst.cbbAllItem;
					return (<Autocomplete key={'cbb' + x}
						id={String(x)} name={String(x)} ref={refcbb}
						onChange={ that.onCbbRefChange(refcbb) }

						options={cond.options}
						getOptionLabel={ (it) => it ? it.n || '' : '' }
						getOptionSelected={(opt, v) => opt && v && opt.v === v.v}
						filter={Autocomplete.caseInsensitiveFilter}
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
					        control={ <Switch key={x} checked={v} coloer='primary'
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
AnQueryFormComp.contextType = AnContext;

AnQueryFormComp.propTypes = {
	/* TODO: DOCS
	 * Design Notes:
	 * All common widgets need this check, but main CURD page's uri is been set
	 * by SysComp.
	 */
	uri: PropTypes.string.isRequired
};

const AnQueryForm = withStyles(styles)(AnQueryFormComp);
export { AnQueryForm, AnQueryFormComp }
