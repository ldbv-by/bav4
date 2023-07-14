const fs = require('fs');
const path = require('path');

const excludesFiles = ['index.js', 'setupPage.js', 'embed.js', 'main.js', 'config.js', 'mgrs.js'];

const findInDir = (dir, fileList = []) => {
	const files = fs.readdirSync(dir);

	files.forEach((file) => {
		const filePath = path.join(dir, file);
		const fileStat = fs.lstatSync(filePath);

		if (fileStat.isDirectory()) {
			findInDir(filePath, fileList);
		}
		fileList.push(filePath);
	});

	return fileList
		.filter((fp) => fp.endsWith('.js'))
		.filter((fp) => !excludesFiles.includes(path.basename(fp))) // remove excluded files
		.filter((fp) => !path.dirname(fp).includes('i18n')) // remove i18n provider
		.filter((fp) => !fp.includes('reducer')) // remove reducer dirs
		.filter((fp) => !fp.includes('chunks')); // remove lazy dir
};

findInDir('./src').forEach((fp) => {
	const moduleNameIdentifier = '/**\n * @module';
	// path from src (excluded) + filename (without extension)
	const moduleName = `${path.dirname(fp).split('src/')[1]}/${path.basename(fp).split('.js')[0]}`.replace('.', '_');
	if (process.env.DOC_CHECK /** just check */) {
		const content = fs.readFileSync(fp, 'utf8');
		// check if we already have a @module name
		if (!content.startsWith(moduleNameIdentifier)) {
			throw new Error(`${fp} does not contain a JSDoc module name. Please run "npm run doc:apply"`);
		} else if (!content.startsWith(`${moduleNameIdentifier} ${moduleName}`)) {
			throw new Error(`${fp} does not contain the correct JSDoc module name. Please run "npm run doc:apply"`);
		}
	} else {
		const content = fs.readFileSync(fp, 'utf8');
		// check if we already have a @module name
		if (content.startsWith(moduleNameIdentifier)) {
			const regex = /\* @module.*/;
			fs.writeFileSync(fp, content.replace(regex, `* @module ${moduleName}`));
		} else {
			const template = `/**
 * @module ${moduleName}
 */\n`;
			fs.writeFileSync(fp, template.concat(content));
		}
	}
});
