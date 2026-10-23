import React from 'react';
import { Theme } from '@mui/material/styles';
import { withStyles, withWidth } from '@anclient/anreact';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';

import {
	AnsonResp, Semantier, AnlistColAttrs, PageInf, Tierec,
	OnLoadOk, UIComponent, AnsonMsg, len, str
} from '@anclient/semantier';

import { L, Comprops, CrudCompW, AnContext, AnContextType, ConfirmDialog, AnTablist,
	ClassNames, CompOpts, AnQueryst, QueryCbbField, jsample, AnConst
} from '@anclient/anreact';

import { AdminReq, AdminResp } from '../common/registry';

/**
 * Dead domains of the market, for the super role (r00) only:
 * none of a dead domain's synodes is in a state other than 'd'.
 * Copied from ./org-domains.tsx.
 *
 * Reads and deletes go through the central's admin.serv (Administratier), with AdminReq;
 * the client composes no sql. Deleting a domain deletes all its dead synodes first, then the domain.
 *
 * Menu url: /market/dead-domains
 */
const styles = (theme: Theme) => ( {
	root: {
		"& :hover": {
			backgroundColor: '#777'
		}
	},
	button: {
		height: '2.4em',
		verticalAlign: 'middle',
		margin: theme.spacing(1),
	}
} );

class DeadDomainsComp extends CrudCompW<Comprops> {

	state = {
		conds: undefined as Array<AnlistColAttrs<JSX.Element, any>> | undefined,

		// active buttons
		buttons: { del: false },

		rows: [] as Tierec[],
		pageInf: { page: 0, size: 25, total: 0 } as PageInf,
		selected: {ids: new Map<string, Tierec>()},
	};

	tier: DeadDomainsTier;
	confirm: JSX.Element;
	props: { classes: ClassNames; };

	constructor(props: Comprops) {
		super(props);

		this.toSearch = this.toSearch.bind(this);
		this.onPageInf = this.onPageInf.bind(this);
		this.onTableSelect = this.onTableSelect.bind(this);
		this.toDel = this.toDel.bind(this);
	}

	componentDidMount() {
		if (!this.tier) {
			this.tier = new DeadDomainsTier(this);
			this.tier.setContext(this.context as unknown as AnContextType);
		}

		// as ./org-domains.tsx, the super role's community combobox
		let conds = [ { type: 'cbb', field: 'orgId', val: AnConst.cbbAllItem, label: L('Community'),
				  sk: 'org.all', nv: {n: 'text', v: 'value'},
				  options: [ AnConst.cbbAllItem ] } as QueryCbbField ];

		this.setState({conds}, () => this.toSearch());
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

	onTableSelect(rowIds: Map<string, Tierec>) {
		this.setState( {
			buttons: {
				del: len(rowIds) >= 1,
			},
		} );
	}

	toDel(_e: React.MouseEvent<HTMLElement>) {
		let that = this;
		let txt = L('Totally {count} dead domains, with their dead synodes, will be deleted. Are you sure?',
				{count: this.state.selected.ids.size});
		this.confirm =
			(<ConfirmDialog open={true}
				ok={L('OK')} cancel={true}
				title={L('Info')} msg={txt}
				onOk={ () => {
					that.tier.delDead(Array.from(that.state.selected.ids.keys()),
					(resp: AdminResp) => {
					  that.confirm = (
						<ConfirmDialog open={true}
							ok={L('OK')} cancel={false}
							title={L('Info')} msg={L('Dead domains deleted: {n}', {n: resp.deleted})}
							onOk={ () => {
								that.confirm = undefined;
								that.toSearch(that.state.pageInf);
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

			<Grid container sx={{alignContent: "flex-end"}} >
				<Button variant="contained" disabled={!btn.del}
					className={classes.button} onClick={this.toDel}
					startIcon={<jsample.JsampleIcons.Delete />}
				>{L('Delete')}</Button>
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
			{this.confirm}
		</>);
	}
}
DeadDomainsComp.contextType = AnContext;

const DeadDomains = withStyles<any, any, Comprops>(styles)(withWidth()(DeadDomainsComp));

class DeadDomainsTier extends Semantier {
	checkbox = true;

	_cols = [
		{ text: '', field: "domid" }, // first column: the check box
		{ text: L('Domain ID'),     field: "domid", color: 'primary', className: 'bold'},
		{ text: L('Domain Name'),   field: "domname", color: 'primary' },
		{ text: L('Community'),     field: "orgName" },
		{ text: L('Synodes'),       field: "synodes" },
		{ text: L('Last reported'), field: "optime" } ]

	/**
	 * Reads and deletes go through the central's admin.serv (Administratier).
	 */
	static port = 'admin';

	constructor(comp: UIComponent & {uri: string, port?: string}) {
		super(comp);

		this.pkval.tabl = 'c_syndomx';
		this.pkval.pk = 'domid';
	}

	/**
	 * Dead domains of the community in the query conditions, or of all communities,
	 * asked to the central's admin.serv (AdminReq.A.deadDomains).
	 */
	records(conds = {} as PageInf, onLoad: OnLoadOk<Tierec>) {
		if (!this.client) return;

		let { orgId } = conds.mapCondts || {};

		let req = this.client.userReq(this.uri, DeadDomainsTier.port,
				new AdminReq({ uri: this.uri, a: AdminReq.A.deadDomains,
							   orgId: orgId ? str(orgId) : undefined }));

		this.client.commit(req,
			(resp: AnsonMsg<AnsonResp>) => {
				let {cols, rows} = AnsonResp.rs2arr(resp.Body().Rs());
				onLoad(cols, rows as Tierec[]);
			},
			this.errCtx);
	}

	/**
	 * Delete dead domains with the central's admin.serv (AdminReq.A.delDead).
	 */
	delDead(domids: string[], onOk: (resp: AdminResp) => void) {
		if (!this.client) return;

		let req = this.client.userReq(this.uri, DeadDomainsTier.port,
				new AdminReq({ uri: this.uri, a: AdminReq.A.delDead, domids }));

		this.client.commit(req,
			(resp: AnsonMsg<AnsonResp>) => onOk(resp.Body() as AdminResp),
			this.errCtx);
	}
}

export { DeadDomains, DeadDomainsComp, DeadDomainsTier }
