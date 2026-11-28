let path = require('path')
let webpack = require('webpack')

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
 * A scope's packages and all they depend on, as installed with semantic-doc: the packages in
 * node_modules/<scope> and their dependencies, recursively. Peers (React, KaTeX) are not followed.
 * E.g. '@tiptap': Tiptap with ProseMirror, ...; '@puckeditor': Puck with dnd-kit, Radix, ...
 * @param {string} scope e.g. '@tiptap'
 * @returns {RegExp} matching the modules' paths
 */
function scopeDependencies(scope) {
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

	let dir = upwardModules(__dirname).map((m) => path.join(m, scope)).find((d) => fs.existsSync(d));
	if (dir)
		fs.readdirSync(dir).forEach((n) => walk(scope + '/' + n));

	let names = [...found].map((n) => n.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&').replace('\\/', '[\\\\/]'));
	return new RegExp(`[\\\\/]node_modules[\\\\/](${names.join('|') || scope})[\\\\/]`);
}

const tiptapDeps = scopeDependencies('@tiptap');
const puckDeps = scopeDependencies('@puckeditor');

let version = "0.5.0";

const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CompressionPlugin = require('compression-webpack-plugin');

/**
 * Writes the list of the files a build emits, web-dist/webpack-assets.json, one list for each build:
 *
 * { "type": "io.oz.srv.WebAssets", "development": ["login.min.js", "login.min.js.gz", ...], "production": [...] }
 *
 * The names are the build's own (entries, split chunks, .gz, .map, fonts), so nothing else repeats them:
 * jserv-album's tasks.py packs a listed file with a listed .gz as the .gz only, and html-service
 * (io.oz.srv.WebAssets, the type) unzips these when it starts. report.html isn't an emitted file.
 */
class AssetsListPlugin {
	apply(compiler) {
		compiler.hooks.done.tap('AssetsListPlugin', (stats) => {
			if (stats.hasErrors()) return;

			let file = path.join(compiler.options.output.path, 'webpack-assets.json');
			let list = {};
			try { list = JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { /* the first build */ }

			list.type = 'io.oz.srv.WebAssets';
			list[compiler.options.mode] = stats.compilation.getAssets().map((a) => a.name).sort();
			fs.writeFileSync(file, JSON.stringify(list, null, 2) + '\n');
		});
	}
}

/**
 * Two builds of the same sources, into web-dist:
 *
 * development: [name].min.js, for index.html and login.html;
 * production : [name].prod.min.js, for webview.html (Android), with the size report, report.html.
 *
 * The files of each build are listed in web-dist/webpack-assets.json, see AssetsListPlugin.
 *
 * Each build is split, for a smaller first download:
 *
 * portfolio, login: the pages' entries;
 * vendor-react, vendor-mui: React and MUI (with emotion), shared by the pages, as script tags in the html;
 * doctree, vendor-tiptap, vendor-katex: the doc-tree editor (semantic-doc), Tiptap with all its
 * dependencies (ProseMirror, ...) and KaTeX, loaded when the function page is opened, see app.tsx,
 * LazyDoctree;
 * story, vendor-puck: the story editor (semantic-doc/storytree), Puck with its dependencies and
 * its own lazy parts (but Tiptap, which Puck also uses: vendor-tiptap), see app.tsx, LazyStory.
 * None of them is in portfolio or login.
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
		? [new BundleAnalyzerPlugin({analyzerMode: 'static'}), new CompressionPlugin(), new AssetsListPlugin()]
		: [new CompressionPlugin(), new AssetsListPlugin()],

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
			// of the story editor, loaded with chunk story; Tiptap modules stay in vendor-tiptap (priority)
			puck: {
				test: (m) => puckDeps.test(m.resource || ''),
				name: 'vendor-puck', chunks: 'async', enforce: true, priority: 5 },
			katex: {
				test: /[\\/]node_modules[\\/]katex[\\/].*\.m?js$/,
				name: 'vendor-katex', chunks: 'async', enforce: true, priority: 10 },
		} }
	},

	watch: false,

	/** React is bundled (vendor-react): React 19 has no UMD builds for <script> tags. */

	resolve: {
		extensions: ['.*', '.ts', '.js', '.jsx', '.tsx'],
		// modules: upwardModules(__dirname),
		modules: ['node_modules', ...upwardModules(__dirname)]
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

/**
 * The viewer of published stories (semantic-doc/viewer): web-dist/_story/viewer.js, one file with
 * all it needs, React, Puck's Render, the blocks' widgets and css (style-loader), as a published
 * story's page (html-service, /pub/<story>/) loads nothing else: no split chunks, no lazy chunks
 * (LimitChunkCountPlugin). html-service copies web-dist/_story/ into /pub/_story/ when it starts
 * (semantic-doc, ResPathsTier). Not listed in webpack-assets.json: packed as it is.
 */
function viewer() {
  let base = config('production');
  return {
	...base,
	name: 'viewer',
	// no source map: _story/ is copied into the public pub folder, and the map would be most of it
	devtool: false,
	entry: { 'viewer': 'semantic-doc/viewer' },
	output: {
	  filename: '[name].js',
	  path: path.resolve(__dirname, 'web-dist', '_story'),
	},
	plugins: [new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 })],
	optimization: { splitChunks: false },
  };
}

module.exports = [config('development'), config('production'), viewer()];
