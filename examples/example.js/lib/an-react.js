/** TODO move this the anclient.js
 */
import React from 'react';

import {L} from './utils/langstr';
import {ConfirmDialog} from './widgets/Messagebox'

export const AnContext = React.createContext(
	// Anclient
	{ an: undefined,
	  ssInf: undefined,

	  // error handling pattern like
	  // https://medium.com/technofunnel/error-handling-in-react-hooks-e42ab91c48f4
 	  error: {hasError: false},
	}
);

export class AnError extends React.Component {
	props = undefined;

	constructor(props) {
		super(props);
		this.state.props = props;
	}

	render() {
		let ctx = this.context;
		return (
			<ConfirmDialog ok={L('OK')} title={L('Error')} cancel={false}
					open={ctx.error.hasError} onClose={this.state.props.onConfirm}
					msg={ctx.error.msg} />
		);
	}
}
