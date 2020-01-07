var webpack = require('webpack');
var webpackMerge = require('webpack-merge');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var commonConfig = require('./webpack.common.js');
var helpers = require('./helpers');

const ENV = process.env.NODE_ENV = process.env.ENV = 'local';
const SERVICE_BASE_URL = process.env.SERVICE_BASE_URL = 'http://itemmasterappservice-dev2.us-east-1.elasticbeanstalk.com/HSPartItemMasterAppService';
// const SERVICE_BASE_URL = process.env.SERVICE_BASE_URL = 'http://itemmasterappservice-qa.us-east-1.elasticbeanstalk.com/HSPartItemMasterAppService';
const CLIENT_SECRET = process.env.CLIENT_SECRET = 'Kkq21!#1Asd1';
const CLIENT_CODE = process.env.CLIENT_CODE = 'ItemMasterGUI';

module.exports = webpackMerge(commonConfig, {
  devtool: 'cheap-module-eval-source-map',

  output: {
    path: helpers.root('dist'),
    publicPath: 'http://localhost:9095/',
    filename: '[name]/[name].js',
    chunkFilename: 'sub-app/[name]/[id].sub-app.js'
  },

  plugins: [
    new ExtractTextPlugin('[name].css'),
    new webpack.DefinePlugin({
      'process.env': {
        'ENV': JSON.stringify(ENV),
        'SERVICE_BASE_URL': JSON.stringify(SERVICE_BASE_URL),
        'CLIENT_SECRET' : JSON.stringify(CLIENT_SECRET),
        'CLIENT_CODE' : JSON.stringify(CLIENT_CODE),
      }
    })
  ],

  devServer: {
    historyApiFallback: true,
    stats: 'minimal'
  }
});