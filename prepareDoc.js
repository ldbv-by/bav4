const fs = require('fs');
const path = require('path');

const excludesFiles = ['index.js', 'setupPage.js', 'embed.js', 'main.js', 'config.js'];

const findInDir = (dir, filter, fileList = []) => {
	const files = fs.readdirSync(dir);

	files.forEach((file) => {
		const filePath = path.join(dir, file);
		const fileStat = fs.lstatSync(filePath);

		if (fileStat.isDirectory()) {
			findInDir(filePath, filter, fileList);
		}
		fileList.push(filePath);
	});

	return fileList
		.filter((fp) => fp.endsWith('.js'))
		.filter((fp) => !excludesFiles.includes(path.basename(fp))) // remove excluded files
		.filter((fp) => !path.dirname(fp).includes('i18n')) // remove i18n provider
		.filter((fp) => !fp.includes('reducer')); // remove reducer
};

findInDir('./src').forEach((fp) => {
	const moduleName = `${path.dirname(fp).split('src/')[1]}/${path.basename(fp).split('.js')[0].replace('.', '_')}`;

	try {
		const content = fs.readFileSync(fp, 'utf8');
		// check if we already have a @module comment
		if (content.startsWith('/**\n * @module')) {
			const regex = /\* @module.*/;
			fs.writeFileSync(fp, content.replace(regex, `* @module ${moduleName}`));
		} else {
			const template = `/**
 * @module ${moduleName}
 */\n`;
			fs.writeFileSync(fp, template.concat(content));
		}
	} catch (e) {
		console.error(e);
	}
});
