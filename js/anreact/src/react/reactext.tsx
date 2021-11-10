import { ErrorCtx, Semantext, SessionClient, SessionInf } from '@anclient/semantier-st';
import React from 'react';

import { AnReact } from './anreact';

export interface AnContextType extends Semantext {
	ssInf: SessionInf,

	pageOrigin: string,
	iparent: any,    // usually the parent window of ifram
	ihome: string,

	/**default: host */
	servId: string,

	servs: { host: string; [h: string]: string },

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

	error: {
        /**@function (code: string, AnsonMsg<AnsonResp>) => void */
		onError: undefined,
		msg: undefined
	} as ErrorCtx,
	hasError: false,

	/** Only nullable for Login */
	reactHelper: undefined as AnReact,
} as AnContextType);
