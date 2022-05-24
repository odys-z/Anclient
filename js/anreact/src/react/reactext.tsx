import { ErrorCtx, Semantext, SessionInf } from '@anclient/semantier';
import React from 'react';

import { AnReact } from './anreact';

/**
 * The configuration used by user App to setup jserv root URL.
 */
export interface JsonServs {
	host?: string;
	[h: string]: string,
}

export interface AnContextType extends Semantext {
	ssInf?: SessionInf,

	pageOrigin?: string,
	iparent?: any,    // usually the parent window of ifram
	ihome?: string,

	/**default: host */
	servId: string,

	servs: JsonServs, 

	hasError: boolean,
} 

export const AnContext = React.createContext({
	ssInf: undefined as SessionInf,

	pageOrigin: '.',
	iparent: {},    // usually the parent window of ifram
	ihome: undefined as string,

	/**default: host */
	servId: undefined as string,

	servs: { host: 'http://localhost:8080' } as JsonServs,

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
