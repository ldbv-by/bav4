/**
 * @module domain/topic
 */
/**
 * Defines style properties for a topic.
 * @typedef {Object} TopicStyle
 * @property {number} [hue=null] css hue value (0-360)
 * @property {string} [icon=null] svg
 */

/**
 * @class
 */
export class Topic {
	/**
	 *
	 * @param {String} id The id of this Topic
	 * @param {String} label The label of this Topic
	 * @param {String} description The description of this Topic
	 * @param {Object<String, Array<String>>} [baseGeoRs] An object containing a list of GeoResources that represent possible default base layers of the map. Each key symbolizes a category of GeoResources.
	 * @param {String} [defaultBaseGeoR] An id of a GeoResource that represent the default base layer
	 * @param {String[]} [activatedGeoRs] A list of ids of GeoResources that should be displayed "activated"
	 * @param {String[]} [selectedGeoRs] A list of ids of GeoResources that should displayed "selected"
	 * @param {module:domain/topic~TopicStyle} [style] The style of this Topic
	 */
	constructor(
		id,
		label,
		description,
		baseGeoRs = null,
		defaultBaseGeoR = null,
		activatedGeoRs = [],
		selectedGeoRs = [],
		style = { hue: null, icon: null }
	) {
		this._id = id;
		this._label = label;
		this._description = description;
		this._defaultBaseGeoR = defaultBaseGeoR;
		this._baseGeoRs = baseGeoRs;
		this._activatedGeoRs = activatedGeoRs;
		this._selectedGeoRs = selectedGeoRs;
		this._style = { hue: null, icon: null, ...style };
	}

	/**
	 *  @type {String}
	 */
	get id() {
		return this._id;
	}

	/**
	 *  @type {String}
	 */
	get label() {
		return this._label;
	}

	/**
	 *  @type {String}
	 */
	get description() {
		return this._description;
	}

	/**
	 *  @type {String|null}
	 */
	get defaultBaseGeoR() {
		return this._defaultBaseGeoR;
	}

	/**
	 *  @type {Object|null}
	 */
	get baseGeoRs() {
		return this._baseGeoRs ? { ...this._baseGeoRs } : null;
	}

	/**
	 *  @type {Array}
	 */
	get selectedGeoRs() {
		return [...this._selectedGeoRs];
	}

	/**
	 *  @type {Array}
	 */
	get activatedGeoRs() {
		return [...this._activatedGeoRs];
	}

	/**
	 *  @type {Object}
	 */
	get style() {
		return this._style;
	}
}
