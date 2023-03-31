/** Configuration for test with Mocha.
 * npm test
 */
var webpack = require('webpack');
var nodeExternals = require('webpack-node-externals');

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
	extensions: ['*', '.ts', '.js']
  },

  module: {
	rules: [
		{   test: /\.js$/,
			loader: 'babel-loader',
			options: {
			  // presets: ['@babel/preset-react', '@babel/preset-env']
		  }
		},
		{ test: /\.ts$/,
		  loader : 'babel-loader',
		  options: { presets: [
				'@babel/preset-typescript',
				'@babel/preset-env'
			] }
		}
	]
  }
};


module.exports = config;
