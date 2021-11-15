
import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import withWidth from "@material-ui/core/withWidth";

import { L } from '../../utils/langstr';
	import { AnConst } from '../../utils/consts';
	import { Comprops, CrudComp, CrudCompW } from '../../react/crud'
	import { AnContext, AnContextType } from '../../react/reactext'
	import { AnTablist } from '../../react/widgets/table-list'
import { QueryConditions, Semantier } from '@anclient/semantier-st';
import { AnQueryst } from '../../react/widgets/query-form-st';

const styles = (theme) => ( {
	root: {
		"& :hover": {
			backgroundColor: '#777'
		}
	}
} );

class DomainComp extends CrudCompW<Comprops> {
	state = {
		/*
		condTxt : { type: 'text', val: '', text: 'No', label: 'text'},
		condCbb : { type: 'autocbb',
					sk: 'lvl1.domain.jsample', nv: {n: 'domainName', v: 'domainId'},
					val: AnConst.cbbAllItem,
					options: [ AnConst.cbbAllItem ],
					label: 'cbb'},
		condAuto: { type: 'cbb', // sk: 'lvl2.domain.jsample',
					nv: {n: 'domainName', v: 'domainId'},
					val: AnConst.cbbAllItem,
					options: [ AnConst.cbbAllItem, {n: 'first', v: 1}, {n: 'second', v: 2}, {n: 'third', v: 3} ],
					label: 'autocbb'},
		condDate: {type: 'date', val: '', label: 'operTime'},
		*/
		pageInf : { page: 0, size: 25, total: 0 },

		selected: {ids: new Set()},
	};

	queryReq: QueryConditions;
	tier: DomainTier;

	conds = [
		{ type: 'text', val: '', text: 'No', label: 'text'},
		{ type: 'autocbb',
		  sk: 'lvl1.domain.jsample', nv: {n: 'domainName', v: 'domainId'},
		  val: AnConst.cbbAllItem,
		  options: [ AnConst.cbbAllItem ],
		  label: 'Encoded Items'},
		{ type: 'cbb', // sk: 'lvl2.domain.jsample',
		  nv: {n: 'domainName', v: 'domainId'},
		  val: AnConst.cbbAllItem,
		  options: [ AnConst.cbbAllItem, {n: 'item', v: 1} ],
		  label: 'Sub Items'},
	];

	constructor(props: Comprops) {
		super(props);

		this.toSearch = this.toSearch.bind(this);
		this.onPageInf = this.onPageInf.bind(this);
	}

	componentDidMount() {
		this.tier = new DomainTier({uri: this.uri});
		this.tier.setContext(this.context);
	}

	toSearch(query) {
		const ctx = this.context as unknown as AnContextType;
		let pageInf = this.state.pageInf;

		let queryReq = ctx.anClient.query(this.uri, 'a_domain', 'd', pageInf)
		if (query.parent && query.parent !== 0)
			queryReq.Body().whereCond('=', 'parentId', `'${query.parent}'`);
		if (query.domain)
			queryReq.Body().whereCond('%', 'domainName', `'${query.domain}'`);
		if (query.ignored)
			queryReq.Body().whereCond('<>', 'parentId', `'${query.ignored}'`);

		this.queryReq = queryReq;

		ctx.anReact.bindTablist(queryReq, this, ctx.error);
	}

	onPageInf(page, size) {
		const ctx = this.context as unknown as AnContextType;
		this.state.pageInf.size = size;
		this.state.pageInf.page = page;
		let query = this.queryReq;
		if (query) {
			query.Body().Page(size, page);
			this.state.pageInf = {page, size, total: this.state.pageInf.total};
			ctx.anReact.bindTablist(query, this, ctx.error);
		}
	}

	render() {
		const { classes, width } = this.props;
		let media = CrudCompW.getMedia(width);
		console.log(classes, media);
		return ( <>
			<AnQueryst uri={this.uri}
				onSearch={this.toSearch}
				onLoaded={this.toSearch}
				conds={this.conds}
				// query={(q) => { return {
				// 	domain: q.state.conds[0].val ? q.state.conds[0].val : undefined,
				// 	parent: q.state.conds[1].val ? q.state.conds[1].val.v : undefined,
				// 	ignored: q.state.conds[2].val ? q.state.conds[2].val.v : undefined,
				// 	operTime: q.state.conds[3].val ? q.state.conds[3].val : undefined
				// }} }
			/>
			<AnTablist className={classes.root}
				columns={[
					{ text: L('Domain ID'), field:"domainId", color: 'primary', className: 'bold' },
					{ text: L('Domain Name'), color: 'primary', field:"domainName"},
					{ text: L('parent'), color: 'primary',field:"parentId" }
				]}
				rows={this.tier.rows} pk='domainId'
				pageInf={this.state.pageInf}
				selected={this.state.selected}
				sizeOptions={[5, 25, 50]}
				onPageInf={this.onPageInf}
			/>
		  </>);
	}
}
DomainComp.contextType = AnContext;

export class DomainTier extends Semantier {

	_fields = [{field: 'did', label: 'Domain ID'}];

	_cols = [{field: 'did', label: 'Doamin ID'}];


}

const Domain = withStyles<any, any, Comprops>(styles)(withWidth()(DomainComp));
export { Domain, DomainComp }
