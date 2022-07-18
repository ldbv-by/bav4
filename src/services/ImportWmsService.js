import { $injector } from '../injection';
import { SourceType, SourceTypeName } from '../domain/sourceType';

import { bvvCapabilitiesProvider } from './provider/wmsCapabilities.provider';

/**
 *
 * @typedef {Object} ImportWmsOptions
 * @property {SourceType} [sourceType] the source type
 * @property {boolean} [isAuthenticated] Whether or not the wms needs a authentication.
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
		const { GeoResourceService: geoResourceService, UrlService: urlService } = $injector.inject('GeoResourceService', 'UrlService');
		this._geoResourceService = geoResourceService;
		this._urlService = urlService;
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
	 * @param {ImportWmsOptions} [options] the importWmsOptions, if not or partially specified, the options will be filled with default values.
     * @returns {Array<WmsGeoResource>} list of WMS GeoResources available at the specified URL
	 * @throws Will pass through the error of the provider
     */
	async forUrl(url, options = {}) {
		const { isAuthenticated, sourceType } = { ...this._newDefaultImportWmsOptions(), ...options };
		const geoResources = await this._wmsCapabilitiesProvider(this._urlService.originAndPathname(url), sourceType, isAuthenticated);
		geoResources.map(gr => gr.setImportedByUser(true)).forEach(geoResource => this._geoResourceService.addOrReplace(geoResource));
		return geoResources;
	}
}
