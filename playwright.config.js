module.exports = {
	testDir: 'test/e2e',
	reporter: [['list'], ['junit', { outputFile: 'reports/e2e/results.xml' }]],
	use: {
		ignoreHTTPSErrors: true
	}
};
