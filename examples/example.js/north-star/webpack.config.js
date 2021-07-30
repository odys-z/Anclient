var path = require('path')
var webpack = require('webpack')

var v = 'development';// "production" | "development" | "none"
var version = "0.1.0";

module.exports = {
	mode: v,
	devtool: 'source-map',
	entry: { 'north': './src/north-app.jsx' },

	output: {
	  filename: "[name]-" + version + ".min.js",

	  path: path.resolve(__dirname, 'dist'),
	  publicPath: "./dist/",

	  libraryTarget: 'umd'
	},

	plugins: [ ],

	resolve: {
		extensions: ['*', '.js', '.jsx']
	},
	module: {
		rules: [
		{   test: /\.jsx$/,
			loader: 'babel-loader',
			exclude: /node_modules/,
			options: {
			  presets: ['@babel/preset-react', '@babel/preset-env'] }
		},
		{   test: /\.js$/,
			loader: 'babel-loader',
			exclude: /node_modules/,
			options: {
			  presets: ['@babel/preset-react', '@babel/preset-env'] }
		},
		{   test: /\.css$/,
			use: ["style-loader", "css-loader"]
		},
		{   test: /\.svg$/,
			use: [  { loader: "babel-loader" },
					{ loader: "react-svg-loader" } ]
		} ]
	}
}
