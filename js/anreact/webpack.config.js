var path = require('path')
var webpack = require('webpack')

var v = 'development';
var version = "1.0.0";

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
      'react': 'react',
      'react-dom' : 'reactDOM',
      "@material-ui/core": "MaterialUI",
    },

	plugins: [
	],

	resolve: {
		extensions: ['*', '.ts', '.js', '.tsx', '.jsx']
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
