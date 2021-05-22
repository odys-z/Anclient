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
   entry: {anvue: './lib/view/vue/jcomponents.js', anclient: './lib/anclient.js'},

   output: {
     filename: "[name]-" + version + ".min.js",

     path: path.resolve(__dirname, 'dist'),
     publicPath: "./dist/",

     library: 'jvue',
     libraryTarget: 'umd'
   },

   plugins: [
     new VueLoaderPlugin(),
     new MiniCssExtractPlugin({ filename: "vue-sidebar-menu.css" })
   ],

   module: {
 	rules: [
		// npm install babel-plugin-syntax-jsx babel-plugin-transform-vue-jsx babel-helper-vue-jsx-merge-props babel-preset-env --save-dev
		{test: /\.js$/, exclude: /node_modules/, loader: "babel-loader",
			options: { plugins: ['transform-vue-jsx'] }},
 		{test: /\.css$/,
		 use: [ 'style-loader',
				'css-loader',
				'postcss-loader',
			  ] },
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
