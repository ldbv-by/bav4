/* eslint-disable no-undef */
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const portFinderSync = require('portfinder-sync');
const port = portFinderSync.getPort(8080);
// load local .env file
require('dotenv').config({ path: '.env' });
const templateParameters = process.env.BACKEND_URL
	? require(`./src/assets/${process.env.DEFAULT_LANG || 'en'}.json`)
	: require(`./src/assets/standalone.json`);

module.exports = {
	mode: 'development',
	entry: {
		config: './src/assets/config.js',
		bundle: './src/main.js',
		embed: './src/embed.js',
		wc: './src/wc.js'
	},
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: '[name].[contenthash].js',
		clean: true
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
							esModule: false
						}
					}
				]
			},
			{
				test: /\.(woff2|svg|webp|png)$/,
				type: 'asset/inline'
			}
		]
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: 'src/index.html',
			templateParameters: templateParameters,
			chunks: ['config', 'bundle']
		}),
		new HtmlWebpackPlugin({
			filename: 'embed.html',
			template: 'src/embed.html',
			templateParameters: templateParameters,
			chunks: ['config', 'embed']
		}),
		new HtmlWebpackPlugin({
			filename: 'embed/wrapper/index.html',
			template: 'src/embedWrapper.html',
			chunks: []
		}),
		new HtmlWebpackPlugin({
			filename: 'wc/wrapper/index.html',
			template: 'src/wcWrapper.html',
			chunks: []
		}),
		new CopyPlugin({
			patterns: [{ from: path.resolve(__dirname, './src/assets/favicon'), to: path.join('assets') }]
		}),
		new Dotenv()
	],
	devServer: {
		static: './dist',
		port: port,
		client: {
			overlay: {
				runtimeErrors: true /** set to `false` if errors should be caught by the app instead */
			}
		}
	},
	resolve: {
		alias: {
			'@chunk': path.resolve(__dirname, './src/chunks')
		},
		fallback: {
			https: false,
			http: false,
			buffer: false,
			fs: false
		}
	}
};
