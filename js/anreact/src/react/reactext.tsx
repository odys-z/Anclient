import { Inseclient, SessionClient } from '@anclient/semantier-st/anclient';
import React from 'react';

import {L} from '../utils/langstr';
import { AnReact } from './anreact';
import { Comprops, CrudCompW } from './crud';
import {ConfirmDialog} from './widgets/messagebox'

export const AnContext = React.createContext({
	/**	Anclient */
	// an: undefined,
    /**@type = SessionIfn */
	ssInf: undefined,

	pageOrigin: '.',
	iparent: {},    // usually the parent window of ifram
	ihome: '',
	servId: 'host',
	servs: { host: 'http://localhost:8080' },

	anClient: undefined as typeof SessionClient | Inseclient,
	anReact: undefined as typeof AnReact,

	// error handling pattern like
	// https://medium.com/technofunnel/error-handling-in-react-hooks-e42ab91c48f4
	error: {
        /**@function (code: string, AnsonMsg<AnsonResp>) => void */
		onError: undefined,
		msg: undefined
	},
	hasError: false,

	// uuid: function() : string {
	// 	return (++ _uid_).toString();
	// }
});

// var _uid_ = 0;

export interface ErrorProps extends Comprops {
    onClose: () => void;
    fullScreen: boolean;
}

// export class AnError extends React.Component<ErrorProps> {
export class AnError extends CrudCompW<ErrorProps> {
	// props = undefined;
    context: React.ContextType<typeof AnContext>

	state = {
	};

	constructor(props) {
		super(props);
	}

	render() {
		let ctx = this.context;// .errors;
        let p = this.props as ErrorProps;
		return (
			<ConfirmDialog ok={L('OK')} title={L('Error')} cancel={false}
					open={!!ctx.hasError} onClose={p.onClose}
					fullScreen={p.fullScreen}
					msg={L(ctx.error.msg)} />
		);
	}
}
AnError.contextType = AnContext;
