const path = require('node:path');
const crypto = require('node:crypto');

function getPathKey(filePath, withExtension) {
	if (withExtension === undefined) {
		withExtension = false;
	}

	const parsed = path.parse(filePath);
	const name = parsed.name;
	const ext = parsed.ext;
	const key = name + '.' + crypto.createHash('sha256').update(filePath).digest('hex');

	return withExtension ? key + ext : key;
}

function normalizePathSeparators(filePath) {
	return filePath.split(path.sep).join('/');
}

function transformPathToJs(filePath) {
	const parsed = path.parse(filePath);
	const dir = parsed.dir;
	const name = parsed.name;

	return path.join(dir, name) + '.js';
}

module.exports = {
	getPathKey: getPathKey,
	normalizePathSeparators: normalizePathSeparators,
	transformPathToJs: transformPathToJs
};
