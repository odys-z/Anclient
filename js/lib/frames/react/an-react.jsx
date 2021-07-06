/** TODO move this the anclient.js
 */
import React from 'react';

import {L} from './utils/langstr';
import {ConfirmDialog} from './widgets/messagebox.jsx'

export const AnContext = React.createContext({
	//	Anclient
	an: undefined,
	ssInf: undefined,

	pageOrigin: '.',
	servId: 'host',
	servs: { host: 'http://localhost:8080/jserv-sample' },

	quizId: undefined,

	// error handling pattern like
	// https://medium.com/technofunnel/error-handling-in-react-hooks-e42ab91c48f4
	error: {
		onError: undefined,
		msg: undefined
	},
	hasError: false,

	setServ: function(servId, json) {
		let me = AnContext;
		me.servs = Object.assign(me.servs, json);
		me.servId = servId ? servId : 'host';
	}
});

export class AnError extends React.Component {
	props = undefined;

	state = {
		porps: undefined,
	};

	constructor(props) {
		super(props);
		this.state.props = props;
	}

	render() {
		let ctx = this.context;// .errors;
		return (
			<ConfirmDialog ok={L('OK')} title={L('Error')} cancel={false}
					open={!!ctx.hasError} onClose={this.state.props.onClose}
					msg={ctx.errHandler.msg} />
		);
	}
}
AnError.contextType = AnContext;
