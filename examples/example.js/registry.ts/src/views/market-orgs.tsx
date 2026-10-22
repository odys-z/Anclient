import React from 'react';
import { Theme } from "@material-ui/core/styles";
import withStyles from "@material-ui/core/styles/withStyles";
import withWidth from "@material-ui/core/withWidth";
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';

import {
	AnsonResp, Semantier, CRUD, AnlistColAttrs, PageInf, Tierec,
	OnLoadOk, UIComponent, AnsonMsg, len, str, OnCommitOk
} from '@anclient/semantier';

import { L, Comprops, CrudCompW, AnContext, AnContextType, ConfirmDialog, AnTablist,
	ClassNames, CompOpts, AnQueryst, jsample
} from '@anclient/anreact';

import { OrgDetails } from './org-details';
import { RegistReq, SynodeConfig, SynOrg } from '../common/registry';

/**
 * Copied from @anclient/anreact/jsample/views/roles.tsx, for table a_orgs of the market.
 *
 * Menu url: /market/orgs (super role r00, see a_role_func)
 */
const styles = (theme: Theme) => ( {
	root: {
		"& :hover": {
			backgroundColor: '#777'
		}
	},
	container: {
		display: 'flex',
		'& > *': {
			margin: theme.spacing(0.5),
		}
	},
	buttons: {
		display: 'flex',
		justifyContent: "flex-end",
		'& > *': {
			margin: theme.spacing(0.5),
		}
	},
	button: {
		height: '2.4em',
		verticalAlign: 'middle',
		margin: theme.spacing(1),
	}
} );

class MarketOrgsComp extends CrudCompW<Comprops> {

	state = {
		condName: { type: 'text', field: 'orgName', val: '', label: L('Community Name')} as AnlistColAttrs<JSX.Element, any>,

		// active buttons
		buttons: { add: true, edit: false, del: false},

		total: 0,
		rows: [] as Tierec[],
		pageInf: { page: 0, size: 25, total: 0 } as PageInf,
		selected: {ids: new Map<string, Tierec>()},
	};

	port: string;

	tier: MarketOrgsTier;
	confirm: JSX.Element;
	orgForm: JSX.Element;
	props: { classes: ClassNames; };

	constructor(props: Comprops) {
		super(props);

		this.closeDetails = this.closeDetails.bind(this);
		this.toSearch = this.toSearch.bind(this);
		this.onPageInf = this.onPageInf.bind(this);
		this.onTableSelect = this.onTableSelect.bind(this);

		this.toAdd = this.toAdd.bind(this);
		this.toEdit = this.toEdit.bind(this);
		this.toDel = this.toDel.bind(this);
	}

	componentDidMount() {
		if (!this.tier) {
			this.tier = new MarketOrgsTier(this);
			this.tier.setContext(this.context as unknown as AnContextType);
		}

		this.tier.loadMarket(() => this.toSearch());
	}

	toSearch(pageInf: PageInf = new PageInf(0, -1)) {
		let that = this;
		this.tier.records( pageInf,
			(_cols, rows) => {
				that.state.selected.ids.clear();
				that.setState({rows});
			} );
		this.setState({pageInf});
	}

	onPageInf(page: number, size?: number) {
		this.state.pageInf.size = size || 0;
		this.state.pageInf.page = page;

		this.toSearch(this.state.pageInf);
	}

	onTableSelect(rowIds: Map<string, Tierec>) {
		this.setState( {
			buttons: {
				add: this.state.buttons.add,
				edit: len(rowIds) === 1, // rowIds && rowIds.length === 1,
				del:  len(rowIds) >=  1, // rowIds &&  rowIds.length >= 1,
			},
		} );
	}

	toDel(_e: React.MouseEvent<HTMLElement>) {
		let that = this;
		let txt = L('Totally {count} community records will be deleted. Are you sure?',
				{count: this.state.selected.ids.size});
		this.confirm =
			(<ConfirmDialog open={true}
				ok={L('OK')} cancel={true}
				title={L('Info')} msg={txt}
				onOk={ () => {
					that.tier.del({ids: that.state.selected.ids},
					(_resp) => {
					  that.confirm = (
						<ConfirmDialog open={true}
							ok={L('OK')} cancel={false}
							title={L('Info')} msg={L('Data Deleted!')}
							onOk={ () => {
								that.confirm = undefined;
								that.toSearch();
							} }
						/>);
					  that.setState({});
					} ); } }
				onClose={ () => {
					that.confirm = undefined;
					that.setState({});
				} }
			/>);
	}

	toAdd(_e: React.MouseEvent<HTMLElement>) {
		this.tier.resetFormSession();
		this.tier.rec = {orgType: this.tier.market} as Tierec;
		this.orgForm = (<OrgDetails crud={CRUD.c} uri={this.uri}
			tier={this.tier}
			onOk={(r) => console.log(r)}
			onClose={this.closeDetails} />);
	}

	toEdit(_e: React.MouseEvent<HTMLElement>) {
		let that = this;
		this.tier.pkval.v = this.getByIx(this.state.selected.ids, 0);

		this.orgForm = (<OrgDetails crud={CRUD.u} uri={this.uri}
			tier={this.tier}
			onOk={(_r) => that.toSearch(that.state.pageInf)}
			onClose={this.closeDetails} />);
	}

	closeDetails() {
		this.orgForm = undefined;
		this.tier.resetFormSession();
		this.setState({});
		this.onTableSelect(new Map());
		this.toSearch(undefined);
	}

	render() {
		const { classes } = this.props;
		let btn = this.state.buttons;
		return ( <>
			<AnQueryst uri={this.uri}
				onSearch={this.toSearch}
				onLoaded={this.toSearch}
				fields={[ this.state.condName ]}
			/>

			<Grid container alignContent="flex-end" >
				<Button variant="contained" disabled={!btn.add}
					className={classes.button} onClick={this.toAdd}
					startIcon={<jsample.JsampleIcons.Add />}
				>{L('Add')}</Button>
				<Button variant="contained" disabled={!btn.del}
					className={classes.button} onClick={this.toDel}
					startIcon={<jsample.JsampleIcons.Delete />}
				>{L('Delete')}</Button>
				<Button variant="contained" disabled={!btn.edit}
					className={classes.button} onClick={this.toEdit}
					startIcon={<jsample.JsampleIcons.Edit />}
				>{L('Edit')}</Button>
			</Grid>

			{this.tier && <AnTablist
				className={classes.root} checkbox={true}
				columns={this.tier.columns() as AnlistColAttrs<JSX.Element, CompOpts>[]}
				rows={this.state.rows} pk={this.tier.pkval.pk}
				selected={this.state.selected}
				pageInf={this.state.pageInf}
				onPageInf={this.onPageInf}
				onSelectChange={this.onTableSelect}
			/>}
			{this.orgForm}
			{this.confirm}
		</>);
	}
}
MarketOrgsComp.contextType = AnContext;

const MarketOrgs = withStyles<any, any, Comprops>(styles)(withWidth()(MarketOrgsComp));

class MarketOrgsTier extends Semantier {
	checkbox = true;

	/** The market id, i.e. a_orgs.orgType of the session user's org. */
	market: string | undefined;

	_cols = [
		{ text: L('Community ID'),   field: "orgId", color: 'primary', className: 'bold'},
		{ text: L('Community Name'), field: "orgName", color: 'primary' },
		{ text: L('Homepage'), field: "webroot" },
		{ text: L('Album'),    field: "album0" },
		{ text: L('Domains'),  field: "domains" } ]

	_fields = [
		{ type: 'text', field: 'orgId',   label: 'Community ID',
		  validator: {notNull: true, len: 12} },
		{ type: 'text', field: 'orgName', label: 'Community Name',
		  validator: {notNull: true, len: 50} },
		{ type: 'text', field: 'orgType', label: 'Market', readOnly: true },
		{ type: 'text', field: 'sort',    label: 'Sort' },
		{ type: 'text', field: 'webroot', label: 'Homepage (landing page)' },
		{ type: 'text', field: 'album0',  label: 'Album' }
	] as Array<AnlistColAttrs<JSX.Element, CompOpts>>;

	/**
	 * @param comp
	 * @param {string} comp.uri the client function uri.
	 * @constructor
	 */
	constructor(comp: UIComponent & {uri: string, port?: string}) {
		super(comp);

		this.pkval.tabl = 'a_orgs';
		this.pkval.pk = 'orgId';
	}

	uid(): string {
		return (this.client as any)?.ssInf?.uid;
	}

	/**
	 * Load the market id, a_orgs.orgType of the session user's org.
	 */
	loadMarket(onLoad: () => void) {
		let that = this;
		let req = this.client.query(this.uri, 'a_users', 'u');
		req.Body()
			.expr('o.orgType', 'market')
			.j('a_orgs', 'o', 'o.orgId = u.orgId')
			.whereEq('u.userId', this.uid());

		this.client.commit(req,
			(resp: AnsonMsg<AnsonResp>) => {
				let {rows} = AnsonResp.rs2arr(resp.Body().Rs());
				that.market = rows && rows[0] && str((rows[0] as Tierec).market);
				onLoad();
			},
			this.errCtx);
	}

	records(conds = {} as PageInf, onLoad: OnLoadOk<Tierec>) {

		let { orgName } = conds.mapCondts || {};
		let queryReq = this.client.query(this.uri, this.pkval.tabl, 'o', conds)
		let req = queryReq.Body()
			.expr('o.orgId', 'orgId').expr('o.orgName', 'orgName')
			.expr('o.webroot', 'webroot').expr('o.album0', 'album0')
			.expr('count(d.domid)', 'domains')
			.l('c_syndomx', 'd', 'd.orgid = o.orgId and d.market = o.orgType')
			.whereEq('o.orgType', str(this.market))
			.groupby('o.orgId')
			.orderbys([['o.sort', 'asc'], ['o.orgId', 'asc']]);

		if (orgName)
			req.whereCond('%', 'o.orgName', `'${orgName}'`);

		this.client.commit(queryReq,
			(resp) => {
				let {cols, rows} = AnsonResp.rs2arr(resp.Body().Rs());
				onLoad(cols, rows);
			},
			this.errCtx);
	}

	/**
	 * Create a community with the Registry tier, regist.serv, a = c/org,
	 * as synode.py/tasks.py register_org() does.
	 * Edit is saved with u.serv (saveRec), delete with del().
	 */
	createOrg(onOk: OnCommitOk) {
		let rec = this.rec as Tierec;
		let org = new SynOrg({
			orgId  : str(rec.orgId),
			orgName: str(rec.orgName),
			orgType: this.market,
			sort   : rec.sort === undefined ? undefined : str(rec.sort),
			homepage: rec.webroot ? str(rec.webroot) : undefined,
			album0 : rec.album0 ? str(rec.album0) : undefined });

		let req = this.client.userReq(this.uri, 'regist',
			new RegistReq({ uri: this.uri, a: RegistReq.A.createOrg, market: str(this.market),
							diction: new SynodeConfig({org}) }));

		let that = this;
		this.client.commit(req,
			(resp) => {
				that.pkval.v = org.orgId;
				onOk(resp);
			},
			this.errCtx);
	}

	record(conds: PageInf, onLoad: OnLoadOk<Tierec>) {
		if (!this.client) return;

		let client = this.client;
		let that = this;

		// temp id avoiding update my pk status
		let orgId = conds.mapCondts[this.pkval.pk] as string;

		let req = client.query(this.uri, 'a_orgs', 'o')
		req.Body()
			.col('orgId').col('orgName').col('orgType').col('sort').col('webroot').col('album0')
			.whereEq(this.pkval.pk, orgId);

		client.commit(req,
			(resp: AnsonMsg<AnsonResp>) => {
				let {cols, rows} = AnsonResp.rs2arr(resp.Body().Rs());
				that.rec = rows && rows[0];
				that.pkval.v = that.rec && that.rec[that.pkval.pk];
				onLoad(cols, rows);
			},
			this.errCtx);
	}
}

export { MarketOrgs, MarketOrgsComp, MarketOrgsTier }
