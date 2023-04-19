/**
 * @module services/MapFeedbackService
 */
/**
 * @typedef {Object} MapFeedback
 * @property {string} state The encoded state of the map
 * @property {string} category The category of this feedback message
 * @property {string} description The actual message of this feedback message
 * @property {string} fileId The id of the referenced geometry file of this feedback message
 * @property {string} [email] The email address of the editor of this feedback message
 */

import { bvvMapFeedbackCategoriesProvider, bvvMapFeedbackStorageProvider } from './provider/mapFeedbackStorage.provider';

/**
 * A function that stores a MapFeedback
 * @async
 * @param {module:services/MapFeedbackService~MapFeedback} mapFeedback
 * @typedef {Function} mapFeedbackStorageProvider
 * @throws {@link Error} when storing was not succesfull
 * @returns {Promise<Boolean>} `true` when storing was successful
 */
/**
 * A function that returns a list of categories for a MapFeedback
 * @async
 * @typedef {Function} mapFeedbackCategoriesProvider
 * @returns {Array<String>} available categories
 */

/**
 * @class
 */
export class MapFeedbackService {
	/**
	 *
	 * @param {module:services/MapFeedbackService~mapFeedbackStorageProvider} mapFeedbackStorageProvider
	 * @param {module:services/MapFeedbackService~mapFeedbackCategoriesProvider} mapFeedbackCategoriesProvider
	 */
	constructor(mapFeedbackStorageProvider = bvvMapFeedbackStorageProvider, mapFeedbackCategoriesProvider = bvvMapFeedbackCategoriesProvider) {
		this._mapFeedbackStorageProvider = mapFeedbackStorageProvider;
		this._mapFeedbackCategoriesProvider = mapFeedbackCategoriesProvider;
		this._categories = null;
	}
	/**
	 * Returns all possible categories for a MapFeedback.
	 * @throws `Error` when categories are not available.
	 * @returns {Array<String>}
	 */
	async getCategories() {
		if (!this._categories) {
			this._categories = await this._mapFeedbackCategoriesProvider();
		}
		return [...this._categories];
	}

	/**
	 *
	 * Saves a MapFeedback object.
	 * @param {module:services/MapFeedbackService~MapFeedback} mapFeedback
	 * @throws `Error` when storing was not succesfull
	 * @returns {Boolean} `true` when storing was successful
	 */
	async save(mapFeedback) {
		return this._mapFeedbackStorageProvider(mapFeedback);
	}
}
