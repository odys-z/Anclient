let path = require('path')
let webpack = require('webpack')

// v is used in js code?
let v = 'development'; // "production" | "development" | "none"

let version = "0.4.3";

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
	  filename: "[name]-" + version + ".min.js",
	  path: path.resolve(__dirname, 'web-dist'),
	  library: 'album',
	  libraryTarget: 'umd'
	},

	plugins: [
		new BundleAnalyzerPlugin({analyzerMode: 'static'}), new CompressionPlugin()
	],

	watch: false,

	externals: {
		'react': 'React',
		'react-dom' : 'ReactDOM',

		/**
		 * <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/ag-grid-community/styles/ag-grid.min.css">
		 * <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/ag-grid-community/styles/ag-theme-alpine.min.css">
		 * <script src="https://cdn.jsdelivr.net/npm/ag-grid-community/dist/ag-grid-community.min.js"></script>
		 * <!-- If using ag-Grid Enterprise: -->
		 * <script src="https://cdn.jsdelivr.net/npm/ag-grid-enterprise/dist/ag-grid-enterprise.min.js"></script>
		 */
		'ag-grid-community': 'agGrid',
	},

	resolve: {
		extensions: ['.*', '.ts', '.js', '.jsx', '.tsx']
	},

	module: {
		rules: [
		{   test: /\.jsx?$/,
			loader: 'babel-loader',
			options: {
			  presets: ['@babel/preset-react', '@babel/preset-env'] }
		},
		{ test: /\.tsx?$/,
		  loader : 'babel-loader',
		  options: { presets: [
				'@babel/preset-react',
				'@babel/preset-typescript',
				'@emotion/babel-preset-css-prop',
				'@babel/preset-env' ] }
		},
		{   test: /\.css$/,
			use : ["style-loader", "css-loader"]
		},
		{   test: /\.svg$/,
			use : [ { loader: "babel-loader" },
					{ loader: "react-svg-loader" } ]
		} ]
	},
}
