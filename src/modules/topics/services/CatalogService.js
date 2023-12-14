/**
 * @module modules/topics/services/CatalogService
 */
import { $injector } from '../../../injection/index';
import {
	FALLBACK_GEORESOURCE_ID_0,
	FALLBACK_GEORESOURCE_ID_1,
	FALLBACK_GEORESOURCE_ID_2,
	FALLBACK_GEORESOURCE_ID_3
} from '../../../services/GeoResourceService';
import { FALLBACK_TOPICS_IDS } from '../../../services/TopicsService';
import { LevelTypes, emitNotification } from '../../../store/notifications/notifications.action';
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
	 * @async
	 * @public
	 * @param {string} topicId Id of the desired {@link Catalog}
	 * @throws `Error` when loading was not successful
	 * @returns {Promise<Array<module:modules/topics/services/CatalogService~CatalogEntry> | null>}
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
	 *
	 * Saves a catalog object for an id.
	 * @async
	 * @param {string} topicId Id of the {@link Catalog} to be saved
	 * @param {@link Catalog} catalog to be saved
	 * @throws `Error` when storing was not successful
	 * @returns {Promise<Boolean>} `true` when storing was successful
	 */
	// Access to fetch at 'http://localhost:8075/ba-backend-v4/adminui/catalog/ba' from origin 'http://localhost:8080' has
	// been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource. If an opaque
	// response serves your needs, set the request's mode to 'no-cors' to fetch the resource with CORS disabled.
	//
	// async save(topicId, catalog) {
	// 	try {
	// 		const { HttpService: httpService, ConfigService: configService } = $injector.inject('HttpService', 'ConfigService');
	// 		const url = `${configService.getValueAsPath('BACKEND_URL')}adminui/catalog/ba`;

	// 		const response = await httpService.post(url, catalog, {
	// 			headers: {
	// 				'Content-Type': 'application/json',
	// 				'X-AUTH-ADMIN-TOKEN': 'adminToken123'
	// 			}
	// 		});
	// 		// eslint-disable-next-line no-console
	// 		console.log('🚀 ~ file: CatalogService.js:94 ~ CatalogService ~ save ~ response:', response);

	// 		// Handle success if needed
	// 		// eslint-disable-next-line no-console
	// 		console.log('Catalog successfully posted.');

	// 		return true;
	// 	} catch (error) {
	// 		console.error('There has been a problem with your HTTP request:', error);
	// 		return false;
	// 	}
	// }

	async save(catalog) {
		const { ConfigService: configService } = $injector.inject('HttpService', 'ConfigService');

		const url = `${configService.getValueAsPath('BACKEND_URL')}adminui/catalog/ba`;
		const adminToken = configService.getValue('ADMIN_TOKEN_KEY');

		fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-AUTH-ADMIN-TOKEN': adminToken
			},
			body: JSON.stringify(catalog)
			// body: JSON.stringify(catalog)
		})
			// eslint-disable-next-line promise/prefer-await-to-then
			.then(() => {
				const message = 'Catalog successfully posted.';
				// eslint-disable-next-line no-console
				console.log(message); // handle success, if needed
				emitNotification(message, LevelTypes.INFO);
			})
			// eslint-disable-next-line promise/prefer-await-to-then
			.catch((error) => {
				const message = 'There has been a problem with your fetch operation:';
				console.error(message, error);
				emitNotification(message, LevelTypes.ERROR);
			});

		return true;
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
