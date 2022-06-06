import React from 'react';
import { Box, Button, Card, withWidth } from '@material-ui/core';
import { Theme, withStyles } from '@material-ui/core/styles';

import { CRUD, PkMeta, AnsonMsg, PageInf, OnLoadOk, Tierec, AnlistColAttrs, Semantier, OnCommitOk } from '@anclient/semantier';

import {
	L, Comprops, CrudComp,
	jsample, ConfirmDialog, TRecordForm, AnContext, invalidStyles, SpreadsheetResp,
} from '@anclient/anreact';
import { MyReq } from './my-decision';
const { JsampleIcons } = jsample;

const styles = (_theme: Theme) => (Object.assign (
	invalidStyles, {
	root: {
		// height: "calc(100vh - 92ch)"
		height: "72vh"
	},
	actionButton: {
	},
	usersButton: {
		// marginLeft: 20,
		// marginRight: 20,
		// marginTop: 6,
		margin: 6,
		width: 150,
	}
}));

export interface MyScore extends Tierec {
	kid: string;
	userName: string;
	grade: string;
	ielts: string;
	toefl: string;
	act: string;
	sat: string;
	admission: string;
	remarks: string;
}

class MyScoreTier extends Semantier {
	myscores: {};
	// kid?: string;

	/**
	 * 
	 * @param props uri, {pk: kid, v: not-used}
	 */
	constructor(props: {uri: string, pkval: PkMeta}) {
		super(props);

		this._fields = [
			{field: 'grade', label: L('Grade'), grid: {md: 12}, validator: {notNull: true} },
			{field: 'admission', label: 'admission', grid: {md: 12}},
			{field: 'toefl', label: 'TOEFL', grid: {md: 12}},
			{field: 'ielts', label: 'IELTS', grid: {md: 12}},
			{field: 'act', label: 'ACT', grid: {md: 12}},
			{field: 'sat', label: 'SAT', grid: {md: 12}},
		] as AnlistColAttrs<JSX.Element, {}>[];
	}

    record(conds: PageInf, onLoad: OnLoadOk<Tierec>) : void {
		let req = this.client.userReq(this.uri, 'mydecisions',
			new MyReq()
			.A(MyReq.A.loadScore) );
		
		let that = this;
		this.client.commit(req,
			(resp: AnsonMsg<SpreadsheetResp>) => {
				// let bd = resp.Body();
				// that.pkval.v = bd.resulve(that.pkval.tabl, that.pkval.pk, that.rec);
				// let {cols, rows} = AnsonResp.rs2arr(resp.Body().Rs());
				that.rec = resp.Body().rec;
				onLoad(undefined, [that.rec]);
			},
			this.errCtx);
	}

	saveRec(opts: { crud: CRUD; }, onOk: OnCommitOk) {
		if (!this.client) return;
		let client = this.client;
		let that = this;

		let { crud } = opts;

		if (crud === CRUD.u && (!this.pkval || !this.pkval.v))
			throw Error("Can't update with null ID.");

		this.rec.kid = this.pkval.v;

		let req = this.client.userReq(this.uri, 'mydecisions',
			new MyReq()
			.scores( this.rec as MyScore )
			.A(MyReq.A.scores) );

		client.commit(req,
			(resp) => {
				onOk(resp);
			},
			this.errCtx);
	}
}

class MyScoresComp extends CrudComp<Comprops & {uri: string}> {
    state = { }
	tier: MyScoreTier;
	confirm: JSX.Element;

	constructor (props: Comprops & {uri: string}) {
		super(props);

		this.uri = this.props.uri;

        this.tier = new MyScoreTier({
			uri: this.uri,
			pkval: {pk: 'kid', v: undefined, tabl: 'b_myscores'}});

		this.toSave = this.toSave.bind(this);
		this.showConfirm = this.showConfirm.bind(this);
	}

	componentDidMount() {
		console.log(this.props.uri);

		this.context = this.props.anContext || this.context;
		this.tier.setContext(this.context);

		this.tier.pkval.v = this.props.ssInf.uid;
		let {uid} = this.props.ssInf;

		this.tier.rec = {kid: uid};

		let that = this;
		this.tier.record(new PageInf(), () => {
			that.setState({});
		});
	}

	showConfirm(msg: string | string[]) {
		let that = this;
		this.confirm = (
			<ConfirmDialog title={L('Info')}
				ok={L('OK')} cancel={false} open
				onClose={() => {
					that.confirm = undefined;
					that.setState({});
				} }
				msg={msg} />);
		this.setState({});
	}

	toSave(e) {
		if (e) e.stopPropagation();

		let that = this;

		// if (this.tier.validate(undefined, this.tier.fields()))
		if (this.tier.validate())
			this.tier.saveRec(
				{ crud: this.tier.crud },
				resp => {
					// NOTE should crud be moved to tier, just like the pkval?
					if (that.tier.crud === CRUD.c) {
						that.tier.crud = CRUD.u;
					}
					that.showConfirm(L('Saving Succeed!\n') + (resp.Body().msg() || ''));
					if (typeof that.props.onSaved === 'function')
						that.props.onSaved(resp);
				} );
		else this.setState({});
	}

	render() {
		let { classes } = this.props;
		return (<>
		  <Card>{L('Standardized Test Scores')}
		    <Box>{this.tier?.rec?.userName}</Box>
		  </Card>
		  {this.tier &&
		  	<TRecordForm uri={this.props.uri}
					tier={this.tier}
					fields={this.tier.fields()}
					enableValidate={true}
			/>}
			<Button onClick={this.toSave}
				className={classes.actionButton} color="primary" variant="outlined">
				{L('Save')}
			</Button>
			{this.confirm}
		  </>
		);
	}
}
MyScoresComp.contextType = AnContext;

const MyScores = withStyles<any, any, Comprops>(styles)(withWidth()(MyScoresComp));

export { MyScoreTier, MyScores, MyScoresComp }
