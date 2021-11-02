import React from 'react';

import {L} from '../utils/langstr';
import { Comprops, CrudCompW } from './crud';
import {ConfirmDialog} from './widgets/messagebox'

export const AnContext = React.createContext({
	/**	Anclient */
	an: undefined,
    /**@type = SessionIfn */
	ssInf: undefined,

	pageOrigin: '.',
	iparent: {},    // usually the parent window of ifram
	ihome: '',
	servId: 'host',
	// servs: { host: 'http://localhost:8080/jserv-sample' },
	servs: { host: 'http://localhost:8080' },

	anReact: undefined,

	// error handling pattern like
	// https://medium.com/technofunnel/error-handling-in-react-hooks-e42ab91c48f4
	error: {
        /**@function (code: string, AnsonMsg<AnsonResp>) => void */
		onError: undefined,
		msg: undefined
	},
	hasError: false,

	// setServ: function(servId: string, json: {host: string, [key: string]: string}) {
	// 	let me = AnContext;
	// 	me.servs = Object.assign(me.servs, json);
	// 	me.servId = servId ? servId : 'host';
	// },

	uuid: function() {
		return ++ _uid_;
	}
});

var _uid_ = 0;

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
