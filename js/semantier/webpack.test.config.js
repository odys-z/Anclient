/** Webpack config for running/debugging tests in a browser page.
 * Mirrors mocha.config.js, but targets the browser (so nothing is left
 * external - chai, and everything protocol.ts pulls in, gets bundled in)
 * and enables source maps that map cleanly back to the original .ts for
 * devtools breakpoints.
 *
 * npm run test:browser:build
 */
var config = {
  mode: 'development',
  devtool: 'eval-source-map',
  entry: './test/browser-entry.ts',
  output: {
    filename: 'testBundle.browser.js',
    path: __dirname + '/test/dist/browser'
  },
  target: 'web',

  plugins: [ ],

  resolve: {
	preferRelative: true,
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
