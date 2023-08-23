
import React from 'react';
import withStyles from "@material-ui/core/styles/withStyles";
import withWidth from "@material-ui/core/withWidth";
import { Theme } from '@material-ui/core/styles';

import { L } from '../../utils/langstr';
import { AnConst } from '../../utils/consts';
import { Comprops, CrudCompW } from '../../react/crud'
import { AnContext, AnContextType } from '../../react/reactext'
import { AnTablist } from '../../react/widgets/table-list'
import { AnsonResp, PageInf, Semantier, TierComboField } from '@anclient/semantier';
import { AnQueryst } from '../../react/widgets/query-form';

const styles = (theme: Theme) => ( {
	root: {
		"& :hover": {
			backgroundColor: '#777'
		}
	}
} );

class DomainComp extends CrudCompW<Comprops> {
	state = {
		pageInf : new PageInf(0, 25, 0 ),
		selected: {ids: new Map<string, any>()},
	};

	tier: DomainTier;

	conds = [
		{ type: 'text',    name: 'domainName', val: '', text: 'No', label: 'text'},
		{ type: 'autocbb', name: 'domainId',
		  sk: 'lvl1.domain.jsample',
		  nv: {n: 'domainName', v: 'domainId'},
		  val: AnConst.cbbAllItem,
		  options: [ AnConst.cbbAllItem ],
		  label: 'Encoded Items'},
		{ type: 'cbb', name: 'subDomain',
		  sk: 'lvl2.domain.jsample',
		  nv: {n: 'domainName', v: 'domainId'},
		  val: AnConst.cbbAllItem,
		  // options: [ AnConst.cbbAllItem, {n: 'item', v: 1} ],
		  label: 'Sub Items'},
	] as TierComboField[];

	constructor(props: Comprops) {
		super(props);

		this.toSearch = this.toSearch.bind(this);
		this.onPageInf = this.onPageInf.bind(this);
	}

	componentDidMount() {
		this.tier = new DomainTier({uri: this.uri});
		this.tier.setContext(this.context as unknown as AnContextType);
	}

	toSearch(query? : PageInf) {
		const ctx = this.context as unknown as AnContextType;

		let queryReq = ctx.anClient.query(this.uri, 'a_domain', 'd', new PageInf(0, this.props.size, undefined))

		let {domainId, subDomain, domainName} = query.mapCondts;

		if (domainId)
			queryReq.Body().whereCond('=', 'parentId', `'${domainId}'`);
		if (domainName)
			queryReq.Body().whereCond('%', 'domainName', `'${domainName}'`);
		if (subDomain)
			queryReq.Body().whereCond('<>', 'parentId', `'${subDomain}'`);

		let that = this;
		ctx.anClient.commit(queryReq,
			(qrsp) => {
				let rs = qrsp.Body().Rs();
				let {rows} = AnsonResp.rs2arr( rs );
				that.tier.rows = rows;
				that.setState({});
			}, ctx.error );
    }

	onPageInf(page: number, size: number) {
		const ctx = this.context as unknown as AnContextType;
		this.state.pageInf.size = size;
		this.state.pageInf.page = page;
		this.toSearch();
	}

	render() {
		const { classes, width } = this.props;
		let media = CrudCompW.getMedia(width);
		return (
		  <><AnQueryst uri={this.uri}
				onSearch={this.toSearch}
				onLoaded={this.toSearch}
				fields={this.conds}
			/>
			{this.tier &&
			<AnTablist className={classes.root} media={media}
				columns={[
					{ field:"domainId",   label: L('Domain ID'),     color: 'primary', className: 'bold', grid: {} },
					{ field:"domainName", label: L('Domain Name'),   color: 'primary', grid: {} },
					{ field:"parentId",   label: L('Parent Domain'), color: 'primary', grid: {} }
				]}
				rows={this.tier.rows} pk='domainId'
				pageInf={this.state.pageInf}
				selected={this.state.selected}
				onSelectChange={undefined}
				sizeOptions={[5, 25, 50]}
				onPageInf={this.onPageInf}
			/>}
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

