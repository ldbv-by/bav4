const fs = require('fs');
const path = require('path');

const Resource_Extension = ['.svg', '.png'];
const Code_Extension = ['.js', '.css'];
const EOL_RegEx = /\r?\n/;

function* lineReaderSync(file) {
	try {
		const fileContent = fs.readFileSync(file, 'utf-8');
		let index = 0;
		for (const line of fileContent.split(EOL_RegEx)) {
			yield { content: line, index: index };
		}
	} catch (err) {
		console.error(err);
	}
}

const hashCode = (value) => {
	// simplified copy of @see {./src/utils/hashCode}
	// see https://gist.github.com/hyamamoto/fd435505d29ebfa3d9716fd2be8d42f0
	let h = 0;
	for (let i = 0; i < value.length; i++) {
		h = (Math.imul(31, h) + value.charCodeAt(i)) | 0;
	}
	return h;
};

const findResourceWithExtensionInDir = (dir, extensionList) => {
	const fileList = [];
	const files = fs.readdirSync(dir);

	files.forEach((file) => {
		const filePath = path.join(dir, file);
		const fileStat = fs.lstatSync(filePath);

		if (fileStat.isDirectory()) {
			findResourceWithExtensionInDir(filePath, extensionList).forEach((item) => fileList.push(item));
		} else {
			const fileContent = fs.readFileSync(filePath, 'utf8');
			const hash = hashCode(fileContent);
			const fileSize = fs.statSync(filePath).size;

			fileList.push({ filePath, file, hash, fileSize });
		}
	});

	return fileList.filter((fileItem) => extensionList.some((extension) => fileItem.file.endsWith(extension)));
};

const getRelativePathForResourceName = (relativePathSource, resourceName) => {
	if (relativePathSource.includes(resourceName)) {
		const leftOfResourceName = relativePathSource.split(resourceName)[0];
		const leftIndex = leftOfResourceName.lastIndexOf("'");
		const rightIndex = relativePathSource.indexOf(resourceName);
		return relativePathSource.substring(leftIndex + 1, rightIndex + resourceName.length);
	}
	return null;
};

const getResourcesByHash = (resources) => {
	return resources.reduce((byHash, resource) => {
		const { filePath, file, hash, fileSize } = resource;

		const getResourceInfo = () => {
			if (byHash.has(hash)) {
				const { resourceName, filePaths, hash: h, fileSize: fSize } = byHash.get(hash);
				return {
					resourceName,
					filePaths: [...filePaths, filePath],
					hash: h,
					fileSize: fileSize,
					fileSizeSum: fSize + fileSize,
					usage: [],
					tags: ['duplicated']
				};
			}
			return { resourceName: file, filePaths: [filePath], hash: hash, fileSize: fileSize, usage: [], tags: [] };
		};

		byHash.set(hash, getResourceInfo());
		return byHash;
	}, new Map());
};

const getResourcesByName = (resources, resourcesByHash) => {
	return resources.reduce((byName, resource) => {
		const { file, hash } = resource;
		const resourceInfoByHash = resourcesByHash.get(hash);
		if (byName.has(file)) {
			byName.get(file).add(resourceInfoByHash);
		} else {
			byName.set(file, new Set([resourceInfoByHash]));
		}
		return byName;
	}, new Map());
};

const findCodeUsageInDir = (dir, resourcesByName, extensionList) => {
	const files = fs.readdirSync(dir);
	const resourceNames = Array.from(resourcesByName.keys());

	const findAndRegisterUsage = (filePath, resourceName, line) => {
		const { content, index } = line;
		const relativePath = getRelativePathForResourceName(content, resourceName);
		if (relativePath) {
			const resourceCandidates = resourcesByName.get(resourceName);
			resourceCandidates.forEach((c) => {
				const { filePaths } = c;
				if (filePaths.some((absoluteFilePath) => path.relative(dir, absoluteFilePath) === relativePath)) {
					c.usage = [...c.usage, { sourcefile: filePath, lineOfCode: index }];
				}
			});
		}
	};

	files.forEach((file) => {
		const filePath = path.join(dir, file);
		const fileStat = fs.lstatSync(filePath);

		if (fileStat.isDirectory()) {
			findCodeUsageInDir(filePath, resourcesByName, extensionList);
		} else if (extensionList.some((extension) => file.endsWith(extension))) {
			for (const line of lineReaderSync(filePath)) {
				resourceNames.forEach((resourceName) => findAndRegisterUsage(filePath, resourceName, line));
			}
		}
	});
};

const calculateRating = (resourcesByName) => {
	// values -> resourceInfosByHash, key -> fileName
	const rating = [];
	resourcesByName.forEach((value, key, m) => {
		const cardinality = value.size;
		const sumRating = Array.from(value).reduce(
			(sum, resourceInfo) => sum + (resourceInfo.filePaths.length * Math.pow(10, resourceInfo.usage.length)) / cardinality,
			0
		);
		const fileSizeInfo = Array.from(value).map((resourceInfo, index) => {
			return `[${index}] fileSize/Sum in Bytes: ${resourceInfo.fileSize}/${resourceInfo.fileSize * resourceInfo.filePaths.length} `;
		});
		const resources = Array.from(value).flatMap((resourceInfo, index) => {
			return [resourceInfo.filePaths.map((fp) => `[${index}] hash:${resourceInfo.hash} -> ${fp} `)];
		});

		const usages = Array.from(value).flatMap((resourceInfo, index) => resourceInfo.usage.map((u) => `[${index}]  ${u.sourcefile}`));

		const orphanedResources = Array.from(value)
			.filter((resourceInfo) => !resourceInfo.usage.length)
			.flatMap((resourceInfo) => resourceInfo.filePaths);
		const tags = [
			...Array.from(value).flatMap((resourceInfo) => resourceInfo.tags),
			value.size > 1 ? 'ambiguous name' : [],
			orphanedResources.length != 0 ? 'orphaned' : []
		];
		rating.push({
			file: key,
			rating: sumRating,
			fileSize: fileSizeInfo,
			resources,
			usages: usages,
			tags: Array.from(new Set(tags.flat())),
			orphaned: orphanedResources
		});
	});
	return rating;
};

const resources = findResourceWithExtensionInDir('./src', Resource_Extension);

const resourcesByHash = getResourcesByHash(resources);
const resourcesByName = getResourcesByName(resources, resourcesByHash);

findCodeUsageInDir('./src', resourcesByName, Code_Extension);

const ratingResult = calculateRating(resourcesByName);
// ratingResult.forEach((r) => console.log(r));
const sortedRating = [...ratingResult].sort((a, b) => a.rating - b.rating);
sortedRating.forEach((r) => console.log(r));
// - iterate recursive through src-folder
// - find bundle resources defined by an extension-list from config
// - list all resources ordered by count, occurance in code (line of code, link)
