/**
 * @module domain/geometry
 */
/**
 * A geometry. The actual geometry is encoded as the specified data type.
 */
export class Geometry {
	#data;
	#dataType;
	#geometryType;
	/**
	 *
	 * @param {String} data The data of this source
	 * @param {GeometryType} geometryType The type of this source
	 * @param {GeometryDataType} dataType The data of this source
	 */
	constructor(data, geometryType, dataType) {
		this.#data = data;
		this.#geometryType = geometryType;
		this.#dataType = dataType;
	}

	get data() {
		return this.#data;
	}

	get geometryType() {
		return this.#geometryType;
	}

	get dataType() {
		return this.#dataType;
	}
}

/**
 * Type of a {@link Geometry}
 * @readonly
 * @enum {Number}
 */
export const GeometryDataType = Object.freeze({
	GEOJSON: 0
});
