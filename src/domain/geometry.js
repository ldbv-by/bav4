/**
 * @module domain/geometry
 */
/**
 * A geometry. The actual geometry is encoded as the specified VectorSourceType or `null` if it is unknown (in that case a consumer should use the `SourceTypeService`  for determination).
 */
export class Geometry {
	#data;
	#sourceType;
	/**
	 *
	 * @param {String} data The data of this geometry
	 * @param {VectorSourceType} [sourceType] The data type of this geometry or `null` if unknown
	 */
	constructor(data, sourceType = null) {
		this.#data = data;
		this.#sourceType = sourceType;
	}

	get data() {
		return this.#data;
	}

	get sourceType() {
		return this.#sourceType;
	}
}
