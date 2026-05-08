/**
 * @module services/GeoResourceLegendService
 */

/**
 * Service for authentication and authorization tasks.
 *
 * @class
 * @author herrmutig
 */
export class GeoResourceLegendService {
	/**
	 * Lists all available geoResourceIds containing a legend.
	 * @type string[]
	 */
	#available = [];

	constructor(geoResourceLegendProvider = null) {
		this._geoResourceLegendProvider = geoResourceLegendProvider;
	}

	/**
	 *  asynchronously receives a {@link Legend}
	 *
	 * @param {string} geoResourceId - The resourceId to receive the legend from
	 * @returns {Legend} - A legend object containing information about the geoResource's legend entries
	 */
	async getLegendById(geoResourceId) {
		return {};
	}

	getAvailableLegends() {
		return [...this.#available];
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
	 * @param {Array<LegendEntry>|Array<Array<LegendEntry>>} [entries] legends available for this geoResource - optional inner array indicates zoom-dependent legends where the index represents the zoom-level for that legendEntry
	 *
	 */
	constructor(geoResourceId, entries) {
		this.#geoResourceId = geoResourceId;
		this.#entries = entries;
	}

	get geoResourceId() {
		return this.#geoResourceId;
	}

	get entries() {
		// TODO - inner array should be spreaded as well or freezed to avoid unintentional modifications
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
	IMAGE_BASE64: 'image_base64',
	IMAGE_URL: 'image_url',
	PDF_URL: 'pdf_url',
	HTML: 'html'
});
