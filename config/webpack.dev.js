const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const commonConfig = require('./webpack.common.js');

module.exports = webpackMerge(commonConfig, {
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
          https: {
            key: fs.readFileSync('./certs/server.key'),
            cert: fs.readFileSync('./certs/server.crt'),
            cacert: fs.readFileSync('./certs/ca.crt')
        },
        historyApiFallback: true,
	allowedHosts: [
            '.amazonaws.com'
        ]
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin()
    ]
});
