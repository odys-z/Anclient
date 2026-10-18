#!/usr/bin/env python3
"""
Create a new ReactJS + TypeScript web client for semantic-jserv, built on
@anclient/anreact and @anclient/semantier. Interactive, in the way of synode-cli
(semantic-jserv/synode.py/src/synodepy3/prompt.py): it asks the project name,
then lists all settings with defaults derived from it. Type a setting's number to
change it, return to create the project, q to quit.

Usage:
    python3 create-anapp.py          answer the questions
    python3 create-anapp.py -h       show help and quit

Requires prompt_toolkit >= 3.0.52:
    pip install "prompt_toolkit>=3.0.52"

The generated project follows the layout shared by the example.js projects
(north-star, curriculum, album):

    <name>/
      package.json         npm project, dependencies of anreact / semantier
      tsconfig.json
      webpack.config.js    two UMD entries: <lib>.App (main) & <lib>.LoginApp
      README.md
      src/
        app.tsx            App: AnContext + Sys (menu frame) + AnError, bindHtml()
        login-app.tsx      LoginApp: Login form, redirects to the main page
        common/ports.ts    project's own jserv ports (extends Protocol ports)
        views/home.tsx     a CrudCompW page linked into the Sys menu
      web-dist/
        index.html         main page, loads <name>.min.js
        login.html         portal / login page, loads login.min.js
        github.json        jserv urls, e.g. {"host": "http://localhost:8080/jserv-sample"}
        private/host.json  local override of github.json (git ignored)
        res-vol/lang.json  Langstrs translations

The server side defaults to semantic-jserv/jserv-sample (JSampleApp, port 8080,
context path /jserv-sample). The app's function uri defaults to /sys/<name>,
which jserv-sample's connects.xml maps to sys-sqlite with the prefix rule
<uri>/sys/*</uri>.

For scripts, generate() can be called with an AppConfig, without questions.
"""

import json
import os
import re
import shutil
import subprocess
import sys
from dataclasses import dataclass
from typing import Optional

ANREACT_VERSION = '^0.7.2'
SEMANTIER_VERSION = '^1.0.5'

# Versions follow examples/example.js/package.json, which builds album, north-star, etc.
DEPENDENCIES = {
    '@anclient/anreact': ANREACT_VERSION,
    '@anclient/semantier': SEMANTIER_VERSION,
    '@emotion/react': '^11.11.0',
    '@material-ui/core': '^4.12.4',
    '@material-ui/icons': '^4.11.3',
    '@material-ui/lab': '^4.0.0-alpha.61',
    '@material-ui/styles': '^4.11.5',
    'ag-grid-community': '^33.0.4',
    'ag-grid-react': '^33.0.4',
    'core-js': '^3.21.1',
    'jquery': '^3.6.0',
    'material-ui-audio-player': '^1.6.6',
    'mime-types-no-nodejs': '^0.9.1',
    'pdfjs-dist': '^5.1.91',
    'qrcode': '^1.5.1',
    'react': '^17.0.2',
    'react-dom': '^17.0.2',
    'react-modal': '^3.16.1',
    'react-portal': '^4.2.2',
    'react-responsive-carousel': '^3.2.23',
    'regenerator-runtime': '^0.13.9',
    'resize-observer-polyfill': '^1.5.1',
}

DEV_DEPENDENCIES = {
    '@babel/core': '^7.26.0',
    '@babel/preset-env': '^7.26.0',
    '@babel/preset-react': '^7.16.7',
    '@babel/preset-typescript': '^7.16.7',
    '@emotion/babel-preset-css-prop': '^11.2.0',
    '@types/react': '^17.0.83',
    '@types/react-dom': '^17.0.26',
    'babel-loader': '^9.2.1',
    'css-loader': '^6.8.1',
    'style-loader': '^2.0.0',
    'typescript': '^4.9.5',
    'webpack': '^5.98.0',
    'webpack-cli': '^4.9.2',
}

# ---------------------------------------------------------------- templates
# Placeholders are __UPPER__ tokens, so that TSX ${...} and {...} are left alone.

TSCONFIG = '''{
	"compilerOptions": {
		"jsx": "react",
		"target": "es2017",
		"module": "esnext",
		"moduleResolution": "node",
		"experimentalDecorators": true,
		"allowSyntheticDefaultImports": true,
		"esModuleInterop": true,
		"forceConsistentCasingInFileNames": true,
		"sourceMap": true,
		"noEmit": true,
		"skipLibCheck": true,
		"types": ["react", "react-dom"],
		"baseUrl": ".",
		"paths": {
			"@anclient/anreact": ["node_modules/@anclient/anreact/src/an-components.ts"]
		}
	},
	"include": ["src"]
}
'''

WEBPACK = '''let path = require('path');

// "production" | "development" | "none"
let mode = process.env.NODE_ENV === 'production' ? 'production' : 'development';

module.exports = {
	mode,
	devtool: 'source-map',
	entry: {
		'__NAME__': './src/app.tsx',
		'login'   : './src/login-app.tsx',
	},

	output: {
		filename: '[name].min.js',
		path: path.resolve(__dirname, 'web-dist'),
		library: '__LIB__',
		libraryTarget: 'umd'
	},

	plugins: [ ],
__EXTERNALS__
	resolve: {
		extensions: ['.ts', '.tsx', '.js', '.jsx']
	},

	module: {
		rules: [
		{ test: /\\.jsx?$/,
		  exclude: /node_modules/,
		  loader: 'babel-loader',
		  options: { presets: ['@babel/preset-react', '@babel/preset-env'] }
		},
		{ test: /\\.tsx?$/,
		  loader : 'babel-loader',
		  options: { presets: [
				'@babel/preset-react',
				'@babel/preset-typescript',
				'@emotion/babel-preset-css-prop',
				'@babel/preset-env' ] }
		},
		{ test: /\\.css$/,
		  use : ['style-loader', 'css-loader']
		} ]
	}
}
'''

WEBPACK_EXTERNALS = '''
	/** React is loaded by web-dist/*.html with <script> tags. */
	externals: {
		'react': 'React',
		'react-dom' : 'ReactDOM',
	},
'''

PORTS_TS = '''/**
 * Ports (jserv servlet urls) of __TITLE__.
 *
 * Jserv's built-in ports (session, query, update, dataset, menu, ...) are already
 * understood by @anclient/semantier.Protocol. Add the project's own servlets here,
 * matching the server side's IPort enum, e.g. jserv-sample's Samport:
 *
 *   tools: 'tools.serv',
 *   vec3 : 'vec3.serv',
 */
export const __PORTS__ = {
	/** jserv-sample/src/main/java/io/oz/jservapp/JservMenu.java */
	menu: 'menu.serv',
};
'''

APP_TSX = '''import React from 'react';
import ReactDOM from 'react-dom';

import { Protocol, AnsonMsg, AnsonResp, ErrorCtx, SessionClient } from '@anclient/semantier';
import { L, Langstrs, Sys, SysComp, AnContext, AnError, AnReactExt,
	AnreactAppOptions, ExternalHosts, ClientOptions, jsample
} from '@anclient/anreact';
import { MuiThemeProvider } from '@material-ui/core/styles';

import { __PORTS__ } from './common/ports';
import { Home } from './views/home';

export interface AppProps {
	servs: ExternalHosts;
	servId: string;

	/** portal (login) page, the target for logging out & re-login */
	iportal?: string;
	iwindow?: Window;
	iparent?: any;

	clientOpts?: ClientOptions;
}

/**
 * __TITLE__ main page:
 * the AnContext singleton, Sys frame (menu & routes) and the error handler.
 */
export class App extends React.Component<AppProps> {
	/** Function uri. Must be mapped by jserv's connects.xml/conn-uri. */
	uri = '__URI__';

	state = {
		hasError: false,
		/** e.g. 're-login' */
		nextAction: undefined as string | undefined,
	};

	ssclient: SessionClient | undefined;
	anReact: AnReactExt | undefined;
	error: ErrorCtx;

	/** Menu items used when no menu dataset (sk) is loaded from jserv. */
	menuTree = [
		{node: {funcId: 'home', id: 'home', funcName: L('Home'), text: '', url: '/home', css: {icon: 'home'}, sort: 0}},
	];

	constructor(props: AppProps) {
		super(props);

		this.onError = this.onError.bind(this);
		this.onErrorClose = this.onErrorClose.bind(this);
		this.logout = this.logout.bind(this);

		this.error = {onError: this.onError, msg: ''};

		// restore the session persisted by LoginApp into window.localStorage
		this.ssclient = new SessionClient();
		this.anReact = new AnReactExt(this.ssclient, this.error);
		this.ssclient.an.understandPorts(__PORTS__);

		if (!this.ssclient.ssInf) {
			this.state.hasError = true;
			this.state.nextAction = 're-login';
			this.error.msg = L('Setup session failed! Please re-login.');
		}

		// link pages to menu urls
		SysComp.extendLinks([
			{path: '/home', comp: Home},
		]);
	}

	onError(code: string, rsp: AnsonMsg<AnsonResp> | undefined) {
		console.error(code, rsp);
		this.error.msg = rsp?.Body()?.msg() || code;
		this.setState({
			hasError: !!code,
			nextAction: code === Protocol.MsgCode.exSession ? 're-login' : 'ignore'
		});
	}

	onErrorClose() {
		if (this.state.nextAction === 're-login') {
			this.state.nextAction = undefined;
			this.logout();
		}
		this.setState({hasError: false});
	}

	/** Logout and navigate to the portal (login) page. Also called by SysComp.onLogout. */
	logout() {
		let that = this;
		let portal = this.props.iportal || 'login.html';
		try {
			if (this.ssclient?.ssInf)
				this.ssclient.logout(
					() => { if (that.props.iwindow) that.props.iwindow.location.href = portal; },
					{ onError: (_c: any, _e: any) => cleanup(that) } );
			else cleanup(that);
		}
		catch (_) { cleanup(that); }
		finally { this.ssclient = undefined; }

		function cleanup(app: App) {
			localStorage.removeItem(SessionClient.ssInfo);
			if (app.props.iwindow)
				app.props.iwindow.location.href = portal;
		}
	}

	render() {
		return (
		<MuiThemeProvider theme={jsample.JsampleTheme}>
		  <AnContext.Provider value={{
			pageOrigin: window ? window.origin : 'localhost',
			servId    : this.props.servId,
			servs     : this.props.servs as any,
			anClient  : this.ssclient as SessionClient,
			uiHelper  : this.anReact,
			ssInf     : this.ssclient?.ssInf,
			hasError  : this.state.hasError,
			iparent   : this.props.iparent,
			ihome     : this.props.iportal || 'login.html',
			error     : this.error,
			host_json : 'private/host.json',
			clientOpts: this.props.clientOpts,
		  }} >
			{this.ssclient?.ssInf &&
			<Sys uri={this.uri}
				__MENU_PROP__
				landingUrl={'/home'}
				sys={L('__TITLE__')} menuTitle={L('Sys Menu')}
				onLogout={this.logout} />}

			{this.state.hasError &&
			<AnError onClose={this.onErrorClose} fullScreen={false}
				uri={this.uri} tier={undefined}
				title={L('Error')} msg={this.error.msg || ''} />}
		  </AnContext.Provider>
		</MuiThemeProvider>);
	}

	/**
	 * Load jserv urls (private/host.json, then github.json), then render into html element.
	 * @param elem html element id
	 * @param opts serv: key in the json, default 'host'; portal: login page
	 */
	static bindHtml(elem: string, opts: AnreactAppOptions = {}) {
		let portal = opts.portal || 'login.html';
		try { Langstrs.load('res-vol/lang.json', navigator.language); } catch (e) {}

		AnReactExt.loadServs(elem, opts, (elem: string, opts: AnreactAppOptions, json: ExternalHosts) => {
			ReactDOM.render(
				<App servs={json} servId={opts.serv || 'host'} iportal={portal}
					iwindow={window} clientOpts={opts.clientOpts} />,
				document.getElementById(elem));
		});
	}
}
'''

LOGIN_TSX = '''import React from 'react';
import ReactDOM from 'react-dom';

import { AnsonMsg, AnsonResp, SessionClient, SessionInf } from '@anclient/semantier';
import { L, Langstrs, AnContext, AnError, AnReact, Login,
	AnreactAppOptions, ExternalHosts, JsonHosts, jsample } from '@anclient/anreact';
import { MuiThemeProvider } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

export interface LoginAppProps {
	servs: ExternalHosts;
	servId: string;
	/** window to be redirected after login, e.g. parent of the iframe */
	iparent?: Window;
	/** main page */
	ihome?: string;
}

/**
 * __TITLE__ login page: logs in to jserv, persists the session into localStorage,
 * then redirects to the main page.
 */
export class LoginApp extends React.Component<LoginAppProps> {
	/** Function uri. Must be mapped by jserv's connects.xml/conn-uri. */
	uri = '__URI__';

	state = {
		hasError: false,
	};

	errCtx = {
		msg: '',
		onError: (c: string, r: AnsonMsg<AnsonResp>) => this.onError(c, r),
	};

	constructor(props: LoginAppProps) {
		super(props);
		this.onErrorClose = this.onErrorClose.bind(this);
		this.onLogin = this.onLogin.bind(this);
	}

	onError(code: string, rsp: AnsonMsg<AnsonResp>) {
		console.error(code, rsp);
		this.errCtx.msg = rsp?.Body()?.msg() || code;
		this.setState({hasError: !!code});
	}

	onErrorClose() {
		this.setState({hasError: false});
	}

	onLogin(client: { ssInf: SessionInf & {home?: string} }) {
		SessionClient.persistorage(client.ssInf);

		let mainpage = client.ssInf.home || this.props.ihome || 'index.html';
		let target = this.props.iparent || window;
		target.location.href = `${mainpage}?serv=${this.props.servId}`;
	}

	render() {
		return (
		<MuiThemeProvider theme={jsample.JsampleTheme}>
		  <AnContext.Provider value={{
			pageOrigin: window ? window.origin : 'localhost',
			servId    : this.props.servId,
			servs     : this.props.servs as unknown as JsonHosts,
			anClient  : undefined as unknown as SessionClient,
			uiHelper  : undefined,
			ssInf     : undefined,
			hasError  : this.state.hasError,
			iparent   : this.props.iparent,
			ihome     : this.props.ihome || 'index.html',
			error     : this.errCtx,
			host_json : 'private/host.json',
		  }} >
			<Paper elevation={3} style={{maxWidth: 560, margin: '10vh auto', padding: 24}}>
				<Typography variant='h5'>{L('__TITLE__')}</Typography>
				<Typography variant='body2' color='textSecondary' gutterBottom>
					{L('Please login')}
				</Typography>
				<Login uri={this.uri} onLogin={this.onLogin} config={{}} />
			</Paper>

			{this.state.hasError &&
			<AnError onClose={this.onErrorClose} fullScreen={false}
				title={L('Error')} msg={this.errCtx.msg} />}
		  </AnContext.Provider>
		</MuiThemeProvider>);
	}

	/**
	 * Load jserv urls (private/host.json, then github.json), then render into html element.
	 * @param elem html element id
	 * @param opts serv: key in the json, default 'host'; home: main page; parent: window to redirect
	 */
	static bindHtml(elem: string, opts: AnreactAppOptions = {}) {
		try { Langstrs.load('res-vol/lang.json', navigator.language); } catch (e) {}

		AnReact.bindDom(elem, opts, (elem: string, opts: AnreactAppOptions, json: JsonHosts) => {
			ReactDOM.render(
				<LoginApp servs={json as unknown as ExternalHosts} servId={opts.serv || 'host'}
					iparent={opts.parent} ihome={opts.home} />,
				document.getElementById(elem));
		});
	}
}
'''

HOME_TSX = '''import React from 'react';
import { AnContextType, Comprops, CrudCompW, L } from '@anclient/anreact';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';

/**
 * Landing page of __TITLE__, linked to menu url '/home' by App's SysComp.extendLinks().
 * Replace with the project's own pages, e.g. a semantier + AnQueryst + AnTablist list.
 */
export class Home extends CrudCompW<Comprops> {
	render() {
		let ctx = this.context as unknown as AnContextType;
		let ssInf = ctx?.anClient?.ssInf;
		let jserv = ctx?.servs ? (ctx.servs as any)[ctx.servId] : undefined;

		return (
			<Card style={{margin: 16}}>
				<CardContent>
					<Typography variant='h6'>{L('Welcome')}, {ssInf?.usrName || ssInf?.uid}</Typography>
					<Typography variant='body2' color='textSecondary'>
						{L('jserv')}: {jserv}
					</Typography>
					<Typography variant='body2' color='textSecondary'>
						{L('uri')}: {this.uri}
					</Typography>
				</CardContent>
			</Card>);
	}
}
'''

INDEX_HTML = '''<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
__REACT_SCRIPTS__	<title>__TITLE__</title>
	<style>html, body { margin: 0; padding: 0; }</style>
</head>

<body>
	<div id="app"></div>
	<noscript>You need to enable JavaScript to run this app.</noscript>
	<script src="__NAME__.min.js"></script>
	<script>
		let searchParams = new URLSearchParams(window.location.search);
		let serv = searchParams.get('serv') || 'host';
		__LIB__.App.bindHtml('app', {serv, portal: 'login.html'});
	</script>
</body>
</html>
'''

LOGIN_HTML = '''<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
__REACT_SCRIPTS__	<title>__TITLE__ Login</title>
	<style>html, body { margin: 0; padding: 0; background: #f4f5fb; }</style>
</head>

<body>
	<div id="login"></div>
	<noscript>You need to enable JavaScript to run this app.</noscript>
	<script src="login.min.js"></script>
	<script>
		let searchParams = new URLSearchParams(window.location.search);
		let serv = searchParams.get('serv') || 'host';
		// parent: the window to be redirected, if this page is loaded in an iframe.
		__LIB__.LoginApp.bindHtml('login', {serv, parent, home: 'index.html'});
	</script>
</body>
</html>
'''

REACT_CDN = '''	<script crossorigin src="https://unpkg.com/react@17/umd/react.__REACT_BUILD__.js"></script>
	<script crossorigin src="https://unpkg.com/react-dom@17/umd/react-dom.__REACT_BUILD__.js"></script>
'''

README = '''# __TITLE__

A web client of [semantic-jserv](https://github.com/odys-z/semantic-jserv), built on
[@anclient/anreact](https://github.com/odys-z/Anclient/tree/master/js/anreact) and
[@anclient/semantier](https://github.com/odys-z/Anclient/tree/master/js/semantier),
generated by Anclient/examples/example.js/create-anapp.py.

## Build

```
    npm install
    npm run build          # or: npm run watch / npm run release
```

`npm run tsc` type-checks src/. Since anreact & semantier are shipped as TypeScript sources,
it also reports errors inside node_modules/@anclient/*; those don't affect the webpack build.

Bundles are written into web-dist/: `__NAME__.min.js` (main page) and `login.min.js`.
Both are UMD bundles exposing the global `__LIB__`.

## Server

The default jserv is semantic-jserv/jserv-sample:

start it as in [Jserv-sample Quick Start](https://odys-z.github.io/notes/semantics/jserv/jsample-quick-start.html#jsample-kick),
e.g. run io.oz.jservapp.JSampleApp (src/test) from the IDE, or deploy the war with context
path /jserv-sample.

Jserv urls are loaded from web-dist/private/host.json (not committed), falling back to
web-dist/github.json:

```
    { "host": "__JSERV__" }
```

Page parameter `?serv=<key>` selects one of the keys.

The function uri of this app is `__URI__`. The server must map it to a connection
in WEB-INF/connects.xml, table conn-uri. jserv-sample's prefix rule already covers it
if it starts with /sys/:

```
    <c>
        <uri>/sys/*</uri>
        <conn>sys-sqlite</conn>
    </c>
```

## Run

Serve web-dist/ with any static http server, e.g.

```
    cd web-dist && python3 -m http.server 8888
```

then open http://localhost:8888/login.html. jserv-sample allows CORS.

## Structure

| file | what |
|---|---|
| src/app.tsx | App: AnContext, Sys menu frame, error handler; `__LIB__.App.bindHtml()` |
| src/login-app.tsx | LoginApp: login form, session persisted into localStorage |
| src/common/ports.ts | project's jserv ports |
| src/views/home.tsx | landing page, linked to menu url /home |
| web-dist/res-vol/lang.json | translations used by `L()` |

To add a page: write a `CrudCompW` component in src/views, link it in App's
`SysComp.extendLinks()`, and add a menu item (App.menuTree, or the server's menu dataset).
'''

LANG_JSON = '''{ "using": "zh-cn",
  "zh-CN": {
    "Home": "首 页",
    "Welcome": "欢 迎",
    "Please login": "请登录",
    "Sys Menu": "系统菜单",
    "Error": "错 误"
  }
}
'''

GITIGNORE = '''node_modules/
web-dist/*.min.js
web-dist/*.min.js.map
web-dist/*.LICENSE.txt
web-dist/private/
'''

# ---------------------------------------------------------------- generator

@dataclass
class AppConfig:
    name: str
    title: str = ''
    dest: str = ''
    jserv: str = 'http://localhost:8080/jserv-sample'
    uri: str = ''
    menu_sk: Optional[str] = None
    '''None: a local menu tree in app.tsx; otherwise the dataset sk loaded by menu.serv'''
    react_cdn: bool = False
    react_build: str = 'development'
    lib: str = ''
    author: str = ''
    version: str = '0.1.0'
    license: str = 'MIT'
    package: str = ''

    def fill_defaults(self) -> 'AppConfig':
        self.title = self.title or to_title(self.name)
        self.dest = self.dest or self.name
        self.uri = self.uri or f'/sys/{self.name}'
        self.lib = self.lib or to_lib(self.name)
        self.package = self.package or f'@anclient/{self.name}'
        return self


name_regex = r'[a-z0-9][a-z0-9._-]*'


def to_lib(name: str) -> str:
    """'my-app' -> 'myApp', usable as a js global."""
    parts = [p for p in re.split(r'[^0-9A-Za-z]+', name) if p]
    if not parts:
        raise ValueError(f'Cannot make a js identifier from {name!r}')
    lib = parts[0].lower() + ''.join(p[:1].upper() + p[1:] for p in parts[1:])
    return '_' + lib if lib[0].isdigit() else lib


def to_title(name: str) -> str:
    return ' '.join(p.capitalize() for p in re.split(r'[-_.\s]+', name) if p)


def render(text: str, tokens: dict) -> str:
    for k, v in tokens.items():
        text = text.replace(f'__{k}__', v)
    left = re.findall(r'__[A-Z_]+__', text)
    if left:
        raise RuntimeError(f'Unresolved template tokens: {sorted(set(left))}')
    return text


def write(root: str, rel: str, content: str):
    path = os.path.join(root, rel)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8', newline='\n') as f:
        f.write(content)
    print(f'  + {rel}')


def package_json(cfg: AppConfig) -> str:
    pkg = {
        'name': cfg.package,
        'version': cfg.version,
        'description': f'{cfg.title}, a web client built on Anclient',
        'private': True,
        'scripts': {
            'build': 'webpack-cli',
            'watch': 'webpack-cli --watch',
            'release': 'webpack-cli --mode production',
            'tsc': 'tsc -p .',
        },
        'keywords': ['Anclient', 'semantic-jserv'],
        'author': cfg.author,
        'license': cfg.license,
        'dependencies': dict(sorted(DEPENDENCIES.items())),
        'devDependencies': dict(sorted(DEV_DEPENDENCIES.items())),
    }
    # With react_cdn, react & react-dom stay in dependencies for type checking and
    # for anreact's peers, while webpack takes them as externals.
    return json.dumps(pkg, indent=2, ensure_ascii=False) + '\n'


def generate(cfg: AppConfig) -> str:
    """
    Write the project files into cfg.dest, overwriting existing ones.
    :return: the absolute path of the project folder
    """
    cfg.fill_defaults()
    dest = os.path.abspath(cfg.dest)

    menu_prop = f"menu={{'{cfg.menu_sk}'}}" if cfg.menu_sk else 'tree={this.menuTree as any}'
    react_build = 'production.min' if cfg.react_build == 'production' else 'development'
    tokens = {
        'NAME': cfg.name,
        'LIB': cfg.lib,
        'TITLE': cfg.title,
        'URI': cfg.uri,
        'JSERV': cfg.jserv,
        'PORTS': cfg.lib[0].upper() + cfg.lib[1:] + 'Ports',
        'MENU_PROP': menu_prop,
        'EXTERNALS': WEBPACK_EXTERNALS if cfg.react_cdn else '',
        'REACT_SCRIPTS': render(REACT_CDN, {'REACT_BUILD': react_build}) if cfg.react_cdn else '',
    }

    print(f'Creating {cfg.title} in {dest}')
    files = {
        'package.json': package_json(cfg),
        'tsconfig.json': TSCONFIG,
        'webpack.config.js': render(WEBPACK, tokens),
        'README.md': render(README, tokens),
        '.gitignore': GITIGNORE,
        'src/app.tsx': render(APP_TSX, tokens),
        'src/login-app.tsx': render(LOGIN_TSX, tokens),
        'src/common/ports.ts': render(PORTS_TS, tokens),
        'src/views/home.tsx': render(HOME_TSX, tokens),
        'web-dist/index.html': render(INDEX_HTML, tokens),
        'web-dist/login.html': render(LOGIN_HTML, tokens),
        'web-dist/github.json': json.dumps({'host': cfg.jserv}, indent='\t') + '\n',
        'web-dist/private/host.json': json.dumps({'host': cfg.jserv}, indent='\t') + '\n',
        'web-dist/res-vol/lang.json': LANG_JSON,
    }
    for rel, content in files.items():
        write(dest, rel, content)
    return dest


def run_npm(dest: str, build: bool) -> bool:
    npm = shutil.which('npm')
    if not npm:
        print('npm is not found. Install Node.js, then run: npm install && npm run build')
        return False
    try:
        subprocess.check_call([npm, 'install'], cwd=dest)
        if build:
            subprocess.check_call([npm, 'run', 'build'], cwd=dest)
        return True
    except subprocess.CalledProcessError as e:
        print(f'npm failed: {e}')
        return False


# ---------------------------------------------------------------- prompts

cli_help = __doc__


def git_user() -> str:
    try:
        return subprocess.run(['git', 'config', 'user.name'], capture_output=True,
                              text=True, timeout=5).stdout.strip()
    except (OSError, subprocess.SubprocessError):
        return ''


def is_empty_dir_or_none(path: str) -> bool:
    return not os.path.exists(path) or (os.path.isdir(path) and not os.listdir(path))


npm_steps = {1: 'npm install & npm run build', 2: 'npm install only', 3: 'nothing, do it later'}


def interact():
    try:
        from prompt_toolkit import PromptSession
        from prompt_toolkit.document import Document
        from prompt_toolkit.shortcuts import choice
        from prompt_toolkit.styles import Style
        from prompt_toolkit.validation import Validator, ValidationError
    except ImportError:
        sys.exit('This script requires prompt_toolkit >= 3.0.52:\n'
                 '    pip install "prompt_toolkit>=3.0.52"')

    style = Style.from_dict({
        'prompt': 'bg:#ansiblue #ffffff',  # Blue background, white text
    })
    session = PromptSession(style=style)

    def quit_nothing():
        print('Quit, nothing is created.')
        sys.exit(0)

    class RegexValidator(Validator):
        """Blank is passed (keep the current value, or quit for the name)."""
        def __init__(self, regex: str, message: str):
            self.regex, self.message = regex, message

        def validate(self, document: Document) -> None:
            text = document.text.strip()
            if text and not re.fullmatch(self.regex, text):
                raise ValidationError(message=self.message)

    v_name = RegexValidator(name_regex, 'Lower case letters, digits and "-._", starting with a letter or digit.')
    v_jserv = RegexValidator(r'https?://[^\s/]+(/\S*)?',
                             'Format: http(s)://host[:port]/context, e.g. http://localhost:8080/jserv-sample')
    v_uri = RegexValidator(r'/\S*', 'Must start with "/", without spaces, e.g. /sys/my-app')
    v_lib = RegexValidator(r'[A-Za-z_$][\w$]*', 'Must be a JavaScript identifier.')
    v_sk = RegexValidator(r'\S+', 'No spaces.')
    v_pkg = RegexValidator(r'(@[a-z0-9][a-z0-9._-]*/)?' + name_regex, 'npm package name, e.g. @anclient/my-app')

    # PromptSession keeps the last prompt's validator when validator=None is passed,
    # so a prompt without its own validator must pass this one explicitly.
    v_any = Validator.from_callable(lambda _: True)

    def edit(message: str, current: str, validator: Optional[Validator] = None) -> str:
        """Edit one setting. Empty input keeps the current value."""
        answer = session.prompt(message=message + ' (empty to keep): ', default=current,
                                validator=validator or v_any, validate_while_typing=False).strip()
        return answer or current

    print('Create a ReactJS + TypeScript client on @anclient/anreact & @anclient/semantier.')

    # 1. the name, the only question asked first; other settings are derived from it
    name = session.prompt(message='1. Project name, npm style, e.g. my-app (empty to quit): ',
                          validator=v_name, validate_while_typing=False).strip()
    if not name:
        quit_nothing()

    cfg = AppConfig(name=name, author=git_user())
    npm_step = 1 if shutil.which('npm') else 3
    edited = set()  # settings changed by the user, not re-derived when the name changes

    def derive():
        """(Re)derive the settings not edited by the user from the name."""
        defaults = AppConfig(name=cfg.name).fill_defaults()
        for k in ('dest', 'title', 'uri', 'lib', 'package'):
            if k not in edited:
                setattr(cfg, k, getattr(defaults, k))

    derive()

    def show():
        folder = os.path.abspath(cfg.dest)
        print(f'''
Settings (type a number to change):
   1  project name    : {cfg.name}
   2  project folder  : {folder}{'' if is_empty_dir_or_none(cfg.dest) else '   [not empty!]'}
   3  title           : {cfg.title}
   4  jserv root url  : {cfg.jserv}
   5  function uri    : {cfg.uri}   (must match connects.xml/conn-uri)
   6  system menu     : {'menu.serv, dataset sk = ' + cfg.menu_sk if cfg.menu_sk else 'local menu tree in app.tsx'}
   7  react           : {'unpkg CDN, ' + cfg.react_build + ' build' if cfg.react_cdn else 'bundled by webpack'}
   8  UMD global      : {cfg.lib}   (web-dist/{cfg.name}.min.js & login.min.js)
   9  author          : {cfg.author}
  10  npm package     : {cfg.package} {cfg.version}, {cfg.license}
  11  after creating  : {npm_steps[npm_step]}{'' if shutil.which('npm') else '   (npm is not found)'}''')

    class MenuValidator(Validator):
        def validate(self, document: Document) -> None:
            t = document.text.strip().lower()
            if t in ('', 'q') or (t.isdigit() and 1 <= int(t) <= 11):
                return
            raise ValidationError(message='Type 1 - 11 to change, return to create, q to quit.')

    while True:
        show()
        cmd = session.prompt(message='Number to change, return to create the project, q to quit: ',
                             validator=MenuValidator(), validate_while_typing=False).strip().lower()
        if cmd == 'q':
            quit_nothing()

        if cmd == '':
            if not is_empty_dir_or_none(cfg.dest):
                how = choice(message=f'{os.path.abspath(cfg.dest)} is not empty.',
                             options=[(1, 'Overwrite the generated files in it.'),
                                      (2, 'Back to the settings.')],
                             default=2, style=style)
                if how != 1:
                    continue
            break

        n = int(cmd)
        if n == 1:
            cfg.name = edit('1. Project name', cfg.name, v_name)
            derive()
        elif n == 2:
            cfg.dest = edit('2. Project folder', cfg.dest); edited.add('dest')
        elif n == 3:
            cfg.title = edit('3. Title', cfg.title); edited.add('title')
        elif n == 4:
            cfg.jserv = edit('4. Jserv root url, written into web-dist/github.json', cfg.jserv, v_jserv)
        elif n == 5:
            cfg.uri = edit("5. Function uri, matching a <uri> of jserv's connects.xml/conn-uri",
                           cfg.uri, v_uri); edited.add('uri')
        elif n == 6:
            m = choice(message='6. Where does the system menu come from?',
                       options=[(1, 'A local menu tree in app.tsx (no server dataset needed).'),
                                (2, "Jserv's menu.serv, by a dataset sk (e.g. jserv-sample's sys.menu.jsample).")],
                       default=2 if cfg.menu_sk else 1, style=style)
            cfg.menu_sk = edit('   Menu dataset sk, in WEB-INF/dataset.xml',
                               cfg.menu_sk or 'sys.menu.jsample', v_sk) if m == 2 else None
        elif n == 7:
            r = choice(message='7. How is React loaded?',
                       options=[(1, 'Bundled by webpack.'),
                                (2, 'From unpkg CDN, development build (webpack externals, like album).'),
                                (3, 'From unpkg CDN, production build.')],
                       default=1 if not cfg.react_cdn else 3 if cfg.react_build == 'production' else 2,
                       style=style)
            cfg.react_cdn = r != 1
            cfg.react_build = 'production' if r == 3 else 'development'
        elif n == 8:
            cfg.lib = edit('8. UMD global of the bundles, used in the html pages', cfg.lib, v_lib); edited.add('lib')
        elif n == 9:
            # can be cleared
            cfg.author = session.prompt(message='9. Author in package.json (can be empty): ',
                                        default=cfg.author, validator=v_any).strip()
        elif n == 10:
            cfg.package = edit('10. npm package name', cfg.package, v_pkg); edited.add('package')
        elif n == 11:
            npm_step = choice(message='11. After the project is created:',
                              options=[(k, v) for k, v in npm_steps.items()],
                              default=npm_step, style=style)

    dest = generate(cfg)

    npm_done = False
    if npm_step != 3:
        npm_done = run_npm(dest, build=npm_step == 1)

    print(f'''
Done. Next:
    cd {os.path.relpath(dest)}{'' if npm_done else '''
    npm install && npm run build'''}
    cd web-dist && python3 -m http.server 8888   # open http://localhost:8888/login.html

Jserv: {cfg.jserv}  (edit web-dist/private/host.json)
Uri  : {cfg.uri}  (must match a <uri> rule of WEB-INF/connects.xml, conn-uri)
''')


def main():
    if any(a in ('-h', '--help', 'help') for a in sys.argv[1:]):
        print(cli_help)
        return 0
    try:
        interact()
    except (KeyboardInterrupt, EOFError):
        print('\nQuit.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
