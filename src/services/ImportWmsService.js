import { $injector } from '../injection';
import { SourceType, SourceTypeName } from '../domain/sourceType';

import { bvvCapabilitiesProvider } from './provider/wmsCapabilities.provider';
import { getAttributionProviderForGeoResourceImportedByUrl } from './provider/attribution.provider';

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
	 * Imports WMS from a URL and returns an array of {@link WmsGeoResource}.
	 * @param {string} url the url of a WMS
	 * @param {ImportWmsOptions} [options] the importWmsOptions, if not or partially specified, the options will be filled with default values.
	 * @returns {Array<WmsGeoResource>} list of WMS GeoResources available at the specified URL
	 * @throws Will pass through the error of the provider
	 */
	async forUrl(url, options = {}) {
		const { isAuthenticated, sourceType } = { ...this._newDefaultImportWmsOptions(), ...options };
		const geoResources = await this._wmsCapabilitiesProvider(this._urlService.originAndPathname(url), sourceType, isAuthenticated);
		return geoResources
			.map(gr => gr.setImportedByUser(true))
			.map(gr => gr.setAttributionProvider(getAttributionProviderForGeoResourceImportedByUrl(url)))
			.map(gr => this._geoResourceService.addOrReplace(gr));
	}
}
