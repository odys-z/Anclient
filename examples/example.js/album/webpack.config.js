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

let fs = require('fs');

/**
 * Tiptap and all it depends on (ProseMirror, ...), as installed with semantic-doc: the packages in
 * node_modules/@tiptap and their dependencies, recursively. Peers (React, KaTeX) are not followed.
 * @returns {RegExp} matching the modules' paths
 */
function tiptapDependencies() {
	let found = new Set();
	let pkgjson = (name) => upwardModules(__dirname)
			.map((m) => path.join(m, name, 'package.json'))
			.find((f) => fs.existsSync(f));
	let walk = (name) => {
		if (found.has(name)) return;
		let f = pkgjson(name);
		if (!f) return;
		found.add(name);
		Object.keys(JSON.parse(fs.readFileSync(f, 'utf8')).dependencies || {}).forEach(walk);
	};

	let scope = upwardModules(__dirname).map((m) => path.join(m, '@tiptap')).find((d) => fs.existsSync(d));
	if (scope)
		fs.readdirSync(scope).forEach((n) => walk('@tiptap/' + n));

	let names = [...found].map((n) => n.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&').replace('\\/', '[\\\\/]'));
	return new RegExp(`[\\\\/]node_modules[\\\\/](${names.join('|') || '@tiptap'})[\\\\/]`);
}

const tiptapDeps = tiptapDependencies();

let version = "0.5.0";

const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CompressionPlugin = require('compression-webpack-plugin');

/**
 * Two builds of the same sources, into web-dist:
 *
 * development: [name].min.js, for index.html and login.html;
 * production : [name].prod.min.js, for webview.html (Android), with the size report, report.html.
 *
 * Each build is split, for a smaller first download:
 *
 * portfolio, login: the pages' entries;
 * vendor-react, vendor-mui: React and MUI (with emotion), shared by the pages, as script tags in the html;
 * doctree, vendor-tiptap, vendor-katex: the doc-tree editor (semantic-doc), Tiptap with all its
 * dependencies (ProseMirror, ...) and KaTeX, loaded when the function page is opened, see app.tsx,
 * LazyDoctree. None of them is in portfolio or login.
 *
 * @param {'development' | 'production'} mode
 */
function config(mode) {
  let prod = mode === 'production';
  let min = prod ? 'prod.min.js' : 'min.js';

  return {
	mode,
	devtool: 'source-map',
	entry: { 'portfolio': './src/app.tsx',
			 'login'    : './src/login-admin.tsx'
			 // "admin": "./src/admin.tsx"
		   },

	output: {
	  filename: `[name].${min}`,
	  chunkFilename: `[name].${min}`,
	  path: path.resolve(__dirname, 'web-dist'),
	  library: 'album',
	  libraryTarget: 'umd'
	},

	plugins: prod
		? [new BundleAnalyzerPlugin({analyzerMode: 'static'}), new CompressionPlugin()]
		: [new CompressionPlugin()],

	optimization: {
		splitChunks: { cacheGroups: {
			default: false,
			defaultVendors: false,
			react: {
				test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
				name: 'vendor-react', chunks: 'initial', enforce: true, priority: 20 },
			mui: {
				test: /[\\/]node_modules[\\/](@mui|@emotion|@popperjs|stylis|react-transition-group)[\\/]/,
				name: 'vendor-mui', chunks: 'initial', enforce: true, priority: 10 },
			// of the doc-tree editor, loaded with chunk doctree
			tiptap: {
				test: (m) => tiptapDeps.test(m.resource || ''),
				name: 'vendor-tiptap', chunks: 'async', enforce: true, priority: 10 },
			katex: {
				test: /[\\/]node_modules[\\/]katex[\\/].*\.m?js$/,
				name: 'vendor-katex', chunks: 'async', enforce: true, priority: 10 },
		} }
	},

	watch: false,

	/** React is bundled (vendor-react): React 19 has no UMD builds for <script> tags. */

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
};
}

module.exports = [config('development'), config('production')];
