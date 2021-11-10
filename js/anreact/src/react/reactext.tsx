import { ErrorCtx, Semantext, SessionClient, SessionInf } from '@anclient/semantier-st';
import React from 'react';

import { AnReact } from './anreact';

export interface AnContextType extends Semantext {
	/**	Anclient */
	// an: undefined,
    /**@type = SessionIfn */
	ssInf: SessionInf,

	pageOrigin: string,
	iparent: any,    // usually the parent window of ifram
	ihome: string,

	/**default: host */
	servId: string,

	servs: { host: string; [h: string]: string },

	// anClient: SessionClient,

	/** Only nullable for Login */
	// anReact: typeof AnReact,

	// error handling pattern like
	// https://medium.com/technofunnel/error-handling-in-react-hooks-e42ab91c48f4
	// error: ErrorCtx,
	hasError: boolean,
} 

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

	anClient: undefined,
	anReact: undefined,

	// error handling pattern like
	// https://medium.com/technofunnel/error-handling-in-react-hooks-e42ab91c48f4
	error: {
        /**@function (code: string, AnsonMsg<AnsonResp>) => void */
		onError: undefined,
		msg: undefined
	} as ErrorCtx,
	hasError: false,

	/** Only nullable for Login */
	reactHelper: undefined as AnReact,
	// uuid: function() : string {
	// 	return (++ _uid_).toString();
	// }
} as AnContextType);

// var _uid_ = 0;

