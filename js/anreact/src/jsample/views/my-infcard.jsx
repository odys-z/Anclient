import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import withWidth from "@material-ui/core/withWidth";
import PropTypes from "prop-types";
import { Button, Grid, Card, Typography } from '@material-ui/core';

import { Protocol, UpdateReq, InsertReq, DeleteReq, AnsonResp } from '@anclient/semantier';
import { L } from '../../utils/langstr';
	import { dataOfurl, urlOfdata } from '../../utils/file-utils';
	import { Semantier  } from '@anclient/semantier';
	import { AnConst } from '../../utils/consts';
	import { CrudCompW } from '../../react/crud';
	import { AnContext, AnError } from '../../react/reactext';
	import { ConfirmDialog } from '../../react/widgets/messagebox.jsx'
	import { AnTablistLevelUp } from '../../react/widgets/table-list-lu';
	import { AnQueryForm } from '../../react/widgets/query-form';
	import { TRecordForm } from '../../react/widgets/t-record-form';
	import { ImageUpload } from '../../react/widgets/image-upload';
	import { JsampleIcons } from '../styles';

const styles = theme => ({
	actionButton: { marginTop: theme.spacing(2) }
});

/** Simple session info card. Jsample use this to show user's personal info.
 * As UserDetails handling data binding by itself, and quit with data persisted
 * at jserv, this component is used to try the other way - no data persisting,
 * but with data automated data loading and state hook.
 */
class MyInfCardComp extends React.Component {

	state = { }

	constructor (props) {
		super(props);

		this.uri = this.props.uri;

		let {uid, roleId} = props;
		this.state.rec = {uid, roleId}

		this.toSave = this.toSave.bind(this);
	}

	componentDidMount() {
		console.log(this.props.uri);

		// MyInfCard is created outside of context provider,
		// see test/jsample/app.jsx: render().myInfoPanels(AnContext)
		// Don't set this in constructor. This.context changed after it.
		this.context = this.props.anContext || this.context;

		let that = this;

		if (!this.tier) this.getTier()

		this.tier.myInf({userId: this.props.ssInf.uid},
						(cols, record) => that.setState({cols, record}) );
	}

	showConfirm(msg) {
		let that = this;
		this.confirm = (
			<ConfirmDialog title={L('Info')}
				ok={L('Ok')} cancel={false} open
				onClose={() => {that.confirm = undefined;} }
				msg={msg} />);
		this.setState({});
	}

	toSave(e) {
		if (e) e.stopPropagation();

		let that = this;

		if (this.tier.validate(undefined, undefined))
			this.tier.saveRec(
				{ uri: this.props.uri,
				  crud: this.state.crud,
				  pkval: this.tier.pkval,
				},
				resp => {
					// NOTE should crud be moved to tier, just like the pkval?
					if (that.state.crud === Protocol.CRUD.c) {
						that.state.crud = Protocol.CRUD.u;
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
					fields={this.tier.columns()}
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
MyInfCardComp.context = AnContext;

MyInfCardComp.propTypes = {
	uri: PropTypes.string.isRequired,
	width: PropTypes.oneOf(["lg", "md", "sm", "xl", "xs"]).isRequired,
	ssInf: PropTypes.object.isRequired,
};

const MyInfCard = withWidth()(withStyles(styles)(MyInfCardComp));
export { MyInfCard, MyInfCardComp };

class MyInfTier extends Semantier {

	uri = undefined;
	mtabl = 'a_users';
	pk = 'userId';
	imgProp = 'img';

	constructor(opts) {
		super('session');
		this.uri = opts.uri;
	}

	columns() {
		let that = this;
		return [
			{ field: 'userId',   label: L('Log ID'), grid: {sm: 6, lg: 4}, disabled: true },
			{ field: 'userName', label: L('Name'),   grid: {sm: 6, lg: 4} },
			{ field: 'roleId',   label: L('Role'),   grid: {sm: 6, lg: 4}, cbbStyle: {width: "100%"},
			  type : 'cbb', sk: Protocol.sk.cbbRole, nv: {n: 'text', v: 'value'} },
			{ field: this.imgProp,label: L('Avatar'), grid: {md: 6}, formatter: loadAvatar } // use loadAvatar for default
		];

		function loadAvatar(rec, field) {
			return (
				<ImageUpload
					blankIcon={{color: "primary", width: 32, height: 32}}
					tier={that} field={field}
					src64={rec && field && rec[field.field]}
				/>);
		}
	}

	myInf(conds, onLoad) {
		let { userId } = conds;

		let client = this.client;
		if (!client)
			return;

		let that = this;

		// NOTE
		// Is this senario is an illustrating of general query's necessity?
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

		let crud = Protocol.CRUD.u;

		let {roleId, userName} = this.rec;

		let req = this.client
					.usrAct(this.uri, Protocol.CRUD.u, "save", "save my info")
					.update(this.uri, this.mtabl,
							{pk: this.pk, v: this.pkval},
							{roleId, userName});
		// about attached image:
		// delete old, insert new (image in rec[imgProp] is updated by TRecordForm/ImageUpload)
		if ( this.rec.attId )
			req.Body().post(
				new DeleteReq(this.uri, "a_attaches",
						{pk: "attId", v: this.rec.attId}) );
		if ( this.rec[this.imgProp] )
			req.Body().post(
				new InsertReq(this.uri, "a_attaches")
					.nv('busiTbl', 'a_users').nv('busiId', this.pkval)
					.nv('attName', this.rec.fileMeta.name)
					.nv('mime', this.rec.fileMeta.mime)
					.nv('uri', dataOfurl(this.rec[this.imgProp])) );

		client.commit(req,
			(resp) => {
				let bd = resp.Body();
				if (crud === Protocol.CRUD.c)
					// NOTE:
					// resulving auto-k is a typicall semantic processing, don't expose this to caller
					that.pkval = bd.resulve(that.mtabl, that.pk, that.rec);
				onOk(resp);
			},
			this.errCtx);
	}
}
