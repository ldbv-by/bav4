module.exports = {
	mode: 'development',
	devtool: 'inline-source-map',
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
				test: /\.(woff2|svg|webp)$/,
				type: 'asset/inline'
			},
			{
				test: /\.js/,
				include: /src/,
				exclude: /node_modules|\.spec\.js$/,
				use: '@jsdevtools/coverage-istanbul-loader'
			}
		]
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
