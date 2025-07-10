/**
 * @module services/ImportOafService
 */
import { OafGeoResource } from '../domain/geoResources';
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
 * @returns {Promise<Array<module:domain/oaf~OafFilterCapabilities>>} available categories
 */

/**
 *
 * @typedef {Object} ImportOafOptions
 * @property {boolean} [isAuthenticated] Whether or not the OAF service needs a authentication.
 * @property {Array<String>} [collections] Return only OafGeoResources matching the given collection ids.
 * @property {Array<String>} [ids] Desired ids of the created OafGeoResources. If not set, ids will be created automatically.
 */

/**
 * Default OafCapabilities cache duration
 * @constant
 */
export const DEFAULT_OAF_CAPABILITIES_CACHE_DURATION_SECONDS = 60 * 10; // 10min

/**
 * Service for importing OafGeoResource and OafFilterCapabilities,
 *
 * **OafFilterCapabilities Caching Strategy**
 * - OafFilterCapabilities are cached by OafGeoResource ID to reduce redundant provider calls.
 * - The cache uses a time-based expiry policy (default: 10 minutes).
 * - Cache expiry is enforced only in {@link getFilterCapabilities}. The method {@link getFilterCapabilitiesFromCache} does NOT check for expiry and may return stale data.
 * - If the cache grows large (many different GeoResources), there is currently no upper bound to the number of entries.
 *
 * **Error Handling**
 * - Errors from provider calls in {@link getFilterCapabilities} are propagated to the caller.
 * - In {@link getFilterCapabilitiesFromCache}, errors from asynchronous prefetches are logged as warnings but not propagated.
 *
 * **Usage Recommendations**
 * - Use {@link getFilterCapabilities} when you need up-to-date capabilities and want to respect cache expiry.
 * - Use {@link getFilterCapabilitiesFromCache} for fast cache lookups or to trigger background prefetching, but be aware that results may be stale.
 *
 * @class
 * @author taulinger
 */
export class ImportOafService {
	#filterCapabilitiesCache = new Map();
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
	 * Returns the `OafFilterCapabilities` for a `OafGeoResource`. Returns `null` for any other `GeoResource`.
	 * @param {OafGeoResource|GeoResource} oafGeoResource
	 * @returns {module:domain/oaf~OafFilterCapabilities|null} `OafFilterCapabilities` or null if none are available
	 * @throws Will pass through the error of the provider
	 */
	async getFilterCapabilities(oafGeoResource) {
		if (oafGeoResource instanceof OafGeoResource) {
			for (const [key, { created }] of this.#filterCapabilitiesCache) {
				if (Date.now() - created >= DEFAULT_OAF_CAPABILITIES_CACHE_DURATION_SECONDS * 1_000) {
					this.#filterCapabilitiesCache.delete(key);
				}
			}

			if (this.#filterCapabilitiesCache.has(oafGeoResource.id)) {
				return this.#filterCapabilitiesCache.get(oafGeoResource.id).data;
			}

			const oafFilterCapabilities = await this._oafFilterCapabilitiesProvider(oafGeoResource);
			if (oafFilterCapabilities) {
				this.#filterCapabilitiesCache.set(oafGeoResource.id, { created: new Date().getTime(), data: oafFilterCapabilities });
			}
			return oafFilterCapabilities;
		}
		return null;
	}

	/**
	 * Returns the `OafFilterCapabilities` for a `OafGeoResource` if they are already in the cache.
	 *
	 * Returns `null` if the `OafFilterCapabilities` are not in the cache but requests them asynchronously so that they may be available in the future.
	 *
	 * Returns `null` for any other `GeoResource` than `OafGeoResource`.
	 *
	 * **Cache Expiry Behaviour:**
	 * This method does **not** check whether the cached `OafFilterCapabilities` entry has expired. If an entry exists in the cache, it will be returned even if it is older than the current cache duration.
	 * Expired cache entries are only cleaned up in {@link getFilterCapabilities}. If you require up-to-date capabilities with respect to cache expiry, use {@link getFilterCapabilities} instead.
	 *
	 * Note: This method is primarily intended for synchronous cache lookups and optional background (asynchronous) prefetching.
	 *
	 * @param {OafGeoResource|GeoResource} oafGeoResource
	 * @param {boolean}[requestIfNotAvailable=true] `true` if a missing  `OafFilterCapabilities` object should be requested from the provider asynchronously
	 * @returns {module:domain/oaf~OafFilterCapabilities|null} `OafFilterCapabilities` or null if none are available
	 */
	getFilterCapabilitiesFromCache(oafGeoResource, requestIfNotAvailable = true) {
		if (oafGeoResource instanceof OafGeoResource) {
			if (this.#filterCapabilitiesCache.has(oafGeoResource.id)) {
				return this.#filterCapabilitiesCache.get(oafGeoResource.id).data;
			}

			if (requestIfNotAvailable) {
				this._oafFilterCapabilitiesProvider(oafGeoResource)
					// eslint-disable-next-line promise/prefer-await-to-then
					.then((oafFilterCapabilities) => {
						if (oafFilterCapabilities) {
							this.#filterCapabilitiesCache.set(oafGeoResource.id, { created: new Date().getTime(), data: oafFilterCapabilities });
						}
					})
					// eslint-disable-next-line promise/prefer-await-to-then
					.catch((error) => {
						console.warn(error);
					});
			}
		}
		return null;
	}
}
