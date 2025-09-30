/**
 * @module modules/admin/services/AdminCatalogService
 */

import { MediaType } from '../../../domain/mediaTypes';
import { $injector } from '../../../injection';
import { HttpService } from '../../../services/HttpService';

export const Environment = Object.freeze({
	STAGE: 'stage',
	PRODUCTION: 'production'
});

/**
 * Service for manipulating Catalogs
 * @class
 * @author herrmutig
 */
export class BvvAdminCatalogService {
	#cachedGeoResources;
	#cachedGeoResourcesDictionary;

	constructor() {
		const { HttpService: httpService, ConfigService: configService } = $injector.inject('HttpService', 'ConfigService');
		this._httpService = httpService;
		this._configService = configService;
	}

	/**
	 * Returns a cached geo-resource by id
	 * @param {number|string} geoResourceId - The id of the geo-resource.
	 * @returns {GeoResource}
	 */
	getCachedGeoResourceById(geoResourceId) {
		if (this.#cachedGeoResourcesDictionary) {
			return this.#cachedGeoResourcesDictionary[`${geoResourceId}`] ?? null;
		}
		return null;
	}

	/**
	 * Returns all geo-resources that were cached from the last invoked request
	 * @returns {Array<GeoResource>}
	 */
	getCachedGeoResources() {
		return this.#cachedGeoResources ? [...this.#cachedGeoResources] : [];
	}

	/**
	 * Requests and returns all geo-resources
	 * @async
	 * @throws `Error` when request failed
	 * @returns {Promise<Array<GeoResource>>}
	 */
	async getGeoResources() {
		const url = this._configService.getValueAsPath('BACKEND_URL') + 'georesources/all';
		this.#cachedGeoResources = await this._getRequestAsJson(url);
		this.#cachedGeoResourcesDictionary = Object.fromEntries(this.#cachedGeoResources.map((r) => [r.id, r]));

		return [...this.#cachedGeoResources];
	}

	/**
	 * Requests and returns all topics
	 * @async
	 * @throws `Error` when request failed
	 * @returns {Promise<Array<Topic>>}
	 */
	async getTopics() {
		const url = this._configService.getValueAsPath('BACKEND_URL') + 'adminui/topics';
		return await this._getRequestAsJson(url);
	}

	/**
	 * Requests and returns a catalog
	 * @async
	 * @param {number|string} topicId - The id of the topic.
	 * @throws `Error` when request failed
	 * @returns {Promise<Array<CatalogNode|CatalogLeaf>>}
	 */
	async getCatalog(topicId) {
		const url = this._configService.getValueAsPath('BACKEND_URL') + 'adminui/catalog/' + topicId;
		return await this._getRequestAsJson(url);
	}

	async saveCatalog(topicId, catalog) {
		const url = this._configService.getValueAsPath('BACKEND_URL') + 'adminui/catalog/' + topicId;
		const token = this._configService.getValue('BACKEND_ADMIN_TOKEN');
		const result = await this._httpService.fetch(url, { ...this._getFetchOptions(token), method: 'PUT', body: JSON.stringify(catalog) });

		switch (result.status) {
			case 200:
				return true;
			default:
				throw new Error(`Http-Status ${result.status}`, { cause: result });
		}
	}

	async publishCatalog(environment, topicId, body = {}) {
		const token = this._configService.getValue('BACKEND_ADMIN_TOKEN');

		const url = `${this._configService.getValueAsPath('BACKEND_URL')}adminui/${environment === Environment.PRODUCTION ? 'publish' : 'stage'}/catalog/${topicId}`;
		const result = await this._httpService.fetch(url, { ...this._getFetchOptions(token), method: 'PUT', body: body });

		switch (result.status) {
			case 200:
				return true;
			default:
				throw new Error(`Http-Status ${result.status}`, { cause: result });
		}
	}

	async _getRequestAsJson(url) {
		const token = this._configService.getValue('BACKEND_ADMIN_TOKEN');
		const result = await this._httpService.get(url, this._getFetchOptions(token));

		switch (result.status) {
			case 200:
				return await result.json();
			default: {
				throw new Error(`Http-Status ${result.status}`, { cause: result });
			}
		}
	}

	_getFetchOptions(token) {
		return {
			mode: HttpService.DEFAULT_REQUEST_MODE,
			headers: {
				'x-auth-admin-token': token,
				'Content-Type': MediaType.JSON
			}
		};
	}
}
