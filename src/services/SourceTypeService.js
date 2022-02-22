import { isHttpUrl } from '../utils/checks';
import { SourceTypeMaxFileSize } from './domain/sourceType';
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
     * @returns {SourceType|null} sourceType or `null` when no source type was detected
     */
	async forUrl(url) {
		if (!isHttpUrl(url)) {
			throw new TypeError('Parameter <url> must represent an Http URL');
		}
		try {
			return await this._urlSourceTypeProvider(url);
		}
		catch (e) {
			throw new Error(`Could not detect a SourceType: ${e}`);
		}
	}

	/**
     *
     * @param {string} data
     * @param {string} [mediaType]
     * @returns {SourceType|null} sourceType or `null` when no source type was detected
     */
	forData(data, mediaType = null) {
		const sourceType = mediaType ? this._mediaSourceTypeProvider(mediaType) : null;
		return sourceType ? sourceType : this._dataSourceTypeProvider(data);
	}

	/**
	 *
	 * @param {Blob} blob the blob
	 * @returns {SourceType|null} sourceType or `null` when no source type was detected or 'null'
	 * when blob is too large
	 */
	forBlob(blob) {
		if (blob instanceof Blob && blob.size <= SourceTypeMaxFileSize) {
			return this._mediaSourceTypeProvider(blob.type);
		}
		return null;
	}
}
