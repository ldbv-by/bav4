import { $injector } from '../injection';
import { SourceType, SourceTypeName } from './domain/sourceType';

import { bvvCapabilitiesProvider } from './provider/wmsCapabilities.provider';

/**
 *
 * @typedef {Object} ImportWmsOptions
 * @property {string} [id] the id of the created VectorGeoResource. If not set, id will be created
 * @property {string} [label] the label of the created VectorGeoResource
 * @property {SourceType} [sourceType] the source type
 */

/**
 * Service for importing WMS. Usually returns an array of {@link WmsGeoResource}.
 * @class
 * @author thiloSchlemmer
 */
export class ImportWmsService {

	/**
	 * @param {wmsCapabilitiesProvider} [wmsCapabilitiesProvider = bvvCapabilitiesProvider]
	 */
	constructor(wmsCapabilitiesProvider = bvvCapabilitiesProvider) {
		const { GeoResourceService: geoResourceService } = $injector.inject('GeoResourceService');
		this._geoResourceService = geoResourceService;
		this._wmsCapabilitiesProvider = wmsCapabilitiesProvider;
	}

	/**
	* Returns default wms import options.
	* @returns ImportWmsOptions
	*/
	_newDefaultImportWmsOptions() {
		return {
			isAuthenticated: false,
			sourceType: new SourceType(SourceTypeName.WMS, '1.1.1')
		};
	}

	/**
     * Imports WMS from an URL and returns an array of {@link WmsGeoResource}.
     * @param {string} url the url of a WMS
     * @param {SourceTypeResult} sourceTypeResult the sourceType and status of the WMS.
	 * @param {ImportWmsOptions} [options]
     * @returns {Array<WmsGeoResource>} list of WMS GeoResources available at the specified URL
     */
	async forUrl(url, options = {}) {
		const { isAuthenticated, sourceType } = { ...this._newDefaultImportWmsOptions(), ...options };
		const geoResources = await this._wmsCapabilitiesProvider(url, sourceType, isAuthenticated);
		geoResources.forEach(geoResource => this._geoResourceService.addOrReplace(geoResource));
		return geoResources;
	}
}
