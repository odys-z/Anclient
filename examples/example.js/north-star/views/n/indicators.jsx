
import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import withWidth from "@material-ui/core/withWidth";
import { Card, Box, TextField, Typography } from '@material-ui/core';

import { AnClient, SessionClient, Protocol } from '@anclient/semantier';
import { L, Langstrs,
    AnContext, AnError, CrudCompW, AnReactExt,
	AnTreeditor
} from 'anclient';

import { QuizProtocol } from '../../common/protocol.quiz.js';

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
			uri={this.uri} mtabl='ind_emotion'
			pk={{ type: 'text', field: 'indId', label: L('Indicator Id'), hide: 1, validator: {len: 12} }}
			parent={{ type: 'text', field: 'parent', label: L('Indicator Id'), hide: 1, validator: {len: 12} }}
			columns={[
				{ type: 'text', field: 'indName', label: L('Indicator'),
				  validator: {len: 200, notNull: true}, cols: {sm: 3} },
				{ type: 'float', field: 'weight', label: L('Default Weight'),
				  validator: {min: 0.0}, cols: {sm: 3},
				  formatter: (n, col) => n.node.weight},
				{ type: 'formatter', label: L('Question Type'), cols: {sm: 3},
				  formatter: (rec) => { return readableQtype(rec.node.qtype || rec.node.vtype, true) } },
				{ type: 'actions', label: '', cols: 3}
			]}
			fields={[
				{ type: 'text', field: 'parent', label: L('Indicator Id'), hide: 1,
				  validator: {len: 12} },
				{ type: 'text', field: 'indName', label: L('Indicator'),
				  validator: {len: 200, notNull: true} },
				{ type: 'float', field: 'weight', label: L('Default Weight'),
				  validator: {min: 0.0} },
				{ type: 'enum', field: 'qtype', label: L('Question Type'),
				  // If a node is the type of the first option, it means that node is middle (internal) node.
				  options: [{n: L('[ Category ]'), v: 'cate'}, ...QuizProtocol.Qtype.options()],
				  validator: {notNull: true} },
				{ type: 'int',field: 'sort', label: L('UI Sort'),
				  validator: {notNull: true} },
				{ type: 'text', field: 'remarks', label: L('Remarks'),
				  validator: {len: 500}, props: {sm: 12, lg: 6} }
			]}
			isMidNode={n => n.qtype === 'cate' || !n.qtype}
			detailFormTitle={L('Indicator Details')}
		/>);

		/**Change qtype to readable component
		 * @param {string} t qtype
		 * @return {string} decoded text
		 */
		function readableQtype(t) {
			if (t)
				t = t.toLowerCase();
			if (t === 'cate')
				return L('[Category]');
			else // can't pu Typography here because it's child of Typography
				return QuizProtocol.Qtype.decode(t);
		}
	}
}
IndicatorsComp.contextType = AnContext;

const Indicators = withWidth()(withStyles(styles)(IndicatorsComp));
export { Indicators, IndicatorsComp }
