/**
 * @module domain/geometry
 */

import { isString } from '../utils/checks';
import { SourceTypeName, SupportedVectorSourceTypes } from './sourceType';

/**
 * A geometry. The actual geometry is encoded as the specified SourceType or `null` if it is unknown (in that case a consumer can use the `SourceTypeService`  for determination).
 */
export class Geometry {
	#data;
	#sourceType;
	/**
	 *
	 * @param {String|object} data The data of this geometry (Note type `object' is only allowed in case of sourceType GeoJSON)
	 * @param {SourceType} [sourceType] The source type of this geometry or `null` if unknown
	 */
	constructor(data, sourceType = null) {
		if (sourceType && !SupportedVectorSourceTypes.includes(sourceType.name)) {
			throw new Error(`Unsupported source type: ${sourceType.toString()}`);
		}
		if (!isString(data) && sourceType.name !== SourceTypeName.GEOJSON) {
			throw new Error('<data> must be a String');
		}
		this.#data = isString(data) ? data : JSON.stringify(data);
		this.#sourceType = sourceType;
	}

	get data() {
		return this.#data;
	}

	get sourceType() {
		return this.#sourceType;
	}
}
