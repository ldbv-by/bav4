import { fromLonLat, toLonLat, transformExtent } from 'ol/proj';
import { createStringXY } from 'ol/coordinate';


/**
 * Utilities for coordinates like transformation based on ol.
 * @class
 * @author aul
 */
export class OlCoordinateService {

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