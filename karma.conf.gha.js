const baseConfig = require('./karma.conf.js');

module.exports = function (config) {

	// Load base config
	baseConfig(config);

	config.set({
		reporters: ['progress', 'coverage-istanbul'],
		coverageIstanbulReporter: {
			dir: 'coverage',
			reports: ['text-summary', 'lcov']
		}
	});
};
