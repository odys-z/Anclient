
import * as vscode from 'vscode';

type Serv = {
    webroot: string,
    port: string
};

class ServHelper {
    serv: Serv;

    constructor(serv: Serv | undefined) {
        this.serv = Object.assign({
            pythonPath: './packages/anserv.py',
            webroot: 'dist',
            starting: false,
            webpackTerm: undefined
        }, serv);
    }

    /**
     * Change webroot
     * @param uri 
     * @returns 
     */
	public webroot(uri: vscode.Uri): ServHelper {

        return this;
	}

    /**
     * Change html page
     * @param uri 
     * @returns 
     */
	public html(uri: vscode.Uri): ServHelper {

        return this;
	}

    public async startup(): Promise<boolean> {
        return false;
    }

    public async shutdown(): Promise<boolean> {
        return false;
    }
}
