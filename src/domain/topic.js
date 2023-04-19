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
	 * @param {string} id id of this Topic
	 * @param {string} label label of this Topic
	 * @param {string} description description of this Topic
	 * @param {string[]} baseGeoRs GeoResources that represent possible base layers
	 * @param {string} [defaultBaseGeoR] a GeoResource that represent the default base layer
	 * @param {string[]} [activatedGeoRs] GeoResources that should be displayed "activated"
	 * @param {string[]} [selectedGeoRs] GeoResources that should displayed "selected"
	 * @param {TopicStyle} [style] The style of this Topic
	 */
	constructor(
		id,
		label,
		description,
		baseGeoRs,
		defaultBaseGeoR = baseGeoRs[0],
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

	get id() {
		return this._id;
	}

	get label() {
		return this._label;
	}

	get description() {
		return this._description;
	}

	get defaultBaseGeoR() {
		return this._defaultBaseGeoR;
	}

	get baseGeoRs() {
		return [...this._baseGeoRs];
	}

	get selectedGeoRs() {
		return [...this._selectedGeoRs];
	}

	get activatedGeoRs() {
		return [...this._activatedGeoRs];
	}

	get style() {
		return this._style;
	}
}
