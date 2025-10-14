/**
 * @module services/provider/stringifyCoords_provider
 */
import { LLtoUTM, forward } from '../../utils/mgrs';
import { GlobalCoordinateRepresentations } from '../../domain/coordinateRepresentation';
import { toLocaleString } from '../../utils/numberUtils';

/**
 * BVV specific implementation of {@link module:services/OlCoordinateService~stringifyCoordProvider}
 * @function
 * @type {module:services/OlCoordinateService~stringifyCoordProvider}
 */
export const bvvStringifyFunction = (coordinate, coordinateRepresentation, transformFn, options = {}) => {
	const { global, code, digits, id } = coordinateRepresentation;

	/*
	 * The coordinates could be from any of openlayers multiworlds, if the user pans off the edge.
	 * For this case we have to normalize the coordinates to the primary world.
	 */

	const normalizedCoordinate = normalize(coordinate);
	// all global coordinate representations
	if (global) {
		const stringifyGlobal = (id, coordinate) => {
			const coord4326 = transformFn(coordinate, 3857, 4326);
			switch (id) {
				case GlobalCoordinateRepresentations.SphericalMercator.id:
					return createStringXY(digits, true)(coordinate);
				case GlobalCoordinateRepresentations.WGS84.id:
					return stringifyLatLong(options.digits ?? coordinateRepresentation.digits)(coord4326);
				case GlobalCoordinateRepresentations.UTM.id: {
					const { northing, easting, zoneNumber, zoneLetter } = LLtoUTM({ lat: coord4326[1], lon: coord4326[0] });
					return `${zoneNumber}${zoneLetter} ${easting} ${northing}`;
				}
				case GlobalCoordinateRepresentations.MGRS.id:
					return forward(coord4326);
			}
		};
		return stringifyGlobal(id, normalizedCoordinate);
	}

	// all local coordinate representations
	return stringifyLocal(code, options.digits ?? coordinateRepresentation.digits, transformFn)(transformFn(normalizedCoordinate, 3857, code));
};

/**
 * A function that returns a function specific for the representation of geographic
 * point location according to {@link https://en.wikipedia.org/wiki/ISO_6709|ISO 6709}.
 * Switching [X,Y,(Z,M)] to [Y,X].
 * @param {number} digits
 * @ignore
 */
const stringifyLatLong = (digits) => {
	// Possible Z-, M-values are currently ignored. This may change in future implementations.
	return (coordinate4326) => createStringXY(digits, true)(coordinate4326.slice(0, 2).reverse());
};

const stringifyLocal = (srid, digits, transformFn) => {
	if (srid === 31468) {
		return (coordinate) => {
			return createStringXY(digits)(coordinate);
		};
	}

	const determineUtmZoneBand = (coordinate4326) => {
		if (coordinate4326[1] < 54 && coordinate4326[1] >= 48) {
			return 'U';
		} else if (coordinate4326[1] < 48 && coordinate4326[1] >= 42) {
			return 'T';
		}
		return '';
	};
	return (coordinate) => {
		const zoneNumber = srid === 25832 ? '32' : '33';
		const zoneBand = determineUtmZoneBand(transformFn(coordinate, srid, 4326));

		const coord = createStringXY(digits)(coordinate);
		return `${zoneNumber}${zoneBand} ${coord}`;
	};
};

const createStringXY = (fractionDigits, convertToLocalString = false) => {
	const convert = (value) => {
		return convertToLocalString ? toLocaleString(value, fractionDigits) : value;
	};

	return (coordinate) => `${convert(coordinate[0].toFixed(fractionDigits))} ${convert(coordinate[1].toFixed(fractionDigits))}`;
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
const normalize = (coordinate) => {
	const normalizeByBoundary = (value, boundary) => {
		const worldOffset = boundary * 2;
		return ((value + worldOffset) % worldOffset) - Math.trunc(((value + worldOffset) % worldOffset) / boundary) * worldOffset;
	};
	// boundary for WebMercator coordinate values
	const boundaryValue = 20037508.34;
	// only the x-coordinate must be normalized in WebMercator projection
	return [normalizeByBoundary(coordinate[0], boundaryValue), coordinate[1]];
};
