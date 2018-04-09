const path = require("path");
const webpack = require("webpack");
//filename hashing - only needed because was seeing the same bundle coming out in the filesystem even after code changes
const CleanWebpackPlugin = require('clean-webpack-plugin');

/* Note: bundle file has to be output with extension .gs, prevents webpack from rewriting all the function mames */

module.exports = {
  entry: [path.join(__dirname, 'src/include-in-webpack.js')],
  module: {
    rules: [{
      exclude: /node_modules/,
      test: /\.js$/,
      use: { loader: 'babel-loader' },
    }],
  },
  output: {
    filename: 'CombinedWebpackCode.[hash].gs',
    libraryTarget: 'this',
    path: path.join(__dirname, 'dist'),
  },
  resolve: {
    extensions: ['.js'],
    modules: [
      path.join(__dirname, 'src'),
      path.join(__dirname, 'node_modules'),
    ],
  }
};