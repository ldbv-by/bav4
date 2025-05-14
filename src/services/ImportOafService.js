/**
 * @module services/ImportOafService
 */
import { $injector } from '../injection';

import { getAttributionProviderForGeoResourceImportedByUrl } from './provider/attribution.provider';
import { bvvOafFilterCapabilitiesProvider, bvvOafGeoResourceProvider } from './provider/oaf.provider';

/**
 * An async function that provides an array of {@link OafGeoResource}s
 * @async
 * @typedef {Function} oafGeoResourceProvider
 * @param {string} url
 * @param {module:services/ImportOafService~ImportOafOptions} [options]
 * @returns {Promise<Array<OafGeoResource>>} available categories
 */

/**
 * An async function that provides a `OafFilterCapabilities` object for a {@link OafGeoResource}
 * @async
 * @typedef {Function} oafFilterCapabilitiesProvider
 * @param {OafGeoResource} oafGeoResource
 * @param {module:domain/credentialDef~Credential} [credential]
 * @returns {Promise<Array<OafGeoResource>>} available categories
 */

/**
 *
 * @typedef {Object} ImportOafOptions
 * @property {boolean} [isAuthenticated] Whether or not the OAF service needs a authentication.
 * @property {Array<String>} [collections] Return only OafGeoResources matching the given collection ids.
 * @property {Array<String>} [ids] Desired ids of the created OafGeoResources. If not set, ids will be created automatically.
 */

/**
 * Service for importing OCG API Feature services. Usually returns an array of {@link OafGeoResource}.
 * @class
 * @author taulinger
 */
export class ImportOafService {
	/**
	 * @param {oafGeoResourceProvider} [oafGeoResourceProvider = bvvOafGeoResourceProvider]
	 * @param {oafFilterCapabilitiesProvider} [oafFilterCapabilitiesProvider = bvvOafFilterCapabilitiesProvider]
	 */
	constructor(oafGeoResourceProvider = bvvOafGeoResourceProvider, oafFilterCapabilitiesProvider = bvvOafFilterCapabilitiesProvider) {
		const { GeoResourceService: geoResourceService } = $injector.inject('GeoResourceService');
		this._geoResourceService = geoResourceService;
		this._geoResourceService = geoResourceService;
		this._oafGeoResourceProvider = oafGeoResourceProvider;
		this._oafFilterCapabilitiesProvider = oafFilterCapabilitiesProvider;
	}

	/**
	 * Returns the default OAF import options.
	 * @returns {module:services/ImportOafService~ImportOafOptions}
	 */
	_newDefaultImportOafOptions() {
		return {
			isAuthenticated: false,
			collections: [],
			ids: []
		};
	}

	/**
	 * Imports from a URL and returns an array of {@link OafGeoResource}.
	 * @param {string} url the url of a OCI API Features service
	 * @param {module:services/ImportOafService~ImportOafOptions} [options] the `ImportOafOptions`, if not or partially specified, the options will be filled with default values.
	 * @returns {Array<OafGeoResource>} list of `OafGeoResource`s available at the specified URL
	 * @throws Will pass through the error of the provider
	 */
	async forUrl(url, options = {}) {
		const completeOptions = { ...this._newDefaultImportOafOptions(), ...options };
		const geoResources = await this._oafGeoResourceProvider(url, completeOptions);
		return geoResources
			.map((gr) => gr.setAttributionProvider(getAttributionProviderForGeoResourceImportedByUrl(url)))
			.map((gr) => this._geoResourceService.addOrReplace(gr));
	}

	/**
	 * Returns the `OafFilterCapabilities` for a `OafGeoResource`
	 * @param {OafGeoResource} oafGeoResource
	 * @returns {module:domain/oaf~OafFilterCapabilities|null} `OafFilterCapabilities` or null if none are available
	 * @throws Will pass through the error of the provider
	 */
	async getFilterCapabilities(oafGeoResource) {
		return this._oafFilterCapabilitiesProvider(oafGeoResource);
	}
}
