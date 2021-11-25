import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import withWidth from "@material-ui/core/withWidth";
import PropTypes from "prop-types";
import { Box, TextField, Button, Grid, Card, Typography, Link } from '@material-ui/core';

import { Protocol, AnsonResp, InsertReq, AnsonBody, Semantier } from '@anclient/semantier-st';
import { L, Langstrs,
    AnConst, AnContext, AnError, CrudCompW, AnReactExt,
	AnQueryst, AnTablist, DatasetCombo, ConfirmDialog, jsample, utils
} from '@anclient/anreact';
const { JsampleIcons } = jsample;
const { mimeOf, dataOfurl, urlOfdata, regex } = utils;

import { starTheme } from '../../common/star-theme';
import { DocshareDetails } from './docshare-details';

const { CRUD } = Protocol;

export const docListyle = (theme) => {return {
	imgUploadBox: {
		width: 102,
		height: 40,
		marginRight: theme.spacing(2),
	},
	iconCell: {
		height: 24,
	},
 	fileInput: {
		border: "solid 1px red",
		width: "100%",
		height: "100%",
		position: "relative",
		top: -48,
		opacity: 0
	}
}; };

const styles = (theme) => Object.assign(starTheme(theme), docListyle(theme));

class DocsharesComp extends CrudCompW {
	state = {
		buttons: { add: true, edit: false, del: false},
		pageInf: { page: 0, size: 10, total: 0 },
		selected: {},
	};

	tier = undefined;

	fileInput = undefined;

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
				edit: rowIds && rowIds.length === 1 && !('loading' in new Set(rowIds)),
				del:  rowIds && rowIds.length >= 1  && !('loading' in new Set(rowIds)),
			},
		} );
	}

	toDel(e, v) {
		let that = this;
		this.confirm = (
			<ConfirmDialog title={L('Info')}
				ok={L('OK')} cancel={true} open
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
						ok={L('OK')} cancel={false} open
						onClose={() => {
							that.confirm = undefined;
							that.toSearch();
						} }
						msg={L('Deleting Succeed!')} />);
				that.toSearch();
			} );
	}

	toAdd(e, v) {
		let that = this;
		let files = this.fileInput.files;
		this.tier.upload(files, (docId) => {
			that.tier.pkval = docId; // FIXME NOTE where is the best place to do this?

			this.state.selected.Ids.clear();
			this.state.selected.Ids.add(docId);
			that.toEdit(e, docId);
		});
	}

	toEdit(e, v) {
		let that = this;
		this.tier.pkval = [...this.state.selected.Ids][0];
		this.recForm = (<DocshareDetails u
			uri={this.uri}
			tier={this.tier}
			onOk={(r) => that.toSearch()}
			onClose={this.closeDetails} />);
		that.setState({});
	}

	closeDetails() {
		this.recForm = undefined;
		this.tier.resetFormSession();
		this.setState({});
	}

	render() {
		const { classes } = this.props;
		let btn = this.state.buttons;
		let tier = this.tier;

		return (<div className={classes.root}>
			{L(this.props.funcName || this.props.title || 'Documents Sharing')}

			<DocsQuery uri={this.uri} onQuery={this.toSearch} />

			<Grid container alignContent="flex-end" >
				<Box className={ this.props.classBox || classes.imgUploadBox }>
					<Button variant="contained" disabled={!btn.add}
						className={classes.button}
						startIcon={<JsampleIcons.Add />}
					>{L('File')}</Button>
					<input type='file' className={ classes.fileInput }
				 		ref={ (ref) => this.fileInput = ref }
				 		onChange={ this.toAdd } />
				</Box>
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
				columns={tier.columns( {mime: {formatter: (v, x, rec) => DocsTier.getMimeIcon(v, rec, classes)}} )}
				rows={tier.rows}
				pageInf={this.pageInf}
				onPageInf={this.onPageInf}
				onSelectChange={this.onTableSelect}
			/>}
			{this.recForm}
			{this.confirm}
		</div>);

	}
}
DocsharesComp.contextType = AnContext;

const Docshares = withWidth()(withStyles(styles)(DocsharesComp));
export { Docshares, DocsharesComp }

export class DocsQuery extends React.Component {
	conds = [
		// FIXME 'name' not used?
		{ name: 'docName', type: 'text', val: '', label: L('File Name') },
		{ name: 'tag',     type: 'text', val: '', label: L('Tag') },
		{ name: 'mime',    type: 'cbb',  val: '', label: L('Format'),
		  options: [{n: 'Office Word', v: 'doc'},
		  			{n: 'Office Excel', v: 'xsl'},
					{n: 'Office PPT', v: 'ppt'},
					{n: 'PDF', v: 'pdf'},
					{n: 'Image', v:'image'}] },
	];

	constructor(props) {
		super(props);
		this.collect = this.collect.bind(this);
	}

	collect() {
		return {
			docName: this.conds[0].val ? this.conds[0].val : undefined,
			tag    : this.conds[1].val ? this.conds[1].val : undefined,
			mime   : this.conds[2].val ? regex.type2mime(this.conds[2].val.v) : undefined };
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
	port = 'docstier';
	mtabl = 'n_docs';
	pk = 'docId';

	reltabl = 'n_doc_kid';
	rel = {'n_doc_kid': {
		fk: 'docId',  // fk to main table
		col: 'userId',// checking col
		sk: 'trees.doc_kid' }};
	checkbox = true;

	client = undefined;
	rows = [];
	pkval = undefined;
	rec = {};

	_cols = [
		{ text: L('ID'), field: 'docId', checked: true },
		{ text: L('Doc Type'), field: 'mime' },
		{ text: L('File Name'), field: 'docName' },
		{ text: L('Shared With'), field: 'sharings' } ];

	_fields = [
		{ type: 'text', field: 'docId',   label: 'Doc ID',
		  disabled: true },
		{ type: 'text', field: 'docName', label: 'File Name',
		  disabled: true },
		{ type: 'text', field: 'mime',    label: 'File Type',
		  disabled: true, formatter: undefined }
	];

	constructor(comp) {
		super(comp);
	}

	upload(files, onOk) {
		if (!files) return;

		let that = this;
		let client = this.client;

		files.forEach( (file, x) => {
			let row = {
				docId: 'loading',
				// uri  : undefined,
				mime : undefined,
				docName: file.name,
				reader: new FileReader()
			};
			that.rows.push(row);

			row.reader.onload = function (e) {
				// FIXME how about stream mode?
				row.mime = mimeOf( row.reader.result );
				row.uri64 = dataOfurl( row.reader.result );
				delete row.reader;
				row.docId = undefined;

				// file always uploaded as insertion, - delete first (even null Id)
				let req = client
					.userReq( that.uri, that.port,
					new DocsReq( that.uri, { deletings: [that.pkval], ...row } )
					.A( DocsReq.A.upload ) );

				client.commit(req,
					(resp) => {
						let bd = resp.Body();
						// NOTE:
						// resulving auto-k is a typicall semantic processing, don't expose this to caller
						row[that.pk] = bd.resulve(that.mtabl, that.pk, row);

						console.log(row[that.pk]); // safe for concurrent uploading?
						onOk(row[that.pk]);
					},
					that.errCtx);
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
				that.resetFormSession();
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
	 * @param {Set} ids record id
	 * @param {function} onOk: function(AnsonResp);
	 */
	del(opts, onOk) {
		if (!this.client) return;
		let client = this.client;
		let that = this;
		let { uri, ids, posts } = opts;

		if (ids && (ids.size > 0 || ids.length > 0)) {
			let req = this.client.userReq(uri, this.port,
				new DocsReq( uri, { deletings: [...ids] } )
				.A(DocsReq.A.del) );

			client.commit(req, onOk, this.errCtx);
		}
	}

	/**
	 * @param{string} mime
	 * @param{object} rec
	 * @param{object} classes
	 * @param{string} iconpath
	 * @return{React.fragment} <img/>
	 */
	static getMimeIcon(mime, rec, classes, iconpath) {
		const known = { image: 'image.svg', '.txt': 'text.svg',
				'.doc': 'docx.svg', '.docx': 'docx.svg', '.zip': '7zip.svg',
				'.pdf': 'pdf.svg', '.rtf': 'txt.svg'};
		const unknown = 'unknown.svg';
		iconpath = iconpath || '/res-vol/icons';

		let src = regex.mime2type(mime);
		if (src) src = known[src];
		else src = unknown

		return (<img className={classes.iconCell} src={`${iconpath}/${src}`}></img>);
	}

}

export class DocsReq extends AnsonBody {
	static type = 'io.odysz.semantic.tier.docs.DocsReq';
	static __init__ = function () {
		// Design Note:
		// can we use dynamic Protocol?
		Protocol.registerBody(DocsReq.type, (jsonBd) => {
			return new DocsReq(jsonBd);
		});
		return undefined;
	}();

	static A = {
		records: 'r/list',
		mydocs: 'r/my-docs',
		rec: 'r/rec',
		upload: 'c',
		del: 'd',
		//preview: 'r/preview',
	}

	constructor(uri, args = {}) {
		super();
		this.type = DocsReq.type;
		this.docId = args.docId;
		this.docName = args.docName;
		this.mime = args.mime;
		this.uri64 = args.uri64;

		// case d
		this.deletings = args.deletings;
	}
}
