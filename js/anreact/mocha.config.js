/** Configuration for test with Mocha.
 * npm test
 */
var webpack = require('webpack');
var nodeExternals = require('webpack-node-externals');
var WebpackShellPlugin = require('webpack-shell-plugin');


var config = {
  mode: 'development',
  entry: './test/all-jsunits.js',
  output: {
    filename: 'testBundle.js'
  },
  target: 'node',
  externals: [nodeExternals()],

  plugins: [ ],

  resolve: {
	extensions: ['*', '.js', '.jsx', '.tsx']
  },

  module: {
	rules: [
		{   test: /\.jsx?$/,
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
 		{ test: /\.css$/,
		  use: [ 'style-loader',
				'css-loader',
			  ] }
	]
  }
};

module.exports = config;
