import { FALLBACK_TOPICS_IDS } from '../../../services/TopicsService';
import { loadFallbackCatalog, loadBvvCatalog } from './provider/catalog.provider';

/**
 * Loads a catalog definition by a topic id.
 * @callback CatalogProvider
 * @param {String} topicId  Topic Id
 * @returns {Promise<Array<Object>>} Catalog definitions
 */

/**
 * Service for loading catalog definitions.
 *
 * @class
 * @author taulinger
 */
export class CatalogService {
	/**
	 *
	 * @param {CatalogProvider} [catalogProvider=loadBvvCatalog]
	 */
	constructor(provider = loadBvvCatalog) {
		this._provider = provider;
		this._cache = new Map();
	}

	/**
	 * Returns a catalog definition for an id.
	 * @public
	 * @param {string} id Id of the desired {@link GeoResource}
	 * @returns {GeoResource | null}
	 */
	async byId(topicId) {
		try {
			if (!this._cache.has(topicId)) {
				const catalog = await this._provider(topicId);
				this._cache.set(topicId, catalog);
			}
			return this._cache.get(topicId);
		} catch (e) {
			//do we have a fallback topic?
			if (FALLBACK_TOPICS_IDS.includes(topicId)) {
				return this._newFallbackCatalog(topicId);
			}
			throw new Error('Could not load catalog from provider: ' + e.message);
		}
	}

	/**
	 * @private
	 */
	_newFallbackCatalog() {
		return loadFallbackCatalog();
	}
}
