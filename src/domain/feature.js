/**
 * @module domain/feature
 */
/**
 * A feature.
 */
export class Feature {
	#id;
	#geometry;
	#properties = {};
	/**
	 *
	 * @param {Geometry} geometry The geometry of this feature
	 * @param {String} id The id of this feature
	 */
	constructor(geometry, id = null) {
		this.#id = id;
		this.#geometry = geometry;
	}

	set(key, value) {
		this.#properties[key] = value;
		return this.getProperties();
	}

	get(key) {
		return this.getProperties()[key] ?? null;
	}

	remove(key) {
		delete this.#properties[key];
		return this.getProperties();
	}

	getProperties() {
		return { ...this.#properties };
	}

	get id() {
		return this.#id;
	}

	set id(id) {
		this.#id = id;
	}

	get geometry() {
		return this.#geometry;
	}
}
