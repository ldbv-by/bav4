const baseConfig = require('./karma.conf.js');
const path = require('path');

module.exports = function (config) {
	// Load base config
	baseConfig(config);

	config.set({
		browsers: ['ChromeHeadlessNoSandbox', 'FirefoxHeadless', 'WebkitHeadless'],
		customLaunchers: {
			ChromeHeadlessNoSandbox: {
				base: 'ChromeHeadless',
				flags: ['--no-sandbox', '--disable-setuid-sandbox', '--single-process', '--dbus-stub']
			}
		},
		reporters: ['progress', 'coverage-istanbul'],
		coverageIstanbulReporter: {
			dir: path.join(__dirname, 'coverage'),
			reports: ['lcovonly']
		},
		browserDisconnectTimeout: 90000,
		browserNoActivityTimeout: 90000,
		browserDisconnectTolerance: 2
	});
};
