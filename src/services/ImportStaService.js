/**
 * @module services/ImportStaService
 */
import { $injector } from '../injection';

import { getAttributionProviderForGeoResourceImportedByUrl } from './provider/attribution.provider';
import { bvvStaGeoResourceProvider } from './provider/sta.provider';

/**
 * An async function that provides an array of {@link StaGeoResource}s
 * @async
 * @typedef {Function} staGeoResourceProvider
 * @param {string} url
 * @param {module:services/ImportStaService~ImportStaOptions} [options]
 * @returns {Promise<Array<StaGeoResource>>} available categories
 */

/**
 *
 * @typedef {Object} ImportStaOptions
 * @property {boolean} [isAuthenticated] Whether or not the STA service needs a authentication.
 * @property {Array<String>} [observedProperties] Return only StaGeoResources matching the given observed properties.
 * @property {Array<String>} [ids] Desired ids of the created StaGeoResources. If not set, ids will be created automatically.
 */

/**
 * Service for importing StaGeoResources.
 *
 * @class
 * @author taulinger
 */
export class ImportStaService {
	/**
	 * @param {staGeoResourceProvider} [staGeoResourceProvider = bvvStaGeoResourceProvider]
	 */
	constructor(staGeoResourceProvider = bvvStaGeoResourceProvider) {
		const { GeoResourceService: geoResourceService } = $injector.inject('GeoResourceService');
		this._geoResourceService = geoResourceService;
		this._staGeoResourceProvider = staGeoResourceProvider;
	}

	/**
	 * Returns the default STA import options.
	 * @returns {module:services/ImportStaService~ImportStaOptions}
	 */
	_newDefaultImportStaOptions() {
		return {
			isAuthenticated: false,
			observedProperties: [],
			ids: []
		};
	}

	/**
	 * Imports from a URL and returns an array of {@link StaGeoResource}.
	 * @param {string} url the url of a OCI API Features service
	 * @param {module:services/ImportStaService~ImportStaOptions} [options] the `ImportStaOptions`, if not or partially specified, the options will be filled with default values.
	 * @returns {Array<StaGeoResource>} list of `StaGeoResource`s available at the specified URL
	 * @throws Will pass through the error of the provider
	 */
	async forUrl(url, options = {}) {
		const completeOptions = { ...this._newDefaultImportStaOptions(), ...options };
		const geoResources = await this._staGeoResourceProvider(url, completeOptions);
		return geoResources
			.map((gr) => gr.setAttributionProvider(getAttributionProviderForGeoResourceImportedByUrl(url)))
			.map((gr) => this._geoResourceService.addOrReplace(gr));
	}
}
