const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require("webpack");

module.exports = async (env, options) => {
    const config = {
	devtool: 'source-map',
    entry: {
        app: './src/index.ts',
        'function-file': './function-file/function-file.ts'
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.html', '.js']
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: 'ts-loader'
            },
            {
                test: /\.html$/,
                exclude: /node_modules/,
                use: 'html-loader'
            },
            {
                test: /\.(png|jpg|jpeg|gif)$/,
                use: 'file-loader'
            }
        ]
    },
    devServer: {
      headers: {
        "Access-Control-Allow-Origin": "*"
      },
      port: 3000
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './index.html',
            chunks: ['app']
        }),
        new HtmlWebpackPlugin({
            template: './function-file/function-file.html',
            filename: 'function-file/function-file.html',
            chunks: ['function-file']
        }),
        new webpack.ProvidePlugin({
            Promise: ["es6-promise", "Promise"]
        })
    ]
    };

    return config;
};

