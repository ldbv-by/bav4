var baseConfig = require('./karma.conf.js');

module.exports = function (config) {

	// Load base config
	baseConfig(config);

	config.set({
		reporters: ['progress', 'coverage-istanbul'],
		customLaunchers: {
			GhaHeadlessChrome: {
				base: 'ChromeHeadless',
				flags: ['--disable-translate', '--disable-extensions',
					'--no-first-run', '--disable-background-networking',
					'--remote-debugging-port=9223']
			},
		},
		coverageIstanbulReporter: {
			dir: 'coverage',
			reports: ['text-summary', 'lcov']
		}
	});
};
