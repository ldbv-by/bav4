import { fromLonLat, toLonLat, transformExtent } from 'ol/proj';
import { createStringXY } from 'ol/coordinate';


/**
 * An array of numbers representing an xy coordinate. Example: `[16, 48]`.
 * @typedef {Array<number>} Coordinate
 */

/**
 * An array of numbers representing an extent: `[minx, miny, maxx, maxy]`.
 * @typedef {Array<number>} Extent
 */

/**
 * Utilities for coordinates like transformation based on ol.
 * @class
 * @author aul
 */
export class OlCoordinateService {

	/**
	 * Transforms a 3857 coordinate to longitude/latitude.
	 * @param {Coordinate} coordinate3857 
	 * @public
	 */
	toLonLat(coordinate3857) {
		return toLonLat(coordinate3857);

	}

	/**
	 * Transforms a coordinate from longitude/latitude to 3857 coordinate
	 * @param {Coordinate} coordinate4326 
	 * @public
	 */
	fromLonLat(coordinate4326) {
		return fromLonLat(coordinate4326);
	}

	/**
	 * Transforms an extent from 3857 to longitude/latitude
	 * @param {Extent} extent3857 
	 * @public
	 */
	toLonLatExtent(extent3857) {
		return transformExtent(extent3857, 'EPSG:3857', 'EPSG:4326');
	}

	/**
	 * Transforms an extent from longitude/latitude to 3857
	 * @param {Extent} extent4326 
	 * @public
	 */
	fromLonLatExtent(extent4326) {
		return transformExtent(extent4326, 'EPSG:4326', 'EPSG:3857');
	}

	to25832() {
		throw new Error('Not yet implemented');

	}

	from25832() {
		throw new Error('Not yet implemented');
	}

	/**
	 * Stringifies a coordinate.
	 * @param {*} coordinate the coordinate
	 * @param {*} digits number of fractional digits:
	 */
	stringifyYX(coordinate, digits) {
		return createStringXY(digits)(coordinate);
	}
}