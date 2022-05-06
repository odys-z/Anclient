import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import withWidth from "@material-ui/core/withWidth";
import Button from '@material-ui/core/Button';

import { Protocol, CRUD,
	InsertReq, DeleteReq, AnsonResp, Semantier, Tierec, AnlistColAttrs,
	OnCommitOk, OnLoadOk, QueryConditions, SessionInf
} from '@anclient/semantier-st';
import { L } from '../../utils/langstr';
import { dataOfurl, urlOfdata } from '../../utils/file-utils';
import { AnContext, AnContextType } from '../../react/reactext';
import { ConfirmDialog } from '../../react/widgets/messagebox'
import { TRecordForm } from '../../react/widgets/t-record-form';
import { ImageUpload } from '../../react/widgets/image-upload';
import { Comprops, DetailFormW } from '../../react/crud';
import { CompOpts } from '../../an-components';

const styles = theme => ({
	actionButton: { marginTop: theme.spacing(2) }
});

interface MyInfRec extends Tierec {
	userId: string,
	roleId?: string,
	userName: string,
	img?: string,
	mime?: string,
	attName?: string,
	attId?: string,
}

interface MyInfProps extends Comprops {
	ssInf: SessionInf;
};

/** Simple session info card. Jsample use this to show user's personal info.
 * As UserDetails handling data binding by itself, and quit with data persisted
 * at jserv, this component is used to try the other way - no data persisting,
 * but with data automated data loading and state hook.
 */
class MyInfCardComp extends DetailFormW<MyInfProps> {

	state = { }
	tier: MyInfTier;
	confirm: JSX.Element;

	constructor (props: MyInfProps) {
		super(props);

		this.uri = this.props.uri;

		this.toSave = this.toSave.bind(this);
	}

	componentDidMount() {
		console.log(this.props.uri);

		// TODO DOC: MyInfCard is created outside of context provider,
		// see test/jsample/app.jsx: render().myInfoPanels(AnContext)
		// Don't set this in constructor - this.context will be changed after constructing.
		this.context = this.props.anContext || this.context;

		if (!this.tier) this.getTier()

		this.tier.pkval.v = this.props.ssInf.uid;
		let {uid, roleId} = this.props.ssInf;
		this.tier.rec = {userId: uid, roleId, userName: undefined};

		this.setState({});
	}

	showConfirm(msg) {
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

		if (this.tier.validate(undefined, this.tier.fields()))
			this.tier.saveRec(
				{ uri: this.props.uri,
				  crud: this.tier.crud,
				  pkval: this.tier.pkval.v,
				},
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

	getTier = () => {
		this.tier = new MyInfTier(this);
		this.tier.setContext(this.context as unknown as AnContextType);
	}

	render() {
		let { classes } = this.props;
		return (
		  <>{this.tier
			 && <TRecordForm uri={this.props.uri}
					tier={this.tier}
					fields={this.tier.fields()}
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
MyInfCardComp.contextType = AnContext;

const MyInfCard = withWidth()(withStyles(styles)(MyInfCardComp));

export class MyInfTier extends Semantier {
	//#region : db meta
	readonly imgProp = 'img';
	//#endregion

	rec = {} as MyInfRec; // Tierec & {mime: string, attName: string, attId: string};

	constructor(comp) {
		super(comp);
		// FIXME move to super class?
		// this.uri = comp.uri;
		this.mtabl = 'a_users';
		this.pkval.pk = 'userId';

		this.loadAvatar = this.loadAvatar.bind(this);
	}

	_fields = [
		{ field: 'userId',   label: L('Log ID'), grid: {sm: 6, lg: 4}, disabled: true },
		{ field: 'userName', label: L('User Name'),   grid: {sm: 6, lg: 4} },
		{ field: 'roleId',   label: L('Role'), disabled: true,
		  grid: {sm: 6, lg: 4}, cbbStyle: {width: "100%"},
		  type : 'cbb', sk: Protocol.sk.cbbRole, nv: {n: 'text', v: 'value'} },
		{ field: this.imgProp, label: L('Avatar'), grid: {sm: 6, lg: 4}, fieldFormatter: this.loadAvatar.bind(this) }
	] as AnlistColAttrs<JSX.Element, CompOpts>[];

	/**
	 * Format an image upload component.
	 * @param record for the form
	 * @param field difinetion, e.g. field of tier._fileds
	 * @param opts classes and media for future
	 * @return {React.component} ImageUpload
	 */
	loadAvatar(rec: MyInfRec, field: {field: string}, opts: CompOpts) {
		let tier = this as MyInfTier;
		return (
			<ImageUpload
				blankIcon={{color: "primary", width: 32, height: 32}}
				tier={tier} field={field}
				src64={rec && field && rec[field.field]}
			/>);
	}

	record(conds: QueryConditions, onLoad: OnLoadOk<MyInfRec>) {
		let { userId } = conds;

		let client = this.client;
		if (!client)
			return null;

		let that = this;

		// NOTE
		// Is this senario an illustration of general query is also necessity?
		let req = client.query(this.uri, 'a_users', 'u')
		req.Body()
			.col('r.roleId').col('u.userId').col('userName')
			.col('extfile(uri)', this.imgProp).col('attName').col('mime').col('a.attId')
			.l("a_attaches", "a", `a.busiTbl = 'a_users' and a.busiId = '${userId}'`)
			.l("a_roles", "r", "r.roleId=u.roleId")
			.l("a_orgs", "o", "o.orgId=u.orgId")
			.whereEq('userId', userId as string);

		client.commit(req,
			(resp) => {
				// NOTE because of using general query, extra hanling is needed
				let {cols, rows} = AnsonResp.rs2arr(resp.Body().Rs());
				that.rec = rows && rows[0] as MyInfRec;
				that.pkval.v = that.rec && that.rec[that.pkval.pk];
				that.rec[that.imgProp] = urlOfdata(that.rec.mime, that.rec[that.imgProp]);
				onLoad(cols, rows as Array<MyInfRec>);
			},
			this.errCtx);
	}

	saveRec(opts: { uri: string; crud: CRUD; pkval: string; }, onOk: OnCommitOk) {
		if (!this.client) return;
		let client = this.client;
		let that = this;

		let crud = CRUD.u;

		let rec = this.rec;
		let {roleId, userName} = rec;

		let req = this.client
					.usrAct(this.uri, CRUD.u, "save", "save my info")
					.update(this.uri, this.mtabl,
							{pk: this.pkval.pk, v: opts.pkval},
							{roleId, userName});
		// about attached image:
		// delete old, insert new (image in rec[imgProp] is updated by TRecordForm/ImageUpload)
		if ( rec.attId )
			// NOTE this is a design error
			// have to: 1. delete a_users/userId's attached file, all of his / her - in case previous deletion failed
			//          2. delete saved attId file (trigged by semantic handler)
			req.Body()
				// .post( new DeleteReq(this.uri, "a_attaches", ["attId", rec.attId as string])
				.post( new DeleteReq(this.uri, "a_attaches", undefined)
					.whereEq('busiId', rec[this.pkval.pk] as string || '')
					.whereEq('busiTbl', this.mtabl) );
		if ( rec[this.imgProp] ) {
			req.Body().post(
				new InsertReq(this.uri, "a_attaches")
					.nv('busiTbl', 'a_users').nv('busiId', this.pkval.v)
					.nv('attName', rec.attName)
					.nv('mime', rec.mime)
					.nv('uri', dataOfurl(rec[this.imgProp] as string)) );
		}

		client.commit(req,
			(resp) => {
				let bd = resp.Body();
				if (crud === CRUD.c)
					// NOTE:
					// resulving auto-k is a typicall semantic processing, don't expose this to caller
					that.pkval.v = bd.resulve(that.mtabl, that.pkval.pk, that.rec);
				onOk(resp);
			},
			this.errCtx);
	}
}

export { MyInfCard, MyInfCardComp, MyInfProps };
