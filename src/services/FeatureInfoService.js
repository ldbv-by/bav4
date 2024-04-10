/**
 * @module services/FeatureInfoService
 */
import { $injector } from '../injection';
import { WmsGeoResource } from '../domain/geoResources';
import { loadBvvFeatureInfo } from './provider/featureInfo.provider';

/**
 * An async function that returns a {@link GeoResourceInfoResult} for a `coordinate`.
 * @async
 * @typedef {Function} featureInfoProvider
 * @function
 * @param {string} geoResourceId The id of the corresponding GeoResource
 * @param {module:domain/coordinateTypeDef~Coordinate} coordinate3857 The coordinate in 3857
 * @param {number} mapResolution The current resolution of the map in meters
 * @throws `Error`
 * @returns {Promise<FeatureInfoResult>}
 */

/**
 * Provides a FeatureInfo query for raster data-based GeoResources.
 * @class
 * @author taulinger
 */
export class FeatureInfoService {
	/**
	 * @param {module:services/FeatureInfoService~featureInfoProvider} [featureInfoProvider=loadBvvFeatureInfo]
	 */
	constructor(featureInfoProvider = loadBvvFeatureInfo) {
		this._featureInfoProvider = featureInfoProvider;
		const { GeoResourceService: geoResourceService } = $injector.inject('GeoResourceService');
		this._geoResourceService = geoResourceService;
	}

	/**
	 * Executes a FeatureInfo request for a suitable GeoResource.
	 * If a GeoResource is not queryable, `null` will be returned as result.
	 * @param {string} geoResourceId The id of a GeoResource
	 * @param {Coordinate} coordinate The coordinate for the FeatureInfo request
	 * @param {number} mapResolution Current map resolution in meters
	 * @returns {Promise<FeatureInfoResult|null>} The result or `null`
	 */
	async get(geoResourceId, coordinate, mapResolution) {
		if (this.isQueryable(geoResourceId)) {
			try {
				return await this._featureInfoProvider(geoResourceId, coordinate, mapResolution);
			} catch (e) {
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
		return geoResource.queryable && geoResource instanceof WmsGeoResource;
	}
}

/**
 * @class
 */
export class FeatureInfoResult {
	/**
	 * @param {string} content The content of this FeatureInfoResult
	 * @param {string} [title=null] The title of this FeatureInfoResult
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
