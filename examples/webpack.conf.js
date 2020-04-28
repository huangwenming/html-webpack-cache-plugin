/*
 * @Author: huangwenming
 * @Date: 2020-04-21 14:56:46
 */
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const PreloadWebpackPlugin = require('preload-webpack-plugin');
const HtmlWebpackCachePlugin = require('./plugins/index.js');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    entry: {
        main: './src/main.js'
    },
    output: {
        path: path.resolve(__dirname, './dist/'),
        filename: '[name].[hash].js'
    },
    resolve: {
        extensions: ['.js', '.vue', '.json'],
        alias: {
            vue: 'vue/dist/vue.esm.js'
        }
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader']
            }
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: '[name].[hash].css',
            chunkFilename: '[name].[hash].css'
        }),
        new HtmlWebpackPlugin({
            template: './src/index.html',
            filename: 'demo.html'
        }),
        // 需要放置在HtmlWebpackPlugin后面，监听compilation.hooks.htmlWebpackPluginBeforeHtmlProcessing
        // PreloadWebpackPlugin的2.3版本 依赖HtmlWebpackPlugin的v3.2.0版本
        //
        // new PreloadWebpackPlugin({
        //     rel: 'preload'
        // }),
        // 需要放置在HtmlWebpackPlugin后面，监听compilation.hooks.htmlWebpackPluginAlterAssetTags
        // 兼容HtmlWebpackPlugin的v3 和 v4
        new HtmlWebpackCachePlugin({
            jsOmit: /(async-)|(chunk-)/,
            cssOmit: /(async-)|(chunk-)/,
            type: 'indexedDB',
            dbConf: {
                dbName: 'test',
                version: 1,
                storeName: 'cache',
                storeKey: 'path'
            }
        })
    ],
    optimization: {
        splitChunks: {
            cacheGroups: {
                vendor: {
                    name: 'vendor',
                    test: /vue|vuex|vue-router/,
                    chunks: 'initial',
                    priority: 10
                }
            }
        }
    }
};
