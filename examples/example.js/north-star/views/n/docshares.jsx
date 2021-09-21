import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import withWidth from "@material-ui/core/withWidth";
import PropTypes from "prop-types";
import { TextField, Button, Grid, Card, Typography, Link } from '@material-ui/core';

import { Protocol, AnsonResp, DocsReq, Semantier } from '@anclient/semantier';
import { L, Langstrs,
    AnConst, AnContext, AnError, CrudCompW, AnReactExt,
	AnQueryst, AnTablist, DatasetCombo, ConfirmDialog, jsample
} from '@anclient/anreact';
const { JsampleIcons } = jsample;

import { DocshareDetails } from './docshare-details';

const { CRUD } = Protocol;

const styles = (theme) => ( {
	root: {
	},
	button: {
	},
 	fileInput: {
		border: "solid 1px #f777",
		width: "100%",
		height: "100%",
		position: "relative",
		top: -52,
		opacity: 0
	}
} );

class DocsharesComp extends CrudCompW {
	state = {
		buttons: { add: true, edit: false, del: false},
		pageInf: { page: 0, size: 10, total: 0 },
		selected: {},
	};

	tier = undefined;

	constructor(props) {
		super(props);

		this.state.selected.Ids = new Set();

		this.closeDetails = this.closeDetails.bind(this);
		this.toSearch = this.toSearch.bind(this);

		this.toAdd = this.toAdd.bind(this);
		this.toEdit = this.toEdit.bind(this);
		this.onTableSelect = this.onTableSelect.bind(this);
		this.toDel = this.toDel.bind(this);
		this.del = this.del.bind(this);
	}

	componentDidMount() {
		if (!this.tier) {
			this.getTier()
		}
	}

	getTier = () => {
		this.tier = new DocsTier(this);
		this.tier.setContext(this.context);
	}

	fileInput = undefined;

	/** If condts is null, use the last condts to query.
	 * on succeed: set state.rows.
	 * @param {object} condts the query conditions collected from query form.
	 */
	toSearch(condts) {
		// querst.onLoad (query.componentDidMount) event can even early than componentDidMount.
		if (!this.tier) {
			this.getTier();
		}

		let that = this;
		this.q = condts || this.q;
		this.tier.records( this.q,
			(cols, rows) => {
				that.state.selected.Ids.clear();
				that.setState(rows);
			} );
	}

	onTableSelect(rowIds) {
		this.setState( {
			buttons: {
				// NOTE: is this also CRUD semantics?
				add: this.state.buttons.add,
				edit: rowIds && rowIds.size === 1 && !('loading' in rowIds),
				del:  rowIds && rowIds.size >= 1  && !('loading' in rowIds),
			},
		} );
	}

	toDel(e, v) {
		let that = this;
		this.confirm = (
			<ConfirmDialog title={L('Info')}
				ok={L('Ok')} cancel={true} open
				onOk={ that.del }
				onClose={() => {that.confirm = undefined;} }
				msg={L('{cnt} record(s) will be deleted, proceed?', {cnt: this.state.selected.Ids.size})} />);
	}

	del() {
		let that = this;
		this.tier.del({
				uri: this.uri,
				ids: this.state.selected.Ids },
			resp => {
				that.confirm = (
					<ConfirmDialog title={L('Info')}
						ok={L('Ok')} cancel={false} open
						onClose={() => {
							that.confirm = undefined;
							that.toSearch();
						} }
						msg={L('Deleting Succeed!')} />);
				that.toSearch();
			} );
	}

	toAdd(e, v) {
		let files = this.fileInput.files;
		this.tier.upload(files);
	}

	toEdit(e, v) {
		let that = this;
		let pkv = [...this.state.selected.Ids][0];
		this.tier.pkval = pkv;
		this.recForm = (<DocshareDetails crud={CRUD.u}
			uri={this.uri}
			tier={this.tier}
			recId={pkv}
			onOk={(r) => that.toSearch()}
			onClose={this.closeDetails} />);
	}

	closeDetails() {
		this.recForm = undefined;
		this.setState({});
	}

	render() {
		const { classes } = this.props;
		let btn = this.state.buttons;
		let tier = this.tier;

		return (<div className={classes.root}>
			{this.props.funcName || this.props.title || 'Documents Sharing'}

			<DocsQuery uri={this.uri} onQuery={this.toSearch} />

			<Grid container alignContent="flex-end" >
				// <Button variant="contained" disabled={!btn.add}
				// 	className={classes.button} onClick={this.toAdd}
				// 	startIcon={<JsampleIcons.Add />}
				// >{L('Add')}</Button>

				<Box className={ this.props.classBox || classes.imgUploadBox }>
					<Button variant="contained" disabled={!btn.add}
						className={classes.button} onClick={}
						startIcon={<JsampleIcons.Add />}
					<input type='file' className={ classes.fileInput }
				 		ref={ (ref) => this.fileInput = ref }
				 		onChange={ this.toAdd } />
				</Box>);

				<Button variant="contained" disabled={!btn.edit}
					className={classes.button} onClick={this.toEdit}
					startIcon={<JsampleIcons.Edit />}
				>{L('Share')}</Button>
				<Button variant="contained" disabled={!btn.del}
					className={classes.button} onClick={this.toDel}
					startIcon={<JsampleIcons.Delete />}
				>{L('Delete')}</Button>
			</Grid>

			{tier && <AnTablist pk={tier.pk}
				className={classes.root} checkbox={tier.checkbox}
				selectedIds={this.state.selected}
				columns={tier.columns( {mime: {formatter: (rec, c) => getMimeIcon(v)}} )}
				rows={tier.rows}
				pageInf={this.pageInf}
				onPageInf={this.onPageInf}
				onSelectChange={this.onTableSelect}
			/>}
			{this.recForm}
			{this.confirm}
		</div>);

		function getMimeIcon(rec, f) {
			console.log(rec[f.field]);
			return (<>[DocIcon]</>);
		}
	}
}
DocsharesComp.contextType = AnContext;

const Docshares = withWidth()(withStyles(styles)(DocsharesComp));
export { Docshares, DocsharesComp }

class DocsQuery extends React.Component {
	conds = [
		{ name: 'docName', type: 'text', val: '', label: L('File Name') },
		{ name: 'tag',     type: 'text', val: '', label: L('Tag') },
		{ name: 'doctype', type: 'cbb',  val: '', label: L('Format'),
		  options: [{text: 'Word', value: 'doc'}, {text: 'PDF', value: 'pdf'}],
		  nv: {n: 'text', v: 'value'} },
	];

	constructor(props) {
		super(props);
		this.collect = this.collect.bind(this);
	}

	collect() {
		return {
			docName: this.conds[0].val ? this.conds[0].val : undefined,
			tag    : this.conds[1].val ? this.conds[1].val.v : undefined,
			doctype: this.conds[2].val ? this.conds[2].val.v : undefined };
	}

	/** Design Note:
	 * Problem: This way bound the query form, so no way to expose visual effects modification?
	 */
	render () {
		let that = this;
		return (
		<AnQueryst {...this.props}
			conds={this.conds}
			onSearch={() => this.props.onQuery(that.collect()) }
			onLoaded={() => that.props.onQuery(that.collect()) }
		/> );
	}
}
DocsQuery.propTypes = {
	uri: PropTypes.string.isRequired,
	onQuery: PropTypes.func.isRequired
}

export class DocsTier extends Semantier {
	mtabl = 'n_docs';
	pk = 'docId';
	checkbox = true;
	client = undefined;
	uri = undefined;
	rows = [];
	pkval = undefined;
	rec = {};

	_cols = [
		{ text: L(''), field: 'docId', checked: true },
		{ text: L(''), field: 'mime' },
		{ text: L('File Name'), field: 'docName' },
		{ text: L('Shared With'), field: 'sharings' } ];

	constructor(comp) {
		super(comp.port || 'docstier');
		this.uri = comp.uri || comp.props.uri;
	}

	columns(modifier) {
		if (modifier)
			return this._cols.map( (c, x) =>
				typeof modifier[c.field] === 'function' ?
						{...c, ...modifier[c.field](c, x) } :
						{...c, ...modifier[c.field]}
			);
		else
			return this._cols;
	}

	upload(files) {
		if (!files) return;

		let that = this;

		files.forEach( (file, x) => {
			let row = {
				docId: 'loading',
				uri  : content,
				mime : mimeOf( reader.result ),
				docName: file.name,
				reader: new FileReader()
			};
			that.rows.push(row);

			row.onLoad = function (e) {
				row.uri = row.reader.result;
				delete row.reader;
				delete row.onLoad;
				that.saveRec();
				that.setState({});
			}

			row.reader.readAsDataURL(file);
		});
	}

	records(conds, onLoad) {
		if (!this.client) return;

		let client = this.client;
		let that = this;

		let req = client.userReq(this.uri, this.port,
					new DocsReq( this.uri, conds )
					.A(DocsReq.A.records) );

		client.commit(req,
			(resp) => {
				let {cols, rows} = AnsonResp.rs2arr(resp.Body().Rs());
				that.rows = rows;
				onLoad(cols, rows);
			},
			this.errCtx);
	}

	record(conds, onLoad) {
		if (!this.client) return;
		let client = this.client;
		let that = this;

		let req = client.userReq(this.uri, this.port,
					new DocsReq( this.uri, conds )
					.A(DocsReq.A.rec) );

		client.commit(req,
			(resp) => {
				let {cols, rows} = AnsonResp.rs2arr(resp.Body().Rs());
				that.rec = rows && rows[0];
				onLoad(cols, rows);
			},
			this.errCtx);
	}

	/**
	 * @param {object} opts
	 * @param {string} opts.uri
	 * @param {object} opts.rec { docId, uri, mime, docName, size }
	 * @param {function} onOk
	 */
	saveRec(opts, onOk) {
		if (!this.client) return;
		let client = this.client;
		let that = this;

		let { uri, rec } = opts;
		let {docId, docName, mime, size} = rec;
		let crud = docId === 'loading' ? CRUD.c : CRUD.u;

		let req = this.client
					.usrAct( this.uri, crud, "upload", "share docs" )
					.update( this.uri, this.mtabl,
							{pk: this.pk, v: rec[this.pk]},
							rec );

		client.commit(req,
			(resp) => {
				let bd = resp.Body();
				if (crud === CRUD.c)
					// NOTE:
					// resulving auto-k is a typicall semantic processing, don't expose this to caller
					rec[that.pk] = bd.resulve(that.mtabl, that.pk, rec);
				onOk(resp);
			},
			this.errCtx);
	}

	/**
	 * @param {Set} ids record id
	 * @param {function} onOk: function(AnsonResp);
	 */
	del(opts, onOk) {
		if (!this.client) return;
		let client = this.client;
		let that = this;
		let { uri, ids } = opts;

		if (ids && ids.size > 0) {
			let req = this.client.userReq(uri, this.port,
				new DocsReq( uri, { deletings: [...ids] } )
				.A(DocsReq.A.del) );

			client.commit(req, onOk, this.errCtx);
		}
	}
}

export class DocsReq extends UserReq {
	static type = 'io.oz.ever.conn.n.docs.DocsReq';
	static __init__ = function () {
		// Design Note:
		// can we use dynamic Protocol?
		Protocol.registerBody(DocsReq.type, (jsonBd) => {
			return new DocsReq(jsonBd);
		});
		return undefined;
	}();

	static A = {
		records: 'records',
		rec: 'rec',
		update: 'u',
		insert: 'c',
		del: 'd',

		preview: 'r/preview',
	}

	constructor (uri, args = {}) {
		super();
		this.type = DocsReq.type;
		this.uri = uri;
		this.docId = args.docId;
		this.docName = args.docName;
		this.doctype = args.doctype;

		/// case u
		this.pk = args.pk;
		this.record = args.record;

		// case d
		this.deletings = args.deletings;
	}
}
