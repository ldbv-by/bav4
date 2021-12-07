import { loadBvvGeoResourceInfo } from './provider/geoResourceInfoResult.provider';
import { $injector } from '../../../injection';
import { FALLBACK_GEORESOURCE_ID_0, FALLBACK_GEORESOURCE_ID_1 } from '../../../services/GeoResourceService';

/**
 * Service for managing {@link GeoResourceInfoResult}s.
 *
 * @class
 * @author costa_gi
 */
export class GeoResourceInfoService {

	constructor(provider = loadBvvGeoResourceInfo) {
		this._provider = provider;
		this._geoResourceInfoResults = new Map();
		const { EnvironmentService: environmentService } = $injector.inject('EnvironmentService');
		this._environmentService = environmentService;
	}

	/**
	* Returns the corresponding  {@link GeoResourceInfoResult} for an id if present in the internal cache, otherwise retrived from backend.
	* @public
	* @param {string} geoResourceId Id of the desired {@link GeoResourceInfoResult}
	* @returns {GeoResourceInfoResult | null }
	* @throws Will throw an error if the provider result is wrong and pass it to the view.
	*/
	async byId(geoResourceId) {
		if (!this._geoResourceInfoResults.get(geoResourceId)) {
			try {
				this._geoResourceInfoResult = await this._provider(geoResourceId);
				this._geoResourceInfoResults.set(geoResourceId, this._geoResourceInfoResult);
			}
			catch (e) {
				if (this._environmentService.isStandalone()) {
					console.warn('georesourceinfo could not be fetched from backend. Using fallback georesourceinfo');
					this._geoResourceInfoResult = this._newFallbackGeoResourceInfo(geoResourceId);
					this._geoResourceInfoResults.set(geoResourceId, this._geoResourceInfoResult);
				}
				else {
					throw new Error('Could not load geoResourceInfoResult from provider: ' + e.message);
				}
			}
		}
		return this._geoResourceInfoResults.get(geoResourceId);
	}

	/**
	 * @private
	 */
	_newFallbackGeoResourceInfo(geoResourceId) {
		//see fallback georesources in GeoResourceService
		switch (geoResourceId) {
			case FALLBACK_GEORESOURCE_ID_0: {
				return new GeoResourceInfoResult('This is a fallback georesourceinfo', FALLBACK_GEORESOURCE_ID_0);
			}
			case FALLBACK_GEORESOURCE_ID_1: {
				return new GeoResourceInfoResult('This is a fallback georesourceinfo', FALLBACK_GEORESOURCE_ID_1);
			}
		}
	}
}

/**
* @class
* @author costa_gi
*/
export class GeoResourceInfoResult {

	/**
	 *
	 * @param {string} content of this GeoResourceInfoResult
	 * @param {string} [title=null] optional title of this GeoResourceInfoResult
	 */
	constructor(content, title = null) {

		this._content = content;
		this._title = title;
	}

	get content() {
		return this._content;
	}

	get title() {
		return this._title;
	}
}

