
import React from 'react';
import { Theme, withStyles } from '@material-ui/core/styles';
import withWidth from "@material-ui/core/withWidth";
import clsx from  'clsx';

import Grid from '@material-ui/core/Grid';
import Box from "@material-ui/core/Box";
import TextField from "@material-ui/core/TextField";
import Typography from '@material-ui/core/Typography';

import { TierComboField, Semantier, Tierec, AnlistColAttrs, TierCol } from '@anclient/semantier-st';

import { L, toBool, DatasetCombo, invalidStyles, Comprops, CrudCompW, Media, CompOpts, ClassNames, toReactStyles } from '@anclient/anreact';

/**
 * Some parent controlled user actions, like SessionInf can be added here.
 * headFormatter: the head's formatter
 * cardFormatter: a grid card formatter, each card should be a Grid, for insert into a Grid container, the form body.
 */
export interface CardsFormProps extends Comprops {
	headFormatter?: (rec: Tierec, cols: Array<TierCol>, classes: ClassNames, media: Media) => JSX.Element;
	cardFormatter?: (rec: Tierec, rx: number, classes: ClassNames, media: Media) => JSX.Element;
};

const styles = (theme: Theme) => (Object.assign(
	invalidStyles,
	{ root: {
		display: 'flex',
		width: '100%',
		backgroundColor: '#fafafaee'
	  },
	  paperHead: {
		width: '100%',
		'& :hover': {
		  backgroundColor: '#ced'
		}
	  },
	}
) );

/**
 * This class render rows as Grid cards, a generic class like Tablist.
 * <h5>Required tiers:</h5>
 * <p>1. using tier.rec as paper head</p>
 * <p>2. using tier.rows as cards. All cards in Grid container.</p>
 */
class CardsFormComp extends CrudCompW<CardsFormProps> {
	state = {
		dirty: false,
		pk: undefined,
	};

    tier: Semantier;

	constructor (props: CardsFormProps) {
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
			// let cond = {};
			// cond[this.tier.pk] = this.tier.pkval;
			this.tier.record(undefined, // using this.tier.pkval,
				(_cols, _rows) => {
				// that.rec = rows && rows[0] ? rows[0] : {};
				that.setState({});
			} );
		}
	}

    /* Let's move this better version to TRecordForm
	 *
	 * @param f
	 * @param rec
	 * @param classes
	 * @returns
	 */
	getField(f: AnlistColAttrs<JSX.Element, CompOpts>, rec: { [x: string]: any; }, classes: { [x: string]: string; }) {
		let media = this.media;
		let { isSm } = media;
		let that = this;

		if (f.type === 'enum' || f.type === 'cbb') {
            const df = f as unknown as TierComboField<JSX.Element, CompOpts>;
			return (
				<DatasetCombo uri={ this.props.uri }
					sk={df.sk} nv={ df.nv }
					disabled={ !!df.disabled }
					readOnly={ !df && f.disabled }
					options={ df.options || []} val={{n: undefined, v:rec[f.field]} }
					label={ f.label }
					style={ toReactStyles(f.css) || {width: 200} }
					className={ f.style }
					invalidStyle={ f.css }
					onSelect={ (v) => {
						rec[df.field] = v.v;
						f.css = undefined;
						that.setState({dirty: true});
					} }
				/>);
		}
		else if (f.type === 'formatter' || f.fieldFormatter) {
			return (
				<>{f.fieldFormatter(rec, f)}</>
			);
		}
		else {
            // const tf = f as TierCol;
			let type = 'text';
			if (f.type === 'float' || f.type === 'int')
				type = 'number';
			return (
			<TextField key={f.field} type={f.type || type}
				disabled={!!f.disabled}
				label={isSm && !that.props.dense ? L(f.label) : ''}
				variant='outlined' color='primary' fullWidth
				placeholder={L(f.label)} margin='dense'
				value={ !rec || (rec[f.field] === undefined || rec[f.field] === null) ? '' : rec[f.field] }
				className={classes[f.style as string]}
				onChange={(e) => {
					rec[f.field] = e.target.value;
					f.css = undefined;
					that.setState({dirty: true});
				}}
			/>);
		}
	}

	formFields(rec: {}, classes: ClassNames, media: Media) {
		let fs = [];
		const isSm = this.props.dense || toBool(media.isMd);

		this.tier.fields().forEach( (f: AnlistColAttrs<JSX.Element, CompOpts>, i: Number) => {
		  if (!!f.visible) {
			f.fieldFormatter = (rec, x) => (<>{rec[f.field]}</> as JSX.Element);

			fs.push(
				<Grid item key={`${f.field}.${i}`}
					{...f.grid} className={this.props.dense ? classes.labelText_dense : classes.labelText} >
				  {/* <Box className={classes.rowBox} {...f.box} > */}
				  <Box {...f.box} >
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

	/**
	 * Create a formatter to compose a card for each record.
	 * @param c column meta
	 * @param x
	 * @returns
	formatCard = (c: AnlistCol, x: number) => {
		const modifier: AnlistColAttrs = {};
		modifier[c.field] = {
			formatter: (rec: any) => (<>
				{rec[c.field]}
			</>)
		};
		return modifier;
	}
	 */

	render () {
		const { classes, width } = this.props;
		let media = CrudCompW.getMedia(width);


		return <>
			{this.props.headFormatter(this.tier.rec, this.tier.columns(), classes, media)}
		  : <Grid container className={classes.root} direction='row'>
				{this.cards(classes, media)}
			</Grid>
		  </>;
	}

	// PaperHead(classes: {[x: string] : any}, media: Media): React.ReactNode {
	// 	let pl = this.tier.rec;
	// 	return <Card className={classes.paperHead}>{pl?.Title}</Card>
	// }

	cards(classes: {[x: string] : any}, media: Media): React.ReactNode {
		// return this.tier.rows?.map( (r, x) => this.props.CardsFormatter(r, x, classes, media) );
		return this.props.CardsFormatter(this.tier.rows, classes, media);
	}
}

const CardsForm = withStyles<any, any, CardsFormProps>(styles)(withWidth()(CardsFormComp));
export { CardsForm, CardsFormComp }

