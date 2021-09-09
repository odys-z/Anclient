
import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import withWidth from "@material-ui/core/withWidth";
import PropTypes from "prop-types";

import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Box from "@material-ui/core/Box";
import TextField from "@material-ui/core/TextField";
import Typography from '@material-ui/core/Typography';
import Input from '@material-ui/core/Input';

import { L } from '../../utils/langstr';
	import { toBool } from '../../utils/helpers';
	import { AnConst } from '../../utils/consts';
	import { CrudCompW } from '../crud';
	import { DatasetCombo } from './dataset-combo'
	import { JsampleIcons } from '../../jsample/styles';

const styles = (theme) => ({
  root: {
	display: 'flex',
	width: '100%',
	backgroundColor: '#fafafaee'
  },
  rowBox: {
	width: '100%',
	'& :hover': {
	  backgroundColor: '#ced'
	}
  },
  labelText: {
	padding: theme.spacing(1),
	borderLeft: '1px solid #bcd',
  },
  labelText_dense: {
	paddingLeft: theme.spacing(1),
	paddingRight: theme.spacing(1),
	borderLeft: '1px solid #bcd',
  }
});

/**
 * A Tiered record component is designed for UI record layout rendering, handling
 * user action (change text, etc.) in a levle-up style. It's parent's responsibilty
 * to load all binding data in sychronous.
 * TRecordForm won't resolving FK's auto-cbb.
 * But TRecordFormComp do has a state for local udpating, See performance issue:
 * https://stackoverflow.com/a/66934465
 *
 * In case of child relation table, this component currently is not planned to supprt.
 * <p>Usally a CRUD process needs to update multiple tables in one transaction,
 * so this component leveled up state for saving. Is this a co-accident with React
 * or is required by semantics?</p>
 * <p>Issue: FK binding are triggered only once ? What about cascade cbbs ineraction?</p>
 */
export class TRecordFormComp extends CrudCompW {
	state = {
		dirty: false,
		pk: undefined,
		// pkval: undefined,
		// record: {},
	};

	constructor (props = {}) {
		super(props);

		// for safety - props can be changed
		// this.state.record = Object.assign({}, props.record);
		//
		// this.setStateHooked = this.setStateHooked.bind(this);
		// if (props.stateHook)
		// 	props.stateHook.collect = function (me) {
		// 		let that = me;
		// 		return function(hookObj) {
		// 			// hookObj[that.props.mtabl] = that.state.record;
		// 			hookObj.record = that.state.record;
		// 		}; }(this);

		// this.state.pkval = props.pkval;

		this.formFields = this.formFields.bind(this);
		this.getField = this.getField.bind(this);

		this.validate = this.validate.bind(this);
	}

	componentDidMount() {
	}

	setProps(obj) {
		Object.assign(this.props, obj);
		this.setState({});
	}

	// TODO move to tier, because saving action happends there
	// - where data validated and new way of (altering) rendering are done here
	validate(invalidStyle) {
		if (!this.props.enableValidate)
			return true;

		let that = this;

	    const invalid = Object.assign(invalidStyle || {}, { border: "2px solid red" });

		let valid = true;
	    this.props.fields.forEach( (f, x) => {
			f.valid = validField(f, { validator: (v) => !!v });
			f.style = f.valid ? undefined : invalid;
			valid &= f.valid;
	    } );
		return valid;

		function validField (f, valider) {
			let v = that.props.record[f.field];

			if (f.type === 'int')
				if (v === '' || ! Number.isInteger(Number(v))) return false;

			if (typeof valider === 'function')
				return valider(v);
			else if (f.validator) {
				let vd = f.validator;
				if(vd.notNull && (v === undefined || v === null || v.length === 0))
					return false;
				if (vd.len && v && v.length > vd.len)
					return false;
				return true;
			}
			else // no validator
				return true;
		}
	}

	getField(f, rec) {
		let media = super.media;
		let {isSm} = media;
		let that = this;

		if (f.type === 'enum' || f.type === 'cbb') {
			return (
				<DatasetCombo uri={this.props.uri}
					sk={f.sk} nv={f.nv}
					options={f.options || []} val={rec[f.field]}
					label={f.label} style={f.style}
					onSelect={ (v) => {
						rec[f.field] = v.v;
						that.setProps({dirty: true});
					}}
				/>);
		}
		else if (f.type === 'formatter' || f.formatter)
			return (
				<Grid item key={f.field} {...f.cols} >
					<Typography variant='body2' >
					  {f.formatter(rec)}
					</Typography>
				</Grid>);
		else {
			let type = 'text';
			if (f.type === 'float' || f.type === 'int')
				type = 'number';
			return (
			<TextField id={f.field} key={f.field}
				type={f.type || type} disabled={!!f.disabled}
				label={isSm && !that.props.dense ? L(f.label) : ''}
				variant='outlined' color='primary' fullWidth
				placeholder={L(f.label)} margin='dense'
				value={ !rec || (rec[f.field] === undefined || rec[f.field] === null) ? '' : rec[f.field] }
				inputProps={f.style ? { style: f.style } : undefined}
				onChange={(e) => {
					rec[f.field] = e.target.value;
					that.setProps({ dirty : true });
				}}
			/>);
		}
	}

	formFields(rec, classes) {
		let fs = [];
		const isSm = this.props.dense || toBool(super.media.isMd);

		this.props.fields.forEach( (f, i) => {
		  if (!f.hide) {
			fs.push(
				<Grid item key={`${f.field}.${i}`}
					{...f.grid} className={this.props.dense ? classes.labelText_dense : classes.labelText} >
				  <Box className={classes.rowBox} {...f.box} >
					{!isSm && (
					  <Typography className={classes.formLabel} >
						{L(f.label)}
					  </Typography>
					)}
					{this.getField(f, rec)}
				  </Box>
				</Grid> );
		} } );
		return fs;
	}

	render () {
		const { classes, width } = this.props;
		let media = CrudCompW.setWidth(width);

		let rec = this.props.record;

		return (
			<Grid container className={classes.root} direction='row'>
				{this.formFields(rec, classes)}
			</Grid> );
	}
}

TRecordFormComp.propTypes = {
	// uri: PropTypes.string.isRequired,	// because cbb binding needs data access
	// stateHook: PropTypes.object,		// for readonly this is not required
	dense: PropTypes.bool,
	enableValidate: PropTypes.bool,

	// mtabl:  PropTypes.string.isRequired,
	// fields: PropTypes.array.isRequired,
	// record: PropTypes.object.isRequired,
	tier: PropTypes.object.isRequired,
};

const TRecordForm = withWidth()(withStyles(styles)(TRecordFormComp));
export { TRecordForm }
