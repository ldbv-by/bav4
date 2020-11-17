/* eslint-disable no-undef */
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	entry: './src/main.js',
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'bundle.js',
	},
	module: {
		rules: [
			{
				test: /\.css$/i,
				use: [
					'css-loader'
				],
			},
			{
				test: /\.svg$/,
				use: 'svg-url-loader',
			}
		],
	},
	devtool: 'inline-source-map',
	plugins: [
		new HtmlWebpackPlugin({
			template: 'src/index.html',
		})
	],

	// OPTIONAL
	// Reload On File Change
	watch: false,
	devServer: {
		contentBase: './dist',
	},
};