const webpackConfig = require('./webpack.test.config.js');

module.exports = function (config) {
	config.set({
		frameworks: ['jasmine', 'iframes'],
		// list of files / patterns to load in the browser
		files: [
			{ pattern: 'test/**/*.test.js', watched: false },
		],
		// preprocess matching files before serving them to the browser
		preprocessors: {
			'test/**/*.test.js': ['webpack', 'iframes'],
		},
		reporters: ['progress', 'coverage-istanbul'],
		// port: 9876,
		// colors: true,
		// logLevel: config.LOG_INFO,
		// autoWatch: true,
		browsers: ['ChromeHeadless', 'FirefoxHeadless'],
		customLaunchers: {
			TravisHeadlessChrome: {
				base: 'ChromeHeadless',
				flags: ['--disable-translate', '--disable-extensions',
					'--no-first-run', '--disable-background-networking',
					'--remote-debugging-port=9223']
			}
		},
		singleRun: true,
		concurrency: Infinity,
		webpack: webpackConfig,
		coverageIstanbulReporter: {
			dir: 'coverage/%browser%',
			reports: ['text-summary', 'html']
		},
	});
};
