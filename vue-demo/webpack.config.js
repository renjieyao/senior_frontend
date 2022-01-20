const VueLoaderPlugin = require('vue-loader/lib/plugin');
const webpack = require('webpack'); // 用于访问内置插件
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
    entry: './src/main.js',
    module: {
        rules: [
            { test: /\.vue$/, use: 'vue-loader' },
            // this will apply to both plain `.css` files
            // AND `<style>` blocks in `.vue` files
            {
                test: /\.css$/,
                use: [
                    'vue-style-loader',
                    'css-loader'
                ]
            }
        ],
    },
    plugins: [
        new VueLoaderPlugin(),
        new CopyPlugin({
            patterns: [
                { from: "src/*.html", to: "[name].[ext]" }, 
            ],
        }),
    ],
};