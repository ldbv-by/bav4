/**
 * @module modules/geoResourceInfo/services/GeoResourceInfoService
 */
import { loadBvvGeoResourceInfo } from './provider/geoResourceInfoResult.provider';
import { $injector } from '../../../injection';

/**
 * An async function that returns a {@link GeoResourceInfoResult}.
 * @async
 * @param {string} id Id of the requested GeoResource
 * @typedef {function(id) : (GeoResourceInfoResult|null)} geoResourceInfoProvider
 */

/**
 * Service for managing {@link GeoResourceInfoResult}s.
 * @class
 * @author costa_gi
 * @author taulinger
 */
export class GeoResourceInfoService {
	/**
	 * @param {provider} [providers=loadBvvGeoResources]
	 */
	constructor(providers = [loadBvvGeoResourceInfo]) {
		this._providers = providers;
		this._geoResourceInfoResults = new Map();
		const { EnvironmentService: environmentService } = $injector.inject('EnvironmentService');
		this._environmentService = environmentService;
	}

	/**
	 * Returns the corresponding  {@link GeoResourceInfoResult} for an id if present in the internal cache, otherwise retrieved from backend.
	 * @public
	 * @param {string} geoResourceId Id of the desired {@link GeoResourceInfoResult}
	 * @returns {GeoResourceInfoResult | null}
	 * @throws Will throw an error if the provider result is wrong and pass it to the view.
	 */
	async byId(geoResourceId) {
		if (this._environmentService.isStandalone()) {
			console.warn('GeoResourceInfo could not be fetched from backend. Using a fallback GeoResourceInfo.');
			return this._newFallbackGeoResourceInfo(geoResourceId);
		}

		if (!this._geoResourceInfoResults.get(geoResourceId)) {
			try {
				for (const provider of this._providers) {
					const geoResourceInfoResult = await provider(geoResourceId);
					if (geoResourceInfoResult) {
						this._geoResourceInfoResults.set(geoResourceId, geoResourceInfoResult);
						return geoResourceInfoResult;
					}
				}
			} catch (e) {
				throw new Error('Could not load a GeoResourceInfoResult from provider', { cause: e });
			}
		}
		return this._geoResourceInfoResults.get(geoResourceId) ?? null;
	}

	_newFallbackGeoResourceInfo(geoResourceId) {
		//see fallback GeoResources in GeoResourceService
		return new GeoResourceInfoResult(`This is a fallback GeoResourceInfoResult for '${geoResourceId}'`, geoResourceId);
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
