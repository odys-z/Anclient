import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { AnContext, Comprops, CrudCompW, L } from '@anclient/anreact';

import { Tierec } from '@anclient/semantier';

import { DomxTier } from '../common/domx-tier';
import { domxTier, Selector, SynodesList } from './central-lists';

/**
 * Synodes of a domain, with the states last reported by the synodes, asked to the
 * central's domx.serv (DomxReq.A.domains, DomxReq.A.synodes).
 *
 * The domains are loaded once: the user's community's, or, for the super role, all of the
 * market's, of which the communities are selected first (communities without domains have
 * no synodes, and are not listed).
 *
 * Menu url: /domain/synodes
 */
export class DomainSynodes extends CrudCompW<Comprops> {
	tier: DomxTier | undefined;

	/** domains of the community, or of the market (super role): domid, domname, orgid, orgName */
	domxRows = [] as Tierec[];

	state = {
		orgs: [] as {v: string, n: string}[],
		domains: [] as {v: string, n: string}[],
		orgId: undefined as string | undefined,
		domain: undefined as string | undefined,
	};

	componentDidMount() {
		this.tier = domxTier(this);
		this.tier.domains(undefined, (_cols, rows) => {
			this.domxRows = rows;
			if (this.tier?.isSuper()) {
				let orgs = new Map<string, string>();
				rows.forEach(r => orgs.set(r.orgid as string, r.orgName as string));
				this.setState({orgs: Array.from(orgs, ([v, n]) => ({v, n: `${n} (${v})`}))});
			}
			else this.selectOrg(undefined);
		});
	}

	/**
	 * @param orgId super role: the selected community; others: undefined, the user's own
	 */
	selectOrg(orgId: string | undefined) {
		this.setState({orgId, domain: undefined,
			domains: this.domxRows
				.filter(r => !orgId || r.orgid === orgId)
				.map(r => ({v: r.domid as string, n: `${r.domname} (${r.domid})`}))});
	}

	render() {
		let {orgId, domain} = this.state;
		return (<>
		  <Card style={{margin: 8}}><CardContent>
			<Typography variant='h6'>{L('Synodes of a Domain')}</Typography>
			{this.tier?.isSuper() &&
			  <Selector label={L('Community')} value={orgId} options={this.state.orgs}
				onChange={(v) => this.selectOrg(v)} />}
			<Selector label={L('Domain')} value={domain} options={this.state.domains}
				onChange={(v) => this.setState({domain: v})} />
			<Typography variant='caption' color='textSecondary' sx={{display: 'block'}}>
				{L('States are what the synodes last reported to the central.')}
			</Typography>
		  </CardContent></Card>

		  {this.tier && domain &&
			<SynodesList uri={this.uri} tier={this.tier} orgId={orgId} domain={domain} />}
		</>);
	}
}
DomainSynodes.contextType = AnContext;
