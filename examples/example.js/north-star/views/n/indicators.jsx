
import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import withWidth from "@material-ui/core/withWidth";
import Button from '@material-ui/core/Button';
import Replay from '@material-ui/icons/Replay';

import { L, AnContext,
	CrudCompW, ConfirmDialog, AnTreeditor
} from '@anclient/anreact';

import { QuizProtocol } from '../../common/protocol.quiz.js';

const styles = (theme) => ( {
	button: {
		margin: theme.spacing(2)
	}
} );

class IndicatorsComp extends CrudCompW {
	state = {
		students: []
	};
	sk = 'xv.indicators';

	constructor(props) {
		super(props);

		this.reshape = this.reshape.bind(this);
	}

	reshape(e) {
		// ask server tag all subtrees
		let client = this.context.anClient;
		let that = this;

		let uri = this.uri;

		let ds = {uri, sk: this.sk, t: 'tagtrees', onOk: (e) => {
			that.confirm = (
				<ConfirmDialog title={L('Info')}
					ok={L('OK')} cancel={false} open
					onOk={ that.del }
					onClose={() => {that.confirm = undefined;} }
					msg={L('Updating quiz teamplates finished!')} />);
			that.setState({});
		}};

		that.context.anReact.stree(ds, that.context.error);
	}

	render () {
		let {classes} = this.props;
		return (<>
		  <Button variant="contained" color='primary'
			className={classes.button} onClick={this.reshape}
			startIcon={<Replay />}
		  >{L('Update')}</Button>
		  <AnTreeditor sk={this.sk}
			uri={this.uri} mtabl='ind_emotion'
			pk={{ type: 'text', field: 'indId', label: L('Indicator Id'), hide: 1, validator: {len: 12} }}
			parent={{ type: 'text', field: 'parent', label: L('Indicator Id'), hide: 1, validator: {len: 12} }}
			columns={[
				{ type: 'text', field: 'indName', label: L('Indicator'),
				  validator: {len: 200, notNull: true}, cols: {sm: 6} },
				{ type: 'float', field: 'weight', label: L('Weight'),
				  validator: {min: 0.0}, cols: {sm: 1},
				  formatter: (n, col) => n.node.weight},
				{ type: 'formatter', label: L('Question Type'), cols: {sm: 2},
				  formatter: (rec) => { return readableQtype(rec.node.qtype || rec.node.vtype, true) } },
				{ type: 'actions', label: '', cols: 3}
			]}
			fields={[
				{ type: 'text', field: 'parent', label: 'parent', hide: 1 },
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
		  />
		  {this.confirm}
		</>);

		/**Change qtype to readable component
		 * @param {string} t qtype
		 * @return {string} decoded text
		 */
		function readableQtype(t) {
			if (t)
				t = t.toLowerCase();
			if (t === 'cate')
				return L('[Category]');
			else // can't put Typography here because it's child of Typography
				return QuizProtocol.Qtype.decode(t);
		}
	}
}
IndicatorsComp.contextType = AnContext;

const Indicators = withWidth()(withStyles(styles)(IndicatorsComp));
export { Indicators, IndicatorsComp }
