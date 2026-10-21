import React from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import { Tierec } from '@anclient/semantier';
import { AnContext, AnTablist, Comprops, CrudCompW, L } from '@anclient/anreact';

import { CentralTier } from '../common/central-tier';
import { centralTier, DomainsList, SynodesList } from './central-lists';

/**
 * Orgs of the market (super role only). Select an org to see its domains,
 * then a domain to see its synodes.
 *
 * Menu url: /market/orgs
 */
export class MarketOrgs extends CrudCompW<Comprops> {
	tier: CentralTier | undefined;

	state = {
		rows: [] as Tierec[],
		selected: {ids: new Map<string, Tierec>()},
		orgId: undefined as string | undefined,
		domain: undefined as string | undefined,
	};

	componentDidMount() {
		this.tier = centralTier(this);
		this.tier.orgs((_cols, rows) => this.setState({rows}));
	}

	render() {
		let {orgId, domain} = this.state;
		return (<>
		  <Card style={{margin: 8}}><CardContent>
			<Typography variant='h6'>{L('Orgs of the Market')}</Typography>
		  </CardContent></Card>

		  {this.tier &&
		  <AnTablist uri={this.uri} pk='orgId' singleCheck
			selected={this.state.selected}
			rows={this.state.rows}
			columns={[
				{ field: 'orgId',   label: L('Org ID'), grid: {} },
				{ field: 'orgName', label: L('Org Name'), grid: {} },
				{ field: 'webroot', label: L('Web Root'), grid: {} },
				{ field: 'album0',  label: L('Album'), grid: {} },
				{ field: 'domains', label: L('Domains'), grid: {} },
			]}
			onSelectChange={(ids: Map<string, Tierec>) => {
				let [id] = ids.keys();
				this.setState({orgId: id, domain: undefined});
			}}
		  />}

		  {this.tier && orgId && <>
			<Typography variant='subtitle1' style={{margin: 8}}>{L('Domains of {org}', {org: orgId})}</Typography>
			<DomainsList uri={this.uri} tier={this.tier} orgId={orgId}
				onSelect={(id) => this.setState({domain: id})} />
		  </>}

		  {this.tier && orgId && domain && <>
			<Typography variant='subtitle1' style={{margin: 8}}>{L('Synodes of {dom}', {dom: domain})}</Typography>
			<SynodesList uri={this.uri} tier={this.tier} orgId={orgId} domain={domain} />
		  </>}
		</>);
	}
}
MarketOrgs.contextType = AnContext;
