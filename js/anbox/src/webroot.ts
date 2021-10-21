
import path = require('path');
import * as vscode from 'vscode';

type Serv = {
    pythonPath: string,
    webroot?: string, // initially unknown, before webroot() is called
    port?: string, // "?" for initially unknow - port in launch.json is part of url, but python need it
    starting: boolean
};

export class ServHelper {
    serv: Serv;
    page: vscode.Uri | undefined;

    constructor(context: vscode.ExtensionContext, serv?: Serv) {
        this.serv = Object.assign({
			pythonPath: context.asAbsolutePath(path.join('packages', 'anserv.py')),
            starting: false,
            webpackTerm: undefined
        }, serv);
    }

	starting (starting: boolean) {
        this.serv.starting = starting;
        return this;
	}

	pythonPath() {
		return this.serv.pythonPath;
	}

    /**
     * Findout webRoot of launch.json for the uri's workspace.
     * @param uri 
     * @returns 
     */
	public webroot(uri: vscode.Uri): ServHelper {

        const cfgs = vscode.workspace.getConfiguration("launch", uri)?.get<any[]>("configurations");

        if (cfgs) {
            for (let i = 0; i < cfgs.length; i++) {
                console.log(cfgs[i]);
                if (cfgs[i].type === "pwa-chrome") {
                    this.serv.webroot = cfgs[i].webRoot;
                    break;
                }
            }
        };
        return this;
	}

    /**
     * Check is the html located in webroot. If yes, change it.
     * If webroot is still not set, update webroot with the workspace launch.json.
     * @param uri 
     * @returns 
     */
	public html(uri: vscode.Uri): ServHelper {
        if (!this.serv.webroot) {
            this.webroot(uri);
            this.page = uri;
        }
        else {
            const fullpath = uri.fsPath;
            if (fullpath?.startsWith(this.serv.webroot)) {
                this.page = uri;
            }
            else throw Error('page is not located in root folder: ' + uri.fsPath);
        }
        return this;
	}

}
