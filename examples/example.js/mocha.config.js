/** Configuration for test with Mocha.
 */
var webpack = require('webpack');
// var nodeExternals = require('webpack-node-externals');
// var WebpackShellPlugin = require('webpack-shell-plugin');

var config = {
  mode: 'development',
  entry: ['./test/all-jsunits.js'],
  output: {
    filename: 'testBundle.js'
  },
  target: 'node',
  // externals: [nodeExternals()],

  resolve: {
    fallback: { fs: false },
	extensions: ['*', '.js', '.jsx']
  },
  module: {
	rules: [
	{   test: /\.js$/,
		loader: 'babel-loader',
		exclude: /node_modules/,
		options: { presets: ['@babel/preset-react', '@babel/preset-env'] }
	}
	]
  }
};

module.exports = config;
