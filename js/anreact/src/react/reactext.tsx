import { ErrorCtx, Semantext, SessionInf } from '@anclient/semantier';
import React from 'react';

import { AnReact } from './anreact';

/**
 * The configuration data object used by user App to setup jserv root URL.
 */
export interface JsonHosts {
	host?: string;
	[h: string]: string,
}

export interface AnContextType extends Semantext {
	ssInf?: SessionInf,
	/** AnReact instance. currently neccessary */
	anReact?: AnReact,   

	pageOrigin?: string,
	/** Usually the parent window of ifram. */
	iparent?: Window,
	ihome?: string,

	/**
	 * Jserv id configured within index.html for jserv url directing.
	 * default: host
	 */
	servId: string,

	servs: JsonHosts, 

	hasError: boolean,

	/** e.g.: private/host.json */
	host_json: string,

	/**
	 * e.g.: res-vol/res.json
	 * @since 0.6.5
	 */
	res_vol: string,

	/**
	 * @since 0.6.5
	 */
	clientOpts?: ClientOptions

	/**
	 * Fullscreen event handler, a contract between the main frame (client window) and child components.
	 * 
	 * @since 0.6.5
	 */
	onFullScreen?: (isfull: any) => void;
}

/**
 * @since 0.6.5 
 */
export interface ClientOptions {
	/**
	 * False: use iframe (pdf-iframe) for pdf, which uses browser's pdf rendere;
	 * True: Use anreact/react/widgets/pdf-view.
	 */
	legacyPDF?: boolean

	/** 
	 * @since 0.6.5
	 * 
	 * Default: 'browser'
	 */
	platform?: 'android' | 'browser'
}

export const AnContext = React.createContext({
	ssInf: undefined as SessionInf,

	pageOrigin: '.',
	iparent: {},    // usually the parent window of ifram
	ihome: undefined as string,

	/**default: host */
	servId: undefined as string,

	servs: { host: 'http://localhost:8080' } as JsonHosts,

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
} as unknown as AnContextType);
