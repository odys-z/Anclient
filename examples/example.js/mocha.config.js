/** Configuration for test with Mocha.
 * For basic example (tutorial), see <a href='https://github.com/odys-z/hello/blob/master/mocha/README.md'>
 * his Hello/Mocha repository</a>
 * This is configured for testing without Node server:<pre>
	npm run build
	npm test</pre>
 */
var webpack = require('webpack');
var nodeExternals = require('webpack-node-externals');
// var WebpackShellPlugin = require('webpack-shell-plugin');

var config = {
  mode: 'development',
  entry: ['./react-quiz/test/all-jsunits.js'],
  output: {
    filename: 'testBundle.js'
  },
  target: 'node',
  externals: [nodeExternals()],

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
