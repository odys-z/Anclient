let path = require('path')

/**
 * node_modules of this folder and its parents, the way Node looks up from here (as registry.ts).
 * Absolute paths, so the linked sources, @anclient/*, resolve their imports here too, never in
 * their own node_modules: one copy of each package, e.g. React.
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

// v is used in js code?
let v = 'development'; // "production" | "development" | "none"

let version = "0.5.0";

const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CompressionPlugin = require('compression-webpack-plugin');

module.exports = {
	mode: v,
	devtool: 'source-map',
	entry: { 'portfolio': './src/app.tsx',
			 'login'    : './src/login-admin.tsx'
			 // "admin": "./src/admin.tsx"
		   },

	output: {
	  filename: "[name].min.js",
	  path: path.resolve(__dirname, 'web-dist'),
	  library: 'album',
	  libraryTarget: 'umd'
	},

	plugins: [
		new BundleAnalyzerPlugin({analyzerMode: 'static', openAnalyzer: false}), new CompressionPlugin()
	],

	watch: false,

	/** React is bundled: React 19 has no UMD builds for <script> tags. */

	resolve: {
		extensions: ['.*', '.ts', '.js', '.jsx', '.tsx'],
		modules: upwardModules(__dirname),
	},

	module: {
		rules: [
		{   test: /\.jsx?$/,
			exclude: /node_modules/,
			loader: 'babel-loader',
			options: {
			  presets: ['@babel/preset-react', '@babel/preset-env'] }
		},
		// no exclude: compiles the TS sources of @anclient/* and semantic-doc (from its tarball)
		{ test: /\.tsx?$/,
		  loader : 'babel-loader',
		  // presets run last to first: TypeScript strips semantic-doc's `declare` fields
		  // before preset-env transforms class fields
		  options: { presets: [
				'@babel/preset-env',
				'@babel/preset-react',
				'@emotion/babel-preset-css-prop',
				['@babel/preset-typescript', { allowDeclareFields: true }] ] }
		},
		{   test: /\.css$/,
			use : ["style-loader", "css-loader"]
		},
		// KaTeX fonts, for the doc-tree editor's formulas
		{   test: /\.(woff2?|ttf)$/,
			type: 'asset/resource',
			generator: { filename: 'fonts/[name][ext]' }
		},
		{   test: /\.svg$/,
			use : [ { loader: "babel-loader" },
					{ loader: "react-svg-loader" } ]
		} ]
	},
}
