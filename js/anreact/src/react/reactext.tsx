import { ErrorCtx, Inseclient, SessionClient } from '@anclient/semantier-st/anclient';
import React from 'react';

import { AnReact } from './anreact';

export const AnContext = React.createContext({
	/**	Anclient */
	// an: undefined,
    /**@type = SessionIfn */
	ssInf: undefined,

	pageOrigin: '.',
	iparent: {},    // usually the parent window of ifram
	ihome: undefined as string,

	/**default: host */
	servId: undefined as string,

	servs: { host: 'http://localhost:8080' },

	anClient: undefined as typeof SessionClient | Inseclient,
	anReact: undefined as typeof AnReact,

	// error handling pattern like
	// https://medium.com/technofunnel/error-handling-in-react-hooks-e42ab91c48f4
	error: {
        /**@function (code: string, AnsonMsg<AnsonResp>) => void */
		onError: undefined,
		msg: undefined
	} as ErrorCtx,
	hasError: false,

	// uuid: function() : string {
	// 	return (++ _uid_).toString();
	// }
});

// var _uid_ = 0;

