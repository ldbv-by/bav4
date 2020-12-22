import { fromLonLat, toLonLat } from 'ol/proj';
import { createStringXY } from 'ol/coordinate';


/**
 * Utilities for coordinates like transformation based on ol.
 * @class
 * @author aul
 */
export class OlCoordinateService {

	/**
	 * Transforms a 3857 coordinate to longitude/latitude.
	 * @param {*} coordinate3857 
	 */
	toLonLat(coordinate3857) {
		return toLonLat(coordinate3857);

	}

	/**
	 * Transforms a coordinate from longitude/latitude to 3857 coordinate
	 * @param {*} coordinate4326 
	 */
	fromLonLat(coordinate4326) {
		return fromLonLat(coordinate4326);
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