const path = require("path");
const webpack = require("webpack");

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
    filename: 'CombinedWebpackCode.gs',
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