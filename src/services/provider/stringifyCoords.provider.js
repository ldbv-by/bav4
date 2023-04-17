/**
 * @module service/provider
 */
import { createStringXY } from 'ol/coordinate';

/**
 * A function that returns a string representaion of a coordinate.
 *
 * @typedef {function(Coordinate, CoordinateRepresentation, transformFn, object):(string)} stringifyCoordProvider
 */

/**
 * @function
 * @param {CoordinateRepresentation} coordinateRepresentation
 * @param {object} options
 * @returns {stringifyCoordProvider}
 */
export const bvvStringifyFunction = (coordinate, coordinateRepresentation, transformFn, options = {}) => {
	const { global, code, digits } = coordinateRepresentation;
	if (global && code !== 4326) {
		return code === 3857 ? createStringXY(digits)(coordinate) : `pending support for global ${coordinateRepresentation.label}`;
	}

	if (code === 4326) {
		return createStringLatLong(options.digits ?? coordinateRepresentation.digits)(transformFn(coordinate, 3857, code));
	}
	return createStringUTM(code, options.digits ?? coordinateRepresentation.digits, transformFn)(transformFn(coordinate, 3857, code));
};

/**
 * A function that returns a function specific for the representation of geographic
 * point location according to {@link https://en.wikipedia.org/wiki/ISO_6709|ISO 6709}.
 * Switching [X,Y,(Z,M)] to [Y,X].
 * @param {number} digits
 */
const createStringLatLong = (digits) => {
	// Possible Z-, M-values are currently ignored. This may change in future implementations.
	return (coordinate4326) => createStringXY(digits)(coordinate4326.slice(0, 2).reverse());
};

const createStringUTM = (srid, digits, transformFn) => {
	return (coordinate) => {
		const zoneNumber = srid === 25832 ? '32' : '33';
		const zoneBand = determineUtmZoneBand(transformFn(coordinate, srid, 4326));

		const coord = createStringXY(digits)(coordinate).replace(/\B(?=(\d{3})+(?!\d))/g, '');
		return `${zoneNumber}${zoneBand} ${coord}`;
	};
};

const determineUtmZoneBand = (coordinate4326) => {
	if (coordinate4326[1] < 54 && coordinate4326[1] >= 48) {
		return 'U';
	} else if (coordinate4326[1] < 48 && coordinate4326[1] >= 42) {
		return 'T';
	}
	return '';
};
