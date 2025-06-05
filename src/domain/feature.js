/**
 * @module domain/feature
 */

import { isString } from '../utils/checks';
import { BaGeometry } from './geometry';

/**
 * A "framework-neutral" feature in the BA context.
 */
export class BaFeature {
	#id;
	#geometry;
	#styleHint;
	#style;
	#properties = {};
	/**
	 *
	 * @param {BaGeometry} geometry The geometry of this feature
	 * @param {String} id The id of this feature
	 */
	constructor(geometry, id) {
		if (!(geometry instanceof BaGeometry)) {
			throw new Error('<geometry> must be a Geometry');
		}
		if (!isString(id)) {
			throw new Error('<id> must be a String');
		}
		this.#id = id;
		this.#geometry = geometry;
	}

	/**
	 * Sets a property
	 * @param {string} key
	 * @param {*} value
	 * @returns `this` for chaining
	 */
	set(key, value) {
		if (isString(key)) {
			this.#properties[key] = value;
		}
		return this;
	}

	/**
	 * Returns a property
	 * @param {string} key
	 * @returns the property or `null`
	 */
	get(key) {
		return this.getProperties()[key] ?? null;
	}

	/**
	 * Removes a property
	 * @param {string} key
	 * @returns `this` for chaining
	 */
	remove(key) {
		delete this.#properties[key];
		return this;
	}

	getProperties() {
		return { ...this.#properties };
	}

	/**
	 * Set the style hint for this `VectorGeoResource`
	 * @param {module:domain/styles~StyleHint|null} styleHint
	 * @returns {BaFeature}
	 */
	setStyleHint(styleHint) {
		if (styleHint || styleHint === null) {
			this.#styleHint = styleHint;
		}
		return this;
	}
	/**
	 * @returns `true` if this Feature has specific style hint
	 */
	hasStyleHint() {
		return !!this.#styleHint;
	}

	get styleHint() {
		return this.#styleHint ?? null;
	}

	/**
	 * Sets the `Style` for this `BaFeature`.
	 * @param {module:domain/styles~Style|null} style the style
	 * @returns {BaFeature} `this` for chaining
	 */
	setStyle(style) {
		if (style || style === null) {
			this.#style = style;
		}
		return this;
	}

	/**
	 * The style of this `AbstractVectorGeoResource`.
	 *  @type {module:domain/styles~Style|null}
	 */
	get style() {
		return this.#style;
	}

	/**
	 * @returns {boolean}`true` if this `BaFeature` has specific `Style`
	 */
	hasStyle() {
		return !!this.#style;
	}

	get id() {
		return this.#id;
	}

	get geometry() {
		return this.#geometry;
	}
}
