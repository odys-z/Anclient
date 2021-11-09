import { ErrorCtx, Inseclient, SessionClient } from '@anclient/semantier-st/anclient';
import React from 'react';
import { AnReact } from './anreact';
export declare const AnContext: React.Context<{
    /**	Anclient */
    /**@type = SessionIfn */
    ssInf: any;
    pageOrigin: string;
    iparent: {};
    ihome: string;
    /**default: host */
    servId: string;
    servs: {
        host: string;
    };
    anClient: Inseclient | typeof SessionClient;
    anReact: typeof AnReact;
    error: ErrorCtx;
    hasError: boolean;
}>;
