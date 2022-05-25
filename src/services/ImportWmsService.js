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
     * @param {Credential} [credential] the optional credential, depending on whether the WMS specified by the URL is restricted or not.
     * @returns {Array<WmsGeoResource>} list of WMS GeoResources available at the specified URL
     */
	async forUrl(url, credential = null) {
		const geoResources = await this._wmsCapabilitiesProvider(url, credential);
		geoResources.forEach(geoResource => this._geoResourceService.addOrReplace(geoResource));
		return geoResources;
	}
}
