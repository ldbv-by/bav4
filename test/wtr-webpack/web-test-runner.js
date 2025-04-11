const utils = require('./utils');
const globSync = require('fast-glob').globSync;

// Copied from https://github.com/modernweb-dev/web/blob/master/packages/test-runner-core/src/runner/collectTestFiles.ts
function collectTestFiles(patterns) {
	const normalizedPatterns = [].concat(patterns).map(utils.normalizePathSeparators);

	return globSync(normalizedPatterns, { absolute: true });
}

function filesToWebpackEntries(files) {
	const entries = {};
	const testFiles = collectTestFiles(files);

	for (let i = 0; i < testFiles.length; i++) {
		const testFile = testFiles[i];
		entries[utils.getPathKey(testFile)] = testFile;
	}

	return entries;
}

module.exports = {
	filesToWebpackEntries: filesToWebpackEntries
};
