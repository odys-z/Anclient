var path = require('path')
var webpack = require('webpack')

var v = 'development';// "production" | "development" | "none"
var version = "1.1.1";

// const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

module.exports = {
	mode: v,
	devtool: 'source-map',
	entry: {// 'home': './src/less-app.tsx',
			// 'widgets': './src/less-widgets.tsx',
			'doctree': './src/less-widgets-treegrid.tsx',
			'docview': './src/less-widgets-docview.tsx',
			// 'sheet': './src/workbook/sheet-app.tsx'
		},
	
	externals: {
		'react': 'React',
		'react-dom': 'ReactDOM',
  
		/**
		 * <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/ag-grid-community/styles/ag-grid.min.css">
		 * <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/ag-grid-community/styles/ag-theme-alpine.min.css">
		 * <script src="https://cdn.jsdelivr.net/npm/ag-grid-community/dist/ag-grid-community.min.js"></script>
		 * <!-- If using ag-Grid Enterprise: -->
		 * <script src="https://cdn.jsdelivr.net/npm/ag-grid-enterprise/dist/ag-grid-enterprise.min.js"></script>
		 */
		'ag-grid-community': 'agGrid'
	},

	output: {
	  filename: "[name]-" + version + ".min.js",
	  path: path.resolve(__dirname, 'dist'),
	  library: 'less',
	  libraryTarget: 'umd'
	},

	plugins: [
		// new webpack.ProvidePlugin({ process: 'process/browser', Buffer: ['buffer', 'Buffer']}),
		// new NodePolyfillPlugin()
	],

	resolve: {
		extensions: ['.ts', '.js', '.jsx', '.tsx'],
		// fallback: {
		// 	"process": require.resolve('process/browser'),
		// 	"stream": require.resolve("stream-browserify"),
		// 	"crypto": require.resolve("crypto-browserify"),
		// 	"buffer": require.resolve("buffer/"),
		// 	"util": require.resolve("util/"),
		// 	"vm": require.resolve("vm-browserify")
		//  },
	},

	module: {
		rules: [
		{ test: /\.jsx?$/,
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
	}
}
