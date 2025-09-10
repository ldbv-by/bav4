/**
 * @module modules/admin/services/AdminCatalogService
 */
import { MediaType } from '../../../domain/mediaTypes';
import { $injector } from '../../../injection';

/**
 * Service for manipulating the Theme Catalog
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

	getCachedGeoResourceById(geoResourceId) {
		if (this.#cachedGeoResourcesDictionary) {
			return this.#cachedGeoResourcesDictionary[`${geoResourceId}`] ?? null;
		}
		return null;
	}

	getCachedGeoResources() {
		return this.#cachedGeoResources ? [...this.#cachedGeoResources] : [];
	}

	async getGeoResources() {
		const url = this._configService.getValueAsPath('BACKEND_URL') + 'georesources/all';
		this.#cachedGeoResources = await this._getRequestAsJson(url);
		this.#cachedGeoResourcesDictionary = Object.fromEntries(this.#cachedGeoResources.map((r) => [r.id, r]));

		return [...this.#cachedGeoResources];
	}

	async getTopics() {
		const url = this._configService.getValueAsPath('BACKEND_URL') + 'adminui/topics';
		return await this._getRequestAsJson(url);
	}

	async getCatalog(topic) {
		const url = this._configService.getValueAsPath('BACKEND_URL') + 'catalog/' + topic;
		return await this._getRequestAsJson(url);
	}

	async _getRequestAsJson(url) {
		const token = this._configService.getValue('BACKEND_ADMIN_TOKEN');
		try {
			const result = await this._httpService.get(url, {
				headers: {
					'Content-Type': MediaType.JSON,
					'x-auth-admin-token': token
				}
			});

			switch (result.status) {
				case 200:
					return await result.json();
				default:
					throw new Error(`Http-Status ${result.status}`);
			}
		} catch (ex) {
			// handle abort exception https://developer.mozilla.org/en-US/docs/Web/API/AbortController
			if (ex instanceof DOMException) {
				return null;
			}
			throw ex;
		}
	}
}
