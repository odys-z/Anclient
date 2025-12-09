import { AnsonMsg, AnsonResp, ErrorCtx, Semantext, SessionInf } from '@anclient/semantier';
import React from 'react';

import { AnReact } from './anreact';

/**
 * The configuration data object used by user App to setup jserv root URL.
 * @deprecated 0.6.8 use ExternalHosts instead
 */
export interface JsonHosts {
	host: string;
	[h: string]: string | object,
}

export class ExternalHosts implements JsonHosts {
	[h: string]: string | object;

	host: string;
	localip?: string;
	syndomx?: { [key: string]: string };
	synodesetups?: { [key: string]: string[] };


	constructor(json: {host: string, localip?: string,
				syndomx?: { [key: string]: string },
				synodesetups?: { [key: string]: string[] }}) {

		Object.assign(this, json);

		if (json !== undefined && json.host !== undefined) 
			this.ServId(json.host);
	}

	/**
	 * Setup which servId to use for jserv.
	 * @param servId 
	 * @returns this
	 */
	ServId (servId: string): this {
		this.host = servId;
		this.domain = (this.syndomx ?? {})['domain'];
		this.jserv = (this.syndomx ?? {} )[this.host];
		
		this.jservNvs = Object
			.entries(this.syndomx || {})
			.filter(([x, v]) => x !== 'domain')
			.map(([k, v]) => {return {n: k, v}});
		return this;
	}

	static
	to_arch_os_readable(zip_name: string): string {
		let arc, os: string;
		if (zip_name.indexOf('x64') >= 0)
			arc = '64-bit';
		else if (zip_name.indexOf('x86') >= 0)
			arc = '32-bit';
		else
			arc = 'AMD';
		if (zip_name.indexOf('win') >= 0)
			os = 'Windows';
		else if (zip_name.indexOf('linux') >= 0)
			os = 'Linux';
		else if (zip_name.indexOf('mac') >= 0)
			os = 'MacOS';
		else
			os = 'OS';
		
		return `${os} ${arc}`;
	}
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
		onError: undefined as (code: string, resp: AnsonMsg<AnsonResp>) => undefined,
		msg: undefined as string
	} as ErrorCtx,
	hasError: false,

	/** Only nullable for Login */
	reactHelper: undefined as AnReact,
} as unknown as AnContextType);
