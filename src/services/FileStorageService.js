/**
 * @module services/FileStorageService
 */
import { $injector } from '../injection';
import { createUniqueId } from '../utils/numberUtils';

/**
 * Service for persisting and loading ASCII based geo-data.
 * @author taulinger
 * @interface FileStorageService
 */

/**
 * Checks if a string represents an adminId.
 * @function
 * @name FileStorageService#isAdminId
 * @param {String|null|undefined} id
 * @returns {boolean} fileId
 */

/**
 * Checks if a string represents a fileId.
 * @function
 * @async
 * @name FileStorageService#isFileId
 * @param {String|null|undefined} id
 * @returns {boolean} fileId
 */

/**
 * Returns the corresponding fileId for an adminId.
 * If the given id already a fileId, it will be returned unchanged.
 * @function
 * @async
 * @name FileStorageService#getFileId
 * @param {String|null} adminId
 * @returns {Promise<string>} fileId
 */

/**
 * Loads the content of a file.
 * @function
 * @async
 * @name FileStorageService#get
 * @param {String} fileId
 * @returns {Promise<FileLoadResult>} content
 */

/**
 * Saves the content of a file.
 * If no id defined --> create a new file
 *     returns new adminId and new file url
 * If id is an adminId --> update the file
 *     returns the same adminId and the same file url
 * if id is an fileId --> fork the file
 *     returns new adminId and new file url
 * @function
 * @async
 * @name FileStorageService#save
 * @param {string|null|undefined} id ID of the file
 * @param {string} content
 * @param {FileStorageServiceDataTypes} type
 * @returns {Promise<FileSaveResult>} content
 */

/**
 * MetaData of a successfully saved file.
 * @typedef {Object} FileSaveResult
 * @property {string} adminId The adminId of the successfully saved file
 * @property {string} fileId The fileId of the successfully saved file
 */

/**
 * MetaData of a successfully retrieved file.
 * @typedef {Object} FileLoadResult
 * @property {string} data The data of the successfully retrieved file
 * @property {FileStorageServiceDataTypes} type The type of the successfully retrieved file
 * @property {number} srid The srid of the successfully retrieved data
 */

/**
 * @readonly
 * @enum {String}
 */
export const FileStorageServiceDataTypes = Object.freeze({
	KML: 'application/vnd.google-earth.kml+xml'
});

/**
 * BVV service for persisting and loading ASCII based geo-data using a RESTful endpoint.
 * @class
 * @author taulinger
 * @implements {FileStorageService}
 */
export class BvvFileStorageService {
	constructor() {
		const { HttpService: httpService, ConfigService: configService } = $injector.inject('HttpService', 'ConfigService');
		this._httpService = httpService;
		this._configService = configService;
	}

	_getFileStorageUrl() {
		return this._configService.getValueAsPath('BACKEND_URL') + 'files';
	}

	_getKeyByValue(object, value) {
		return Object.keys(object).find((key) => object[key] === value);
	}

	isAdminId(id) {
		if (id) {
			return id.startsWith('a_');
		}
		return false;
	}

	isFileId(id) {
		if (id) {
			return id.startsWith('f_');
		}
		return false;
	}

	async getFileId(possibleAdminId) {
		if (this.isFileId(possibleAdminId)) {
			return possibleAdminId;
		}
		const url = `${this._getFileStorageUrl()}/${possibleAdminId}`;

		const result = await this._httpService.get(url);
		if (result.ok) {
			const { fileId } = await result.json();
			if (fileId) {
				return fileId;
			}
		}
		throw new Error('FileId could not be retrieved: ' + url);
	}

	async get(fileId) {
		const url = `${this._getFileStorageUrl()}/${fileId}`;
		const result = await this._httpService.get(url);
		if (result.ok) {
			const type = this._getKeyByValue(FileStorageServiceDataTypes, result.headers.get('Content-Type'));
			if (type) {
				const data = await result.text();
				return {
					data: data,
					type: FileStorageServiceDataTypes[type],
					srid: 4326
				};
			}
			throw new Error('Content-Type ' + result.headers.get('Content-Type') + ' currently not supported');
		}
		throw new Error('File could not be loaded: ' + url);
	}

	async save(id, content, type) {
		if (type === FileStorageServiceDataTypes.KML) {
			const url = id ? `${this._getFileStorageUrl()}/${id}` : this._getFileStorageUrl();
			const result = await this._httpService.post(url, content, type);
			if (result.ok) {
				const data = await result.json();
				return {
					adminId: data.adminId,
					fileId: data.fileId
				};
			}

			throw new Error('File could not be saved: ' + url);
		}
		throw new Error('Content-Type ' + type + ' currently not supported');
	}
}

/**
 * Service that persists data temporarily (for a "session")
 * @class
 * @author taulinger
 * @implements {FileStorageService}
 */
export class TempStorageService {
	#store = {};

	isAdminId(id) {
		if (id) {
			return id.startsWith('a_');
		}
		return false;
	}

	isFileId(id) {
		if (id) {
			return id.startsWith('f_');
		}
		return false;
	}

	async getFileId(possibleAdminId) {
		if (this.isFileId(possibleAdminId)) {
			return possibleAdminId;
		} else if (this.isAdminId(possibleAdminId)) {
			return possibleAdminId.replace('a_', 'f_');
		}

		throw new Error('FileId could not be retrieved: ' + possibleAdminId);
	}

	async get(fileId) {
		const fileName = fileId?.split('f_')[1];
		if (this.#store[fileName]) {
			return this.#store[fileName];
		}
		throw new Error('File could not be loaded: ' + fileId);
	}

	async save(id, content, type) {
		if (id && this.isFileId(id)) {
			throw new Error('Saving a file by its FileId is currently not supported');
		}
		if (type === FileStorageServiceDataTypes.KML) {
			if (id) {
				this.#store[id?.split('a_')[1]] = content;
				return {
					adminId: id,
					fileId: id.replace('a_', 'f_')
				};
			}
			const fileName = `tmp_${createUniqueId()}`;
			this.#store[fileName] = content;
			return {
				adminId: `a_${fileName}`,
				fileId: `f_${fileName}`
			};
		}
		throw new Error('Content-Type ' + type + ' currently not supported');
	}
}
