module.exports = {
	testDir: 'test/e2e',
	reporter: [['dot'], ['junit', { outputFile: 'reports/e2e/results.xml' }]]
};
