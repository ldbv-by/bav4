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

/**
 * Normalizes a coordinate in map projection (EPSG:3857).
 *
 * In this projection, the x-coordinate is wrapped around the boundary value @see {@link https://epsg.io/3857|3857}
 * of 20037508.34 meters.This means that if the x-coordinate exceeds this boundary, it is adjusted to fall within the valid range.
 *
 * @param {module:domain/coordinateTypeDef~Coordinate} coordinate - The coordinate to be normalized.
 * @returns {module:domain/coordinateTypeDef~Coordinate} The normalized coordinate.
 */
export const normalize = (coordinate) => {
	const normalizeByBoundary = (value, boundary) => {
		const worldOffset = boundary * 2;
		return ((value + worldOffset) % worldOffset) - Math.trunc(((value + worldOffset) % worldOffset) / boundary) * worldOffset;
	};

	// boundary for WebMercator coordinate values
	const boundaryValue = 20037508.34;

	// only the x-coordinate must be normalized in WebMercator projection
	return [normalizeByBoundary(coordinate[0], boundaryValue), coordinate[1]];
};
