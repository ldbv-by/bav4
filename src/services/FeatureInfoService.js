/**
 * @module services/FeatureInfoService
 */
import { $injector } from '../injection';
import { loadBvvFeatureInfo } from './provider/featureInfo.provider';

/**
 * An async function that returns a {@link GeoResourceInfoResult} for a `coordinate`.
 * @async
 * @typedef {Function} featureInfoProvider
 * @param {string} geoResourceId The id of the corresponding GeoResource
 * @param {module:domain/coordinateTypeDef~Coordinate} coordinate3857 The coordinate in 3857
 * @param {number} mapResolution The current resolution of the map in meters
 * @param {string|null} timestamp The timestamp or `null`
 * @throws `Error`
 * @returns {Promise<module:domain/featureInfo~FeatureInfo>}
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
	 * @returns {Promise<module:domain/featureInfo~FeatureInfo|null>} The result or `null`
	 */
	async get(geoResourceId, coordinate, mapResolution, timestamp) {
		if (this._geoResourceService.byId(geoResourceId)?.queryable) {
			try {
				return await this._featureInfoProvider(geoResourceId, coordinate, mapResolution, timestamp);
			} catch (e) {
				throw new Error(`Could not load a FeatureInfoResult from provider: ${e}`);
			}
		}
		return null;
	}
}
