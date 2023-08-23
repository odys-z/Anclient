
import React from 'react';
import { Theme, withStyles } from "@material-ui/core/styles";
import withWidth from "@material-ui/core/withWidth";
import Card from '@material-ui/core/Card';
import Typography from '@material-ui/core/Typography';

import { PageInf, StreeTier, AnDatasetResp, AnTreeNode } from '@anclient/semantier';

import { L } from '../../utils/langstr';
import { Comprops, CrudCompW } from '../../react/crud'
import { AnContext, AnContextType } from '../../react/reactext'
import { AnTreegrid } from '../../react/widgets/treegrid'

const styles = (_theme: Theme) => ( {
	root: {
		"& :hover": {
			backgroundColor: '#777'
		}
	}
} );

/**
 * This component shows tree data to table binding
 */
class OrgsComp extends CrudCompW<Comprops> {
	state = {
	};
	tier: StreeTier;

	constructor(props) {
		super(props);

		this.toSearch = this.toSearch.bind(this);
	}

	componentDidMount() {
		if (!this.tier) {
			this.tier = new StreeTier(this);
			this.tier.setContext(this.context as unknown as AnContextType);
		}

		this.toSearch(undefined);
	}

	toSearch(e?: React.UIEvent) {
		let that = this;
		this.tier && this.tier.stree({
			sk: 'orgs',
			pageInf: new PageInf(0, -1, 0, []),
			onOk: (resp) => {
				that.tier.forest = (resp.Body(0) as AnDatasetResp).forest as AnTreeNode[];
				that.setState({});
			}}, that.context.error);
	}

	render() {
		const { classes } = this.props;
		return (
		<><Card>
			<Typography variant="h6" gutterBottom>
				{this.props.funcName || this.props.title || 'Orgnization Tree'}
			</Typography>
		  </Card>
		  { this.tier &&
			<AnTreegrid uri={this.uri}
				pk='' onSelectChange={undefined}
				tier={this.tier} sk={'orgs'}
				className={classes.root}
				columns={[
					{ label: L('ID'),           field:"orgId", grid: {xs: 6, sm: 4}, className: 'rowHead' },
					{ label: L('Organization'), field:"text",  grid: {xs: 6, sm: 4} },
					{ label: L('Upper'),        field:"pname", grid: {xs: false, sm: 4} }
				]}
		    />}
		</>);
	}
}
OrgsComp.contextType = AnContext;

const Orgs = withWidth()(withStyles(styles)(OrgsComp));
export { Orgs, OrgsComp }
