/**TODO We should separate this file into two files, one for basic semantics config,
 * one for the vue layer. */
 var path = require('path')
 var webpack = require('webpack')

 const VueLoaderPlugin = require('vue-loader/lib/plugin')
 const MiniCssExtractPlugin = require('mini-css-extract-plugin')

 var v = 'development';
 var version = "0.9.5";

 module.exports = {
   mode: v, // "production" | "development" | "none"
   devtool: 'source-map',
   entry: {japp: './test/vue/index.js'},

   output: {
     filename: "[name]-" + version + ".min.js",

     path: path.resolve(__dirname, 'dist'),
     publicPath: "./dist/",

     library: 'japp',
     libraryTarget: 'umd'
   },

   plugins: [
     new VueLoaderPlugin(),
     new MiniCssExtractPlugin({ filename: "vue-sidebar-menu.css" })
   ],

   module: {
 	rules: [
 		{test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" },
 		{test: /\.css$/,
		 use: [ 'style-loader',
				'css-loader',
				'postcss-loader',
			  ] },
 		// npm install --save-dev mini-css-extract-plugin
 		// npm install postcss-loader --save-dev
 		// npm install sass-loader --save-dev
 		// npm install npm-sass
 		{test: /\.scss$/,
 		 use: [ 'vue-style-loader',
 				'css-loader',
 				'postcss-loader',
 				'sass-loader'
 		 	  ]},
 		{test: /\.vue$/, loader: ["vue-loader"] },
	],
  }, // module
}
