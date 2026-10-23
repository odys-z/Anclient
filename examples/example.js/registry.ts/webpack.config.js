let path = require('path');

/**
 * node_modules of this folder and its parents, the way Node looks up from here.
 * Absolute paths, so the linked sources, e.g. node_modules/@anclient/anreact -> ../../../js/anreact,
 * resolve their imports (@material-ui, ...) here too, never in their own node_modules: one copy
 * of each package.
 */
function upwardModules(dir) {
	let dirs = [];
	for (;;) {
		dirs.push(path.join(dir, 'node_modules'));
		let parent = path.dirname(dir);
		if (parent === dir) return dirs;
		dir = parent;
	}
}

// "production" | "development" | "none"
let mode = process.env.NODE_ENV === 'production' ? 'production' : 'development';

module.exports = {
	mode,
	devtool: 'source-map',
	entry: {
		'registry.ts': './src/app.tsx',
		'login'   : './src/login-app.tsx',
	},

	output: {
		filename: '[name].min.js',
		path: path.resolve(__dirname, 'web-dist'),
		library: 'registryTs',
		libraryTarget: 'umd'
	},

	plugins: [ ],

	/** React is bundled: React 19 has no UMD builds for <script> tags. */

	resolve: {
		extensions: ['.ts', '.tsx', '.js', '.jsx'],
		modules: upwardModules(__dirname),
	},

	module: {
		rules: [
		{ test: /\.jsx?$/,
		  exclude: /node_modules/,
		  loader: 'babel-loader',
		  options: { presets: ['@babel/preset-react', '@babel/preset-env'] }
		},
		{ test: /\.tsx?$/,
		  loader : 'babel-loader',
		  options: { presets: [
				'@babel/preset-react',
				'@babel/preset-typescript',
				'@emotion/babel-preset-css-prop',
				'@babel/preset-env' ] }
		},
		{ test: /\.css$/,
		  use : ['style-loader', 'css-loader']
		} ]
	}
}
