/** Configuration for test with Mocha.
 * npm test
 */
// import * as webpack from 'webpack';

var config = {
  mode: 'development',
  entry: './test/all-jsunits.js',
  output: {
    filename: 'testBundle.js'
  },
  target: 'node',

  plugins: [ ],

	resolve: {
		extensions: ['.*', '.ts', '.js', '.tsx', '.jsx']
	},

	module: {
	  rules: [
		{ test: /\.jsx?$/,
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
	] }
};

module.exports = config;
// export default config;
