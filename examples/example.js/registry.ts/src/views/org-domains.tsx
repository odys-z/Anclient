import React from 'react';
import { Theme } from "@material-ui/core/styles";
import withStyles from "@material-ui/core/styles/withStyles";
import withWidth from "@material-ui/core/withWidth";
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';

import {
	AnsonResp, Semantier, CRUD, AnlistColAttrs, PageInf, Tierec,
	OnLoadOk, UIComponent, AnsonMsg, len, str
} from '@anclient/semantier';

import { L, Comprops, CrudCompW, AnContext, AnContextType, ConfirmDialog, AnTablist,
	ClassNames, CompOpts, AnQueryst, QueryCbbField, jsample, AnConst
} from '@anclient/anreact';

import { DomainDetails } from './domain-details';
import { superRole } from '../common/central-tier';
import { DomxReq, DomxResp } from '../common/registry';

/**
 * Domains of communities, table c_syndomx.
 * Copied from ./market-orgs.tsx (from @anclient/anreact/jsample/views/roles.tsx).
 *
 * The super role (r00) selects the community with a combobox (dataset org.all);
 * other users see only domains of their own community (a_users.orgId).
 *
 * Menu url: /org/domains
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

class OrgDomainsComp extends CrudCompW<Comprops> {

	state = {
		/** condition fields of AnQueryst, set after the user's role is known */
		conds: undefined as Array<AnlistColAttrs<JSX.Element, any>> | undefined,

		// active buttons
		buttons: { add: false, edit: false, del: false},

		total: 0,
		rows: [] as Tierec[],
		pageInf: { page: 0, size: 25, total: 0 } as PageInf,
		selected: {ids: new Map<string, Tierec>()},
	};

	tier: OrgDomainsTier;
	confirm: JSX.Element;
	domForm: JSX.Element;
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
			this.tier = new OrgDomainsTier(this);
			this.tier.setContext(this.context as unknown as AnContextType);
		}

		let condName = { type: 'text', field: 'domname', val: '', label: L('Domain Name') } as AnlistColAttrs<JSX.Element, any>;
		let conds = this.tier.isSuper()
			// as jsample/views/roles.tsx: a controlled Autocomplete from the first render
			? [ { type: 'cbb', field: 'orgId', val: AnConst.cbbAllItem, label: L('Community'),
				  sk: 'org.all', nv: {n: 'text', v: 'value'},
				  options: [ AnConst.cbbAllItem ],
				  // Add is enabled once a community is selected, before searching
				  onSelectChange: (_item, _reason, val) => this.onCommunity(val?.v as string)
				} as QueryCbbField, condName ]
			: [ condName ];

		this.tier.loadMarket(() => this.setState({conds}, () => this.toSearch()));
	}

	toSearch(pageInf: PageInf = new PageInf(0, -1)) {
		let that = this;
		this.tier.records( pageInf,
			(_cols, rows) => {
				that.state.selected.ids.clear();
				that.setState({rows});
				that.onTableSelect(that.state.selected.ids);
			} );
		this.setState({pageInf});
	}

	onPageInf(page: number, size?: number) {
		this.state.pageInf.size = size || 0;
		this.state.pageInf.page = page;

		this.toSearch(this.state.pageInf);
	}

	/**
	 * The community selected in the query form (super role): domains are added to it.
	 * @param orgId '' or undefined for all communities
	 */
	onCommunity(orgId: string | undefined) {
		this.tier.orgId = orgId ? orgId : undefined;
		this.onTableSelect(this.state.selected.ids);
	}

	onTableSelect(rowIds: Map<string, Tierec>) {
		this.setState( {
			buttons: {
				// a domain is added to one community: the super role must have selected one
				add:  !!this.tier?.orgId,
				edit: len(rowIds) === 1,
				del:  len(rowIds) >=  1,
			},
		} );
	}

	toDel(_e: React.MouseEvent<HTMLElement>) {
		let that = this;
		let txt = L('Totally {count} domain records will be deleted. Are you sure?',
				{count: this.state.selected.ids.size});
		this.confirm =
			(<ConfirmDialog open={true}
				ok={L('OK')} cancel={true}
				title={L('Info')} msg={txt}
				onOk={ () => {
					that.tier.del({ids: that.state.selected.ids, port: OrgDomainsTier.port},
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
		this.setState({});
	}

	toAdd(_e: React.MouseEvent<HTMLElement>) {
		this.tier.resetFormSession();
		this.tier.recOrg = this.tier.orgId;
		this.tier.rec = {market: this.tier.market, orgid: this.tier.orgId} as Tierec;
		this.domForm = (<DomainDetails crud={CRUD.c} uri={this.uri}
			tier={this.tier}
			onOk={(r) => console.log(r)}
			onClose={this.closeDetails} />);
		this.setState({});
	}

	toEdit(_e: React.MouseEvent<HTMLElement>) {
		let that = this;
		let row = this.state.selected.ids.values().next().value as Tierec;
		this.tier.pkval.v = this.getByIx(this.state.selected.ids, 0);
		this.tier.recOrg = str(row.orgid);

		this.domForm = (<DomainDetails crud={CRUD.u} uri={this.uri}
			tier={this.tier}
			onOk={(_r) => that.toSearch(that.state.pageInf)}
			onClose={this.closeDetails} />);
		this.setState({});
	}

	closeDetails() {
		this.domForm = undefined;
		this.tier.resetFormSession();
		this.setState({});
		this.onTableSelect(new Map());
		// keep the query conditions, e.g. the community selected by the super role,
		// which enables Add (jsample/views/roles.tsx searches without conditions)
		this.toSearch(this.state.pageInf);
	}

	render() {
		const { classes } = this.props;
		let btn = this.state.buttons;
		return ( <>
			{this.state.conds &&
			  <AnQueryst uri={this.uri}
				onSearch={this.toSearch}
				onLoaded={this.toSearch}
				fields={this.state.conds}
			/>}

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
			{this.domForm}
			{this.confirm}
		</>);
	}
}
OrgDomainsComp.contextType = AnContext;

const OrgDomains = withStyles<any, any, Comprops>(styles)(withWidth()(OrgDomainsComp));

class OrgDomainsTier extends Semantier {
	checkbox = true;

	/** The market id, i.e. a_orgs.orgType of the session user's org. */
	market: string | undefined;

	/** The session user's community, a_users.orgId. */
	myOrg: string | undefined;

	/** The community of the listed domains: the selected one (super role), or myOrg. */
	orgId: string | undefined;

	/** The community of the record in the details form. */
	recOrg: string | undefined;

	_cols = [
		{ text: '', field: "domid" }, // first column: the check box
		{ text: L('Domain ID'),   field: "domid", color: 'primary', className: 'bold'},
		{ text: L('Domain Name'), field: "domname", color: 'primary' },
		{ text: L('Community'),   field: "orgName" },
		{ text: L('Synodes'),     field: "synodes" } ]

	_fields = [
		{ type: 'text', field: 'market',  label: 'Market', readOnly: true },
		{ type: 'text', field: 'orgid',   label: 'Community ID', readOnly: true },
		{ type: 'text', field: 'domid',   label: 'Domain ID',
		  validator: {notNull: true, len: OrgDomainsTier.domainMaxlen} },
		{ type: 'text', field: 'domname', label: 'Domain Name',
		  validator: {notNull: true, len: 64} },
	] as Array<AnlistColAttrs<JSX.Element, CompOpts>>;

	/**
	 * @param comp
	 * @param {string} comp.uri the client function uri.
	 * @constructor
	 */
	constructor(comp: UIComponent & {uri: string, port?: string}) {
		super(comp);

		this.pkval.tabl = 'c_syndomx';
		this.pkval.pk = 'domid';
	}

	uid(): string {
		return (this.client as any)?.ssInf?.uid;
	}

	/** Is the session user of the super role? (only for UI) */
	isSuper() {
		return (this.client as any)?.ssInf?.roleId === superRole;
	}

	/**
	 * Load the market id, a_orgs.orgType of the session user's org, and the user's org id.
	 */
	loadMarket(onLoad: () => void) {
		let that = this;
		let req = this.client.query(this.uri, 'a_users', 'u');
		req.Body()
			.expr('o.orgType', 'market')
			.expr('u.orgId', 'orgId')
			.j('a_orgs', 'o', 'o.orgId = u.orgId')
			.whereEq('u.userId', this.uid());

		this.client.commit(req,
			(resp: AnsonMsg<AnsonResp>) => {
				let {rows} = AnsonResp.rs2arr(resp.Body().Rs());
				that.market = rows && rows[0] && str((rows[0] as Tierec).market);
				that.myOrg  = rows && rows[0] && str((rows[0] as Tierec).orgId);
				onLoad();
			},
			this.errCtx);
	}

	records(conds = {} as PageInf, onLoad: OnLoadOk<Tierec>) {

		let { orgId, domname } = conds.mapCondts || {};
		// super role: the community of the query conditions, or the one selected before searching
		if (!this.isSuper())
			this.orgId = this.myOrg;
		else if (conds.mapCondts && 'orgId' in conds.mapCondts)
			this.orgId = orgId ? str(orgId) : undefined;

		let queryReq = this.client.query(this.uri, this.pkval.tabl, 'd')
		let req = queryReq.Body()
			.expr('d.domid', 'domid').expr('d.domname', 'domname')
			.expr('d.orgid', 'orgid').expr('o.orgName', 'orgName')
			.expr('count(n.sid)', 'synodes')
			.j('a_orgs', 'o', 'o.orgId = d.orgid')
			.l('c_synodes', 'n', 'n.market = d.market and n.orgid = d.orgid and n.domx = d.domid')
			.whereEq('d.market', str(this.market))
			.groupby('d.orgid').groupby('d.domid')
			.orderbys([['d.orgid', 'asc'], ['d.domid', 'asc']]);

		// not the super role: only the user's community, even if it's unknown
		if (this.orgId || !this.isSuper())
			req.whereEq('d.orgid', str(this.orgId));

		// paging, which QueryReq took from pageInf
		if (conds.size !== undefined)
			req.Page(conds.size, conds.page || 0);

		// named conditions from AnQueryst (conds.mapCondts)
		if (domname)
			req.whereCond('%', 'd.domname', `'${domname}'`);

		this.client.commit(queryReq,
			(resp) => {
				let {cols, rows} = AnsonResp.rs2arr(resp.Body().Rs());
				onLoad(cols, rows);
			},
			this.errCtx);
	}

	record(conds: PageInf, onLoad: OnLoadOk<Tierec>) {
		if (!this.client) return;

		let client = this.client;
		let that = this;

		let domid = conds.mapCondts[this.pkval.pk] as string;

		let req = client.query(this.uri, this.pkval.tabl, 'd')
		req.Body()
			.col('market').col('orgid').col('domid').col('domname')
			.whereEq('market', str(this.market))
			.whereEq('orgid', str(this.recOrg))
			.whereEq(this.pkval.pk, domid);

		client.commit(req,
			(resp: AnsonMsg<AnsonResp>) => {
				let {cols, rows} = AnsonResp.rs2arr(resp.Body().Rs());
				that.rec = rows && rows[0];
				that.pkval.v = that.rec && that.rec[that.pkval.pk];
				onLoad(cols, rows);
			},
			this.errCtx);
	}

	/**
	 * Update (saveRec) and delete (del) go through the central's community.serv
	 * (port community), which restricts them with the market and the user's community.
	 * Domains are created with {@link createDomain}, port domx.
	 */
	static port = 'community';

	/** A new domain's id: the synodes are named <domid>-hub, ..., within the 12 chars of a synode id.
	 * See the central's Domxes.domainMaxlen, synode.py's validators.check_domain_id(). */
	static domainMaxlen = 8;

	/**
	 * Check a new domain's id, the same rule as the central's Domxes.checkDomid().
	 * @returns error message, or undefined if valid
	 */
	static checkDomid(domid: string | undefined): string | undefined {
		return domid && /^[A-Za-z0-9`~!@#$%^&*_\-+=:;,./]{2,8}$/.test(domid) ? undefined
			: L("Domain id: 2 - {max} letters, digits or `~!@#$%^&*_-+=:;,./, so that '<domain>-hub' fits a synode id.",
				{max: OrgDomainsTier.domainMaxlen});
	}

	/**
	 * Synodes of a new domain, planned by the central (Domxes.plan()): <domid>-hub, <domid>-1, <domid>-2.
	 * @returns rows like the ones of {@link synodes}, in state 'c' (created)
	 */
	static plan(domid: string | undefined): Tierec[] {
		if (!domid) return [];
		return [`${domid}-hub`, `${domid}-1`, `${domid}-2`].map((sid, x) =>
			({ sid, mode: x === 0 ? 'hub' : '', stat: 'c' } as Tierec));
	}

	/**
	 * Create the domain in tier.rec, of community recOrg, with the central's domx.serv (DomxReq.A.create),
	 * which also inserts the planned synodes, or loads the domain if it exists, the same as
	 * synode.py's Create / Join Domain.
	 */
	createDomain(onOk: (resp: DomxResp) => void) {
		if (!this.client) return;

		let req = this.client.userReq(this.uri, 'domx',
				new DomxReq({ uri: this.uri, a: DomxReq.A.create, orgId: str(this.recOrg),
							  domid: str(this.rec.domid), domname: str(this.rec.domname) }));

		this.client.commit(req,
			(resp: AnsonMsg<AnsonResp>) => {
				let rsp = resp.Body() as DomxResp;
				this.pkval.v = rsp.domid;
				this.recOrg  = rsp.orgId;
				onOk(rsp);
			},
			this.errCtx);
	}

	/**
	 * Synodes of a domain of community recOrg, hub first, asked to the central's domx.serv
	 * (DomxReq.A.synodes).
	 * Columns: sid, mode, stat, jserv, ip, optime, oper
	 */
	synodes(domid: string, onLoad: OnLoadOk<Tierec>) {
		if (!this.client) return;

		let req = this.client.userReq(this.uri, 'domx',
				new DomxReq({ uri: this.uri, a: DomxReq.A.synodes, orgId: str(this.recOrg), domid }));

		this.client.commit(req,
			(resp: AnsonMsg<AnsonResp>) => {
				let {cols, rows} = AnsonResp.rs2arr(resp.Body().Rs());
				onLoad(cols, rows as Tierec[]);
			},
			this.errCtx);
	}
}

export { OrgDomains, OrgDomainsComp, OrgDomainsTier }
