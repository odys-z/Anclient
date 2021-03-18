
var path = require('path')
var webpack = require('webpack')

var v = 'development';// "production" | "development" | "none"
var version = "1.0.0";

module.exports = {
    mode: v,
    devtool: 'source-map',
    entry: { "bar-chart": './bar-chart/app.js',
          },

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
        // npm install babel-plugin-syntax-jsx babel-plugin-transform-vue-jsx babel-helper-vue-jsx-merge-props babel-preset-env --save-dev
        { test: /test\*.js$/, exclude: /node_modules/,
          use: [ 'style-loader',
                'css-loader',
                'postcss-loader', ]
        } ]
    },
}
