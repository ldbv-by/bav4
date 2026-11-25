/**
 * @module services/ViewService
 */
import { GeoResourceTypes } from '@src/domain/geoResources';
import { Tools, WcTools } from '@src/domain/tools';
import { ViewMode } from '@src/domain/view';
import { $injector } from '@src/injection';

/**
 * Provides availability checks for GeoResources and tools based on the current view mode.
 * @class
 */
export class ViewService {
	#geoResourceService;

	/**
	 *
	 */
	constructor() {
		const { GeoResourceService: geoResourceService } = $injector.inject('GeoResourceService');
		this.#geoResourceService = geoResourceService;
	}

	/**
	 * Checks whether a GeoResources is available for use.
	 * Aggregate GeoResource are available only when all their child GeoResource are available.
	 * @param {string} geoResourceId the ID of the GeoResources
	 * @returns {boolean} `true` when the GeoResources or all aggregate children are supported
	 */
	isGeoResourceAvailable(geoResourceId) {
		const geoResource = this.#geoResourceService.byId(geoResourceId);
		if (geoResource) {
			const supportedTypes = [GeoResourceTypes.XYZ, GeoResourceTypes.WMS, GeoResourceTypes.VECTOR];

			if (geoResource.getType() === GeoResourceTypes.AGGREGATE) {
				return geoResource.geoResourceIds.map((grId) => this.isGeoResourceAvailable(grId)).every((val) => val === true);
			}

			return supportedTypes.includes(geoResource.getType());
		}
		return false;
	}

	/**
	 * Checks whether a tool is available in the current view mode.
	 * @param {string} toolId the ID of the tool
	 * @returns {boolean} `true` when the tool is available
	 */
	isToolAvailable(toolId) {
		const d2Tools = [...Object.values(Tools), ...WcTools];
		const d3Tools = [Tools.SHARE, Tools.IMPORT, Tools.EXPORT];

		return this._getCurrentViewMode() === ViewMode.D2 ? d2Tools.includes(toolId) : d3Tools.includes(toolId);
	}

	/**
	 * Returns the normalized current view mode.
	 * @returns {string} `ViewMode.D3` or `ViewMode.D2`
	 */
	_getCurrentViewMode() {
		const { StoreService: storeService } = $injector.inject('StoreService');
		return storeService.getStore().getState().view.mode === ViewMode.D3 ? ViewMode.D3 : ViewMode.D2;
	}
}
