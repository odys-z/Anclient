import path = require('path');
import { URL } from 'url';
import * as vscode from 'vscode';
import { AnprismException } from './common';

type Semantier = {
    pythonPath: string,
    webroot?: string,
    status: string,
};

export type Page = {
	html: vscode.Uri,
	style?: string,
    reload: boolean
};

export class ParserHelper {
    semantier: Semantier;
    context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext, serv?: Semantier) {
        this.semantier = Object.assign({
			pythonPath: context.asAbsolutePath(path.join('packages', 'semantier', 'parser', 'Enveloparser.py')),
            starting: false,
            webpackTerm: undefined
        }, serv);

        this.context = context;
    }

}
