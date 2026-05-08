/**
 * @module services/GeoResourceLegendService
 */

/**
 *
 * @typedef {Object} Legend
 * @property {string} geoResourceId The id of the associated geoResource.
 * @property {Array<LegendEntry> | Array<Array<LegendEntry>>} [entries] legends available for this geoResource - optional inner array indicates zoom-dependent legends where the index represents the zoom-level for that legendEntry
 *
 */

/**
 *
 * @typedef {Object} LegendEntry
 * @property {LegendEntryType} type The type of the entry.
 * @property {string} data the associated data. Can be an url, base64 encoded or html
 *
 */

/**
 * The type to hint what data to expect from an {@link LegendEntry}
 * @readonly
 * @enum {string}
 */
export const LegendEntryType = Object.freeze({
	IMAGE_BASE64: 'image_base64',
	IMAGE_URL: 'image_url',
	PDF_URL: 'pdf_url',
	HTML: 'html'
});

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
