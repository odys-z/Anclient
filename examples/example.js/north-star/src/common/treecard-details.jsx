
import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import withWidth from "@material-ui/core/withWidth";

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import Box from "@material-ui/core/Box";
import TextField from "@material-ui/core/TextField";
import Typography from '@material-ui/core/Typography';
import Input from '@material-ui/core/Input';

import { L, toBool,
	AnConst, Protocol, AnsonResp,
	CrudCompW, AnContext, AnError, AnQueryForm, AnTreeIcons
} from 'anclient'

import { StarIcons } from '../styles';

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

class TreeCardDetailsComp extends CrudCompW {
	state = {
		crud: undefined,
		dirty: false,
		parentId: undefined,
		nodeId: undefined,
		node: undefined,

		mtabl: '',
		// indId, indName, parent, sort, fullpath, css, weight, qtype, remarks, extra
		// type: Material UI: Type of the input element. It should be a valid HTML5 input type. (extended with enum, select)
		// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#Form_%3Cinput%3E_types
		fields: [
			{type: 'text', validator: {len: 12},  field: 'parentId', label: L('Indicator Id'), hide: 1},
			{type: 'text', validator: {len: 200}, field: 'indName', label: L('Indicator')},
			{type: 'float',validator: {min: 0.0}, field: 'weight', label: L('Default Weight')},
			{type: 'enum', validator: undefined, values: [{n: 'single', v: 's'}, {n: 'multiple', v: 'm'}, {n: 'text', v: 't'}],
			                                      field: 'qtype', label: L('Question Type')},
			{type: 'number',validator:{min: 0},   field: 'sort', label: L('UI Sort')},
			{type: 'text', validator: {len: 500}, field: 'remarks', label: L('Remarks')}
		],
		// hide pk means also not editable by user
		pk: {type: 'text', validator: {len: 12},  field: 'indId', label: L('Indicator Id'), hide: 1},
		record: {},
	};

	constructor (props = {}) {
		super(props);

		this.state.crud = props.c ? Protocol.CRUD.c : Protocol.CURD.u;
		this.mtabl = props.mtabl;

		if (this.state.crud !== Protocol.CRUD.c)
			this.state.record[this.state.pk.field] = props.pk;

		this.state.parentId = props.pid;

		this.formFields = this.formFields.bind(this);
		this.getField = this.getField.bind(this);
		this.toSave = this.toSave.bind(this);
		this.toCancel = this.toCancel.bind(this);
		this.showOk = this.showOk.bind(this);

		console.log(super.media);
	}

	toSave(e) {
		e.stopPropagation();

		if (!this.validate()) {
	    	this.setState({});
			return;
		}

		let client = this.context.anClient;
		let rec = this.state.record;
		let c = this.state.crud === Protocol.CRUD.c;

		let req;

		// 1. collect record
		// nvs data must keep consists with jquery serializeArray()
		// https://api.jquery.com/serializearray/
		let nvs = [];
		this.state.fields.forEach( (f, x) => {
			// e.g.
			// nvs.push({name: 'remarks', value: rec.remarks});
			// nvs.push({name: 'roleName', value: rec.roleName});
			nvs.push({name: f.field, value: rec[f.field]});
		} );

		// 2. request (insert / update)
		let pk = this.state.pk;
		if (this.state.crud === Protocol.CRUD.c) {
			nvs.push({name: pk.field, value: rec[pk.field]});
			req = client
				.usrAct(uiName, Protocol.CRUD.c, 'new card')
				.insert(null, this.state.mtabl, nvs);
		}
		else {
			req = client
				.usrAct(uiName, Protocol.CRUD.u, 'edit card')
				.update(null, this.state.mtabl, pk.field, nvs);
			req.Body()
				.whereEq(pk.field, rec[pk.field]);
		}

		let that = this;
		client.commit(req, (resp) => {
			that.state.crud = Protocol.CRUD.u;
			that.showOk(L('Card saved!'));
			if (typeof that.props.onOk === 'function')
				that.props.onOk({code: resp.code, resp});
		}, this.context.error);
	}

	toCancel (e) {
		e.stopPropagation();
		if (typeof this.props.onClose === 'function')
			this.props.onClose({code: 'cancel'});
	}

	showOk(txt) {
		let that = this;
		this.ok = (<ConfirmDialog ok={L('OK')} open={true}
					title={L('Info')}
					cancel={false} msg={txt}
					onClose={() => {that.ok === undefined} } />);

		if (typeof this.props.onSave === 'function')
			this.props.onSave({code: 'ok'});

		that.setState({dirty: false});
	}

	getField(f, rec) {
		let small = super.media.isSm;

		if (f.type === 'enum' || f.type === 'cbb') {
			let that = this;
			return (<DatasetCombo options={[
				{n: L('Single Opt'), v: 's'},
				{n: L('Multiple'), v: 'm'},
				{n: L('Text'), v: 't'} ]}
				label={f.label}
				onSelect={ (v) => {
					rec[f.field] = v;
					that.setState({dirty: true})}}
			/>);
		}
		else return (
			<TextField id={f.field} key={f.field}
				type={f.type}
				label={small ? L(f.label) : undefined}
				variant='outlined' color='primary' fullWidth
				placeholder={L(f.label)} margin='dense'
				value={rec[f.field] === undefined ? '' : rec[f.field]}
				inputProps={f.style ? { style: f.style } : undefined}
				onChange={(e) => {
					rec[f.field] = e.target.value;
					this.setState({ dirty : true });
				}}
			/>);
	}

	formFields(rec, classes) {
		let fs = [];
		let c = this.state.crud === Protocol.CRUD.c;
		const small = toBool(super.media.isMd);

		this.state.fields.forEach( (f, i) => {
		  if (!f.hide) {
			fs.push(
				<Grid item key={`${f.field}.${f.label}`} sm={6} className={classes.labelText}>
				  <Box className={classes.rowBox}>
					{!small && (
					  <Typography className={classes.formLabel}>
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
		// const smallSize = new Set(['xs', 'sm']).has(width);
		const smallSize = super.media.isSm;

		let c = this.state.crud === Protocol.CRUD.c;
		let u = this.state.crud === Protocol.CRUD.u;
		let rec = this.state.record;

		let title = this.state.title ? this.state.title
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
				{this.state.dirty ? <StarIcons.Star color='secondary'/> : ''}
			  </DialogTitle>
			  <Grid container className={classes.content} direction='row'>
				{this.formFields(rec, classes)}
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
TreeCardDetailsComp.contextType = AnContext;

const TreeCardDetails = withWidth()(withStyles(styles)(TreeCardDetailsComp));
export { TreeCardDetails, TreeCardDetailsComp };
