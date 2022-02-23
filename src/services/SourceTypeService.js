import { isHttpUrl } from '../utils/checks';
import { SourceTypeMaxFileSize, SourceTypeResult, SourceTypeResultStatus } from './domain/sourceType';
import { bvvUrlSourceTypeProvider, defaultDataSourceTypeProvider, defaultMediaSourceTypeProvider } from './provider/sourceType.provider';



/**
 * Determines the source type of an Url or given data.
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
	 *
	 * @param {string} url
	 * @returns {SourceTypeResult} the result of this request
	 * @throws
	 */
	async forUrl(url) {
		if (!isHttpUrl(url)) {
			throw new TypeError('Parameter <url> must represent an Http URL');
		}
		return await this._urlSourceTypeProvider(url);
	}

	/**
	 *
	 * @param {string} data
	 * @param {string} [mediaType]
	 * @returns {SourceTypeResult} the result of this request
	 */
	forData(data, mediaType = null) {
		const result = mediaType ? this._mediaSourceTypeProvider(mediaType) : null;
		return result ?? this._dataSourceTypeProvider(data);
	}

	/**
	 *
	 * @param {Blob} blob the blob
	 * @returns {SourceTypeResult} the result of this request
	 */
	forBlob(blob) {
		if (!(blob instanceof Blob)) {
			throw new TypeError('Parameter <blob> must be an instance of Blob');
		}
		if (blob.size >= SourceTypeMaxFileSize) {
			return new SourceTypeResult(SourceTypeResultStatus.MAX_SIZE_EXCEEDED);
		}
		return this._mediaSourceTypeProvider(blob.type);
	}
}
