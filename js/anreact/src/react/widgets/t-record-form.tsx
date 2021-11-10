
import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import withWidth from "@material-ui/core/withWidth";

import Grid from '@material-ui/core/Grid';
import Box from "@material-ui/core/Box";
import TextField from "@material-ui/core/TextField";
import Typography from '@material-ui/core/Typography';

import { L } from '../../utils/langstr';
	import { toBool } from '../../utils/helpers';
	import { ClassNames, Comprops, CrudCompW } from '../crud';
	import { DatasetCombo, TierComboField } from './dataset-combo';
	import { Semantier, TierCol, Tierec } from '@anclient/semantier-st';
import { AnFieldFormatter, Media } from '../anreact';

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

export interface RecordFormProps extends Comprops {
    enableValidate: boolean;
};

export interface AnFormField extends TierCol {
	fieldFormatter?: AnFieldFormatter;
};

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
 * Level-up way is NOT working! So having tier as the common state/data manager.
 */
class TRecordFormComp extends CrudCompW<RecordFormProps> {
	state = {
		dirty: false,
		pk: undefined,
	};
    tier: any;

	constructor (props: RecordFormProps) {
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

	getField(f: TierComboField, rec: Tierec, classes: ClassNames, media: Media) {
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
			console.warn("This branch is deprecated.");
			if (f.formatter.length != 2)
				console.warn('TRecordFormComp need formatter with signature of f(record, field, tier).', f.formatter)
			return (<>{f.formatter(f, rec)}</>);
		}
		else if (f.type === 'formatter' || f.fieldFormatter) {
			return (<>{f.fieldFormatter(rec, f)}</>);
		}
		else {
			let type = 'text';
			if (f.type === 'float' || f.type === 'int')
				type = 'number';
			let readOnly = (typeof this.tier.isReadonly === 'function') ?
							this.tier.isReadonly(f) : this.tier.isReadonly;
			return (
			<TextField key={f.field} type={f.type || type}
				disabled={!!f.disabled}
				// autoComplete={f.autocomplete}
				label={isSm && !that.props.dense ? L(f.label) : ''}
				variant='outlined' color='primary' fullWidth
				placeholder={L(f.label)} margin='dense'
				value={ !rec || (rec[f.field] === undefined || rec[f.field] === null) ? '' : rec[f.field] }
				inputProps={{ readOnly } }
				className={classes[f.className]}
				onChange={(e) => {
					rec[f.field] = e.target.value;
					f.style = undefined;
					that.setState({dirty: true});
				}}
			/>);
		}
	}

	formFields(rec: Tierec, classes: ClassNames, media: Media) {
		let fs = [];
		const isSm = this.props.dense || toBool(media.isMd);

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
					{this.getField(f, rec, classes, media)}
				  </Box>
				</Grid> );
		} } );
		return fs;
	}

	render () {
		const { classes, width } = this.props;
		let media = CrudCompW.getMedia(width);

		let rec = this.tier.rec;

		return rec ?
			<Grid container className={classes.root} direction='row'>
				{this.formFields(rec, classes, media)}
			</Grid>
			: <></>; // have to wait until parent loaded data
	}
}

// TRecordFormComp.propTypes = {
// 	width: PropTypes.oneOf(["lg", "md", "sm", "xl", "xs"]).isRequired,
// 	tier: PropTypes.object.isRequired,
// 	dense: PropTypes.bool,
// 	enableValidate: PropTypes.bool,
// };

const TRecordForm = withWidth()(withStyles(styles)(TRecordFormComp));
export { TRecordForm, TRecordFormComp }
