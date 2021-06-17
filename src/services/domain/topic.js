/**
 * Defines style properties for a topic.
 * @typedef {Object} TopicStyle
 * @property {number} [hue] css hue value (0-360)
 * @property {string} [icon] svg
 */



/**
* @class
*/
export class Topic {

	constructor(id, label, description, baseGeoRs, defaultBaseGeoR = baseGeoRs[0], activatedGeoRs = [], selectedGeoRs = [], style = { hue: null, icon: null }) {

		this._id = id;
		this._label = label;
		this._description = description;
		this._defaultBaseGeoR = defaultBaseGeoR;
		this._baseGeoRs = baseGeoRs;
		this._activatedGeoRs = activatedGeoRs;
		this._selectedGeoRs = selectedGeoRs;
		this._style = style;
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