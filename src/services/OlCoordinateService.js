import { fromLonLat, toLonLat, transformExtent, transform } from 'ol/proj';
import { bvvStringifyFunction } from './provider/stringifyCoords.provider';
import { buffer, containsCoordinate } from 'ol/extent';
import { $injector } from '../injection';

/**
 * Utilities methods for coordinates like transformation, ..., based on ol.
 * @class
 * @author taulinger
 */
export class OlCoordinateService {
	/**
	 *
	 * @param {stringifyCoordProvider} [stringifyFunction=bvvStringifyFunction]
	 */
	constructor(stringifyFunction = bvvStringifyFunction) {
		this._stringifyFunction = stringifyFunction;
		const { ProjectionService } = $injector.inject('ProjectionService');
		this._projectionService = ProjectionService;
	}

	/**
	 *
	 * @private
	 */
	static _toEpsgCodeString(srid) {
		return 'EPSG:' + srid;
	}

	/**
	 * Transforms a 3857 coordinate to longitude/latitude.
	 * @param {Coordinate} coordinate3857
	 * @returns {Coordinate} coordinate4326
	 */
	toLonLat(coordinate3857) {
		return toLonLat(coordinate3857);
	}

	/**
	 * Transforms a coordinate from longitude/latitude to 3857 coordinate
	 * @param {Coordinate} coordinate4326
	 * @returns {Coordinate} coordinate3857
	 */
	fromLonLat(coordinate4326) {
		return fromLonLat(coordinate4326);
	}

	/**
	 * Transforms an extent from 3857 to longitude/latitude
	 * @param {Extent} extent3857
	 * @returns {Extent} a new extent in 4326
	 */
	toLonLatExtent(extent3857) {
		return transformExtent(extent3857, 'EPSG:3857', 'EPSG:4326');
	}

	/**
	 * Transforms an extent from longitude/latitude to 3857
	 * @param {Extent} extent4326
	 * @returns {Extent} a new extent in 3857
	 */
	fromLonLatExtent(extent4326) {
		return transformExtent(extent4326, 'EPSG:4326', 'EPSG:3857');
	}

	/**
	 * Transforms a coordinate in the source srid to a coordinate in the target srid
	 * @param {Coordinate} coordinate
	 * @param {number} sourceSrid srid of the current coordinate
	 * @param {number} targetSrid srid of the transformed coordinate
	 * @returns {Coordinate} transformed coordinate
	 */
	transform(coordinate, sourceSrid, targetSrid) {
		const targetSridAsString = OlCoordinateService._toEpsgCodeString(targetSrid);
		const sourceSridAsString = OlCoordinateService._toEpsgCodeString(sourceSrid);
		if (this._projectionService.getProjections().includes(targetSrid)) {
			return transform(coordinate, sourceSridAsString, targetSridAsString);
		}
		throw new Error('Unsupported SRID: ' + targetSrid);
	}

	/**
	 * Transforms an extent in the source srid to an extent in the target srid
	 * @param {Extent}  extent
	 * @param {number} sourceSrid srid of the current coordinate
	 * @param {number} targetSrid srid of the transformed coordinate
	 * @returns {Extent} a new transformed extent
	 */
	transformExtent(extent, sourceSrid, targetSrid) {
		const targetSridAsString = OlCoordinateService._toEpsgCodeString(targetSrid);
		const sourceSridAsString = OlCoordinateService._toEpsgCodeString(sourceSrid);
		if (this._projectionService.getProjections().includes(targetSrid)) {
			return transformExtent(extent, sourceSridAsString, targetSridAsString);
		}
		throw new Error('Unsupported SRID: ' + targetSrid);
	}

	/**
	 * Stringifies a coordinate.
	 * @param {Coordinate} coordinate the coordinate
	 * @param {number} srid srid of this coordinate
	 * @param {Object} [options] stringify function specific options
	 * @returns {string} stringified coordinate
	 */
	stringify(coordinate, srid, options) {
		return this._stringifyFunction(srid, options)(coordinate);
	}

	/**
	 * Returns an extent increased by the provided value.
	 * @param {Extent} extend
	 * @param {number} value
	 * @returns {Extent} new extent with the applied buffer
	 */
	buffer(extend, value) {
		return [...buffer(extend, value)];
	}

	/**
	 * Check if the passed coordinate is contained or on the edge of the extent.
	 * @param {Extent} extent
	 * @param {Coordinate} coordinate
	 */
	containsCoordinate(extent, coordinate) {
		return containsCoordinate(extent, coordinate);
	}
}
