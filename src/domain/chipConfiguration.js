/**
 * Defines style properties for a topic.
 * @typedef {Object} TopicStyle
 * @property {number} [hue=null] css hue value (0-360)
 * @property {string} [icon=null] svg
 */



/**
* @class
*/
export class ChipConfiguration {

	/**
	 * @param {string} id id of this Chip
	 * @param {string} title title of this Chip
	 * @param {string} href href of this Chip Link
	 * @param {string} target open in the link in a modal or external
	 * @param {boolean} permanent show the Chip always
	 * @param {TopicStyle} [style] The style of this Chip
	 */
	constructor(id, title, href, target, permanent = false, style = { hue: null, icon: null }) {

		this._id = id;
		this._title = title;
		this._href = href;
		this._target = target;
		this._permanent = permanent;
		this._style = { hue: null, icon: null, ...style };
	}

	get id() {
		return this._id;
	}

	get title() {
		return this._title;
	}

	get href() {
		return this._href;
	}

	get target() {
		return this._target;
	}

	get permanent() {
		return this._permanent;
	}

	get style() {
		return this._style;
	}
}
