const baseConfig = require('./karma.conf.js');
const path = require('path');

module.exports = function (config) {
	// Load base config
	baseConfig(config);

	config.set({
		reporters: ['progress', 'coverage-istanbul'],
		coverageIstanbulReporter: {
			dir: path.join(__dirname, 'coverage'),
			reports: ['lcovonly']
		},
		customLaunchers: {
			ChromeHeadlessNoSandbox: {
				base: 'ChromeHeadless',
				flags: ['--no-sandbox', '--disable-setuid-sandbox', '--single-process']
			}
		},
		browserDisconnectTimeout: 90000,
		browserNoActivityTimeout: 90000,
		singleRun: true
	});
};
