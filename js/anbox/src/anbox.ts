import * as vscode from 'vscode';
import * as cp from "child_process";
import { pythonCmd } from './packages/platform';

type Page = {
    port: string,
    host: string,
    html?: string,
};

const page: Page = {port: "8888", host: "localhost", html: "index.html"};

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand('anbox.load', () => {
			AnPagePanel.createOrShow(context.extensionUri);
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('anbox.refresh', () => {
			if (AnPagePanel.currentPanel) {
				AnPagePanel.currentPanel.doRefresh();
			}
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('anbox.startServer', () => {
			const cmd = `${pythonCmd()} anserv.py ${page.port} &`;
            console.log(cmd);
			new Promise<string>((resolve, reject) => {
				cp.exec(cmd, (err, out) => {
					if (err) {
						return reject(err);
					}
					return resolve(out);
				});
			});
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

function getWebviewOptions(extensionUri: vscode.Uri): vscode.WebviewOptions {
	return {
		// Enable javascript in the webview
		enableScripts: true,

		// And restrict the webview to only loading content from our extension's `media` directory.
		localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')]
	};
}

/**
 * Manages cat coding webview panels
 */
class AnPagePanel {
	/**
	 * Track the currently panel. Only allow a single panel to exist at a time.
	 */
	public static currentPanel: AnPagePanel | undefined;

	public static readonly viewType = 'catCoding';

	private readonly _panel: vscode.WebviewPanel;
	private readonly _extensionUri: vscode.Uri;
	private _disposables: vscode.Disposable[] = [];

	private ifrmeBgcolor = '#ccc';
	private page = "";

	public static createOrShow(extensionUri: vscode.Uri) {
		const column = vscode.window.activeTextEditor
			? vscode.window.activeTextEditor.viewColumn
			: undefined;

		// If we already have a panel, show it.
		if (AnPagePanel.currentPanel) {
			AnPagePanel.currentPanel._panel.reveal(column);
			return;
		}

		// Otherwise, create a new panel.
		const panel = vscode.window.createWebviewPanel(
			AnPagePanel.viewType,
			'Cat Coding',
			column || vscode.ViewColumn.One,
			getWebviewOptions(extensionUri),
		);

		AnPagePanel.currentPanel = new CatCodingPanel(panel, extensionUri);
	}

	public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
		AnPagePanel.currentPanel = new AnPagePanel(panel, extensionUri);
	}

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

	doRefresh(): void {
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
			<p id="lines-of-code-counter">Test Page</p>
			<iframe src="${this.url(page)}" width="100%" height="720px" style="background-color: ${this.ifrmeBgcolor}" ></iframe>
		</body>
		</html>`;
	}

    public url(page: Page) {
        return `http://${page.host}:${page.port}/${page.html ? page.html : 'index.html'}`;
    }

}
