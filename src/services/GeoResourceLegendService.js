/**
 * @module services/GeoResourceLegendService
 */

import { $injector } from '@src/injection';
import { bvvGeoResourceLegendProvider } from './provider/geoResourceLegend.provider';

/**
 * A function that returns legend entries for a given geoResourceId
 * @async
 * @param {string} geoResourceId
 * @param {string} label
 * @typedef {Function} geoResourceLegendProvider
 * @throws `Error` with HTTP Status code when unsuccessful
 * @returns {Promise<Legend>|null} the legend of the provided geoResourceId or null if no legend exists
 */

/**
 * Service to receive legends from GeoResources
 *
 * @class
 * @author herrmutig
 */
export class GeoResourceLegendService {
	/**
	 * @type {Legend[]}
	 */
	_legendCache = [];

	/**
	 * provider to receive legends from
	 * @param {module:services/GeoResourceLegendService~geoResourceLegendProvider} [geoResourceLegendProvider=bvvGeoResourceLegendProvider]
	 */
	constructor(geoResourceLegendProvider = bvvGeoResourceLegendProvider) {
		//@ts-ignore
		const { StoreService: storeService, GeoResourceService: geoResourceService } = $injector.inject('StoreService', 'GeoResourceService');

		this._storeService = storeService;
		this._geoResourceService = geoResourceService;
		this._provider = geoResourceLegendProvider;
	}

	/**
	 *  asynchronously returns a {@link Legend} object for a provided GeoResource ID. To achieve that it uses the geoResourceLegendProvider and caches its results
	 *
	 * @param {string} geoResourceId The resourceId to receive the legend from
	 * @returns {Promise<Legend|null>} A legend object containing information about the geoResource's legend entries
	 */
	async getLegendById(geoResourceId) {
		const cachedLegend = this._legendCache.find((legend) => legend.geoResourceId === geoResourceId);

		if (cachedLegend) {
			return cachedLegend;
		}

		try {
			const label = this._geoResourceService.byId(geoResourceId).label;
			const legend = await this._provider(geoResourceId, label);

			if (legend) {
				this._legendCache.push(legend);
				return legend;
			}

			return null;
		} catch (e) {
			throw new Error('Could not load a Legend from provider', { cause: e });
		}
	}

	/**
	 * Lists all available geoResourceIds containing a legend.
	 * @returns {Array<string>}
	 */
	available() {
		return [
			...new Set(
				this._storeService
					.getStore()
					.getState()
					//@ts-ignore
					.layers.active.filter((layer) => this._geoResourceService.byId(layer.geoResourceId)?.legend === true)
					//@ts-ignore
					.map((layer) => layer.geoResourceId)
			)
		];
	}
}

/**
 * Contains information about the available legends for a GeoResource
 * @class
 * @author herrmutig
 */
export class Legend {
	#geoResourceId;
	#entries;
	#label;

	/**
	 *
	 * @param {string} geoResourceId The id of the associated GeoResource.
	 * @param {string} label The label to use for this legend
	 * @param {Array<Array<LegendEntry>>} [entries] legends available for this GeoResource - A GeoResource can have multiple LegendEntry groups, represented by the outer array.
	 * The inner array indicates zoom-dependent LegendEntries where the index represents the zoom-level. If the inner array contains exactly one LegendEntry, then it is used for all zoom-level (not zoom dependent).
	 *
	 */
	constructor(geoResourceId, label, entries = [[]]) {
		//@ts-ignore
		this.#geoResourceId = geoResourceId;
		this.#entries = entries ?? [[]];
		this.#label = label;
	}

	filterLegendEntriesByZoomLevel(zoom) {
		const result = [];
		for (const group of this.#entries) {
			if (group.length === 1) {
				result.push(group[0]);
				continue;
			}

			if (zoom < group.length) {
				result.push(group[zoom]);
				continue;
			}
		}

		return result;
	}

	get geoResourceId() {
		return this.#geoResourceId;
	}

	get entries() {
		return [...this.#entries];
	}

	get label() {
		return this.#label;
	}
}

/**
 * Holds the data of a map legend.
 * @class
 * @author herrmutig
 */
export class LegendEntry {
	#type;
	#urlOrData;

	/**
	 * @param {LegendEntryType} type The type of the entry.
	 * @param {string} data the associated data. Should be an url, base64 encoded or html
	 *
	 */
	constructor(type, data) {
		this.#type = type;
		this.#urlOrData = data;
	}

	get type() {
		return this.#type;
	}

	get urlOrData() {
		return this.#urlOrData;
	}
}

/**
 * The type to hint what data to expect from an {@link LegendEntry}
 * @readonly
 * @enum {string}
 * @author herrmutig
 */
export const LegendEntryType = Object.freeze({
	IMAGE_BASE64: 'IMAGE_BASE64',
	IMAGE_URL: 'IMAGE_URL',
	PDF_URL: 'PDF_URL',
	HTML: 'HTML'
});
