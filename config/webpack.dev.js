const devCerts = require("office-addin-dev-certs");
const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const commonConfig = require('./webpack.common.js');

module.exports = async(env, options) => {
    return webpackMerge(commonConfig, {
    devtool: 'eval-source-map',
    devServer: {
        publicPath: '/',
        contentBase: path.resolve('dist'),
        hot: true,
        compress: true,
        overlay: {
            warnings: false,
            errors: true
        },
        port: 3000,
	https: await devCerts.getHttpsServerOptions(),
        historyApiFallback: true
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin()
    ]
    });
}
