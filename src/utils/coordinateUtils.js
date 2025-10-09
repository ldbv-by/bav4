/**
 * @module utils/coordinateUtils
 */
import { isCoordinate, isString } from './checks';

/**
 * Parses a string containing two coordinate values separated by a specified separator and returns them as coordinate.
 *
 * @param {string} coordinatesAsString - The string containing the coordinate values (e.g., "12.34,56.78").
 * @param {string} [separator=','] - The separator used to split the coordinate values in the string.
 * @returns {module:domain/coordinateTypeDef~Coordinate| null} The coordinate or `null`
 */
export const fromString = (coordinatesAsString, separator = ',') => {
	if (isString(coordinatesAsString)) {
		const values = coordinatesAsString.split(separator);

		const c = values?.length > 1 ? [values[0], values[1]].map((v) => parseFloat(v)).filter((c) => Number.isFinite(c)) : null;
		return isCoordinate(c) ? c : null;
	}
	return null;
};
