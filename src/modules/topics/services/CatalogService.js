/**
 * @module modules/topics/services/CatalogService
 */
import {
	FALLBACK_GEORESOURCE_ID_0,
	FALLBACK_GEORESOURCE_ID_1,
	FALLBACK_GEORESOURCE_ID_2,
	FALLBACK_GEORESOURCE_ID_3
} from '../../../services/GeoResourceService';
import { FALLBACK_TOPICS_IDS } from '../../../services/TopicsService';
import { loadBvvCatalog } from './provider/catalog.provider';

/**
 * @typedef {Object} CatalogEntry
 * @property {string} label The label of this CatalogEntry
 * @property {boolean} [open] `true` if this entry should be displayed opened
 * @property {Array<module:modules/topics/services/CatalogService~GeoResouceRef|module:modules/topics/services/CatalogService~CatalogEntry>} children The elements of this CatalogEntry
 */

/**
 * @typedef {Object} GeoResouceRef
 * @property {string} geoResourceId The id of a {@link GeoResource}
 */

/**
 * An async function that provides an array of {@link module:modules/topics/services/CatalogService~CatalogEntry}.
 *
 * @async
 * @typedef {function} catalogProvider
 * @throws May throw when entries cannot be loaded
 * @return {module:modules/topics/services/CatalogService~CatalogEntry[]}
 */

/**
 * Service for loading catalog definitions.
 *
 * @class
 * @author taulinger
 */
export class CatalogService {
	/**
	 * @param {module:modules/topics/services/CatalogService~catalogProvider} [provider=loadBvvCatalog]
	 */
	constructor(provider = loadBvvCatalog) {
		this._provider = provider;
		this._cache = new Map();
	}

	/**
	 * Returns a catalog definition for an id.
	 * @public
	 * @param {string} topicId Id of the desired {@link Catalog}
	 * @returns {Array<module:modules/topics/services/CatalogService~CatalogEntry> | null}
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
				return this._newFallbackCatalog();
			}
			throw new Error('Could not load catalog from provider', { cause: e });
		}
	}

	/**
	 * @private
	 */
	_newFallbackCatalog() {
		return [
			{
				label: 'Subtopic 1',
				children: [
					{
						geoResourceId: FALLBACK_GEORESOURCE_ID_0
					},
					{
						geoResourceId: FALLBACK_GEORESOURCE_ID_1
					},
					{
						label: 'Suptopic 2',
						children: [
							{
								geoResourceId: FALLBACK_GEORESOURCE_ID_2
							}
						]
					}
				]
			},
			{
				geoResourceId: FALLBACK_GEORESOURCE_ID_3
			}
		];
	}
}
