var path = require('path')
var webpack = require('webpack')

var v = 'development';// "production" | "development" | "none"
var version = "1.0.0";

module.exports = {
	mode: v,
	devtool: 'source-map',
	entry: { 'quiz': './src/app/Quizlist.js' },


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
		{   test: /\.jsx?$/,
			loader: 'babel-loader',
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
