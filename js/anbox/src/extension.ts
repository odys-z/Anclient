/* eslint-disable curly */
import * as vscode from 'vscode';
import * as cp from "child_process";
import * as path from 'path';
import { pythonCmd } from './packages/platform';
import * as fs from 'fs';
import { Server } from 'http';

type Page = {
	port: string,
	host: string,

	html: string,

	style: string
};

type Serv = {
	rootpath: string,
	starting: false,
	webpackTerm: undefined
};

interface AnboxException {
	getMessage(): string
};

/**
 * Setup Anbox.
 * @param context
 */
export function activate(context: vscode.ExtensionContext) {
	console.log('Starting Anbox ...');
	context.subscriptions.push(
		vscode.commands.registerCommand('anbox.load',
			/* uri ~ uris[0] ( from explorer menu ):
			 { formatted:'file:///.../target-file',
			   _fsPath:'/home/.../target-file',
			   authority:'', fragment:'', query:''
			   fsPath (get):ƒ fsPath(){return this._fsPath||(this._fsPath=l(this,!1)),this._fsPath},
			   path:'/home/.../target-file',
			   scheme:'file',
			   __proto__:m }
			 */
			(uri, uris) => {
				AnPagePanel.init(context);
				AnPagePanel.currentPanel.load(context.extensionUri, uri);
			})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('anbox.refresh', () => {
			if (AnPagePanel.currentPanel) {
				AnPagePanel.currentPanel.refresh();
			}
		})
	);

	// context.subscriptions.push(
	// 	vscode.commands.registerCommand('anbox.restartServer', () => {
	// 		const cmd = `pwd && ${pythonCmd()} anserv.py ${page.port} &`;
	// 		console.log(cmd);
	// 		new Promise<string>((resolve, reject) => {
	// 			cp.exec(cmd, (err, out) => {
	// 				if (err) {
	// 					return reject(err);
	// 				}
	// 				return resolve(out);
	// 			});
	// 		});
	// 	})
	// );

	context.subscriptions.push(
		vscode.commands.registerCommand('anbox.restartServer', () => {
			if (AnPagePanel.currentPanel) {
				AnPagePanel.currentPanel.startup();
			}
		})
	);

	if (vscode.window.registerWebviewPanelSerializer) {
		// Make sure we register a serializer in activation event
		vscode.window.registerWebviewPanelSerializer(AnPagePanel.viewType, {
			async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: any) {
				console.log(`Got state: ${state}`);
				// Reset the webview options so we use latest uri for `localResourceRoots`.
				webviewPanel.webview.options = getWebviewOptions(context.extensionUri);
				AnPagePanel.revive(webviewPanel, context.extensionUri);
			}
		});
	}
}

/**
 * Set loacal resource root - restrict the webview to only loading content from target project's directory.
 * @param extensionUri e.g. {scheme: 'file', authority: '', path: '/home/ody/anclient/js/anbox', query: '', fragment: '', …}
 * @returns 
 */
function getWebviewOptions(extensionUri: vscode.Uri): vscode.WebviewOptions {
	console.log(extensionUri);

	// FIXME (by UX and Try).
	const dist = vscode.Uri.joinPath(extensionUri, 'dist');
	const out = vscode.Uri.joinPath(extensionUri, 'out');
	const build = vscode.Uri.joinPath(extensionUri, 'build');
	const publc = vscode.Uri.joinPath(extensionUri, 'public');
	const target = vscode.Uri.joinPath(extensionUri, 'target');
	const volume = vscode.Uri.joinPath(extensionUri, 'volume');
	const res = vscode.Uri.joinPath(extensionUri, 'res');

	return {
		enableScripts: true,
		localResourceRoots: [dist, out, build, publc, target, volume, res]
	};
}

/**
 * Anbox page view.
 * @example
 * load -----[  stop   ]-+ start --+-- load html
 * load -----[ running ]-|---------|
 * restart ----close()---+         |
 * refresh --[  stop   ]-^         |
 * refresh --[ running ]-----------^
 * close ----------------- stop
 * 
 */
class AnPagePanel {
	static init(context: vscode.ExtensionContext): void {
		if (AnPagePanel.currentPanel) return;
		const panel = vscode.window.createWebviewPanel(
			AnPagePanel.viewType,
			'Anbox',
			vscode.window.activeTextEditor?.viewColumn || vscode.ViewColumn.One,
			getWebviewOptions(context.extensionUri),
		);

		panel.webview.options = getWebviewOptions(context.extensionUri);
		AnPagePanel.revive(panel, context.extensionUri);
	}
	/**
	 * Track the currently panel. Only allow a single panel to exist at a time.
	 */
	public static currentPanel: AnPagePanel;

	public static readonly viewType = 'anbox';

	private readonly _panel: vscode.WebviewPanel;
	private readonly _extensionUri: vscode.Uri;
	private _disposables: vscode.Disposable[] = [];

	page: Page = {
		port: "8888",
		host: "localhost",
		html: "index.html",
		style: `backgroundColor: '#ccc'`
	};

	serv: Serv = {
		rootpath: '',
		starting: false,
		webpackTerm: undefined
	};

	/**
	 * Deserialize?
	 * @param panel 
	 * @param extensionUri 
	 */
	public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
		AnPagePanel.currentPanel = new AnPagePanel(panel, extensionUri);
	}

	/**
	 * Load a page, in current active column.
	 * @param extensionUri 
	 * @returns 
	 */
	public async load(extensionUri: vscode.Uri, localhtml: vscode.Uri) {
		let serv = this.getServ(localhtml);
		if (!serv.starting) {
			try {
				await AnPagePanel.currentPanel.startup();
			}
			catch (e) {
				vscode.window.showInformationMessage( (<AnboxException>e).getMessage() );
			}
		}

		const column = vscode.window.activeTextEditor
			? vscode.window.activeTextEditor.viewColumn
			: undefined;

		// no panel, must be the first tiem, create a new panel.
		if (!AnPagePanel.currentPanel) {
			const panel = vscode.window.createWebviewPanel(
				AnPagePanel.viewType,
				`Anbox - ${AnPagePanel.filename(localhtml)}`,
				column || vscode.ViewColumn.One,
				getWebviewOptions(extensionUri),
			);

			AnPagePanel.currentPanel = new AnPagePanel(panel, extensionUri);
		}

		// If we already have a panel, show it.
		if (AnPagePanel.currentPanel) {
			this.refresh();
			AnPagePanel.currentPanel._panel.reveal(column);
			return;
		}
	}

	/**
	 * Find root of localhtml, return the serv instance. 
	 * @param html current html page uri
	 */
	getServ(html: vscode.Uri): Serv {
		throw new Error('Method not implemented.');
	}

	/**
	 * Startup server in possible server root dir.
	 */
	async startup() {
		for (let d in this._panel.webview.options.localResourceRoots) {
			if (fs.existsSync(d)) {
				this.serv.rootpath = d; 
				break;
			}
		};

		const cmd = `cd ${this.serv.rootpath} && ${pythonCmd()} anserv.py ${this.page.port} &`;
		console.log(cmd);
		new Promise<string>((resolve, reject) => {
			cp.exec(cmd, (err, out) => {
				if (err) {
					return reject(err);
				}
				return resolve(out);
			});
		});
	}

	// public static createOrShow(extensionUri: vscode.Uri, localhtml: vscode.Uri) {
	// 	const column = vscode.window.activeTextEditor
	// 		? vscode.window.activeTextEditor.viewColumn
	// 		: undefined;

	// 	// If we already have a panel, show it.
	// 	if (AnPagePanel.currentPanel) {
	// 		AnPagePanel.currentPanel._panel.reveal(column);
	// 		return;
	// 	}

	// 	// Otherwise, create a new panel.
	// 	const panel = vscode.window.createWebviewPanel(
	// 		AnPagePanel.viewType,
	// 		'Anbox',
	// 		column || vscode.ViewColumn.One,
	// 		getWebviewOptions(extensionUri),
	// 	);

	// 	AnPagePanel.currentPanel = new AnPagePanel(panel, extensionUri);
	// }


	private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
		this._panel = panel;
		this._extensionUri = extensionUri;

		// Set the webview's initial html content
		this.loadOnline(page);

		// Listen for when the panel is disposed
		// This happens when the user closes the panel or when the panel is closed programmatically
		this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

		// Update the content based on view changes
		this._panel.onDidChangeViewState(
			e => {
				if (this._panel.visible) {
					this.doRefresh();
				}
			},
			null,
			this._disposables
		);

		// Handle messages from the webview
		this._panel.webview.onDidReceiveMessage(
			message => {
				switch (message.command) {
					case 'alert':
						vscode.window.showErrorMessage(message.text);
						return;
				}
			},
			null,
			this._disposables
		);
	}

	public doRefactor() {
		// Send a message to the webview webview.
		// You can send any JSON serializable data.
		this._panel.webview.postMessage({ command: 'refactor' });
	}

	public dispose() {
		AnPagePanel.currentPanel = undefined;

		// Clean up our resources
		this._panel.dispose();

		while (this._disposables.length) {
			const x = this._disposables.pop();
			if (x) {
				x.dispose();
			}
		}
	}

	private loadOnline(page: Page) {
		const webview = this._panel.webview;
		this._panel.webview.html = this.getAnclientPage(page);
	}

	refresh(): void {
		this._panel.webview.html = "";
		this._panel.webview.html = this.getAnclientPage(page);
	}

	/**
	 * Load target page in iframe. See
	 * vscode issue #70339:
	 * https://github.com/microsoft/vscode/issues/70339
	 * @param webview 
	 * @param page 
	 * @returns 
	 */
	getAnclientPage(page: Page): string {
		return `<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
		</head>
		<body>
			<p id="lines-of-code-counter">${page.html}</p>
			<iframe src="${this.url(page)}" width="100%" height="720px" style="${page.style}" ></iframe>
		</body>
		</html>`;
	}

	public static url(page: Page): string {
		return `http://${page.host}:${page.port}/${page.html}`;
	}

	public static filename(uri: vscode.Uri): string {
		return path.basename(uri.path);
	}


}
