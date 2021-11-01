
import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import withWidth from "@material-ui/core/withWidth";

import Grid from '@material-ui/core/Grid';
import Box from "@material-ui/core/Box";
import TextField from "@material-ui/core/TextField";
import Typography from '@material-ui/core/Typography';

import { AnlistCol, DatasetComboField, Semantier } from '@anclient/semantier-st';
import { L, toBool, DatasetCombo, TRecordForm } from '@anclient/anreact';

import { starTheme } from '../../common/star-theme';
import { CrudCompW, FormProp } from '../../common/north';

interface CardFormProp extends FormProp {
};

const styles = (theme: starTheme) => (Object.assign(
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
class CardFormComp extends CrudCompW<CardFormProp> {
 */
class CardFormComp extends TRecordForm {
	state = {
		dirty: false,
		pk: undefined,
	};

    tier: Semantier;

	constructor (props) {
		super(props);

		this.tier = props.tier;
		this.formFields = this.formFields.bind(this);
		// this.getField = this.getField.bind(this);
	}

	componentDidMount() {
		if (this.tier.pkval) {
			// in case rec is already loaded by parent component
			if (this.tier.rec && Object.keys(this.tier.rec).length > 0)
				console.warn("TRecordFormComp is supposed to load form data with pkval by itself.");

			let that = this;
			let cond = {};
			cond[this.tier.pk] = this.tier.pkval;
			this.tier.record(cond, (_cols, _rows) => {
				// that.rec = rows && rows[0] ? rows[0] : {};
				that.setState({});
			} );
		}
	}

    /* Let's move this better version to TRecordForm
	getField(f: AnlistCol, rec: { [x: string]: string; }, classes: { [x: string]: string; }) {
		let media = this.media;
		let { isSm } = media;
		let that = this;

		if (f.type === 'enum' || f.type === 'cbb') {
            const df = f as DatasetComboField;
			return (
				<DatasetCombo uri={ this.props.uri }
					sk={df.sk} nv={ df.nv }
					disabled={ !!df.disabled }
					readOnly={ !df && f.disabled }
					options={ df.options || []} val={{n: undefined, v:rec[f.field]} }
					label={ df.label }
					style={ df.cbbStyle || {width: 200} }
					invalidStyle={ df.style }
					onSelect={ (v) => {
						rec[df.field] = v.v;
						df.style = undefined;
						that.setState({dirty: true});
					} }
				/>);
		}
		else if (f.type === 'formatter' || f.formatter) {
			return (
				<>{f.formatter(rec)}</>
			);
		}
		else {
            const tf = f as AnlistCol;
			let type = 'text';
			if (tf.type === 'float' || tf.type === 'int')
				type = 'number';
			return (
			<TextField key={tf.field} type={tf.type || type}
				disabled={!!tf.disabled}
				label={isSm && !that.props.dense ? L(tf.label) : ''}
				variant='outlined' color='primary' fullWidth
				placeholder={L(tf.label)} margin='dense'
				value={ !rec || (rec[tf.field] === undefined || rec[tf.field] === null) ? '' : rec[tf.field] }
				className={classes[tf.style as string]}
				onChange={(e) => {
					rec[tf.field] = e.target.value;
					tf.style = undefined;
					that.setState({dirty: true});
				}}
			/>);
		}
	} */

	formFields(rec, classes, media) {
		let fs = [];
		const isSm = this.props.dense || toBool(media.isMd);

		this.tier.fields().forEach( (f, i) => {
		  if (!!f.visible) {
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
				{this.formFields(rec, classes, media)}
			</Grid>
			: <></>; // NOTE have to wait until parent loaded data
	}
}

// CardFormComp.propTypes = {
// 	width: PropTypes.oneOf(["lg", "md", "sm", "xl", "xs"]).isRequired,
// 	tier: PropTypes.object.isRequired,
// 	dense: PropTypes.bool,
// 	enableValidate: PropTypes.bool,
// };

const DefaultCardForm = withWidth()(withStyles(styles)(CardFormComp)); // FIXME only after anreact upgraded
export { DefaultCardForm, CardFormComp }
