/**
 * @module services/GeoResourceLegendService
 */

import { $injector } from '@src/injection';
import { bvvGeoResourceLegendProvider } from './provider/geoResourceLegend.provider';

/**
 * A function that returns legend entries for a given geoResourceId
 * @async
 * @param {string} geoResourceId
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
		this._provider = geoResourceLegendProvider;
	}

	/**
	 *  asynchronously returns a {@link Legend} object for a provided GeoResource ID. To achieve that it uses the geoResourceLegendProvider and caches its results
	 *
	 * @param {string} geoResourceId - The resourceId to receive the legend from
	 * @returns {Promise<Legend|null>} - A legend object containing information about the geoResource's legend entries
	 */
	async getLegendById(geoResourceId) {
		const cachedLegend = this._legendCache.find((legend) => legend.geoResourceId === geoResourceId);

		if (cachedLegend) {
			return cachedLegend;
		}

		try {
			const legend = await this._provider(geoResourceId);

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
		//@ts-ignore
		const { StoreService: storeService } = $injector.inject('StoreService');
		return [
			...new Set(
				storeService
					.getStore()
					.getState()
					//@ts-ignore
					.layers.active.filter((layer) => layer.legend === true)
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

	/**
	 *
	 * @param {string} geoResourceId The id of the associated GeoResource.
	 * @param {Array<Array<LegendEntry>>|Array<LegendEntry>} [entries] legends available for this GeoResource - A GeoResource can have multiple entries, represented by the outer array.
	 * The optional inner array indicates zoom-dependent legends where the index represents the zoom-level for that legendEntry.
	 *
	 */
	constructor(geoResourceId, entries = []) {
		this.#geoResourceId = geoResourceId;
		this.#entries = entries ?? [];
	}

	get geoResourceId() {
		return this.#geoResourceId;
	}

	get entries() {
		return [...this.#entries];
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
