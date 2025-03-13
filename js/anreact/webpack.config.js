var path = require('path')
var webpack = require('webpack')

var v = 'development';
var version = "1.1.0";

const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CompressionPlugin = require('compression-webpack-plugin');

module.exports = {
    mode: v, // "production" | "development" | "none"
    devtool: 'source-map',
    entry: { anreact: './src/an-components.ts' },

    output: {
      filename: "[name]-" + version + ".min.js",

      path: path.resolve(__dirname, '../dist'),
      publicPath: "../dist/",

      library: 'an-react',
      libraryTarget: 'umd'
    },

	externals: {
      'react': 'React',
      'react-dom' : 'ReactDOM',
    //  '@material-ui/core': 'MaterialUI',
    //   '@material-ui/core': {
	// 	root: "MaterialUI",
    //     commonjs: "@material-ui/core",
    //     commonjs2: "@material-ui/core",
    //     amd: "@material-ui/core"},

	  /**
	   * <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/ag-grid-community/styles/ag-grid.min.css">
	   * <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/ag-grid-community/styles/ag-theme-alpine.min.css">
	   * <script src="https://cdn.jsdelivr.net/npm/ag-grid-community/dist/ag-grid-community.min.js"></script>
	   * <!-- If using ag-Grid Enterprise: -->
	   * <script src="https://cdn.jsdelivr.net/npm/ag-grid-enterprise/dist/ag-grid-enterprise.min.js"></script>
	   */
	  'ag-grid-community': 'agGrid',
	  // 'jquery': 'jQuery'
    },

	plugins: [
		new BundleAnalyzerPlugin(), new CompressionPlugin()
	],

	resolve: {
		extensions: ['.*', '.ts', '.js', '.tsx', '.jsx']
	},

	module: {
	  rules: [
		{ test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" },
		{ test: /\.jsx?$/,
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
		  use: [ 'style-loader',
				'css-loader',
			  ] }
	  ]
	}
}
