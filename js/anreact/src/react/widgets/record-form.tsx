
import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import withWidth from "@material-ui/core/withWidth";
import { Theme } from '@material-ui/core/styles';
import clsx from  'clsx';

import Grid from '@material-ui/core/Grid';
import Box from "@material-ui/core/Box";
import TextField from "@material-ui/core/TextField";
import Typography from '@material-ui/core/Typography';

import { AnlistColAttrs, Semantier, TierComboField, Tierec, str_, toBool } from '@anclient/semantier';
import { L } from '../../utils/langstr';
import { Comprops, CrudCompW } from '../crud';
import { DatasetCombo } from './dataset-combo';
import { ClassNames, CompOpts, invalidStyles, Media, toReactStyles } from '../anreact';

const styles = (theme: Theme) => (Object.assign(
	invalidStyles,
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
	/**Default: true */
	enableValidate?: boolean,
	tier: Semantier
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
    tier: Semantier;

	constructor (props: RecordFormProps) {
		super(props);

		this.tier = props.tier;
		this.formFields = this.formFields.bind(this);
		this.getField = this.getField.bind(this);
	}

	componentDidMount() {
		if (this.tier.pkval.v) {
			// in case rec is already loaded by parent component
			if (this.tier.rec && Object.keys(this.tier.rec).length > 0)
				console.warn("TRecordFormComp is supposed to load form data with pkval by itself.");

			let that = this;
			let cond = {};
			cond[str_(this.tier.pkval.pk)] = this.tier.pkval.v;
			this.tier.record(cond, (_cols, _rows) => {
				that.setState({});
			} );
		}
	}

	getField(f: AnlistColAttrs<JSX.Element, CompOpts>, rec: Tierec, classes: ClassNames | undefined, media: Media) {
		let {isSm} = media;
		let that = this;

		if (f.type === 'cbb') {
			let fcbb = f as TierComboField<JSX.Element, CompOpts>;
			return (
				<DatasetCombo uri={ this.props.uri }
					sk={fcbb.sk} nv={ fcbb.nv }
					disabled={ !!fcbb.disabled }
					readOnly={ this.tier && this.tier.isReadonly && this.tier.isReadonly(fcbb) }
					options={ fcbb.options || []} val={{n: undefined, v:rec[fcbb.field]} }
					label={ fcbb.label }
					className={clsx(fcbb.opts?.classes, classes[fcbb.style])}
					style={ toReactStyles(fcbb.css) || { width: 200 } }
					invalidStyle={ fcbb.style }
					onSelect={ (v) => {
						rec[fcbb.field] = v.v;
						fcbb.style = undefined;
						that.setState({dirty: true});
					} }
				/>);
		}
		else if (f.type === 'formatter' || f.formatter) {
			console.warn("This branch is deprecated.");
			// if (len(f.formatter?.length != 2)
			// 	console.warn('TRecordFormComp need formatter with signature of f(record, field, tier).', f.formatter)
			// return (<>{f.formatter(f, rec)}</>);
		}
		else if (f.fieldFormatter) {
			return (<>{f.fieldFormatter(rec, f, {classes: classes || {}, media})}</>);
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
				label={isSm && !that.props.dense ? L(f.label) : ''}
				variant='outlined' color='primary' fullWidth
				placeholder={L(f.label)} margin='dense'
				value={ !rec || (rec[f.field] === undefined || rec[f.field] === null) ? '' : rec[f.field] }
				inputProps={{ readOnly } }
				className={clsx(f.opts?.classes, classes[f.style])}
				onChange={ (e) => {
					rec[f.field] = e.target.value;
					f.style = undefined;
					that.setState({dirty: true});
				} }
			  />);
		}
	}

	formFields(rec: Tierec, classes: ClassNames | undefined, media: Media) {
		let fs = [] as React.ReactNode[];
		const isSm = this.props.dense || toBool(media.isMd);

		this.props.fields.forEach( (f, i) => {
		  if (!f.hide && toBool(f.visible, true)) {
			fs.push(
				<Grid item key={`${f.field}.${i}`}
					{...f.grid} className={this.props.dense ? classes?.labelText_dense : classes?.labelText} >
				  <Box className={classes?.rowBox} {...f.box} >
					{!isSm && f.label &&
					  <Typography className={classes?.formLabel} >
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

		let rec = this.tier?.rec;

		if (!rec) console.warn("TRecordForm used without records, for empty UI?");

		return rec ?
			<Grid container className={classes?.root} direction='row'>
				{this.formFields(rec, classes, media)}
			</Grid>
			: <></>; // have to wait until parent loaded data
	}
}

const TRecordForm = withStyles<any, any, RecordFormProps>(styles)(withWidth()(TRecordFormComp));
export { TRecordForm, TRecordFormComp }
