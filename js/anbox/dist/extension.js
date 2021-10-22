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


/***/ }),
/* 5 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ServHelper = void 0;
const path = __webpack_require__(3);
const vscode = __webpack_require__(1);
const common_1 = __webpack_require__(6);
class ServHelper {
    constructor(context, serv) {
        this.serv = Object.assign({
            pythonPath: context.asAbsolutePath(path.join('packages', 'anserv.py')),
            starting: false,
            webpackTerm: undefined
        }, serv);
        this.context = context;
    }
    isStarting() {
        return this.serv.starting;
    }
    starting(starting) {
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
    webroot(uri) {
        const wscfg = vscode.workspace.getConfiguration('launch', uri);
        const cfgs = wscfg?.get("configurations");
        if (cfgs) {
            for (let i = 0; i < cfgs.length; i++) {
                console.log(cfgs[i]);
                if (cfgs[i].type === "pwa-chrome") {
                    this.serv.webroot = this.resolvEnv(cfgs[i].webRoot, { workspaceFolder: getWorkspaceFolder(uri) });
                    break;
                }
            }
        }
        ;
        return this;
    }
    resolvEnv(s, val) {
        return s.replace(/\${workspaceFolder}/g, val.workspaceFolder);
    }
    webrootPath() {
        return this.serv.webroot || ".";
    }
    /**Change back the absolute path to relative url (remove the leading absolute path).
     * @param page
     * @returns
     */
    url(page) {
        let sub = path.relative(this.webrootPath(), page.html.fsPath);
        // let path = page.html.fsPath.replaceAll(this.serv.webroot, '');
        return `http://${page.host}:${page.port}/${sub}`;
    }
    /**
     * Check is the html located in webroot. If yes, change it.
     * If webroot is still not set, update webroot with the workspace launch.json.
     * @param html
     * @throws AnboxException: page not found or not located in webroot
     * @returns
     */
    checkHtml(html) {
        if (!this.serv.webroot) {
            this.webroot(html);
        }
        else {
            const fullpath = html.fsPath;
            if (!fullpath?.startsWith(this.serv.webroot))
                throw new common_1.AnboxException('page is not located in root folder: ' + html.fsPath);
        }
        return this;
    }
}
exports.ServHelper = ServHelper;
/**
 * Find workspace root according to resouce uri.
 * @param ofUri
 * @returns
 */
function getWorkspaceFolder(ofUri) {
    const fileName = ofUri.fsPath;
    let ws = vscode.workspace.workspaceFolders;
    if (!ws)
        throw new common_1.AnboxException('Why workspaceFolder is null?');
    let wr = ws.map((folder) => folder.uri.fsPath)
        .filter((fsPath) => fileName?.startsWith(fsPath))[0];
    return wr;
}


/***/ }),
/* 6 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AnboxException = void 0;
class AnboxException extends Error {
    constructor(message) {
        super(message);
        this.name = 'AnboxException';
    }
    getMessage() {
        return this.message || this.name;
    }
}
exports.AnboxException = AnboxException;
;


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
const vscode = __webpack_require__(1);
const cp = __webpack_require__(2);
const path = __webpack_require__(3);
const platform_1 = __webpack_require__(4);
const serv_helper_1 = __webpack_require__(5);
const common_1 = __webpack_require__(6);
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
        AnPagePanel.currentPanel?.load(context, uri);
    }));
    context.subscriptions.push(vscode.commands.registerCommand('anbox.refresh', () => {
        if (AnPagePanel.currentPanel) {
            AnPagePanel.currentPanel.refresh(undefined);
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
        // FIXME bug: can't shutdown without a panel providing serv info.
        // This hanppens when user closed Anbox panel and fire shutdown comand.
        if (AnPagePanel.currentPanel) {
            AnPagePanel.currentPanel.serv.starting(false);
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
                AnPagePanel.revive(context, webviewPanel, undefined);
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
 * @deprecated
 * @param extensionUri
 * @returns
 */
function getWebviewOpts(extensionUri) {
    return {
        enableScripts: true,
    };
}
/**FIXME
 * Anbox page view.
 * @example
 * load -----[  stop   ]-+ start --+-- load html
 * load -----[ running ]-|---------|
 * restart ----close()---+         |
 * refresh --[  stop   ]-^         |
 * refresh --[ running ]-----------^
 * FIXME
 * close ----[ running ]-- handle orphan serv to extension
 * shutdown -------------- stop
 *
 */
class AnPagePanel {
    constructor(context, panel, serv) {
        this._disposables = [];
        /**
         * Html page information of which is loaded in this panel.
         */
        this.page = {
            port: "8888",
            host: "localhost",
            html: vscode.Uri.file("index.html"),
            style: `background-color: #ccc`
        };
        // this.serv = new ServHelper(context);
        this.serv = serv;
        this._panel = panel;
        this._extensionUri = context.extensionUri;
        // Set the webview's initial html content
        this.loadOnline();
        // Listen for when the panel is disposed
        // This happens when the user closes the panel or when the panel is closed programmatically
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        // Update the content based on view changes
        this._panel.onDidChangeViewState(e => {
            if (this._panel.visible) {
                this.refresh(undefined);
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
            let serv = new serv_helper_1.ServHelper(context).checkHtml(htmlItem);
            AnPagePanel.log.appendLine('web root: ' + serv.webrootPath());
            const panel = vscode.window.createWebviewPanel(AnPagePanel.viewType, 'Anbox', vscode.window.activeTextEditor?.viewColumn || vscode.ViewColumn.One, { retainContextWhenHidden: false });
            panel.webview.options = getWebviewOpts(context.extensionUri);
            return AnPagePanel.revive(context, panel, serv);
        }
    }
    /**
     * Deserialize
     * @param panel
     * @param extensionUri
     * @param serv
     * @returns current panel
     */
    static revive(context, panel, serv) {
        serv = serv || new serv_helper_1.ServHelper(context);
        const p = new AnPagePanel(context, panel, serv);
        p._panel.webview.onDidReceiveMessage((message) => p.handleWebviewMessage(message));
        AnPagePanel.currentPanel = p;
        AnPagePanel.log.appendLine("Anbox webview revived.");
        return AnPagePanel.currentPanel;
    }
    handleWebviewMessage(message) {
        switch (message.command) {
            case 'devtools-open':
                vscode.commands.executeCommand('workbench.action.webview.openDeveloperTools');
                return;
        }
    }
    /**
     * Load a page, in current active column.
     * @param extensionUri
     * @returns
     */
    async load(context, localhtml) {
        if (!this.serv.isStarting()) {
            try {
                await AnPagePanel.currentPanel.startup();
            }
            catch (e) {
                vscode.window.showInformationMessage(e.getMessage() || "");
            }
        }
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;
        // no panel, must be the first tiem, create a new panel.
        if (!AnPagePanel.currentPanel) {
            const panel = vscode.window.createWebviewPanel(AnPagePanel.viewType, `Anbox - ${AnPagePanel.filename(localhtml)}`, column || vscode.ViewColumn.One);
            AnPagePanel.log.append("Open page " + AnPagePanel.filename(localhtml));
            AnPagePanel.currentPanel = new AnPagePanel(context, panel, this.serv);
        }
        // show it.
        try {
            this.refresh(localhtml);
        }
        catch (e) {
            if (e instanceof common_1.AnboxException)
                vscode.window.showErrorMessage(e.getMessage());
        }
        AnPagePanel.currentPanel._panel.reveal(column);
    }
    /**
     * Find root of localhtml, return the serv instance.
     * @param html
    setPage(html: string) {
        this.page.html = vscode.Uri.file(html);
    }
     */
    /**
     * Startup server in possible server root dir.
     */
    async startup() {
        const cmd = `${(0, platform_1.pythonCmd)('')} ${this.serv.pythonPath()} -b 0.0.0.0 -w ${this.serv.webrootPath()} ${this.page.port} &`;
        this.serv.starting(true);
        AnPagePanel.log.appendLine(cmd);
        vscode.window.showInformationMessage('Starting Anbox server at ' + this.serv.webrootPath());
        new Promise((resolve, reject) => {
            cp.exec(cmd, (err, out) => {
                if (err) {
                    this.serv.starting(false);
                    AnPagePanel.log.appendLine(err.message);
                    vscode.window.showInformationMessage('Starting Anbox server failed. ' + err.message);
                    return reject(err);
                }
                this.serv.starting(false); // test shows only server stopped can reach here
                AnPagePanel.log.appendLine(out.toString());
                return resolve(out);
            });
        });
    }
    /**Dispose Anbox panel not necessarily shutdown server  - can still debugging with js-debugger.
     *
     * Anserv lives longer than debugger, which is longer than panel.
     * The only way to shutdown anserv is the shutdown command or quit vscode.
     */
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
    refresh(newPage) {
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
    getAnclientPage(page) {
        let url = this.serv.url(page);
        return `<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<script type="text/javascript">var vscode = acquireVsCodeApi();</script
		</head>
		<body>
			<p id="lines-of-code-counter">${url}
			<input type='button' value='refresh' onclick='console.log("refresh"); document.getElementById("i-anbox").src = document.getElementById("i-anbox").src'
			/>
			<input type='button' value='dev tool'
				onclick='vscode.postMessage({ command: "devtools-open", text: "" });'
			/>
			</p>
			<iframe id='i-anbox' src="${url}" width="100%" height="720px" style="${page.style}" ></iframe>
		</body>
		</html>`;
    }
    close() {
        AnPagePanel.log.appendLine('Shuting down: ' + this.serv?.serv.webroot);
        vscode.window.showInformationMessage('Shuting down Anbox server. ' + this.page.html);
        // this.page.html = '?_shut-down_=True';
        this.page.html = vscode.Uri.file('?_shut-down_=True');
        let req = this.serv.url(this.page);
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
    static filename(uri) {
        return path.basename(uri.path);
    }
}
AnPagePanel.viewType = 'anbox';

})();

module.exports = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=extension.js.map