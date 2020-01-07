var webpack = require('webpack');
var webpackMerge = require('webpack-merge');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var ZipPlugin = require('zip-webpack-plugin');
var commonConfig = require('./webpack.common.js');
var helpers = require('./helpers');

const ENV = process.env.NODE_ENV = process.env.ENV = 'production';
const SERVICE_BASE_URL = process.env.SERVICE_BASE_URL = process.env.SERVICE_BASE_URL = 'https://item-master-app-service.shs-core.com/HSPartItemMasterAppService';
const CLIENT_SECRET = process.env.CLIENT_SECRET = 'Lkd1!@#e21r12';
const CLIENT_CODE = process.env.CLIENT_CODE = 'ItemMasterGUI';


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
        'SERVICE_BASE_URL': JSON.stringify(SERVICE_BASE_URL),
        'CLIENT_SECRET' : JSON.stringify(CLIENT_SECRET),
        'CLIENT_CODE' : JSON.stringify(CLIENT_CODE)
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
       filename: 'Production-site' + new Date().getTime() + '.zip'
    })
  ]
});