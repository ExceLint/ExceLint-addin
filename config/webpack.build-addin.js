// This config files bundles all the files and places them in the /addin-dist directory
// that is served by Github Pages

const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const { merge } = require('webpack-merge');
const commonConfig = require('./webpack.common.js');

module.exports = async (env, options) => {
    const config = merge(commonConfig, {
    devtool: 'eval-source-map',

    output: {
     filename: '[name].bundle.js',
     path: path.resolve(__dirname, '../addin-dist')
      },
    plugins: [
        new webpack.HotModuleReplacementPlugin()
    ]});
    return config;
}
