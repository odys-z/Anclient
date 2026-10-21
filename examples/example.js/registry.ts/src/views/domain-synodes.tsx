import React from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import { AnContext, Comprops, CrudCompW, L } from '@anclient/anreact';

import { CentralTier } from '../common/central-tier';
import { centralTier, Selector, SynodesList } from './central-lists';

/**
 * Synodes of a domain, with the states last reported by the synodes.
 * The super role can select any org of the market first.
 *
 * Menu url: /domain/synodes
 */
export class DomainSynodes extends CrudCompW<Comprops> {
	tier: CentralTier | undefined;

	state = {
		orgs: [] as {v: string, n: string}[],
		domains: [] as {v: string, n: string}[],
		orgId: undefined as string | undefined,
		domain: undefined as string | undefined,
	};

	componentDidMount() {
		this.tier = centralTier(this);
		if (this.tier.isSuper())
			this.tier.orgs((_cols, rows) =>
				this.setState({orgs: rows.map(r => ({v: r.orgId as string, n: `${r.orgName} (${r.orgId})`}))}));
		else this.loadDomains(undefined);
	}

	loadDomains(orgId: string | undefined) {
		this.setState({orgId, domain: undefined, domains: []});
		this.tier?.domains(orgId, (_cols, rows) =>
			this.setState({domains: rows.map(r => ({v: r.domid as string, n: `${r.domname} (${r.domid})`}))}));
	}

	render() {
		let {orgId, domain} = this.state;
		return (<>
		  <Card style={{margin: 8}}><CardContent>
			<Typography variant='h6'>{L('Synodes of a Domain')}</Typography>
			{this.tier?.isSuper() &&
			  <Selector label={L('Org')} value={orgId} options={this.state.orgs}
				onChange={(v) => this.loadDomains(v)} />}
			<Selector label={L('Domain')} value={domain} options={this.state.domains}
				onChange={(v) => this.setState({domain: v})} />
			<Typography variant='caption' color='textSecondary' display='block'>
				{L('States are what the synodes last reported to the central.')}
			</Typography>
		  </CardContent></Card>

		  {this.tier && domain &&
			<SynodesList uri={this.uri} tier={this.tier} orgId={orgId} domain={domain} />}
		</>);
	}
}
DomainSynodes.contextType = AnContext;
