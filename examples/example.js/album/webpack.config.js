var path = require('path')
var webpack = require('webpack')

var v = 'development';// "production" | "development" | "none"
var version = "1.0.0";

module.exports = {
	mode: v,
	devtool: 'source-map',
	entry: { 'Album': './src/app.tsx' },

	output: {
	  filename: "[name]-" + version + ".min.js",
	  path: path.resolve(__dirname, 'dist'),
	  library: 'album',
	  libraryTarget: 'umd'
	},

	plugins: [ ],

	resolve: {
		extensions: ['*', '.ts', '.js', '.jsx', '.tsx']
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

	// resolve: {
	// 	alias: {
	// 	  'react-photo-gallery': path.resolve(__dirname, './react-photo-gallery/src/Gallery'),
	// 	}
	// },
}
