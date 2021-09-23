import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import withWidth from "@material-ui/core/withWidth";
import PropTypes from "prop-types";
import { TextField, Button, Grid, Card, Typography, Link } from '@material-ui/core';

import { Protocol, AnsonResp , UserReq } from '@anclient/semantier';
import { L, Langstrs,
    AnConst, AnContext, AnError, CrudCompW, AnReactExt,
	AnQueryst, AnTablist, DatasetCombo, ConfirmDialog, jsample
} from '@anclient/anreact';
const { JsampleIcons } = jsample;

// import { PdvViewer } from './docshare-details';

const { CRUD } = Protocol;

const styles = (theme) => ( {
	root: {
	},
	button: {
	}
} );

class MyDocsComp extends CrudCompW {
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
		// this.state.selected.Ids = rowIds
		this.setState( {
			buttons: {
				// is this all CRUD semantics?
				add: this.state.buttons.add,
				edit: rowIds && rowIds.length === 1,
				del: rowIds &&  rowIds.length >= 1,
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
		let that = this;
		this.tier.pkval = undefined;
		this.tier.rec = {};

		this.recForm = (<UserDetailst crud={CRUD.c}
			uri={this.uri}
			tier={this.tier}
			onOk={(r) => that.toSearch()}
			onClose={this.closeDetails} />);
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

			<UsersQuery uri={this.uri} onQuery={this.toSearch} />

			<Grid container alignContent="flex-end" >
				<Button variant="contained" disabled={!btn.add}
					className={classes.button} onClick={this.toAdd}
					startIcon={<JsampleIcons.Add />}
				>{L('Add')}</Button>
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
			return (<>[Doc]</>);
		}
	}
}
MyDocsComp.contextType = AnContext;

const MyDocs = withWidth()(withStyles(styles)(MyDocsComp));
export { MyDocs, MyDocsComp }
