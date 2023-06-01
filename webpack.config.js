/* eslint-disable no-undef */
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const portFinderSync = require('portfinder-sync');
const port = portFinderSync.getPort(8080);
// load local .env file
require('dotenv').config({ path: '.env' });
const standaloneMode = !process.env.BACKEND_URL;
const templateParameters = standaloneMode
	? require(`./src/assets/standalone.json`)
	: require(`./src/assets/${process.env.DEFAULT_LANG || 'en'}.json`);

const plugins = [
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
	new Dotenv()
];

if (!standaloneMode) {
	plugins.push(
		new CopyPlugin({
			patterns: [
				{ from: path.resolve(__dirname, './src/assets/favicon/manifest.json'), to: path.join('assets') },
				{ from: path.resolve(__dirname, './src/assets/favicon/favicon.ico'), to: path.join('assets') },
				{ from: path.resolve(__dirname, './src/assets/favicon/icon_192x192.png'), to: path.join('assets') },
				{ from: path.resolve(__dirname, './src/assets/favicon/icon_512x512.png'), to: path.join('assets') },
				{ from: path.resolve(__dirname, './src/assets/favicon/icon.svg'), to: path.join('assets') },
				{ from: path.resolve(__dirname, './src/assets/favicon/apple-touch-icon.png'), to: path.join('assets') }
			]
		})
	);
}

module.exports = {
	mode: 'development',
	entry: {
		config: './src/assets/config.js',
		bundle: './src/main.js',
		embed: './src/embed.js'
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
	plugins: plugins,

	// OPTIONAL
	// Reload On File Change
	devServer: {
		static: './dist',
		port: port
	},
	resolve: {
		fallback: {
			https: false,
			http: false,
			buffer: false,
			fs: false
		}
	}
};
