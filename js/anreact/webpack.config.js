import path from 'path';
const __dirname = path.resolve();

// for mime-types, which depends on path, see #50
// #50 https://github.com/jshttp/mime-types/issues/50#issuecomment-442916069
// #60 https://github.com/jshttp/mime-types/issues/69
// #77 https://github.com/jshttp/mime-types/issues/77
// hack it?
// import nodeExternals from 'webpack-node-externals';

var v = 'development';
var version = "1.0.0";

export default {
    mode: v, // "production" | "development" | "none"
    devtool: 'source-map',
    entry: { anreact: './src/an-components.ts' },

    output: {
      filename: "[name]-" + version + ".min.js",

      path: path.resolve(__dirname, '../dist'),
      publicPath: "../dist/",

      library: 'an-react',
      libraryTarget: 'umd'
    },

    // externals: Object.assign(
    //   nodeExternals(), {
    externals: {
      'react': 'react',
      'react-dom' : 'reactDOM',
      "@material-ui/core": "MaterialUI",
    },

	plugins: [
	],

	resolve: {
		extensions: ['*', '.ts', '.js', '.tsx', '.jsx']
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
		{ test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" },
 		{ test: /\.css$/,
		  use: [ 'style-loader',
				'css-loader',
			  ] }
	  ]
	}
}
