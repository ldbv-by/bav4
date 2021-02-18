import { fromLonLat, toLonLat, transformExtent, transform } from 'ol/proj';
import { loadBvvDefinitions } from './provider/proj4.provider';
import { bvvStringifyFunction } from './provider/stringifyCoords.provider';
import proj4 from 'proj4';

/**
 * Utilities methods for coordinates like transformation, based on ol.
 * @class
 * @author aul
 */
export class OlCoordinateService {

	constructor(proj4Provider = loadBvvDefinitions, stringifyFunction = bvvStringifyFunction) {
		proj4Provider();
		this._stringifyFunction = stringifyFunction;
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
	 * @public
	 * @param {Coordinate} coordinate3857
	 * @returns {Coordinate} coordinate4326
	 */
	toLonLat(coordinate3857) {
		return toLonLat(coordinate3857);

	}

	/**
	 * Transforms a coordinate from longitude/latitude to 3857 coordinate
	 * @public
	 * @param {Coordinate} coordinate4326 
	 * @returns {Coordinate} coordinate3857
	 */
	fromLonLat(coordinate4326) {
		return fromLonLat(coordinate4326);
	}

	/**
	 * Transforms an extent from 3857 to longitude/latitude
	 * @public
	 * @param {Extent} extent3857
	 * @returns {Extent} extent4326 
	 */
	toLonLatExtent(extent3857) {
		return transformExtent(extent3857, 'EPSG:3857', 'EPSG:4326');
	}

	/**
	 * Transforms an extent from longitude/latitude to 3857
	 * @public
	 * @param {Extent} extent4326 
	 * @returns {Extent} extent4326 
	 */
	fromLonLatExtent(extent4326) {
		return transformExtent(extent4326, 'EPSG:4326', 'EPSG:3857');
	}

	/**
	 * Transforms a coordinate in the source srid to a coordinate in the target srid
	 * @param {Coordinate}  [coordinate] 
	 * @param {number} sourceSrid srid of the current coordinate
	 * @param {number} targetSrid srid of the transformed coordinate
	 * @returns {Coordinate} transformed coordinate
	 */
	transform(coordinate, sourceSrid, targetSrid) {
		const targetSridAsString = OlCoordinateService._toEpsgCodeString(targetSrid);
		const sourceSridAsString = OlCoordinateService._toEpsgCodeString(sourceSrid);
		if (proj4.defs(targetSridAsString)) {
			return transform(coordinate, sourceSridAsString, targetSridAsString);
		}
		throw new Error('Unsupported SRID: ' + targetSrid);
	}


	/**
	 * Stringifies a coordinate.
	 * @param {Coordinate} coordinate the coordinate
	 * @param {number} srid srid of this coordinate
	 * @param {Object} [options] stringify function specific options
	 */
	stringify(coordinate, srid, options) {
		return this._stringifyFunction(srid, options)(coordinate);
	}
}