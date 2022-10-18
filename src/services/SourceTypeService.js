import { isHttpUrl, isString } from '../utils/checks';
import { SourceTypeMaxFileSize, SourceTypeResult, SourceTypeResultStatus } from '../domain/sourceType';
import { bvvUrlSourceTypeProvider, defaultDataSourceTypeProvider, defaultMediaSourceTypeProvider } from './provider/sourceType.provider';



/**
 * Determines the source type of a Url or given data.
 * @class
 * @author taulinger
 * @author thiloSchlemmer
 */
export class SourceTypeService {

	/**
	 *
	 * @param {urlSourceTypeProvider} [urlSourceTypeProvider=bvvUrlSourceTypeProvider]
	 * @param {dataSourceTypeProvider} [dataSourceTypeProvider=defaultDataSourceTypeProvider]
	 * @param {mediaSourceTypeProvider} [mediaSourceTypeProvider=defaultMediaSourceTypeProvider]
	 */
	constructor(urlSourceTypeProvider = bvvUrlSourceTypeProvider, dataSourceTypeProvider = defaultDataSourceTypeProvider, mediaSourceTypeProvider = defaultMediaSourceTypeProvider) {
		this._urlSourceTypeProvider = urlSourceTypeProvider;
		this._dataSourceTypeProvider = dataSourceTypeProvider;
		this._mediaSourceTypeProvider = mediaSourceTypeProvider;
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
		return await this._urlSourceTypeProvider(url);
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
		if (blob.size >= SourceTypeMaxFileSize) {
			return new SourceTypeResult(SourceTypeResultStatus.MAX_SIZE_EXCEEDED);
		}
		const dataSourceContent = await blob.text();
		return this._dataSourceTypeProvider(dataSourceContent);
	}
}
