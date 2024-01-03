
import React, { MouseEvent } from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import withWidth from "@material-ui/core/withWidth";

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';
import Box from "@material-ui/core/Box";
import TextField from "@material-ui/core/TextField";
import Typography from '@material-ui/core/Typography';

import { AnFieldValidation, AnlistColAttrs, AnsonMsg, AnsonResp, CRUD, PkMeta, TierCol, TierComboField, Tierec } from '@anclient/semantier';

import { L } from '../../utils/langstr';
	import { toBool } from '../../utils/helpers';
	import { AnContext, AnContextType } from '../reactext';
	import { Comprops, CrudCompW, DetailFormW } from '../crud';
	import { DatasetCombo } from './dataset-combo'
	import { ConfirmDialog } from './messagebox';
	import { JsampleIcons } from '../../jsample/styles';
	import { ClassNames, CompOpts, Media } from '../../react/anreact';

const styles = (theme) => ({
  root: {
	display: 'flex',
	width: '100%',
  },
  row: {
	width: '100%',
	'& :hover': {
	  backgroundColor: '#ced'
	}
  },
  rowHead: {
	padding: theme.spacing(1),
  },
  folder: {
	width: '100%'
  },
  folderHead: {
	padding: theme.spacing(1),
	borderBottom: '1px solid #bcd',
	borderTop: '1px solid #bcd'
  },
  hide: {
	display: 'none'
  },
  labelText: {
	padding: theme.spacing(1),
	borderLeft: '1px solid #bcd',
  }
});

interface SimpleFormProps extends Comprops {
    // funcId: string;
    crud: CRUD;
    fields: TierCol[];
    // pk: string;
    pkval: PkMeta;
    parent: JSX.Element;
    parentId: string;
	mtabl: string;
}

/**Simple form is a dialog.
 * Use record form for UI record layout.
 */
class SimpleFormComp extends DetailFormW<SimpleFormProps> {
	uri = undefined;

    pkval: PkMeta = { pk: undefined, v: undefined };

	state = {
		crud: undefined,
		dirty: false,
		parent: undefined,
		parentId: undefined,

		nodeId: undefined,
		node: undefined,

        // pk: undefined as PkMeta,

		mtabl: '',
		// indId, indName, parent, sort, fullpath, css, weight, qtype, remarks, extra
		// type: Material UI: Type of the input element. It should be a valid HTML5 input type. (extended with enum, select)
		// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#Form_%3Cinput%3E_types
		fields: [
			{ type: 'text', field: 'parent', label: L('Parent Indicator'), hide: 1,
			  validator: {len: 12} },
			{ type: 'text', field: 'indName', label: L('Indicator'),
			  validator: {len: 200, notNull: true} },
			{ type: 'float', field: 'weight', label: L('Default Weight'),
			  validator: {min: 0.0} },
			{ type: 'enum', field: 'qtype', label: L('Question Type'),
			  values: [{n: 'single', v: 's'}, {n: 'multiple', v: 'm'}, {n: 'text', v: 't'}],
			  validator: {notNull: true} },
			{ type: 'number',field: 'sort', label: L('UI Sort'),
			  validator: undefined },
			{ type: 'text', field: 'remarks', label: L('Remarks'),
			  validator: {len: 500}, grid: {sm: 12, lg: 6} }
		] as AnlistColAttrs<JSX.Element, CompOpts>[],
		// hide pk means also not editable by user
		pkMeta: { type: 'text', field: 'indId', label: L('Indicator Id'), hide: 1,
			  validator: {len: 12} },
		record: {},
	};

    funcId: any;
    ok: JSX.Element;

    handleClose: (event: {}, reason: "backdropClick" | "escapeKeyDown") => void;

	constructor (props: SimpleFormProps) {
		super(props);

		this.funcId = props.funcId || 'SimpleForm';

		this.state.crud = props.crud;
		this.state.mtabl = props.mtabl;

		// this.state.pk = props.pk;
		this.pkval = props.pkval;

		this.state.parent = props.parent;
		this.state.parentId = props.parentId;

		this.uri = this.props.uri;

		this.formFields = this.formFields.bind(this);
		this.getField = this.getField.bind(this);

		this.validate = this.validate.bind(this);
		this.toSave = this.toSave.bind(this);

		this.toCancel = this.toCancel.bind(this);
		this.showOk = this.showOk.bind(this);
	}

	componentDidMount() {
		let that = this;

		if (this.state.crud !== CRUD.c) {
			if (!this.pkval.v)
				throw Error("The pkval property not been set correctly. Record can not be loaded.");

			// load the record
			const ctx = this.context as unknown as AnContextType;
			let queryReq = ctx.anClient.query(this.uri, this.props.mtabl, 'r')
			queryReq.Body().whereEq(this.pkval.pk, this.pkval.v);
			// FIXME but sometimes we have FK in record. Meta here?
			(ctx.uiHelper as AnContextType).bindStateRec({req: queryReq,
				onOk: (resp: AnsonMsg<AnsonResp>) => {
						let {rows, cols} = AnsonResp.rs2arr(resp.Body().Rs());
						if (!rows || rows.length !== 1)
							console.error("Query reults not correct. One and only one row is needed.", rows, queryReq)
						that.setState({record: rows[0]});
					}
				},
				ctx.error);
		}
	}

	validate(invalidStyle) {
		let that = this;

	    const invalid = Object.assign(invalidStyle || {}, { border: "2px solid red" });

		let valid = true;
	    this.state.fields.forEach( (f, x) => {
			f.valid = validField(f, v => !!v);
			f.style = f.valid ? undefined : invalid;
			valid &&= f.valid;
	    } );
		return valid;

		function validField (f: AnlistColAttrs<JSX.Element, CompOpts>, valider: AnFieldValidation | ((v: any) => boolean)): boolean {
			let v = that.state.record[f.field];

			if (f.type === 'int')
				if (v === '' || ! Number.isInteger(Number(v))) return false;

			if (typeof valider === 'function')
				return valider(v);
			else if (f.validator) {
				let vd = f.validator as AnFieldValidation;
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

	toSave(e: React.MouseEvent<HTMLInputElement>) {
		e.stopPropagation();

		if (!this.validate(this.props.invalidStyle)) {
	    	this.setState({});
			return;
		}

		let ctx = this.context as unknown as AnContextType;
		let client = ctx.anClient;
		let rec = this.state.record;
		let c = this.state.crud === CRUD.c;

		let req;

		// 1. collect record
		// nvs data must keep consists with jquery serializeArray()
		// https://api.jquery.com/serializearray/
		let nvs = [];
		let parentId = this.state.parentId;
		this.state.fields.forEach( (f, x) => {
			if (f.field === this.state.parent.field) {
				rec[f.field] = parentId;
				parentId = undefined;
			}
			nvs.push({name: f.field, value: rec[f.field]});
		} );

		if (parentId)
			nvs.push({name: this.state.parent.field, value: this.state.parentId});

		// console.log(nvs);

		// 2. request (insert / update)
		let {pk} = this.pkval;
		if (this.state.crud === CRUD.c) {
			nvs.push({name: pk, value: rec[pk]});
			req = client
				.usrAct(this.uri, CRUD.c, this.props.title || 'new record')
				.insert(this.uri, this.state.mtabl, nvs);
		}
		else {
			req = client
				.usrAct(this.funcId, CRUD.u, 'edit card')
				.update(this.uri, this.state.mtabl, this.pkval, nvs);
			req.Body()
				.whereEq(pk, rec[pk]);
		}

		let that = this;
		client.commit(req, (resp) => {
			that.state.crud = CRUD.u;
			that.showOk(L('Card saved!'));
			if (typeof that.props.onOk === 'function')
				that.props.onOk({code: resp.code, resp});
		}, ctx.error);
	}

	toCancel (e: React.MouseEvent<HTMLInputElement>) {
		e.stopPropagation();
		if (typeof this.props.onClose === 'function')
			this.props.onClose({code: 'cancel'});
	}

	showOk(txt: string | string[]) {
		let that = this;
		this.ok = (<ConfirmDialog ok={L('OK')} open={true}
					title={L('Info')}
					cancel={false} msg={txt}
					onClose={() => {that.ok === undefined} } />);

		if (typeof this.props.onSave === 'function')
			this.props.onSave({code: 'ok'});

		that.setState({dirty: false});
	}

	getField(f: AnlistColAttrs<JSX.Element, CompOpts>, rec: Tierec, media: { classes?: ClassNames; media?: Media; isSm?: any; }) {
		let {isSm} = media;

		if (f.type === 'cbb') {
			let that = this;
			let fd = f as TierComboField<JSX.Element, CompOpts>;
			return (<DatasetCombo uri={this.props.uri}
				options={fd.options} val={rec[fd.field]}
				label={f.label} style={fd.style}
				onSelect={ (v) => {
					rec[f.field] = v.v;
					that.setState({dirty: true});
				}}
			/>);
		}
		else{
			let type = undefined;
			if (f.type === 'float' || f.type === 'int')
				type = 'number'
			return (
			<TextField id={f.field} key={f.field}
				type={type || f.type}
				label={isSm ? L(f.label) : undefined}
				variant='outlined' color='primary' fullWidth
				placeholder={L(f.label)} margin='dense'
				value={!rec || rec[f.field] === undefined ? '' : rec[f.field]}
				inputProps={f.style ? { style: f.style } : undefined}
				onChange={(e) => {
					rec[f.field] = e.target.value;
					this.setState({ dirty : true });
				}}
			/>);
		}
	}

	formFields(rec: Tierec, opts?: {classes: ClassNames, media?: Media}) {
		let fs = [];
		let c = this.state.crud === CRUD.c;
		const isSm = toBool(opts?.media?.isMd);

		this.state.fields.forEach( (f, i) => {
		  if (f.visible === undefined || f.visible === false) {
			fs.push(
				<Grid item key={`${f.field}.${f.label}`}
					sm={f.grid?.sm ? f.grid.sm : 6}
					{...f.grid} className={opts?.classes.labelText} >
				  <Box className={opts?.classes.rowBox} >
					{!isSm && (
					  <Typography className={opts?.classes.formLabel} >
						{L(f.label)}
					  </Typography>
					)}
					{this.getField(f, rec, opts)}
				  </Box>
				</Grid> );
		} } );
		return fs;
	}

	render () {
		const { classes, width } = this.props;

		let c = this.state.crud === CRUD.c;
		let u = this.state.crud === CRUD.u;
		let rec = this.state.record;
		let media = CrudCompW.getMedia(width);

		let title = this.props.title ? this.props.title
					: c ? L('Add Details')
					: u ? L('Edit Details')
					: L('Details');

		return (<>
		  <Dialog className={classes.root}
			classes={{ paper: classes.dialogPaper }}
			open={true} fullWidth maxWidth='lg'
			onClose={this.handleClose}
		  >
			<DialogContent className={classes.content}>
			  <DialogTitle id='u-title' color='primary' >
				{title}
				{this.state.dirty ? <JsampleIcons.Star color='secondary'/> : ''}
			  </DialogTitle>
			  <Grid container className={classes.content} direction='row'>
				{this.formFields(rec, {classes, media})}
			  </Grid>
			</DialogContent>
			<DialogActions className={classes.buttons}>
			  <Button onClick={this.toSave} variant='contained' color='primary'>
				{(c || u) && L('Save')}
			  </Button>
			  <Button onClick={this.toCancel} variant='contained' color='primary'>
				{(c || u) ? L('Close') : L('Cancel')}
			  </Button>
			</DialogActions>
		  </Dialog>
		  {this.ok}
	  </>);
	}
}
SimpleFormComp.contextType = AnContext;

const SimpleForm = withStyles<any, any, SimpleFormProps>(styles)(withWidth()(SimpleFormComp));
export { SimpleForm, SimpleFormComp };
