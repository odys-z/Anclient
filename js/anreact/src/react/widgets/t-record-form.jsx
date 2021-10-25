
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
	import { DatasetCombo } from './dataset-combo';
	import { JsampleIcons } from '../../jsample/styles';
	import { Semantier } from '@anclient/semantier';

const styles = (theme) => (Object.assign(
	Semantier.invalidStyles,
	{ root: {
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
		borderLeft: '1px solid #bcd' }
	}
) );

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
 *
 * NOTE: Desgin Memo
 * Level-up way is working, having tier as the common state/data manager.
 */
class TRecordFormComp extends CrudCompW {
	state = {
		dirty: false,
		pk: undefined,
	};

	constructor (props = {}) {
		super(props);

		this.tier = props.tier;
		this.formFields = this.formFields.bind(this);
		this.getField = this.getField.bind(this);
	}

	componentDidMount() {
		if (this.tier.pkval) {
			// in case rec is already loaded by parent component
			if (this.tier.rec && Object.keys(this.tier.rec).length > 0)
				console.warn("TRecordFormComp is supposed to load form data with pkval by itself.");

			let that = this;
			let cond = {};
			cond[this.tier.pk] = this.tier.pkval;
			this.tier.record(cond, (cols, rows, fkOpts) => {
				// that.rec = rows && rows[0] ? rows[0] : {};
				that.setState({});
			} );
		}
	}

	getField(f, rec, classes) {
		let media = super.media;
		let {isSm} = media;
		let that = this;

		if (f.type === 'enum' || f.type === 'cbb') {
			return (
				<DatasetCombo uri={ this.props.uri }
					sk={f.sk} nv={ f.nv }
					disabled={ !!f.disabled }
					readOnly={ this.tier && this.tier.isReadonly && this.tier.isReadonly(f) }
					options={ f.options || []} val={{n: undefined, v:rec[f.field]} }
					label={ f.label }
					style={ f.cbbStyle || {width: 200} }
					invalidStyle={ f.style }
					onSelect={ (v) => {
						rec[f.field] = v.v;
						f.style = undefined;
						that.setState({dirty: true});
					} }
				/>);
		}
		else if (f.type === 'formatter' || f.formatter) {
			if (f.formatter.length != 3)
				console.warn('TRecordFormComp need formatter with signature of f(record, field, tier).', f.formatter)
			return (
				<>{f.formatter(rec, f, this.props.tier)}</>
			);
		}
		else {
			let type = 'text';
			if (f.type === 'float' || f.type === 'int')
				type = 'number';
			let readOnly = (typeof this.tier.isReadonly === 'function') ?
							this.tier.isReadonly(f) : this.tier.isReadonly;
			return (
			<TextField key={f.field} type={f.type || type}
				disabled={!!f.disabled || !!f.readonly || !!f.readOnly}
				autoComplete={f.autocomplete}
				label={isSm && !that.props.dense ? L(f.label) : ''}
				variant='outlined' color='primary' fullWidth
				placeholder={L(f.label)} margin='dense'
				value={ !rec || (rec[f.field] === undefined || rec[f.field] === null) ? '' : rec[f.field] }
				inputProps={{ readOnly } }
				className={classes[f.style]}
				onChange={(e) => {
					rec[f.field] = e.target.value;
					f.style = undefined;
					that.setState({dirty: true});
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
					{!isSm && f.label &&
					  <Typography className={classes.formLabel} >
						{L(f.label)}
					  </Typography>
					}
					{this.getField(f, rec, classes)}
				  </Box>
				</Grid> );
		} } );
		return fs;
	}

	render () {
		const { classes, width } = this.props;
		let media = CrudCompW.setWidth(width);

		let rec = this.tier.rec;

		return rec ?
			<Grid container className={classes.root} direction='row'>
				{this.formFields(rec, classes)}
			</Grid>
			: <></>; // NOTE have to wait until parent loaded data
	}
}

TRecordFormComp.propTypes = {
	width: PropTypes.oneOf(["lg", "md", "sm", "xl", "xs"]).isRequired,
	tier: PropTypes.object.isRequired,
	dense: PropTypes.bool,
	enableValidate: PropTypes.bool,
};

const TRecordForm = withWidth()(withStyles(styles)(TRecordFormComp));
export { TRecordForm, TRecordFormComp }
