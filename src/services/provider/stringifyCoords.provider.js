/**
 * @module services/provider/stringifyCoords_provider
 */
import { LLtoUTM, forward } from '../../utils/mgrs';
import { GlobalCoordinateRepresentations } from '../../domain/coordinateRepresentation';

/**
 * Bvv specific implementation of {@link module:services/OlCoordinateService~stringifyCoordProvider}
 * @function
 * @type {module:services/OlCoordinateService~stringifyCoordProvider}
 */
export const bvvStringifyFunction = (coordinate, coordinateRepresentation, transformFn, options = {}) => {
	const { global, code, digits, label } = coordinateRepresentation;
	// all global coordinate representations
	if (global) {
		const stringifyGlobal = (label, coordinate) => {
			const coord4326 = transformFn(coordinate, 3857, 4326);
			switch (label) {
				case GlobalCoordinateRepresentations.SphericalMercator.label:
					return createStringXY(digits)(coordinate);
				case GlobalCoordinateRepresentations.WGS84.label:
					return stringifyLatLong(options.digits ?? coordinateRepresentation.digits)(coord4326);
				case GlobalCoordinateRepresentations.UTM.label: {
					const { northing, easting, zoneNumber, zoneLetter } = LLtoUTM({ lat: coord4326[1], lon: coord4326[0] });
					return `${zoneNumber}${zoneLetter} ${easting} ${northing}`;
				}
				case GlobalCoordinateRepresentations.MGRS.label:
					return forward(coord4326);
			}
		};
		return stringifyGlobal(label, coordinate);
	}

	// all local coordinate representations
	return stringifyLocalUTM(code, options.digits ?? coordinateRepresentation.digits, transformFn)(transformFn(coordinate, 3857, code));
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
	return (coordinate4326) => createStringXY(digits)(coordinate4326.slice(0, 2).reverse());
};

const stringifyLocalUTM = (srid, digits, transformFn) => {
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

const createStringXY = (fractionDigits) => {
	return (coordinate) => `${coordinate[0].toFixed(fractionDigits)} ${coordinate[1].toFixed(fractionDigits)}`;
};
