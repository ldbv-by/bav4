const path = require('path');
const webpack = require('webpack');
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

const hashFilenames = !(process.env.HASH_FILENAMES === 'false');
const cesiumSource = 'node_modules/cesium/Build/Cesium';
const cesiumBaseUrl = 'cesiumStatic';

module.exports = {
	mode: 'development',
	entry: {
		config: './src/assets/config.js',
		bundle: './src/main.js',
		globe: '/src/globe.js',
		embed: './src/embed.js',
		admin: './src/admin.js',
		wc: './src/wc.js'
	},
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: hashFilenames ? '[name].[contenthash].js' : '[name].js',
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
			filename: 'globe.html',
			template: 'src/globe.html',
			templateParameters: templateParameters,
			chunks: ['config', 'globe']
		}),
		new HtmlWebpackPlugin({
			filename: 'embed.html',
			template: 'src/embed.html',
			templateParameters: templateParameters,
			chunks: ['config', 'embed']
		}),
		new HtmlWebpackPlugin({
			filename: 'admin.html',
			template: 'src/admin.html',
			templateParameters: templateParameters,
			chunks: ['config', 'admin']
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
		new CopyPlugin({
			patterns: [
				{
					from: require.resolve('maplibre-gl/dist/maplibre-gl-worker.mjs'),
					to: 'maplibre-gl-worker.mjs',
					info: { minimized: true }
				},
				{
					from: require.resolve('maplibre-gl/dist/maplibre-gl-shared.mjs'),
					to: 'maplibre-gl-shared.mjs',
					info: { minimized: true }
				}
			]
		}),
		new CopyPlugin({
			patterns: [
				{
					from: path.join(cesiumSource, 'Workers'),
					to: `${cesiumBaseUrl}/Workers`
				},
				{
					from: path.join(cesiumSource, 'ThirdParty'),
					to: `${cesiumBaseUrl}/ThirdParty`
				},
				{
					from: path.join(cesiumSource, 'Assets'),
					to: `${cesiumBaseUrl}/Assets`
				},
				{
					from: path.join(cesiumSource, 'Widgets'),
					to: `${cesiumBaseUrl}/Widgets`
				}
			]
		}),
		new webpack.DefinePlugin({
			// Define relative base path in cesium for loading assets
			CESIUM_BASE_URL: JSON.stringify(cesiumBaseUrl)
		}),
		new Dotenv()
	],
	ignoreWarnings: [
		// Suppress Critical dependency warning for maplibre-gl
		{
			module: /node_modules\/maplibre-gl/,
			message: /the request of a dependency is an expression/
		}
	],
	devServer: {
		static: './dist',
		port: port,
		client: {
			overlay: {
				runtimeErrors: true /** set to `false` if errors should be caught by the app instead */
			}
		},
		headers: hashFilenames
			? {}
			: {
					'Access-Control-Allow-Origin': '*' /** when developing against the web component we have to enable CORS */
				}
	},
	resolve: {
		alias: {
			'@chunk': path.resolve(__dirname, './src/chunks'),
			'@src': path.resolve(__dirname, './src')
		},
		fallback: {
			https: false,
			http: false,
			buffer: false,
			fs: false
		}
	}
};
