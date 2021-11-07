import * as vscode from 'vscode';
import * as cp from "child_process";
import * as path from 'path';
import { pythonCmd } from './lib/platform';
import { Page, ServHelper } from './serv-helper';
import { AnprismException } from './common';

/**
 * Setup Anprism.
 * @param context
 */
export function activate(context: vscode.ExtensionContext) {
	if (!AnPagePanel.log)
		AnPagePanel.log = vscode.window.createOutputChannel("Anprism");
	AnPagePanel.log.appendLine('Starting Anprism ...');

	context.subscriptions.push(
		vscode.commands.registerCommand('anprism.load',
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
				AnPagePanel.load(context, uri);
			})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('anprism.refresh', () => {
			if (AnPagePanel.currentPanel) {
				AnPagePanel.currentPanel.refresh(undefined);
			}
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('anprism.restartServer', () => {
			if (AnPagePanel.currentPanel) {
				AnPagePanel.currentPanel.startup();
			}
			else 
				vscode.window.showInformationMessage('Sorry! Currently sever can only be started when Anprism loading a page!');
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('anprism.shutdownServer', () => {
			// Note: can't shutdown without a panel providing serv info - panel must live longer.
			// This hanppens when user closed Anprism panel and fire shutdown command.
			if (AnPagePanel.currentPanel) {
				AnPagePanel.currentPanel.close();
			}
			else {
				vscode.window.showInformationMessage('Currently Anprism server can only be shutdown via web page view!');
			}
		})
	);

	// why should revive a view without a sever?
	// if (vscode.window.registerWebviewPanelSerializer) {
	// 	// Make sure we register a serializer in activation event
	// 	vscode.window.registerWebviewPanelSerializer(AnPagePanel.viewType, {
	// 		async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: any) {
	// 			console.log(`Got state: ${state}`);
	// 			// Reset the webview options so we use latest uri for `localResourceRoots`.
	// 			webviewPanel.webview.options = getWebviewOpts(context.extensionUri);
	// 			AnPagePanel.revive(context, webviewPanel, undefined);
	// 		}
	// 	});
	// }
}

export function deactivate() {
	if (AnPagePanel.currentPanel)
		AnPagePanel.currentPanel.close();
}

/**
 * Anprism page view.
 * @example
 * load -(create)--[  stop   ]-+ start --+-- load html
 * load -----------[ running ]-|---------|
 * restart ----------close()---+         |
 * refresh --------[ running ]-----------^
 * refresh --------[  stop   ]-- show blank (error) page
 * close ----------[ running ]-- stop ------- dispose panel
 * shutdown -------------------- stop (panel lives longer than server)
 * 
 */
class AnPagePanel {
	static log: vscode.OutputChannel;
	static _extensionUri: vscode.Uri;

	/**
	 * Track the currently panel. Only allow a single panel to exist at a time.
	 */
	public static currentPanel: AnPagePanel | undefined;

	public static readonly viewType = 'anprism';

	private readonly _panel: vscode.WebviewPanel;
	private _disposables: vscode.Disposable[] = [];

	/**
	 * Html page information of which is loaded in this panel.
	 */
	page: Page = {
		port: "8888",
		host: "localhost",
		html: vscode.Uri.file("index.html"),
		style: `background-color: #ccc`,
		reload: false,
		devtool: false
	};

	// @type ServHelper
	serv: ServHelper;

	handleWebviewMessage(message: any): any {
		switch (message.command) {
			case 'devtools-open':
				vscode.commands.executeCommand(
					'workbench.action.webview.openDeveloperTools',

					// not working! Looks like Live Preview also doesn't handling close command.
					// https://github.dev/microsoft/vscode-livepreview
					// BrowserPreview#handleWebviewMessage()
					AnPagePanel.currentPanel?.page.devtool
				);

				AnPagePanel.currentPanel!.page.devtool = !AnPagePanel.currentPanel?.page.devtool;
				return;
		}
	}

	/**
	 * Load a page, in current active column - creat panel if necessary.
	 * @param extensionUri 
	 * @returns 
	 */
	public static async load(context: vscode.ExtensionContext, localhtml: vscode.Uri) {
		let p = AnPagePanel.currentPanel;

		const column = vscode.window.activeTextEditor
			? vscode.window.activeTextEditor.viewColumn
			: undefined;

		// no panel, must be the first tiem, create a new panel.
		if (!p) {
			try {
				const panel = vscode.window.createWebviewPanel(
					AnPagePanel.viewType,
					`Anprism - ${AnPagePanel.filename(localhtml)}`,
					column || vscode.ViewColumn.One,
					{ enableScripts: true }
				);
				panel.webview.options = { enableScripts: true }

				AnPagePanel.log.appendLine("Open page " + AnPagePanel.filename(localhtml));
				p = new AnPagePanel(context, panel, new ServHelper(context).findRoot(localhtml));
			}
			catch (e) {
				if (e instanceof AnprismException) {
					vscode.window.showErrorMessage((e as AnprismException).getMessage());
					return;
				}
			}
		}

		p = p!; // A not neccessarily needed type checking
		AnPagePanel.currentPanel = p;
		p._panel.webview.onDidReceiveMessage(
			(message) => AnPagePanel.currentPanel!.handleWebviewMessage(message)
		);

		if (!p.serv.isStarting()) {
			try {
				await p.startup();
			}
			catch (e) {
				if (e instanceof AnprismException)
					vscode.window.showInformationMessage( (<AnprismException>e).getMessage() || "" );
			}
		}

		// show it.
		try {
			p.refresh(localhtml);
		}
		catch (e) {
			if (e instanceof AnprismException)
				vscode.window.showErrorMessage((e as AnprismException).getMessage());
		}
		p._panel.reveal(column);
	}

	/**
	 * Startup server in possible server root dir.
	 */
	async startup() {
		const cmd = `${pythonCmd('')} ${this.serv.pythonPath()} -b 0.0.0.0 -w ${this.serv.webrootPath()} ${this.page.port} &`;

		this.serv.starting(true);
		AnPagePanel.log.appendLine(cmd);
		vscode.window.showInformationMessage('Starting Anprism server at ' + this.serv.webrootPath());

		new Promise<string>((resolve, reject) => {
			cp.exec(cmd, (err, out) => {
				if (err) {
					this.serv.starting(false);
					AnPagePanel.log.appendLine(err.message);
					vscode.window.showInformationMessage('Starting Anprism server failed. ' + err.message);
					return reject(err);
				}
				// this.serv.starting(false); // test shows only when server stopped can reach here
				AnPagePanel.log.appendLine(out.toString());
				// if (AnPagePanel.currentPanel)
				// 	AnPagePanel.currentPanel!.refresh(undefined);
				return resolve(out);
			});
		});
	}

	/**Can be used only once.
	 * 
	 * @param context 
	 * @param panel 
	 * @param serv 
	 */
	constructor(context: vscode.ExtensionContext, panel: vscode.WebviewPanel, serv: ServHelper) {
		// this.serv = new ServHelper(context);
		this.serv = serv;

		this._panel = panel;
		AnPagePanel._extensionUri = context.extensionUri;

		// Set the webview's initial html content
		// this.loadOnline();

		// Listen for when the panel is disposed
		// This happens when the user closes the panel or when the panel is closed programmatically
		this._panel.onDidDispose(
			() => this.dispose(),
			null, this._disposables);

		// Update the content based on view changes - how to watch webpack results?
		this._panel.onDidChangeViewState(
			e => {
				// Note: don't load every time the other editors changed - irritating when the page needs user actions.
				if (this._panel.visible && this.page.reload) {
					this.page.reload = false;
					this.refresh(undefined);
				}
				else if (!this._panel.visible)
					this.page.reload = true;
			},
			this,
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

	/**Dispose Anprism panel not necessarily shutdown server  - can still debugging with js-debugger.
	 * 
	 * Anserv lives longer than debugger, which is longer than panel.
	 * The only way to shutdown anserv is the shutdown command or quit vscode.
	 */
	public dispose() {

		AnPagePanel.log.appendLine("Closing webserver: " + AnPagePanel.currentPanel?.serv.webrootPath);
		AnPagePanel.currentPanel?.close(); // not working

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

	/**
	 * Load the page, where page info is {@link AnPagePanel.page}.
	private loadOnline() {
		const webview = this._panel.webview;
		this._panel.webview.html = this.getAnclientPage(this.page);
	}
	 */

	refresh(newPage: vscode.Uri | undefined): void {
		this._panel.webview.html = "";
		this.page.html = newPage || this.page.html;
		this.serv.checkHtml(this.page.html);
		this._panel.webview.html = this.getAnclientPage(this.page);
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
		let {url, sub} = this.serv.url(page);
		AnPagePanel.log.appendLine(url);
		return `<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<script type="text/javascript">var vscode = acquireVsCodeApi();</script>
		</head>
		<body>
			<p id="lines-of-code-counter">${sub}
			<input type='button' value='refresh' onclick='console.log("refresh"); document.getElementById("i-anprism").src = document.getElementById("i-anprism").src'
			/>
			<input type='button' value='dev tool'
				onclick='vscode.postMessage({ command: "devtools-open", text: "" });'
			/>
			</p>
			<iframe id='i-anprism' src="${url}" width="100%" height="720px" style="${page.style}" ></iframe>
			<script type="text/javascript">
				console.log("iframe.src", document.getElementById("i-anprism").getAttribute("src"));
			</script>
		</body>
		</html>`;
	}

	close(): void {
		AnPagePanel.log.appendLine('Shuting down: ' + this.serv?.serv.webroot);
		vscode.window.showInformationMessage('Shuting down Anprism server.');

		// this.page.html = '?_shut-down_=True';
		// this.page.html = vscode.Uri.file('?_shut-down_=True');

		const req = `http://${this.page.host}:${this.page.port}?_shut-down_=True`;
		console.log(req);
		this._panel.webview.html = '';

		// FIXME: Not always work. Send message to js?
		this.serv.starting(false);
		this._panel.webview.html = `<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
		</head>
		<body>
			<iframe id="i-anprism" src="${req}" width="100%" height="720px" style="${this.page.style}" ></iframe>
			<script type="text/javascript">
				console.log("iframe.src", document.getElementById("i-anprism").getAttribute("src"));
			</script>
		</body>
		</html>`;
	}

	public static filename(uri: vscode.Uri): string {
		return path.basename(uri.path);
	}

}

