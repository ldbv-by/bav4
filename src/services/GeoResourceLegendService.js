/**
 * @module services/GeoResourceLegendService
 */

import { $injector } from '@src/injection';
import { requestGeoResourceLegend } from './provider/geoResourceLegend.provider';

/**
 * Service to receive legends from geo resources
 *
 * @class
 * @author herrmutig
 */
export class GeoResourceLegendService {
	/**
	 * Lists all available geoResourceIds containing a legend.
	 * @type string[]
	 */
	constructor(geoResourceLegendProvider = requestGeoResourceLegend) {
		this._geoResourceLegendProvider = geoResourceLegendProvider;
		this._provider = geoResourceLegendProvider;
		this._legendCache = [];
	}

	/**
	 *  asynchronously receives a {@link Legend}
	 *
	 * @param {string} geoResourceId - The resourceId to receive the legend from
	 * @returns {Legend|null} - A legend object containing information about the geoResource's legend entries
	 */
	async getLegendById(geoResourceId) {
		const cachedLegend = this._legendCache.find((legend) => legend.geoResourceId === geoResourceId);

		if (cachedLegend) {
			return cachedLegend;
		}

		const legend = JSON.parse(await this._provider(geoResourceId));

		if (legend) {
			this._legendCache.push(legend);
			return legend;
		}

		return null;
	}

	available() {
		const { StoreService: storeService } = $injector.inject('StoreService');
		return [
			...new Set(
				storeService
					.getStore()
					.getState()
					.layers.active.filter((layer) => layer.legend === true)
					.map((layer) => layer.geoResourceId)
			)
		];
	}
}

/**
 * Contains information about the available legends for a geoResource
 * @class
 * @author herrmutig
 */
export class Legend {
	#geoResourceId;
	#entries;

	/**
	 *
	 * @param {string} geoResourceId The id of the associated geoResource.
	 * @param {Array<Array<LegendEntry>>} [entries] legends available for this geoResource - optional inner array indicates zoom-dependent legends where the index represents the zoom-level for that legendEntry
	 *
	 */
	constructor(geoResourceId, entries = [[]]) {
		this.#geoResourceId = geoResourceId;
		this.#entries = entries ?? [[]];
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
