const { compilationHandler, generateConfig, getCompiler, outputPath } = require('./webpack-compile');
const { getPathKey, normalizePathSeparators, transformPathToJs } = require('./utils');
const { filesToWebpackEntries } = require('./web-test-runner');

function webpackPlugin(userConfig = {}) {
	function serverStart(params) {
		const config = params.config;
		// const files = config.files;
		const files = ['./test/modules/commons/components/Spinner.test.js'];
		const watch = config.watch;
		const entry = filesToWebpackEntries(files);
		const path = outputPath();
		const webpackConfig = generateConfig(userConfig, {
			entry: entry,
			output: {
				path: path
			},
			watch: watch
		});

		config.watch = false;

		return new Promise(
			function (resolve, reject) {
				const result = compilationHandler(userConfig.stats, path, resolve, reject);
				const emptyBundlesContent = result[0];
				const handleCompilation = result[1];

				this.bundlesContent = emptyBundlesContent;
				this.compiler = getCompiler(webpackConfig, handleCompilation);
			}.bind(this)
		);
	}

	function serverStop() {
		if (this.compiler !== undefined) {
			this.compiler.close(function () {});
		}
	}

	function serve(context) {
		const request = context.request;
		const path = transformPathToJs(getPathKey(normalizePathSeparators(request.path), true));

		return (
			(this.bundlesContent && this.bundlesContent.get(path)) || {
				body: 'Not found',
				headers: { status: '404 Not found' }
			}
		);
	}

	return {
		name: 'wtr-webpack-plugin',
		serverStart: serverStart,
		serverStop: serverStop,
		serve: serve
	};
}

module.exports = {
	webpackPlugin: webpackPlugin
};
