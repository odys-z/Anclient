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
/***/ ((__unused_webpack_module, exports) => {


/* eslint-disable no-empty */
// https://github.dev/microsoft/vscode/tree/main/src/vs/base/common
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.pythonCmd = exports.isLittleEndian = exports.OS = exports.translationsConfigFile = exports.locale = exports.language = exports.userAgent = exports.platform = exports.isIOS = exports.isWeb = exports.isNative = exports.isLinuxSnap = exports.isLinux = exports.isMacintosh = exports.isWindows = exports.platformToString = exports.isElectronSandboxed = exports.globals = void 0;
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
function pythonCmd() {
    let python = 'python1';
    switch (exports.OS) {
        case 1 /* Windows */:
            python = 'py';
    }
    return python;
}
exports.pythonCmd = pythonCmd;


/***/ }),
/* 4 */
/***/ ((module) => {

module.exports = require("path");

/***/ }),
/* 5 */
/***/ ((module) => {

module.exports = require("fs");

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
exports.activate = void 0;
/* eslint-disable curly */
const vscode = __webpack_require__(1);
const cp = __webpack_require__(2);
const path = __webpack_require__(4);
const platform_1 = __webpack_require__(3);
const fs = __webpack_require__(5);
;
/**
 * Setup Anbox.
 * @param context
 */
function activate(context) {
    console.log('Starting Anbox ...');
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
        AnPagePanel.init(context);
        AnPagePanel.currentPanel.load(context.extensionUri, uri);
    }));
    context.subscriptions.push(vscode.commands.registerCommand('anbox.refresh', () => {
        if (AnPagePanel.currentPanel) {
            AnPagePanel.currentPanel.refresh();
        }
    }));
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
    context.subscriptions.push(vscode.commands.registerCommand('anbox.restartServer', () => {
        if (AnPagePanel.currentPanel) {
            AnPagePanel.currentPanel.startup();
        }
    }));
    if (vscode.window.registerWebviewPanelSerializer) {
        // Make sure we register a serializer in activation event
        vscode.window.registerWebviewPanelSerializer(AnPagePanel.viewType, {
            async deserializeWebviewPanel(webviewPanel, state) {
                console.log(`Got state: ${state}`);
                // Reset the webview options so we use latest uri for `localResourceRoots`.
                webviewPanel.webview.options = getWebviewOptions(context.extensionUri);
                AnPagePanel.revive(webviewPanel, context.extensionUri);
            }
        });
    }
}
exports.activate = activate;
/**
 * Set loacal resource root - restrict the webview to only loading content from target project's directory.
 * @param extensionUri e.g. {scheme: 'file', authority: '', path: '/home/ody/anclient/js/anbox', query: '', fragment: '', …}
 * @returns
 */
function getWebviewOptions(extensionUri) {
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
    constructor(panel, extensionUri) {
        this._disposables = [];
        this.page = {
            port: "8888",
            host: "localhost",
            html: "index.html",
            style: `backgroundColor: '#ccc'`
        };
        this.serv = {
            rootpath: '',
            starting: false,
            webpackTerm: undefined
        };
        this._panel = panel;
        this._extensionUri = extensionUri;
        // Set the webview's initial html content
        this.loadOnline(page);
        // Listen for when the panel is disposed
        // This happens when the user closes the panel or when the panel is closed programmatically
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        // Update the content based on view changes
        this._panel.onDidChangeViewState(e => {
            if (this._panel.visible) {
                this.doRefresh();
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
    static init(context) {
        if (AnPagePanel.currentPanel)
            return;
        const panel = vscode.window.createWebviewPanel(AnPagePanel.viewType, 'Anbox', vscode.window.activeTextEditor?.viewColumn || vscode.ViewColumn.One, getWebviewOptions(context.extensionUri));
        panel.webview.options = getWebviewOptions(context.extensionUri);
        AnPagePanel.revive(panel, context.extensionUri);
    }
    /**
     * Deserialize?
     * @param panel
     * @param extensionUri
     */
    static revive(panel, extensionUri) {
        AnPagePanel.currentPanel = new AnPagePanel(panel, extensionUri);
    }
    /**
     * Load a page, in current active column.
     * @param extensionUri
     * @returns
     */
    async load(extensionUri, localhtml) {
        let serv = this.getServ(localhtml);
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
            const panel = vscode.window.createWebviewPanel(AnPagePanel.viewType, `Anbox - ${AnPagePanel.filename(localhtml)}`, column || vscode.ViewColumn.One, getWebviewOptions(extensionUri));
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
    getServ(html) {
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
        }
        ;
        const cmd = `cd ${this.serv.rootpath} && ${(0, platform_1.pythonCmd)()} anserv.py ${this.page.port} &`;
        console.log(cmd);
        new Promise((resolve, reject) => {
            cp.exec(cmd, (err, out) => {
                if (err) {
                    return reject(err);
                }
                return resolve(out);
            });
        });
    }
    doRefactor() {
        // Send a message to the webview webview.
        // You can send any JSON serializable data.
        this._panel.webview.postMessage({ command: 'refactor' });
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
    loadOnline(page) {
        const webview = this._panel.webview;
        this._panel.webview.html = this.getAnclientPage(page);
    }
    refresh() {
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
    getAnclientPage(page) {
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
    static url(page) {
        return `http://${page.host}:${page.port}/${page.html}`;
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