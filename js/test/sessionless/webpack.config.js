var path = require('path')
var webpack = require('webpack')

var v = 'development';// "production" | "development" | "none"
var version = "1.0.0";

module.exports = {
	mode: v,
	devtool: 'source-map',
	entry: {'AnHome': './src/less-app.jsx' },

	// watchOptions: {
	// 	ignored: '**/node_modules/**',
	//   },

	output: {
	  filename: "[name]-" + version + ".min.js",
	  path: path.resolve(__dirname, 'dist'),
	  library: 'less',
	  libraryTarget: 'umd'
	},

	plugins: [ ],

	resolve: {
		extensions: ['*', '.js', '.jsx', '.tsx']
	},

	module: {
		rules: [
		{   test: /\.jsx$/,
			loader: 'babel-loader',
			options: {
			  presets: ['@babel/preset-react', '@babel/preset-env'] }
		},
		{ test: /\.tsx$/,
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
