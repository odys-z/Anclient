import React from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import { AnContext, Comprops, CrudCompW, L } from '@anclient/anreact';

import { CentralTier } from '../common/central-tier';
import { centralTier, DomainsList, Selector, SynodesList } from './central-lists';

/**
 * Domains of the user's org. The super role can select any org of the market.
 * Select a domain to see its synodes.
 *
 * Menu url: /org/domains
 */
export class OrgDomains extends CrudCompW<Comprops> {
	tier: CentralTier | undefined;

	state = {
		orgs: [] as {v: string, n: string}[],
		orgId: undefined as string | undefined,
		domain: undefined as string | undefined,
	};

	componentDidMount() {
		this.tier = centralTier(this);
		if (this.tier.isSuper())
			this.tier.orgs((_cols, rows) =>
				this.setState({orgs: rows.map(r => ({v: r.orgId as string, n: `${r.orgName} (${r.orgId})`}))}));
		else this.setState({});
	}

	render() {
		let {orgId, domain} = this.state;
		return (<>
		  <Card style={{margin: 8}}><CardContent>
			<Typography variant='h6'>{L('Domains of the Community')}</Typography>
			{this.tier?.isSuper() &&
			  <Selector label={L('Community')} value={orgId} options={this.state.orgs}
				onChange={(v) => this.setState({orgId: v, domain: undefined})} />}
		  </CardContent></Card>

		  {this.tier &&
			<DomainsList uri={this.uri} tier={this.tier} orgId={orgId}
				onSelect={(id) => this.setState({domain: id})} />}

		  {this.tier && domain && <>
			<Typography variant='subtitle1' style={{margin: 8}}>{L('Synodes of {dom}', {dom: domain})}</Typography>
			<SynodesList uri={this.uri} tier={this.tier} orgId={orgId} domain={domain} />
		  </>}
		</>);
	}
}
OrgDomains.contextType = AnContext;
