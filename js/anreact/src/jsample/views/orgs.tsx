
import React from 'react';
import { Theme, withStyles } from "@material-ui/core/styles";
import withWidth from "@material-ui/core/withWidth";
import Card from '@material-ui/core/Card';
import Typography from '@material-ui/core/Typography';

import { AnlistColAttrs, Semantier } from '@anclient/semantier';

import { L } from '../../utils/langstr';
import { Comprops, CrudCompW } from '../../react/crud'
import { AnContext, AnContextType } from '../../react/reactext'
import { AnTreegrid } from '../../react/widgets/treegrid'
import { CompOpts } from '../../an-components';

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

	toSearch(e) {
		this.setState({})
	}

	render() {
		const { classes } = this.props;
		return ( <>
			<Card>
				<Typography variant="h6" gutterBottom>
					{this.props.funcName || this.props.title || 'Orgnization Tree'}
				</Typography>
			</Card>
			{this.tier && <AnTreegrid uri={this.uri}
				pk='' onSelectChange={undefined}
				className={classes.root}
				columns={[
					{ text: L('Domain ID'), field:"domainId", color: 'primary', className: 'bold', grid: {} },
					{ text: L('Domain Name'), color: 'primary', field:"domainName", grid: {}},
					{ text: L('parent'), color: 'primary',field:"parentId", grid: {} }
				]}
				rows = {this.tier.rows}
			/>}
		</>);
	}
}
OrgsComp.contextType = AnContext;

const Orgs = withWidth()(withStyles(styles)(OrgsComp));
export { Orgs, OrgsComp }

// FIXME merge with StreeTier
class StreeTier extends Semantier {

}