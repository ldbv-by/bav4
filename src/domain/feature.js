/**
 * @module domain/feature
 */

import { isString } from '../utils/checks';
import { Geometry } from './geometry';

/**
 * A feature.
 */
export class Feature {
	#id;
	#geometry;
	#styleHint;
	#properties = {};
	/**
	 *
	 * @param {Geometry} geometry The geometry of this feature
	 * @param {String} id The id of this feature
	 */
	constructor(geometry, id) {
		if (!(geometry instanceof Geometry)) {
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
	 * @param {StyleHint} styleHint
	 * @returns {Feature}
	 */
	setStyleHint(styleHint) {
		if (styleHint) {
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

	get id() {
		return this.#id;
	}

	get geometry() {
		return this.#geometry;
	}
}
