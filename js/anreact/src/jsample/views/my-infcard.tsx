import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import withWidth from "@material-ui/core/withWidth";
import Button from '@material-ui/core/Button';

import { Protocol, CRUD, InsertReq, DeleteReq, AnsonResp, Semantier, Tierec } from '@anclient/semantier-st';
import { L } from '../../utils/langstr';
	import { dataOfurl, urlOfdata } from '../../utils/file-utils';
	import { AnContext } from '../../react/reactext';
	import { ConfirmDialog } from '../../react/widgets/messagebox'
	import { TRecordForm } from '../../react/widgets/t-record-form';
	import { ImageUpload } from '../../react/widgets/image-upload';
import { Comprops, DetailFormW } from '../../react/crud';

const styles = theme => ({
	actionButton: { marginTop: theme.spacing(2) }
});

/** Simple session info card. Jsample use this to show user's personal info.
 * As UserDetails handling data binding by itself, and quit with data persisted
 * at jserv, this component is used to try the other way - no data persisting,
 * but with data automated data loading and state hook.
 */
class MyInfCardComp extends DetailFormW<Comprops> {

	state = { }
	tier: MyInfTier;
	confirm: JSX.Element;

	constructor (props) {
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

		this.tier.pkval = this.props.ssInf.uid;
		let {uid, roleId} = this.props;
		this.tier.rec = {uid, roleId}

		this.setState({});
	}

	showConfirm(msg) {
		let that = this;
		this.confirm = (
			<ConfirmDialog title={L('Info')}
				ok={L('OK')} cancel={false} open
				onClose={() => {that.confirm = undefined;} }
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
				  pkval: this.tier.pkval,
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
		this.tier.setContext(this.context);
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

// MyInfCardComp.propTypes = {
// 	uri: PropTypes.string.isRequired,
// 	width: PropTypes.oneOf(["lg", "md", "sm", "xl", "xs"]).isRequired,
// 	ssInf: PropTypes.object.isRequired,
// };

const MyInfCard = withWidth()(withStyles(styles)(MyInfCardComp));
export { MyInfCard, MyInfCardComp };

export class MyInfTier extends Semantier {
	rec = {} as Tierec;

	// uri = undefined;
	imgProp = 'img';

	constructor(comp) {
		super(comp);
		// FIXME move to super class?
		// this.uri = comp.uri;
		this.mtabl = 'a_users';
		this.pk = 'userId';

		this.loadAvatar = this.loadAvatar.bind(this);
	}

	_fields = [
		{ field: 'userId',   label: L('Log ID'), grid: {sm: 6, lg: 4}, disabled: true },
		{ field: 'userName', label: L('User Name'),   grid: {sm: 6, lg: 4} },
		{ field: 'roleId',   label: L('Role'), disabled: true,
		  grid: {sm: 6, lg: 4}, cbbStyle: {width: "100%"},
		  type : 'cbb', sk: Protocol.sk.cbbRole, nv: {n: 'text', v: 'value'} },
		{ field: this.imgProp,label: L('Avatar'), grid: {md: 6}, formatter: this.loadAvatar }
	];

	/**
	 * Format an image upload component.
	 * @param {object} record for the form
	 * @param {object} field difinetion, e.g. field of tier._fileds
	 * @param {Semantier} tier not necessarily this class's object - this method will be moved
	 * @return {React.component} ImageUpload
	 */
	loadAvatar(rec, field, tier) {
		return (
			<ImageUpload
				blankIcon={{color: "primary", width: 32, height: 32}}
				tier={tier} field={field}
				src64={rec && field && rec[field.field]}
			/>);
	}

	record(conds, onLoad) {
		let { userId } = conds;

		let client = this.client;
		if (!client)
			return;

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
			.whereEq('userId', userId);

		client.commit(req,
			(resp) => {
				// NOTE because of using general query, extra hanling is needed
				let {cols, rows} = AnsonResp.rs2arr(resp.Body().Rs());
				that.rec = rows && rows[0];
				that.pkval = that.rec && that.rec[that.pk];
				that.rec[that.imgProp] = urlOfdata(that.rec.mime, that.rec[that.imgProp]);
				onLoad(cols, rows && rows[0]);
			},
			this.errCtx);
	}

	saveRec(opts, onOk) {
		if (!this.client) return;
		let client = this.client;
		let that = this;

		let { uri } = opts;

		let crud = CRUD.u;

		let rec = this.rec;
		let {roleId, userName} = rec;

		let req = this.client
					.usrAct(this.uri, CRUD.u, "save", "save my info")
					.update(this.uri, this.mtabl,
							{pk: this.pk, v: this.pkval},
							{roleId, userName});
		// about attached image:
		// delete old, insert new (image in rec[imgProp] is updated by TRecordForm/ImageUpload)
		if ( rec.attId )
			// NOTE this is a design erro
			// have to: 1. delete a_users/userId's attached file - in case previous deletion failed
			//          2. delete saved attId file (trigged by semantic handler)
			req.Body().post(
					new DeleteReq(this.uri, "a_attaches", rec.attId as string))
				.post(
					new DeleteReq(this.uri, "a_attaches", undefined)
						.whereEq('busiId', rec[this.pk] as string || '')
					 	.whereEq('busiTbl', this.mtabl));
		if ( rec[this.imgProp] ) {
			let {name, mime} = rec.fileMeta as {name: string, mime: string};
			req.Body().post(
				new InsertReq(this.uri, "a_attaches")
					.nv('busiTbl', 'a_users').nv('busiId', this.pkval)
					.nv('attName', name)
					.nv('mime', mime)
					.nv('uri', dataOfurl(rec[this.imgProp])) );
		}

		client.commit(req,
			(resp) => {
				let bd = resp.Body();
				if (crud === CRUD.c)
					// NOTE:
					// resulving auto-k is a typicall semantic processing, don't expose this to caller
					that.pkval = bd.resulve(that.mtabl, that.pk, that.rec);
				onOk(resp);
			},
			this.errCtx);
	}
}
