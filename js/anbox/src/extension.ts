/* eslint-disable curly */
import * as vscode from 'vscode';
import * as cp from "child_process";
import * as path from 'path';
import { pythonCmd } from './lib/platform';

type Page = {
	port: string,
	host: string,

	html: string,

	style: string
};

type Serv = {
	/**TODO: Only used when system python command not in path environment. */
	pythonPath: string,
	webroot: string,
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
				AnPagePanel.init(context, uri)
					.load(context.extensionUri, uri);
			})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('anbox.refresh', () => {
			if (AnPagePanel.currentPanel) {
				AnPagePanel.currentPanel.refresh();
			}
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('anbox.restartServer', () => {
			if (AnPagePanel.currentPanel) {
				AnPagePanel.currentPanel.startup();
			}
			else 
				vscode.window.showInformationMessage('Sever only started when Anbox is loaded!');
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('anbox.shutdownServer', () => {
			if (AnPagePanel.currentPanel) {
				AnPagePanel.currentPanel.close();
			}
		})
	);

	if (vscode.window.registerWebviewPanelSerializer) {
		// Make sure we register a serializer in activation event
		vscode.window.registerWebviewPanelSerializer(AnPagePanel.viewType, {
			async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: any) {
				console.log(`Got state: ${state}`);
				// Reset the webview options so we use latest uri for `localResourceRoots`.
				webviewPanel.webview.options = getWebviewOpts(context.extensionUri);
				AnPagePanel.revive(webviewPanel, undefined, context.extensionUri);
			}
		});
	}
}

export function deactivate() {
	if (AnPagePanel.currentPanel)
		AnPagePanel.currentPanel.close();
}

/**
 * Set loacal resource root - restrict the webview to only loading content from target project's directory.
 * @param extensionUri e.g. {scheme: 'file', authority: '', path: '/home/ody/anclient/js/anbox', query: '', fragment: '', …}
 * @returns 
 */
function getWebviewOpts(extensionUri: vscode.Uri): vscode.WebviewOptions {
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
	/**
	 * Track the currently panel. Only allow a single panel to exist at a time.
	 */
	public static currentPanel: AnPagePanel | undefined;

	public static readonly viewType = 'anbox';

	private readonly _panel: vscode.WebviewPanel;
	private readonly _extensionUri: vscode.Uri;
	private _disposables: vscode.Disposable[] = [];

	/**
	 * Html page information of which is loaded in this panel.
	 */
	page: Page = {
		port: "8888",
		host: "localhost",
		html: "index.html",
		style: `background-color: #ccc`
	};

	serv: Serv;

	static init(context: vscode.ExtensionContext, htmlItem: vscode.Uri): AnPagePanel {
		if (AnPagePanel.currentPanel)
			return AnPagePanel.currentPanel;

		function getDocumentWorkspaceFolder(): string {
			// 1. find workspace root
			// const fileName = vscode.window.activeTextEditor?.document.fileName;
			const fileName = htmlItem.fsPath;
			let ws = vscode.workspace.workspaceFolders;
			if (!ws)
				throw Error('Why workspaceFolder is null?');

			// 2. guess the output folder
			let outdirs = ['dist', 'out', 'build', 'publc', 'target', 'volume', 'res'];

			let wr = ws.map((folder) => folder.uri.fsPath)
				.filter((fsPath) => fileName?.startsWith(fsPath))[0];
			
			// e.g. .../anclient/js/test/less/dist;
			wr = outdirs.filter((root) => fileName?.startsWith(path.join(wr, root)))
						.map(root => path.join(wr, root))[0];
			console.log('webroot:', wr);
			return wr;
		}

		let serv :Serv = {
					pythonPath: context.asAbsolutePath(path.join('packages', 'anserv.py')),
					webroot: getDocumentWorkspaceFolder(),
					starting: false,
					webpackTerm: undefined };

		const panel = vscode.window.createWebviewPanel(
			AnPagePanel.viewType,
			'Anbox',
			vscode.window.activeTextEditor?.viewColumn || vscode.ViewColumn.One,
		);

		panel.webview.options = getWebviewOpts(context.extensionUri);
		return AnPagePanel.revive(panel, serv, context.extensionUri);
	}

	/**
	 * Deserialize
	 * @param panel 
	 * @param serv 
	 * @param extensionUri 
	 * @returns current panel
	 */
	public static revive(panel: vscode.WebviewPanel, serv: Serv | undefined, extensionUri: vscode.Uri) {
		AnPagePanel.currentPanel = new AnPagePanel(panel, serv, extensionUri);
		return AnPagePanel.currentPanel;
	}

	/**
	 * Load a page, in current active column.
	 * @param extensionUri 
	 * @returns 
	 */
	public async load(extensionUri: vscode.Uri, localhtml: vscode.Uri) {
		let serv = this.getServ();
		if (!serv.starting) {
			try {
				await AnPagePanel.currentPanel!.startup();
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
				getWebviewOpts(extensionUri),
			);

			AnPagePanel.currentPanel = new AnPagePanel(panel, serv, extensionUri);
		}

		// show it.
		this.refresh();
		AnPagePanel.currentPanel._panel.reveal(column);
	}

	/**
	 * Update some option of the serv info.
	 * @param opt options to update
	 */
	getServ(opt = {}): Serv {
		Object.assign(this.serv, opt);
		return this.serv;
	}

	/**
	 * Find root of localhtml, return the serv instance. 
	 * @param html 
	 */
	setPage(html: string) {
		this.page.html = html;
	}

	/**
	 * Startup server in possible server root dir.
	 */
	async startup() {
		const cmd = `${pythonCmd('')} ${this.serv.pythonPath} -b 0.0.0.0 -w ${this.serv.webroot} ${this.page.port} &`;
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

	private constructor(panel: vscode.WebviewPanel, serv: Serv | undefined, extensionUri: vscode.Uri) {
		this._panel = panel;
		this.serv = serv || {
			pythonPath: '',
			webroot: '',
			starting: false,
			webpackTerm: undefined
		};
		this._extensionUri = extensionUri;

		// Set the webview's initial html content
		this.loadOnline();

		// Listen for when the panel is disposed
		// This happens when the user closes the panel or when the panel is closed programmatically
		this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

		// Update the content based on view changes
		this._panel.onDidChangeViewState(
			e => {
				if (this._panel.visible) {
					this.refresh();
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

	/**
	 * Load the page, where page info is {@link AnPagePanel.page}.
	 */
	private loadOnline() {
		const webview = this._panel.webview;
		this._panel.webview.html = this.getAnclientPage(this.page);
	}

	refresh(): void {
		this._panel.webview.html = "";
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
		return `<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
		</head>
		<body>
			<p id="lines-of-code-counter">${page.html}
			<input type='button' value='refresh' onclick='console.log("xxx");
				document.getElementById("i-anbox").src = document.getElementById("i-anbox").src
			'
			/>
			</p>
			<iframe id='i-anbox' src="${AnPagePanel.url(page)}" width="100%" height="720px" style="${page.style}" ></iframe>
		</body>
		</html>`;
	}

	close(): void {
		this.page.html = '?_shut-down_=True';
		let req = AnPagePanel.url(this.page);
		console.log(req);
		this._panel.webview.html = `<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
		</head>
		<body>
			<iframe src="${req}" width="100%" height="720px" style="${this.page.style}" ></iframe>
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
