
import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import withWidth from "@material-ui/core/withWidth";
import { Card, TextField, Typography } from '@material-ui/core';

import { L, Langstrs,
    an, AnClient, SessionClient, Protocol,
    AnContext, AnError, CrudCompW, AnReactExt
} from 'anclient';

// import { AnTreeditor } from '../../../lib/react/widgets/tree-editor';
import { AnTreeditor } from './tree-editor';

const styles = (theme) => ( {
	root: {
	}
} );

class IndicatorsComp extends CrudCompW {
	state = {
		students: []
	};

	constructor(props) {
		super(props);
	}

	render () {
		return (<AnTreeditor sk='xv.indicators'
			uri={this.uri} mtabl='indicators'
			pk={{ type: 'text', field: 'indId', label: L('Indicator Id'), hide: 1, validator: {len: 12} }}
			columns={[
				{ type: 'text', field: 'indName', label: L('Indicator'),
				  validator: {len: 200, notNull: true} },
				{ type: 'float', field: 'weight', label: L('Default Weight'),
				  validator: {min: 0.0} },
				{ type: 'formatter', label: L('Question Type'), formatter: (rec) => { docodeQtype(rec.qtype || rec.vtype) } }
			]}
			fields={[
				{ type: 'text', field: 'parent', label: L('Indicator Id'), hide: 1,
				  validator: {len: 12} },
				{ type: 'text', field: 'indName', label: L('Indicator'),
				  validator: {len: 200, notNull: true} },
				{ type: 'float', field: 'weight', label: L('Default Weight'),
				  validator: {min: 0.0} },
				{ type: 'enum', field: 'qtype', label: L('Question Type'),
				  values: [{n: 'single', v: 's'}, {n: 'multiple', v: 'm'}, {n: 'text', v: 't'}],
				  validator: {notNull: true} },
				{ type: 'number',field: 'sort', label: L('UI Sort'),
				  validator: undefined },
				{ type: 'text', field: 'remarks', label: L('Remarks'),
				  validator: {len: 500}, props: {sm: 12, lg: 6} }
			]}
			detailFormTitle={L('Indicator Details')}
		/>);

		function decodeQtype(t) {
			if (t === undefined) return L('Free Text');
			t = t.toLowerCase();
			return t === 's' ? L('Single Option')
				: t === 'm' ? L('Multiple Option')
				: t === 'r10' ? L('10 Stars Ranking')
				: t === 'r5' ? L('5 Stars Ranking')
				: L('Free Text');
		}
	}
}
IndicatorsComp.contextType = AnContext;

const Indicators = withWidth()(withStyles(styles)(IndicatorsComp));
export { Indicators, IndicatorsComp }
