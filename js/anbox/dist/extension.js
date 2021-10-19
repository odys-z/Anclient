/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

module.exports = require("vscode");

/***/ }),
/* 2 */
/***/ ((module) => {

module.exports = require("child_process");

/***/ }),
/* 3 */
/***/ ((module) => {

module.exports = require("path");

/***/ }),
/* 4 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


/* eslint-disable no-empty */
// https://github.dev/microsoft/vscode/tree/main/src/vs/base/common
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.pythonCmd = exports.isLittleEndian = exports.OS = exports.translationsConfigFile = exports.locale = exports.language = exports.userAgent = exports.platform = exports.isIOS = exports.isWeb = exports.isNative = exports.isLinuxSnap = exports.isLinux = exports.isMacintosh = exports.isWindows = exports.platformToString = exports.isElectronSandboxed = exports.globals = void 0;
const path = __webpack_require__(3);
const LANGUAGE_DEFAULT = 'en';
let _isWindows = false;
let _isMacintosh = false;
let _isLinux = false;
let _isLinuxSnap = false;
let _isNative = false;
let _isWeb = false;
let _isIOS = false;
let _locale = undefined;
let _language = LANGUAGE_DEFAULT;
let _translationsConfigFile = undefined;
let _userAgent = undefined;
exports.globals = (typeof self === 'object' ? self : typeof global === 'object' ? global : {});
let nodeProcess = undefined;
if (typeof exports.globals.vscode !== 'undefined' && typeof exports.globals.vscode.process !== 'undefined') {
    // Native environment (sandboxed)
    nodeProcess = exports.globals.vscode.process;
}
else if (typeof process !== 'undefined') {
    // Native environment (non-sandboxed)
    nodeProcess = process;
}
const isElectronRenderer = typeof nodeProcess?.versions?.electron === 'string' && nodeProcess.type === 'renderer';
exports.isElectronSandboxed = isElectronRenderer && nodeProcess?.sandboxed;
// Web environment
if (typeof navigator === 'object' && !isElectronRenderer) {
    _userAgent = navigator.userAgent;
    _isWindows = _userAgent.indexOf('Windows') >= 0;
    _isMacintosh = _userAgent.indexOf('Macintosh') >= 0;
    _isIOS = (_userAgent.indexOf('Macintosh') >= 0 || _userAgent.indexOf('iPad') >= 0 || _userAgent.indexOf('iPhone') >= 0) && !!navigator.maxTouchPoints && navigator.maxTouchPoints > 0;
    _isLinux = _userAgent.indexOf('Linux') >= 0;
    _isWeb = true;
    _locale = navigator.language;
    _language = _locale;
}
// Native environment
else if (typeof nodeProcess === 'object') {
    _isWindows = (nodeProcess.platform === 'win32');
    _isMacintosh = (nodeProcess.platform === 'darwin');
    _isLinux = (nodeProcess.platform === 'linux');
    _isLinuxSnap = _isLinux && !!nodeProcess.env['SNAP'] && !!nodeProcess.env['SNAP_REVISION'];
    _locale = LANGUAGE_DEFAULT;
    _language = LANGUAGE_DEFAULT;
    const rawNlsConfig = nodeProcess.env['VSCODE_NLS_CONFIG'];
    if (rawNlsConfig) {
        try {
            const nlsConfig = JSON.parse(rawNlsConfig);
            const resolved = nlsConfig.availableLanguages['*'];
            _locale = nlsConfig.locale;
            // VSCode's default language is 'en'
            _language = resolved ? resolved : LANGUAGE_DEFAULT;
            _translationsConfigFile = nlsConfig._translationsConfigFile;
        }
        catch (e) {
        }
    }
    _isNative = true;
}
// Unknown environment
else {
    console.error('Unable to resolve platform.');
}
function platformToString(platform) {
    switch (platform) {
        case 0 /* Web */: return 'Web';
        case 1 /* Mac */: return 'Mac';
        case 2 /* Linux */: return 'Linux';
        case 3 /* Windows */: return 'Windows';
    }
}
exports.platformToString = platformToString;
let _platform = 0 /* Web */;
if (_isMacintosh) {
    _platform = 1 /* Mac */;
}
else if (_isWindows) {
    _platform = 3 /* Windows */;
}
else if (_isLinux) {
    _platform = 2 /* Linux */;
}
exports.isWindows = _isWindows;
exports.isMacintosh = _isMacintosh;
exports.isLinux = _isLinux;
exports.isLinuxSnap = _isLinuxSnap;
exports.isNative = _isNative;
exports.isWeb = _isWeb;
exports.isIOS = _isIOS;
exports.platform = _platform;
exports.userAgent = _userAgent;
/**
 * The language used for the user interface. The format of
 * the string is all lower case (e.g. zh-tw for Traditional
 * Chinese)
 */
exports.language = _language;
// export namespace Language {
// 	export function value(): string {
// 		return language;
// 	}
// 	export function isDefaultVariant(): boolean {
// 		if (language.length === 2) {
// 			return language === 'en';
// 		} else if (language.length >= 3) {
// 			return language[0] === 'e' && language[1] === 'n' && language[2] === '-';
// 		} else {
// 			return false;
// 		}
// 	}
// 	export function isDefault(): boolean {
// 		return language === 'en';
// 	}
// }
/**
 * The OS locale or the locale specified by --locale. The format of
 * the string is all lower case (e.g. zh-tw for Traditional
 * Chinese). The UI is not necessarily shown in the provided locale.
 */
exports.locale = _locale;
/**
 * The translations that are available through language packs.
 */
exports.translationsConfigFile = _translationsConfigFile;
exports.OS = (_isMacintosh || _isIOS ? 2 /* Macintosh */ : (_isWindows ? 1 /* Windows */ : 3 /* Linux */));
let _isLittleEndian = true;
let _isLittleEndianComputed = false;
function isLittleEndian() {
    if (!_isLittleEndianComputed) {
        _isLittleEndianComputed = true;
        const test = new Uint8Array(2);
        test[0] = 1;
        test[1] = 2;
        const view = new Uint16Array(test.buffer);
        _isLittleEndian = (view[0] === (2 << 8) + 1);
    }
    return _isLittleEndian;
}
exports.isLittleEndian = isLittleEndian;
/**
 *
 * @param pypath user know the path without knowing os and python command?
 * @returns fullpath command without PATH evironment involved
 */
function pythonCmd(pypath) {
    let python = 'python3';
    switch (exports.OS) {
        case 1 /* Windows */:
            python = 'py';
    }
    return path.join(pypath, python);
}
exports.pythonCmd = pythonCmd;


/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.deactivate = exports.activate = void 0;
/* eslint-disable curly */
const vscode = __webpack_require__(1);
const cp = __webpack_require__(2);
const path = __webpack_require__(3);
const platform_1 = __webpack_require__(4);
;
/**
 * Setup Anbox.
 * @param context
 */
function activate(context) {
    if (!AnPagePanel.log)
        AnPagePanel.log = vscode.window.createOutputChannel("Anbox");
    AnPagePanel.log.appendLine('Starting Anbox ...');
    context.subscriptions.push(vscode.commands.registerCommand('anbox.load', 
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
        AnPagePanel.init(context, uri);
        AnPagePanel.currentPanel?.load(context.extensionUri, uri);
    }));
    context.subscriptions.push(vscode.commands.registerCommand('anbox.refresh', () => {
        if (AnPagePanel.currentPanel) {
            AnPagePanel.currentPanel.refresh();
        }
    }));
    context.subscriptions.push(vscode.commands.registerCommand('anbox.restartServer', () => {
        if (AnPagePanel.currentPanel) {
            AnPagePanel.currentPanel.startup();
        }
        else
            vscode.window.showInformationMessage('Sever only started when Anbox is loaded!');
    }));
    context.subscriptions.push(vscode.commands.registerCommand('anbox.shutdownServer', () => {
        if (AnPagePanel.currentPanel) {
            AnPagePanel.currentPanel.serv.starting = false;
            AnPagePanel.currentPanel.close();
        }
    }));
    if (vscode.window.registerWebviewPanelSerializer) {
        // Make sure we register a serializer in activation event
        vscode.window.registerWebviewPanelSerializer(AnPagePanel.viewType, {
            async deserializeWebviewPanel(webviewPanel, state) {
                console.log(`Got state: ${state}`);
                // Reset the webview options so we use latest uri for `localResourceRoots`.
                webviewPanel.webview.options = getWebviewOpts(context.extensionUri);
                AnPagePanel.revive(webviewPanel, undefined, context.extensionUri);
            }
        });
    }
}
exports.activate = activate;
function deactivate() {
    if (AnPagePanel.currentPanel)
        AnPagePanel.currentPanel.close();
}
exports.deactivate = deactivate;
/**
 * Set loacal resource root - restrict the webview to only loading content from target project's directory.
 * @param extensionUri e.g. {scheme: 'file', authority: '', path: '/home/ody/anclient/js/anbox', query: '', fragment: '', …}
 * @returns
 */
function getWebviewOpts(extensionUri) {
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
    constructor(panel, serv, extensionUri) {
        this._disposables = [];
        /**
         * Html page information of which is loaded in this panel.
         */
        this.page = {
            port: "8888",
            host: "localhost",
            html: "index.html",
            style: `background-color: #ccc`
        };
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
        this._panel.onDidChangeViewState(e => {
            if (this._panel.visible) {
                this.refresh();
            }
        }, null, this._disposables);
        // Handle messages from the webview
        this._panel.webview.onDidReceiveMessage(message => {
            switch (message.command) {
                case 'alert':
                    vscode.window.showErrorMessage(message.text);
                    return;
            }
        }, null, this._disposables);
    }
    static init(context, htmlItem) {
        if (AnPagePanel.currentPanel)
            return AnPagePanel.currentPanel;
        // function getDocumentWorkspaceFolder(html: vscode.Uri): string {
        // 	// 1. find workspace root
        // 	const fileName = html.fsPath;
        // 	let ws = vscode.workspace.workspaceFolders;
        // 	if (!ws)
        // 		throw Error('Why workspaceFolder is null?');
        // 	// 2. guess the output folder
        // 	let outdirs = ['dist', 'out', 'build', 'publc', 'target', 'volume', 'res'];
        // 	let wr = ws.map((folder) => folder.uri.fsPath)
        // 		.filter((fsPath) => fileName?.startsWith(fsPath))[0];
        // 	// e.g. .../anclient/js/test/less/dist;
        // 	wr = outdirs.filter((root) => fileName?.startsWith(path.join(wr, root)))
        // 				.map(root => path.join(wr, root))[0];
        // 	console.log('webroot:', wr);
        // 	return wr;
        // }
        if (!htmlItem) { // not actived from explorer, try current active doc
            let f = vscode.window.activeTextEditor?.document.uri;
            if (f?.fsPath && new Set([".html", ".htm"]).has(path.extname(f?.fsPath)))
                htmlItem = vscode.window.activeTextEditor?.document.uri;
        }
        if (!htmlItem) {
            vscode.window.showInformationMessage('Anbox don\'t know which html page to load!');
            return undefined;
        }
        else {
            let serv = {
                pythonPath: context.asAbsolutePath(path.join('packages', 'anserv.py')),
                webroot: this.getWorkspaceWebFolder(htmlItem),
                starting: false,
                webpackTerm: undefined
            };
            AnPagePanel.log.appendLine('Loading ' + serv.webroot);
            const panel = vscode.window.createWebviewPanel(AnPagePanel.viewType, 'Anbox', vscode.window.activeTextEditor?.viewColumn || vscode.ViewColumn.One);
            panel.webview.options = getWebviewOpts(context.extensionUri);
            return AnPagePanel.revive(panel, serv, context.extensionUri);
        }
    }
    /**
     * Deserialize
     * @param panel
     * @param serv
     * @param extensionUri
     * @returns current panel
     */
    static revive(panel, serv, extensionUri) {
        AnPagePanel.log.appendLine("Anbox webview revived.");
        AnPagePanel.currentPanel = new AnPagePanel(panel, serv, extensionUri);
        AnPagePanel.currentPanel.serv = serv;
        return AnPagePanel.currentPanel;
    }
    /**
     * Load a page, in current active column.
     * @param extensionUri
     * @returns
     */
    async load(extensionUri, localhtml) {
        let serv = this.getServ(localhtml);
        if (!serv.webroot) {
            vscode.window.showErrorMessage('No html page found.');
            AnPagePanel.log.appendLine('No html page found.');
            return;
        }
        if (!serv.starting) {
            try {
                await AnPagePanel.currentPanel.startup();
            }
            catch (e) {
                vscode.window.showInformationMessage(e.getMessage());
            }
        }
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;
        // no panel, must be the first tiem, create a new panel.
        if (!AnPagePanel.currentPanel) {
            const panel = vscode.window.createWebviewPanel(AnPagePanel.viewType, `Anbox - ${AnPagePanel.filename(localhtml)}`, column || vscode.ViewColumn.One, getWebviewOpts(extensionUri));
            AnPagePanel.log.append("Open page " + AnPagePanel.filename(localhtml));
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
    getServ(page) {
        if (page)
            this.serv.webroot = AnPagePanel.getWorkspaceWebFolder(page);
        return this.serv;
    }
    /**
     * Find root of localhtml, return the serv instance.
     * @param html
     */
    setPage(html) {
        this.page.html = html;
    }
    /**
     * Startup server in possible server root dir.
     */
    async startup() {
        const cmd = `${(0, platform_1.pythonCmd)('')} ${this.serv.pythonPath} -b 0.0.0.0 -w ${this.serv.webroot} ${this.page.port} &`;
        this.serv.starting = true;
        AnPagePanel.log.appendLine(cmd);
        vscode.window.showInformationMessage('Starting Anbox server at ' + this.serv.webroot);
        new Promise((resolve, reject) => {
            cp.exec(cmd, (err, out) => {
                if (err) {
                    this.serv.starting = false;
                    AnPagePanel.log.appendLine(err.message);
                    vscode.window.showInformationMessage('Starting Anbox server failed. ' + err.message);
                    return reject(err);
                }
                this.serv.starting = false; // test shows only server stopped can reach here
                AnPagePanel.log.appendLine(out.toString());
                return resolve(out);
            });
        });
    }
    dispose() {
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
    loadOnline() {
        const webview = this._panel.webview;
        this._panel.webview.html = this.getAnclientPage(this.page);
    }
    refresh() {
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
    getAnclientPage(page) {
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
    close() {
        AnPagePanel.log.appendLine('Shuting down: ' + this.page.html);
        vscode.window.showInformationMessage('Shuting down Anbox server. ' + this.page.html);
        this.page.html = '?_shut-down_=True';
        let req = AnPagePanel.url(this.page);
        console.log(req);
        this._panel.webview.html = '';
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
    static url(page) {
        return `http://${page.host}:${page.port}/${page.html}`;
    }
    static filename(uri) {
        return path.basename(uri.path);
    }
    static getWorkspaceWebFolder(html) {
        // 1. find workspace root
        const fileName = html.fsPath;
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
}
AnPagePanel.viewType = 'anbox';

})();

module.exports = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=extension.js.map