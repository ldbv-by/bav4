import { $injector } from '../injection';
import { WmsGeoResource } from './domain/geoResources';
import { loadBvvFeatureInfo } from './provider/featureInfo.provider';

/**
 * Provides a FeatureInfo query for Raster Data -based GeoResources.
 * @class
 * @author taulinger
 */
export class FeatureInfoService {

	/**
	 * @param {featureInfoProvider} [featureInfoProvider=loadBvvFeatureInfo]
	 */
	constructor(featureInfoProvider = loadBvvFeatureInfo) {
		this._featureInfoProvider = featureInfoProvider;
		const { GeoResourceService: geoResourceService }
			= $injector.inject('GeoResourceService');
		this._geoResourceService = geoResourceService;
	}

	/**
	 * Executes a FeatureInfo request for a suitable GeoResource.
	 * If a GeoResource is not queryable, `null` will be returned as result.
	 * @param {string} geoResourceId The id of a GeoResource
	 * @param {Coordinate} coordinate The coordinate for the FeatureInfo request
	 * @param {number} mapResolution Current map resolution in meters
	 * @returns {FeatureInfoResult|null} The result or `null`
	 */
	async get(geoResourceId, coordinate, mapResolution) {

		if (this.isQueryable(geoResourceId)) {
			try {
				return await this._featureInfoProvider(geoResourceId, coordinate, mapResolution);
			}
			catch (e) {
				throw new Error(`Could not load a FeatureInfoResult from provider: ${e}`);
			}
		}
		return null;
	}

	/**
	 * Tests if a GeoResource can be used for a GetFeatureInfo request.
	 * @param {string} geoResourceId The id of a GeoResource
	 * @returns {boolean} `true` if the GeoResource can be used for a GetFeatureInfo request
	 */
	isQueryable(geoResourceId) {
		const geoResource = this._geoResourceService.byId(geoResourceId);
		return geoResource instanceof WmsGeoResource;
	}
}

/**
* @class
*/
export class FeatureInfoResult {

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
