import { isHttpUrl } from '../utils/checks';
import { bvvUrlSourceTypeProvider, defaultDataSourceTypeProvider } from './provider/sourceType.provider';

/**
 * Determines the source type of an Url or given data.
 * @class
 * @author taulinger
 */
export class SourceTypeService {

	/**
     *
     * @param {urlSourceTypeProvider} [urlSourceTypeProvider=bvvUrlSourceTypeProvider]
     * @param {dataSourceTypeProvider} [dataSourceTypeProvider=defaultDataSourceTypeProvider]
     */
	constructor(urlSourceTypeProvider = bvvUrlSourceTypeProvider, dataSourceTypeProvider = defaultDataSourceTypeProvider) {
		this._urlSourceTypeProvider = urlSourceTypeProvider;
		this._dataSourceTypeProvider = dataSourceTypeProvider;
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
		return this._dataSourceTypeProvider(data, mediaType);
	}
}

/**
 * Enum of all supported source types names
 */
export const SourceTypeName = Object.freeze({
	KML: 'kml',
	GPX: 'gpx',
	GEOJSON: 'geojson',
	WMS: 'wms'
});

export class SourceType {

	constructor(name, version = null) {
		this._name = name;
		this._version = version;
	}

	get name() {
		return this._name;
	}

	get version() {
		return this._version;
	}
}

