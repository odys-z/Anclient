
var path = require('path')
var webpack = require('webpack')

var v = 'development';// "production" | "development" | "none"
var version = "1.0.0";

module.exports = {
    mode: v,
    devtool: 'source-map',
    entry: { "bar-chart": './bar-chart/app.js',
 			 "cube-chart": './cube-chart/app.js'},

    output: {
      filename: "[name].min.js",

      path: path.resolve(__dirname, 'dist'),
      publicPath: "./dist/",

      libraryTarget: 'umd'
    },

    plugins: [ ],

    externals: { xv: 'xv' },

    module: {
      rules: [
        { test: /test\*.js$/, exclude: /node_modules/,
          use: [ 'style-loader',
                'css-loader',
                'postcss-loader', ]
        } ]
    },
}
