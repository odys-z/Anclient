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

    externals: {
        // Use external version of React
        "react": {
            "commonjs": "react",
            "commonjs2": "react",
            "amd": "react",
            "root": "React"
        },
        "react-dom": {
            "commonjs": "react-dom",
            "commonjs2": "react-dom",
            "amd": "react-dom",
            "root": "ReactDOM"
        }
    },

	plugins: [ ],

	resolve: {
		extensions: ['*', '.js', '.jsx'],
		alias: { react: path.resolve('../node_modules/react') }
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
