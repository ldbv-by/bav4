/* eslint-disable no-undef */
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const Dotenv = require('dotenv-webpack');

module.exports = {
	mode: 'development',
	entry: './src/main.js',
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'bundle.js',
	},
	module: {
		rules: [
			{
				test: /\.css$/,
				use: [
					'to-string-loader',
					{
						loader: 'css-loader',
						options: {
							esModule: false,
						},
					},
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
		}),
		new Dotenv()
	],

	// OPTIONAL
	// Reload On File Change
	watch: false,
	devServer: {
		contentBase: './dist',
	},
};