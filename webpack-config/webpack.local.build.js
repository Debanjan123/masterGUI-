var webpack = require('webpack');
var webpackMerge = require('webpack-merge');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var ZipPlugin = require('zip-webpack-plugin');
var commonConfig = require('./webpack.common.js');
var helpers = require('./helpers');

const ENV = process.env.NODE_ENV = process.env.ENV = 'local';
const SERVICE_BASE_URL = process.env.SERVICE_BASE_URL = process.env.SERVICE_BASE_URL = '/';

module.exports = webpackMerge(commonConfig, {
  devtool: 'source-map',

  output: {
    path: helpers.root('../dist/public'),
    publicPath: '',
    filename: '[name]/[name].[hash].js',
    chunkFilename: 'sub-app/[name]/[id].[hash].sub-app.js'
  },

  htmlLoader: {
    minimize: false 
  },

  plugins: [
    new webpack.NoErrorsPlugin(),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin({ 
      mangle: {
        keep_fnames: true
      },
      sourceMap:false // make it true to do production debug easy.
    }),
    new ExtractTextPlugin('[name].[hash].css'),
    new webpack.DefinePlugin({
      'process.env': {
        'ENV': JSON.stringify(ENV),
        'SERVICE_BASE_URL': JSON.stringify(SERVICE_BASE_URL)
      }
    }),
    new CopyWebpackPlugin(
      [
        { from: 'assets', to:'assets' },
        { from: 'error', to:'error' }
      ],
      {
        ignore:[{
          dot:true
        }]
      }
    ),
    new ZipPlugin({
       path: '../site', 
       filename: 'Local-site' + new Date().getTime() + '.zip'
    })
  ]
});