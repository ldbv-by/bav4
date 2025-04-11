const path = require('node:path');
const webpack = require('webpack');
const merge = require('webpack-merge').merge;
const fs = require('node:fs');
const os = require('node:os');

const defaultOutputFilename = '[name].js';

const defaultConfig = {
	mode: 'development',
	output: {
		filename: defaultOutputFilename
	},
	stats: {
		modules: false,
		colors: true
	},
	watch: false,
	optimization: {
		runtimeChunk: 'single',
		splitChunks: {
			chunks: 'all',
			minSize: 0,
			cacheGroups: {
				commons: {
					name: 'commons',
					chunks: 'all',
					minChunks: 1
				}
			}
		}
	},
	plugins: []
};

function validateUserConfig(userConfig) {
	const validConfig = Object.assign({}, userConfig);
	const entry = validConfig.entry;
	const output = validConfig.output;
	const optimization = validConfig.optimization;

	if (entry !== undefined) {
		console.warn(
			'webpack entries will be automatically created from each of your test files. The entry specified in the webpack config will be ignored.'
		);
		delete validConfig.entry;
	}

	if (output !== undefined) {
		const outputFilename = output.filename || defaultOutputFilename;

		if (outputFilename !== defaultOutputFilename) {
			console.warn('webpack output filename set to [name].js. The output filename specified in the webpack config will be ignored.');
			delete output.filename;
		}
	}

	if (optimization !== undefined) {
		console.warn('The optimization settings specified in the webpack config will be ignored.');
		delete validConfig.optimization;
	}

	return validConfig;
}

function compilationHandler(statsConfig, fPath, resolve, reject) {
	console.log(fPath);
	const bundlesContent = new Map();

	return [
		bundlesContent,
		function handleCompilation(err, stats) {
			bundlesContent.clear();

			if (err !== undefined && err !== null) {
				console.error(err.stack || err);
				if (err.details !== undefined) {
					console.error(err.details);
				}

				reject();
				return;
			}

			console.log(stats && stats.toString(statsConfig));

			const assets = (stats && stats.toJson().assets) || [];
			for (let i = 0; i < assets.length; i++) {
				const name = assets[i].name;
				const filePath = path.resolve(fPath, name);

				bundlesContent.set(name, fs.readFileSync(filePath, 'utf8'));
			}

			resolve();
		}
	];
}

function generateConfig(userConfig, pluginConfig) {
	const validConfig = validateUserConfig(userConfig);

	return merge(defaultConfig, validConfig, pluginConfig);
}

function getCompiler(config, callback) {
	return webpack(config, callback);
}

function outputPath() {
	const ENTROPY_SIZE = 1000000;

	return path.join(os.tmpdir(), '_wtr_webpack_') + Math.floor(Math.random() * ENTROPY_SIZE);
}

module.exports = {
	compilationHandler: compilationHandler,
	generateConfig: generateConfig,
	getCompiler: getCompiler,
	outputPath: outputPath
};
