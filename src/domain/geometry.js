/**
 * @module domain/geometry
 */

import { isString } from '../utils/checks';
import { SourceType, SourceTypeName, SupportedVectorSourceTypes } from './sourceType';

/**
 * A "framework-neutral" geometry in the BA context.
 * The actual geometry is encoded as the specified SourceType or `null` if it is unknown (in that case a consumer can use the `SourceTypeService`  for determination).
 */
export class BaGeometry {
	#data;
	#sourceType;
	/**
	 *
	 * @param {String|object} data The data of this geometry (Note: type `object` is only allowed in case of sourceType == `SourceType.GeoJSON`)
	 * @param {SourceType} sourceType The source type of this geometry.
	 */
	constructor(data, sourceType) {
		if (!(sourceType instanceof SourceType)) {
			throw new Error('<sourceType> must be a SourceType');
		}
		if (sourceType && !SupportedVectorSourceTypes.includes(sourceType.name)) {
			throw new Error(`Unsupported source type: ${sourceType.name.toString()}`);
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
