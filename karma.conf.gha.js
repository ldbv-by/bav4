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
		}
	});
};
