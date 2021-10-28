
import path = require('path');
import * as vscode from 'vscode';
import { AnprismException } from './common';

type Serv = {
    pythonPath: string,
    webroot?: string, // initially unknown, before webroot() is called
    port?: string, // "?" for initially unknow - port in launch.json is part of url, but python need it
    starting: boolean
};

export type Page = {
	port: string,
	host: string,

	html: vscode.Uri,

	style: string,

    reload: boolean // FIXME how to get webpack watch results?
};

/**A server helper manage one server:port */
export class ServHelper {
    serv: Serv;
    context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext, serv?: Serv) {
        this.serv = Object.assign({
			pythonPath: context.asAbsolutePath(path.join('packages', 'anserv.py')),
            starting: false,
            webpackTerm: undefined
        }, serv);

        this.context = context;
    }

	isStarting(): boolean {
        return this.serv.starting;
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
     * @param uri e.g. html path
     * @returns
     */
	public findRoot(uri: vscode.Uri): ServHelper {

        const wscfg = vscode.workspace.getConfiguration('launch', uri);
        const cfgs = wscfg?.get<any[]>("configurations");

        if (cfgs) {
            for (let i = 0; i < cfgs.length; i++) {
                console.log(cfgs[i]);
                if (cfgs[i].type === "pwa-chrome") {
                    this.serv.webroot = this.resolvEnv(cfgs[i].webRoot, {workspaceFolder: getWorkspaceFolder(uri)});
                    return this;
                }
            }
        }
        throw new AnprismException("Can't setup webroot. Any pwa-chrome type in launch.json?");
	}

    public resolvEnv(s: string, val: {workspaceFolder: string}): string {
        return s.replace(/\${workspaceFolder}/g, val.workspaceFolder);
    }

    public webrootPath() :string {
        return this.serv.webroot || ".";
    }

    /**Change back the absolute path to relative url (remove the leading absolute path).
	 * @param page
	 * @returns
	 */
	// public url(page: Page): {url: string, sub: string} {
    //     let sub = path.relative(this.webrootPath(), page.html.fsPath);
	// 	const url = `http://${page.host}:${page.port}/${sub}?n=${getNonce()}`;
    //     console.log(url);
    //     return {url, sub};

    //     function getNonce() {
    //         let text = '';
    //         const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    //         for (let i = 0; i < 32; i++) {
    //             text += possible.charAt(Math.floor(Math.random() * possible.length));
    //         }
    //         return text;
    //     }
	// }
	public url(page: Page): {url: string, sub: string} {
        let sub = path.relative(this.webrootPath(), page.html.fsPath);
        let subfile = path.basename(sub, ".html");
		const url = `http://${page.host}:${page.port}/${getNonce()}.html?nonce=${subfile}`;
        console.log(url);
        return {url, sub};

        function getNonce() {
            let text = '';
            const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            for (let i = 0; i < 32; i++) {
                text += possible.charAt(Math.floor(Math.random() * possible.length));
            }
            return text;
        }
	}


    /**
     * Check is the html located in webroot. If yes, change it.
     * If webroot is still not set, update webroot with the workspace launch.json.
     * @param html
     * @throws AnprismException:
     * 1. page not found or not located in webroot
     * 2. no launching configuration for finding webroot
     * @returns
     */
	public checkHtml(html: vscode.Uri): ServHelper {
        if (!this.serv.webroot) {
            this.findRoot(html);
        }
        else {
            // This is safer for Windows
            const relative = path.relative(this.serv.webroot, html.fsPath);
            if (!relative || relative.startsWith('..') || path.isAbsolute(relative))
                throw new AnprismException('page is not located in root folder: ' + html.fsPath);
        }
        return this;
	}

    /**soft update serv info (webroot only updated when more meaningful) */
	public update(serv: Serv | undefined) {
        if (serv?.webroot?.length)
            this.findRoot(vscode.Uri.file(serv.webroot));
	}
}

/**
 * Find workspace root according to resouce uri.
 * @param ofUri
 * @returns
 */
function getWorkspaceFolder(ofUri: vscode.Uri): string {
    const fileName = ofUri.fsPath;
    let ws = vscode.workspace.workspaceFolders;
    if (!ws)
        throw new AnprismException('Why workspaceFolder is null?');

    let wr = ws.map((folder) => folder.uri.fsPath)
        .filter((fsPath) => fileName?.startsWith(fsPath))[0];

    return wr;
}
