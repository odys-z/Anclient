 var path = require('path')
 var webpack = require('webpack')

 var v = 'development';
 var version = "0.9.32";

 module.exports = {
    mode: v, // "production" | "development" | "none"
    devtool: 'source-map',
    entry: { anreact: './lib/view/react/jcomponents.js',
    		anclient: './lib/anclient.js'},

    output: {
      filename: "[name]-" + version + ".min.js",

      path: path.resolve(__dirname, 'dist'),
      publicPath: "./dist/",

      library: 'anreact',
      libraryTarget: 'umd'
    },

	resolve: {
		extensions: ['*', '.js', '.jsx']
	},

	module: {
	  rules: [
		{   test: /\.jsx$/,
			loader: 'babel-loader',
			exclude: /node_modules/,
			options: {
			  presets: ['@babel/preset-react', '@babel/preset-env'] }
		},
		{test: /\.js$/, exclude: /node_modules/, loader: "babel-loader",
			options: { plugins: ['transform-vue-jsx'] }},
		{   test: /\.jsx$/,
			loader: 'babel-loader',
			exclude: /node_modules/,
			options: {
			  presets: ['@babel/preset-react', '@babel/preset-env'] }
		},
 		{test: /\.css$/,
		 use: [ 'style-loader',
				'css-loader',
			  ] }
	  ],
	}, // module
}
