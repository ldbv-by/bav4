import { bvvCapabilitiesProvider } from './provider/wmsCapabilities.provider';

/**
 * Service for importing WMS. Usually returns an Array of {@link WmsGeoResource}.
 * @class
 * @author thiloSchlemmer
 */
export class ImportWmsService {

	/**
	 * @param {wmsCapabilitiesProvider} [wmsCapabilitiesProvider = bvvCapabilitiesProvider]
	 */
	constructor(wmsCapabilitiesProvider = bvvCapabilitiesProvider) {
		this._wmsCapabilitiesProvider = wmsCapabilitiesProvider;
	}


	/**
     *
     * @param {string} url the url of a WMS
     * @param {Credential} [credential] the optional credential, depending on whether the WMS specified by the URL is restricted or not.
     * @returns {Array<WmsGeoResource>} list of WMS GeoResources available at the specified URL
     */
	async forUrl(url, credential = null) {
		return this._wmsCapabilitiesProvider(url, credential);
	}
}
