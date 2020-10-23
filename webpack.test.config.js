const path = require('path');

module.exports = {
	mode: 'development',
	devtool: 'inline-source-map',
	module: {
		rules: [
			{
				test: /\.css$/,
				use: [
					'style-loader',
					'css-loader',
					'postcss-loader'
				],
			},
			{
				test: /\.svg$/,
				use: 'svg-url-loader',
			},
			{
				test: /\.js/,
				include: /src/,
				exclude: /node_modules|\.spec\.js$/,
				use: '@jsdevtools/coverage-istanbul-loader'
			}
		],
	},

};