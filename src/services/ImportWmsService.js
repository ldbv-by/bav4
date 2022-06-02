import { $injector } from '../injection';

import { bvvCapabilitiesProvider } from './provider/wmsCapabilities.provider';

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
     * Imports WMS from an URL and returns an array of {@link WmsGeoResource}.
     * @param {string} url the url of a WMS
     * @param {SourceTypeResult} sourceTypeResult the sourceType and status of the WMS.
     * @returns {Array<WmsGeoResource>} list of WMS GeoResources available at the specified URL
     */
	async forUrl(url, sourceTypeResult) {
		const geoResources = await this._wmsCapabilitiesProvider(url, sourceTypeResult);
		geoResources.forEach(geoResource => this._geoResourceService.addOrReplace(geoResource));
		return geoResources;
	}
}
