/**
 * @module services/GeoResourceLegendService
 */

import { $injector } from '@src/injection';

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
	constructor(geoResourceLegendProvider = null) {
		this._geoResourceLegendProvider = geoResourceLegendProvider;
	}

	/**
	 *  asynchronously receives a {@link Legend}
	 *
	 * @param {string} geoResourceId - The resourceId to receive the legend from
	 * @returns {Legend|null} - A legend object containing information about the geoResource's legend entries
	 */
	async getLegendById(geoResourceId) {
		// Simulating asynchronous operation
		const mockLegends = [
			new Legend('atkis', [
				[
					new LegendEntry(LegendEntryType.IMAGE_URL, 'https://geodaten.bayern.de/wms/legend/legende_alkis_flurkarte_umr.png'),
					new LegendEntry(LegendEntryType.PDF_URL, 'https://geodaten.bayern.de/ba-data/Hilfe/legende_dtk100.pdf')
				]
			]),
			new Legend('tk', [
				[
					new LegendEntry(LegendEntryType.PDF_URL, 'https://geodaten.bayern.de/ba-data/Hilfe/legende_dtk50.pdf'),
					new LegendEntry(LegendEntryType.PDF_URL, 'https://geodaten.bayern.de/ba-data/Hilfe/legende_dtk100.pdf')
				]
			])
		];

		await new Promise((resolve) => setTimeout(resolve, 500));
		const legendMock = mockLegends.find((l) => l.geoResourceId === geoResourceId);

		if (legendMock) {
			return legendMock;
		}

		// TODO call provider and look up Legend + add new found legend to cache.
		return null;
	}

	available() {
		const { StoreService: storeService } = $injector.inject('StoreService');
		return [
			...new Set(
				storeService
					.getStore()
					.getState()
					.layers.active.map((layer) => layer.geoResourceId)
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
	#label;

	/**
	 *
	 * @param {string} geoResourceId The id of the associated geoResource.
	 * @param {Array<Array<LegendEntry>>} [entries] legends available for this geoResource - optional inner array indicates zoom-dependent legends where the index represents the zoom-level for that legendEntry
	 *
	 */
	constructor(geoResourceId, entries = [[]]) {
		const { GeoResourceService: geoResourceService } = $injector.inject('GeoResourceService');
		const resource = geoResourceService.byId(geoResourceId);
		this.#geoResourceId = geoResourceId;
		this.#label = resource.label;
		this.#entries = entries ?? [[]];
	}

	get geoResourceId() {
		return this.#geoResourceId;
	}

	get entries() {
		// TODO - inner array should be spreaded as well or freezed to avoid unintentional modifications
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
	IMAGE_BASE64: 'image_base64',
	IMAGE_URL: 'image_url',
	PDF_URL: 'pdf_url',
	HTML: 'html'
});
