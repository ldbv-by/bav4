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
import { copyCatalogToProd, loadBvvCatalog } from './provider/catalog.provider';

/**
 * An async function that provides an array of {@link module:modules/topics/services/CatalogService~CatalogEntry}.
 *
 * @async
 * @typedef {function} catalogProvider
 * @throws May throw when entries cannot be loaded
 * @return {module:domain/catalogTypeDef~CatalogEntry[]}
 */

/**
 * Service for loading catalog definitions.
 *
 * @class
 * @author taulinger
 */
export class CatalogService {
	/**
	 * @param {module:modules/topics/services/CatalogService~catalogProvider} [loadBvvCatalogProvider=loadBvvCatalog]
	 */
	constructor(loadBvvCatalogProvider = loadBvvCatalog, bvvCopyCatalogToProd = copyCatalogToProd) {
		const { ConfigService: configService } = $injector.inject('ConfigService');
		this._configService = configService;
		this._copyCatalogToProd = bvvCopyCatalogToProd;
		this._loadBvvCatalogProvider = loadBvvCatalogProvider;
		this._cache = new Map();
	}

	/**
	 * Returns a catalog definition for an id.
	 * @async
	 * @public
	 * @param {string} topicId Id of the desired {@link Catalog}
	 * @returns {Promise<Array<module:domain/catalogTypeDef~CatalogEntry>|null>}
	 */
	async byId(topicId) {
		try {
			if (!this._cache.has(topicId)) {
				const catalog = await this._loadBvvCatalogProvider(topicId);
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

	async save(catalog) {
		const { ConfigService: configService } = $injector.inject('HttpService', 'ConfigService');

		const url = `${configService.getValueAsPath('BACKEND_URL')}adminui/catalog/ba`;
		const adminToken = configService.getValue('ADMIN_TOKEN_KEY');

		fetch(url, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				'X-AUTH-ADMIN-TOKEN': adminToken
			},
			body: JSON.stringify(catalog)
		})
			// eslint-disable-next-line promise/prefer-await-to-then
			.then(() => {
				const message = 'Catalog successfully saved.';
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

	async copyCatalogToProd(topicId) {
		try {
			const result = await this._copyCatalogToProd(topicId);
			return result;
		} catch (error) {
			console.error('Failed to copy catalog to production environment:', error);
			throw error;
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
