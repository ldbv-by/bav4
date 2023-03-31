/**
 * @typedef {Object} MapFeedback
 * @property {string} state the encoded state of the map
 * @property {string} category the category of this feedback message
 * @property {string} description the category of this feedback message
 * @property {string} [email] the email address of the editor of this feedback message
 * @property {string} [fileId] the id of the referenced geometry file of this feedback message
 */

/**
 * It's a stub!
 * @class
 */
export class MapFeedbackService {
	constructor() {
		this._categories = ['Foo', 'Bar'];
	}
	/**
	 * Returns all possible categories for a MapFeedback.
	 * @throws an {@link Error} when categories are not available.
	 * @returns {Array<String>}
	 */
	async getCategories() {
		return [...this._categories];
	}

	/**
	 *
	 * Saves a MapFeedback object.
	 * @param {MapFeedback} mapFeedback
	 * @throws an {@link Error} when saving was not succesfull
	 */
	// eslint-disable-next-line no-unused-vars
	async save(mapFeedback) {
		console.log('🚀 ~ MapFeedbackService ~ save ~ mapFeedback:', mapFeedback);
		return true;
	}
}
