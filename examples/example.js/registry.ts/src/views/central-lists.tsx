import React from 'react';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import { Tierec } from '@anclient/semantier';
import { AnContext, AnContextType, AnTablist, Comprops, CrudCompW, L, stateFormatter } from '@anclient/anreact';

import { CentralTier, synodeStates } from '../common/central-tier';

/**
 * Create (once) the central tier for a component, bound to the component's context.
 */
export function centralTier(comp: CrudCompW<Comprops>): CentralTier {
	let tier = new CentralTier(comp);
	tier.setContext(comp.context as unknown as AnContextType);
	return tier;
}

interface ListProps extends Comprops {
	tier: CentralTier;
	/** undefined for the session user's org */
	orgId?: string;
	/** called with the selected row's id, or undefined */
	onSelect?: (id: string | undefined, row?: Tierec) => void;
}

/**
 * Domains of an org, with number of synodes.
 */
export class DomainsList extends CrudCompW<ListProps> {
	state = {
		rows: [] as Tierec[],
		selected: {ids: new Map<string, Tierec>()},
	};

	componentDidMount() { this.load(); }

	componentDidUpdate(prev: ListProps) {
		if (prev.orgId !== this.props.orgId) this.load();
	}

	load() {
		this.state.selected.ids.clear();
		this.props.tier.domains(this.props.orgId, (_cols, rows) => this.setState({rows}));
	}

	render() {
		return (
		  <AnTablist uri={this.uri} pk='domid' singleCheck
			selected={this.state.selected}
			rows={this.state.rows}
			columns={[
				{ field: 'domid',   label: L('Domain'), grid: {} },
				{ field: 'domname', label: L('Name'), grid: {} },
				{ field: 'synodes', label: L('Synodes'), grid: {} },
			]}
			onSelectChange={(ids: Map<string, Tierec>) => {
				let [id, row] = ids.entries().next().value || [];
				this.props.onSelect && this.props.onSelect(id, row);
			}}
		  />);
	}
}
DomainsList.contextType = AnContext;

interface SynodesProps extends Comprops {
	tier: CentralTier;
	orgId?: string;
	domain: string;
}

/**
 * Synodes of a domain, hub first, with the states last reported by the synodes.
 */
export class SynodesList extends CrudCompW<SynodesProps> {
	state = {
		rows: [] as Tierec[],
		selected: {ids: new Map<string, Tierec>()},
	};

	componentDidMount() { this.load(); }

	componentDidUpdate(prev: SynodesProps) {
		if (prev.orgId !== this.props.orgId || prev.domain !== this.props.domain) this.load();
	}

	load() {
		if (!this.props.domain) return this.setState({rows: []});
		this.props.tier.synodes(this.props.orgId, this.props.domain, (_cols, rows) => this.setState({rows}));
	}

	render() {
		return (
		  <AnTablist uri={this.uri} pk='sid' singleCheck
			selected={this.state.selected}
			rows={this.state.rows}
			columns={[
				{ field: 'sid',    label: L('Synode'), grid: {} },
				{ field: 'mode',   label: L('Mode'), grid: {} },
				{ field: 'stat',   label: L('State'), formatter: stateFormatter(synodeStates), grid: {} },
				{ field: 'jserv',  label: L('Jserv'), grid: {} },
				{ field: 'ip',     label: L('IP (reported from)'), grid: {} },
				{ field: 'optime', label: L('Last reported'), grid: {} },
				{ field: 'oper',   label: L('By'), grid: {} },
			]}
		  />);
	}
}
SynodesList.contextType = AnContext;

/**
 * A select field of options loaded by the caller.
 */
export function Selector(props: {label: string, value?: string,
		options: {v: string, n: string}[], onChange: (v: string) => void}) {
	return (
	  <TextField select label={props.label} value={props.value || ''}
		style={{minWidth: 240, margin: 8}}
		onChange={(e) => props.onChange(e.target.value as string)} >
		{props.options.map(o => <MenuItem key={o.v} value={o.v}>{o.n}</MenuItem>)}
	  </TextField>);
}
