let path = require('path')
let webpack = require('webpack')

let v = 'development'; // "production" | "development" | "none"
let version = "0.4.44";

module.exports = {
	mode: v,
	devtool: 'source-map',
	entry: {"Album": "./src/app.tsx",
			"Admin": "./src/admin.tsx" },

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
}
