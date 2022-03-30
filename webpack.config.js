/* eslint-disable no-undef */
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackPwaManifest = require('webpack-pwa-manifest');
const CopyPlugin = require('copy-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const portFinderSync = require('portfinder-sync');
const port = portFinderSync.getPort(8080);
// load local .env file
require('dotenv').config({ path: '.env' });
const templateParameters = require(`./src/assets/${process.env.DEFAULT_LANG || 'en'}.json`);

module.exports = {
	mode: 'development',
	entry: {
		config: './src/assets/config.js',
		bundle: './src/main.js'
	},
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: '[name].js',
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
			templateParameters: templateParameters
		}),
		new WebpackPwaManifest({
			name: 'BayernAtlas',
			icons: [
				{ src: path.resolve('./src/assets/favicon/icon-192.png'), sizes: '192x192', destination: 'assets' },
				{ src: path.resolve('./src/assets/favicon/icon-512.png'), sizes: '512x512', destination: 'assets' }
			],
			publicPath: '/',
			filename: 'assets/manifest.json',
			fingerprints: false
		}),
		new CopyPlugin({
			patterns: [
				{ from: path.resolve(__dirname, './src/assets/favicon/favicon.ico'), to: path.join('assets') }
			]
		}),
		new Dotenv()
	],

	// OPTIONAL
	// Reload On File Change
	watch: false,
	devServer: {
		static: './dist',
		port: port
	},
	resolve: {
		fallback: {
			'https': false,
			'http': false,
			'buffer': false,
			'fs': false
		}
	}
};
