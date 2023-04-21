/**
 * @module services/FeedbackService
 */

import { bvvMapFeedbackCategoriesProvider, bvvFeedbackStorageProvider } from './provider/feedback.provider';

/**
 * A function that stores a feedback.
 * @async
 * @param {MapFeedback|GeneralFeedback} feedback
 * @typedef {Function} feedbackStorageProvider
 * @throws `Error` when storing was not succesfull
 * @returns {Promise<Boolean>} `true` when storing was successful
 */
/**
 * A function that returns a list of categories for a MapFeedback
 * @async
 * @typedef {Function} mapFeedbackCategoriesProvider
 * @returns {Array<String>} available categories
 */

/**
 * Entity for a general feedback message.
 */
export class GeneralFeedback {
	/**
	 * @param {String} description The actual message of this feedback message
	 * @param {String} [email] The email address of the editor of this feedback message
	 * @param {Number} [rating] The rating as number
	 */
	constructor(description, email = null, rating = null) {
		this.description = description;
		this.email = email;
		this.rating = rating;
	}
}
/**
 * Entity for a map related feedback message.
 */
export class MapFeedback {
	/**
	 * @param {String} state The URL-encoded state of the map
	 * @param {String} category The category of this feedback message
	 * @param {String} description The actual message of this feedback message
	 * @param {String} geometryId The id of the referenced geometry file of this feedback message
	 * @param {String} [email] The email address of the editor of this feedback message
	 */
	constructor(state, category, description, geometryId, email = null) {
		this.state = state;
		this.category = category;
		this.description = description;
		this.geometryId = geometryId;
		this.email = email;
	}
}

/**
 * @class
 */
export class FeedbackService {
	/**
	 *
	 * @param {module:services/MapFeedbackService~feedbackStorageProvider} feedbackStorageProvider
	 * @param {module:services/MapFeedbackService~mapFeedbackCategoriesProvider} mapFeedbackCategoriesProvider
	 */
	constructor(feedbackStorageProvider = bvvFeedbackStorageProvider, mapFeedbackCategoriesProvider = bvvMapFeedbackCategoriesProvider) {
		this._mapFeedbackStorageProvider = feedbackStorageProvider;
		this._mapFeedbackCategoriesProvider = mapFeedbackCategoriesProvider;
		this._categories = null;
	}
	/**
	 * Returns all possible categories for a MapFeedback.
	 * @async
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
	 * Saves a feedback object.
	 * @async
	 * @param {MapFeedback|GeneralFeedback} feedback
	 * @throws `Error` when storing was not succesfull
	 * @returns {Boolean} `true` when storing was successful
	 */
	async save(feedback) {
		if (feedback instanceof MapFeedback) {
			// we have MapFeedback object
			return this._mapFeedbackStorageProvider(feedback);
		} else if (feedback instanceof GeneralFeedback) {
			//we have a GeneralFeedback object (currently mocked)
			return true;
		}
		return false;
	}
}
