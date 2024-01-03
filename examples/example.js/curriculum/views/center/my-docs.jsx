import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import withWidth from "@material-ui/core/withWidth";
import { Button, Grid } from '@material-ui/core';

import { CRUD, AnsonResp } from '@anclient/semantier';
import { L, AnContext, CrudCompW, AnTablist, jsample, utils
} from '@anclient/anreact';
const { JsampleIcons } = jsample;

import { starTheme } from '../../common/star-theme';
import { DocsTier, DocsQuery, DocsReq, docListyle } from '../n-tsx/docshares';
import { MyDocView } from './mydoc-view';

const styles = (theme) => Object.assign(starTheme(theme),
	Object.assign(docListyle(theme), {
	button: {
		height: 40,
		width: 140,
		padding: theme.spacing(1),
		margin: theme.spacing(1),
	}
} ));

class MyDocsComp extends CrudCompW {
	state = {
		buttons: { add: true, edit: false, del: false },
		pageInf: { page: 0, size: 10, total: 0 },
		selected:{ ids: new Set() },
	};

	tier = undefined;

	fileInput = undefined;

	downloadLink = React.createRef();

	constructor(props) {
		super(props);

		this.state.selected.ids = new Set();

		this.closeDetails = this.closeDetails.bind(this);
		this.toSearch = this.toSearch.bind(this);

		this.onTableSelect = this.onTableSelect.bind(this);
		this.toView = this.toView.bind(this);
		this.toDownload = this.toDownload.bind(this);
	}

	componentDidMount() {
		if (!this.tier) {
			this.getTier()
		}
	}

	getTier = () => {
		this.tier = new MyDocsTier(this);
		this.tier.setContext(this.context);
	}

	/** If condts is null, use the last condts to query.
	 * on succeed: set state.rows.
	 * @param {object} condts the query conditions collected from query form.
	 */
	toSearch(condts) {
		if (!this.tier) {
			this.getTier();
		}

		let that = this;
		this.q = condts || this.q;
		this.tier.records( this.q,
			(cols, rows) => {
				that.state.selected.ids.clear();
				that.setState(rows);
			} );
	}

	onTableSelect(rowIds) {
		this.setState( {
			buttons: {
				add: this.state.buttons.add,
				edit: rowIds && rowIds.length === 1 && this.tier.canView(rowIds[0]).view,
				del: rowIds &&  rowIds.length >= 1,
			},
		} );
	}

	toDownload(e, v) {
		let that = this;
		let docId = [...this.state.selected.ids][0];
		this.tier.pkval.v = docId;

		if (this.tier.pkval.v) {
			let that = this;
			let cond = {};
			cond[this.tier.pk] = this.tier.pkval.v;
			
			this.tier.record(cond, (cols, rows) => {
				that.downloadLink.current.download = rows[0].docName;
				that.downloadLink.current.href = utils.urlOfdata(rows[0].mime, rows[0].uri64);
				that.downloadLink.current.click();
			} );
		}
	}

	toView(e, v) {
		let docId = [...this.state.selected.ids][0];
		this.tier.pkval.v = docId;
		this.recForm = (<MyDocView crud={CRUD.r}
			uri={this.uri}
			tier={this.tier}
			recId={docId}
			onOk={(r) => that.toSearch()}
			onClose={this.closeDetails} />);
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
			{L(this.props.funcName || this.props.title || 'Shared Documents')}

			<DocsQuery uri={this.uri} onQuery={this.toSearch} />

			<Grid container alignContent="flex-end" >
				<Button variant="contained" disabled={!btn.edit}
					className={classes.button} onClick={this.toView}
					startIcon={<JsampleIcons.Edit />}
				>{L('Preview')}</Button>
				<Button variant="contained" disabled={!btn.del}
					className={classes.button} onClick={this.toDownload}
					startIcon={<JsampleIcons.Export />}
				>{L('Download')}</Button>
				<a ref={this.downloadLink} style={{display: "none"}}></a>
			</Grid>

			{tier && <AnTablist pk={tier.pk} selected={this.state.selected}
				className={classes.root} checkbox={tier.checkbox}
				columns={tier.columns( {
					mime: {formatter: (v, x, rec) => DocsTier.getMimeIcon(v, rec, classes)}} )}
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
MyDocsComp.contextType = AnContext;

const MyDocs = withWidth()(withStyles(styles)(MyDocsComp));
export { MyDocs, MyDocsComp }

export class MyDocsTier extends DocsTier {
	constructor(comp) {
		super(comp);
	}

	_cols = [
		{ text: L(''), field: 'docId', checked: true },
		{ text: L(''), field: 'mime' },
		{ text: L('File Name'), field: 'docName' },
		{ text: L('Owner'), field: 'sharer' } ];

	records(conds, onLoad) {
		if (!this.client) return;

		let client = this.client;
		let that = this;

		let req = client.userReq(this.uri, this.port,
					new DocsReq( this.uri, conds )
					.A(DocsReq.A.mydocs) );

		client.commit(req,
			(resp) => {
				let {cols, rows} = AnsonResp.rs2arr(resp.Body().Rs());
				that.rows = rows;
				that.resetFormSession();
				onLoad(cols, rows);
			},
			this.errCtx);
	}

	canView(docId) {
		// FIXME probably we need a better Tablist.onSelect handler
		if (this.rows) {
			const viewables = new Set(['.pdf', 'image']);
			for (let i = 0; i < this.rows.length; i++)
				if (this.rows[i].docId === docId) {
					let typ = utils.regex.mime2type(this.rows[i].mime);
					return {view: viewables.has(typ), ix: i};
				}
		}
		return {view: false, ix: -1};
	}

	docData() {
		return utils.urlOfdata(this.rec.mime, this.rec.uri64);
	}
}
