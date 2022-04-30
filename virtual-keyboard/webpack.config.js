const webpack = require('webpack');
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = (env, options) => {
  const isProduction = options.mode === 'production';

  const config = {
    mode: isProduction ? 'production' : 'development',
    devtool: /* isProduction ? 'none' :  */'source-map',
    watch: !isProduction,
    entry: './src/index.js',
    output: {
      path: path.join(__dirname, '/dist'),
      filename: 'script.js',
    },

    module: {
      rules: [
        {
          test: /\.css$/i,
          use: ["style-loader", "css-loader"],
        }
      ]
    },

    plugins: [
      new CleanWebpackPlugin(),
    ]
  }

  return config;
}