
import * as CSS from 'csstype';
import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import withWidth from "@material-ui/core/withWidth";
import { Theme } from '@material-ui/core/styles';
import clsx from  'clsx';

import Grid from '@material-ui/core/Grid';
import Box from "@material-ui/core/Box";
import TextField from "@material-ui/core/TextField";
import Typography from '@material-ui/core/Typography';

import { AnlistColAttrs, PageInf, Semantier, TierCol, TierComboField, Tierec, str_, toBool } from '@anclient/semantier';
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
		borderLeft: '1px solid #bcd'
	  },
	  date_disable: {
		color: 'black'
	  }
	}
) );

export interface RecordFormProps extends Comprops {
	/**Default: true */
	enableValidate? : boolean,
	tier            : Semantier,
	fields          : Array<TierCol & {readOnly?: boolean}>

	onSwitchChange? : (r: Tierec, f: AnlistColAttrs<any, CompOpts>, switchState: boolean) => void,
	onToggle?       : (r: Tierec, f: AnlistColAttrs<any, CompOpts>, switchState: boolean, toggleState: boolean) => void
};

/**
 * A Tiered record component which is designed for UI record layout rendering, handling
 * user action (change text, etc.) in a levle-up style - it's parent's responsibilty
 * to load all binding data in sychronous way.
 * 
 * TRecordForm won't resolving FK's auto-cbb.
 * But TRecordFormComp do has a state for local udpating, See performance issue:
 * https://stackoverflow.com/a/66934465
 *
 * In case of one or more child relation tables, this component currently is not planned to supprt.
 * To support relationship tables, in the upper component, use the {@link AnRelationTreeComp}.
 *
 * See also {@link AnRelationTreeComp}
 * 
 * NOTE: Desgin Memo
 * Level-up way is NOT working! So having tier as the common state/data manager.
 */
class TRecordFormComp extends CrudCompW<RecordFormProps> {
	state = {
		dirty: false,
		pk   : undefined,
		// buttonSwitch: {}  as {[field: string]: {state: boolean, views?: string | string[]}}
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
			let cond = new PageInf(0, -1);
			cond.mapCondts[str_(this.tier.pkval.pk)] = this.tier.pkval.v;
			this.tier.record(cond, (_cols, _rows) => {
				that.props.onLoad && that.props.onLoad(_cols, _rows);
				that.setState({});
			} );
		}
	}

	/**
	 * Create a field widget.
	 * @see query-form.tsx AnQuerystComp#conditions()
	 * @param f 
	 * @param fx field index 
	 * @param rec 
	 * @param classes 
	 * @param media 
	 * @returns field widget
	 */
	getField ( f: AnlistColAttrs<JSX.Element, CompOpts> & { css?: CSS.Properties, readOnly?: boolean },
				rec: Tierec, fx: number, classes: ClassNames | undefined, media: Media) {
		let {isSm} = media;
		let that = this;

		if (typeof this.tier.isReadonly === 'function')
			console.error("Since 0.4.50, TRecordForm nolonger use tier.isReadonly for field property. User field.readonly instead.");

		if (f.formatter) 
			console.warn("This branch is deprecated. Use fieldFormatter instead");
		else if (f.fieldFormatter)
			return (<>{f.fieldFormatter(rec, f, fx, {classes: classes || {}, media})}</>);
		else if (f.type === 'cbb') {
			let fcbb = f as TierComboField & { css: CSS.Properties };
			return (
				<DatasetCombo uri={ this.props.uri }
					sk={fcbb.sk} nv={ fcbb.nv }
					disabled={ !!fcbb.disabled }
					// readOnly={ this.tier && this.tier.isReadonly && this.tier.isReadonly(fcbb) }
					readOnly={ f.readOnly }
					options={ fcbb.options || []} val={{n: undefined, v:rec[fcbb.field]} }
					label={ fcbb.label }
					className={clsx(fcbb.opts?.classes, classes && classes[fcbb.style])}
					style={ toReactStyles(fcbb.css) || { width: 200 } } // FIXME change fcbb.css to fcbb.opts.css and verify
					invalidStyle={ fcbb.style }
					onSelect={ (v) => {
						rec[fcbb.field] = v.v;
						fcbb.style = undefined;
						that.setState({dirty: true});
					} }
				/>);
		}
		/*
		else if (f.type === 'button-switch') {
			if (!that.state.buttonSwitch[f.field])
				that.state.buttonSwitch[f.field] = {state: !!rec[f.field], views: rec[f.field] as string || ''}
			let {state, views} = that.state.buttonSwitch[f.field];
			return (
				<FormControlLabel key={'sch' + fx}
					control={<>
						<Switch key={f.field}
							checked={state}
							color='primary'
							onChange = { _e => {
								that.props.onSwitchChange ? that.props.onSwitchChange(rec, f, !state) : undefined
								that.setState({});
								that.state.buttonSwitch[f.field].state = !state;
							} } />
						{ state && 
						  <ToggleButtonGroup value={views} exclusive onChange={toggle}>
							<ToggleButton value={'t1'} disabled={!state} onChange={ _e => {
								that.props.onToggle &&
								that.props.onToggle(rec, f, state, views === 't1');
							}}>
								<ViewQuiltIcon color={views === 't1' ? 'primary' : 'disabled'}/>
								{ toggleLabel('t1', rec, f, fx, {state, classes, media}) }
							</ToggleButton>
						  </ToggleButtonGroup>
						}
					</> }
					label={ switchLabel(state) } />
			);
			
			function toggle ( event: React.UIEvent, nextView: string) {
				views = nextView;
				that.state.buttonSwitch[f.field].views = nextView;
			}

			function switchLabel( state: boolean ) {
				return state ? undefined : f.labels[0]; 
			}

			function toggleLabel( view: string, _rec: Tierec,
					f: AnlistColAttrs<JSX.Element, CompOpts> & { css?: CSS.Properties<any>; },
					_fx: number,
					opts: {state: boolean, classes: ClassNames, media: Media}) {
				return opts.state ? undefined : f.labels[ views === view ? 2 : 1 ];
			}
		}
		*/
		else if (f.type === 'date') {
			return (<TextField
				id="datetime-local" disabled={f.readOnly}
				label={f.label}
				type="date"
				defaultValue={rec[f.field]}
				className={f.readOnly ? classes.date_disable : classes.textField}
				InputLabelProps={{ shrink: true, }}
				InputProps={{ classes: { input: f.readOnly ? classes.date_disable : classes.textField } }}
			/>);
		}
		else if (f.type === 'datetime') {
			return (<TextField
				id="datetime-local" disabled={f.readOnly}
				label={f.label}
				type="datetime-local"
				defaultValue={rec[f.field]}
				className={classes.textField}
				InputLabelProps={{ shrink: true, }}
				InputProps={{ classes: { input: f.readOnly ? classes.date_disable : classes.textField } }}
			/>);
		}
		else {
			let type = 'text';
			if (f.type === 'float' || f.type === 'int')
				type = 'number';

			let {readOnly} = f;

			return (
			  <TextField key={f.field} type={f.type || type}
				disabled={!!f.disabled}
				label={isSm && !that.props.dense ? L(f.label) : ''}
				variant='outlined' color='primary' fullWidth
				placeholder={L(f.label)} margin='dense'
				value={ !rec || (rec[f.field] === undefined || rec[f.field] === null) ? '' : rec[f.field] }
				inputProps={{ readOnly } }
				className={clsx(f.opts?.classes, classes && classes[f.style])}
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

		this.props.fields.forEach( (f: AnlistColAttrs<JSX.Element, CompOpts>, i: number) => {
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
					{this.getField(f, rec, i, classes, media)}
				  </Box>
				</Grid> );
		} } );
		return fs;
	}

	render () {
		const { classes, width } = this.props;
		let media = CrudCompW.getMedia(width);

		let rec = this.tier?.rec;

		// if (!rec)
		// 	console.warn("TRecordForm used without records, for empty UI?");

		return rec ?
			<Grid container className={classes?.root} direction='row'>
				{this.formFields(rec, classes, media)}
			</Grid>
			: <></>; // have to wait until parent loaded data
	}
}

const TRecordForm = withStyles<any, any, RecordFormProps>(styles)(withWidth()(TRecordFormComp));
export { TRecordForm, TRecordFormComp }
