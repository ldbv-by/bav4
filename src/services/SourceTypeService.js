/**
 * @module services/SourceTypeService
 */
import { isHttpUrl, isString } from '../utils/checks';
import { PromiseQueue } from '../utils/PromiseQueue';
import { bvvUrlSourceTypeProvider, defaultDataSourceTypeProvider, defaultMediaSourceTypeProvider } from './provider/sourceType.provider';

/**
 * A function that tries to detect the source type for a url
 * @async
 * @typedef {function} urlSourceTypeProvider
 * @param {string} url the url
 * @returns {SourceTypeResult} the result
 */

/**
 * A function that tries to detect the source type for given data
 * @typedef {function} dataSourceTypeProvider
 * @param {string|object} data the data
 * @returns {SourceTypeResult} the result
 */

/**
 * A function that tries to detect the source by given media type
 *
 * @typedef {function} mediaSourceTypeProvider
 * @param {MediaType} data the media type
 * @returns {SourceTypeResult} the result
 */

/**
 * Determines the source type of a Url or given data.
 * @class
 * @author taulinger
 * @author thiloSchlemmer
 */
export class SourceTypeService {
	/**
	 *
	 * @param {module:services/SourceTypeService~urlSourceTypeProvider} [urlSourceTypeProvider=bvvUrlSourceTypeProvider]
	 * @param {module:services/SourceTypeService~dataSourceTypeProvider} [dataSourceTypeProvider=defaultDataSourceTypeProvider]
	 * @param {module:services/SourceTypeService~mediaSourceTypeProvider} [mediaSourceTypeProvider=defaultMediaSourceTypeProvider]
	 */
	constructor(
		urlSourceTypeProvider = bvvUrlSourceTypeProvider,
		dataSourceTypeProvider = defaultDataSourceTypeProvider,
		mediaSourceTypeProvider = defaultMediaSourceTypeProvider
	) {
		this._urlSourceTypeProvider = urlSourceTypeProvider;
		this._dataSourceTypeProvider = dataSourceTypeProvider;
		this._mediaSourceTypeProvider = mediaSourceTypeProvider;
		this._promiseQueue = new PromiseQueue();
	}

	/**
	 * Detects the SourceType for this url.
	 * @param {string} url
	 * @returns {SourceTypeResult} the result of this request
	 * @throws Will throw an error if parameter `url` is not an Http URL
	 */
	async forUrl(url) {
		if (!isHttpUrl(url)) {
			throw new TypeError('Parameter <url> must represent an Http URL');
		}
		return await this._promiseQueue.add(() => this._urlSourceTypeProvider(url));
	}

	/**
	 * Detects the SourceType for the given data.
	 * @param {string} data
	 * @returns {SourceTypeResult} the result of this request
	 */
	forData(data) {
		if (!isString(data)) {
			throw new TypeError('Parameter <data> must be a String');
		}
		return this._dataSourceTypeProvider(data);
	}

	/**
	 * Detects the SourceType for for a given Blob/File instance.
	 * @param {Blob} blob the blob
	 * @returns {SourceTypeResult} the result of this request
	 * @throws Will throw an error if parameter `blob` is not an instance of Blob
	 */
	async forBlob(blob) {
		if (!(blob instanceof Blob)) {
			throw new TypeError('Parameter <blob> must be an instance of Blob');
		}
		const dataSourceContent = await blob.text();
		return this._dataSourceTypeProvider(dataSourceContent);
	}
}
