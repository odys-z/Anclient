let path = require('path');

// "production" | "development" | "none"
let mode = process.env.NODE_ENV === 'production' ? 'production' : 'development';

module.exports = {
	mode,
	devtool: 'source-map',
	entry: {
		'registry.anclient': './src/app.tsx',
		'login'   : './src/login-app.tsx',
	},

	output: {
		filename: '[name].min.js',
		path: path.resolve(__dirname, 'web-dist'),
		library: 'registier',
		libraryTarget: 'umd'
	},

	plugins: [ ],

	resolve: {
		extensions: ['.ts', '.tsx', '.js', '.jsx']
	},

	module: {
		rules: [
		{ test: /\.jsx?$/,
		  exclude: /node_modules/,
		  loader: 'babel-loader',
		  options: { presets: ['@babel/preset-react', '@babel/preset-env'] }
		},
		{ test: /\.tsx?$/,
		  loader : 'babel-loader',
		  options: { presets: [
				'@babel/preset-react',
				'@babel/preset-typescript',
				'@emotion/babel-preset-css-prop',
				'@babel/preset-env' ] }
		},
		{ test: /\.css$/,
		  use : ['style-loader', 'css-loader']
		} ]
	}
}
