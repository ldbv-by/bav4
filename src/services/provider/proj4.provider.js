/**
 * @module services/provider/proj4_provider
 */
import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';

/**
 * A function that registers proj4 definitions and returns an array of SRIDs
 *
 * @typedef {function(coordinate) : (array<number>)} proj4Provider
 */

/**
 * Registers BVV specific proj4 definitions.
 * @function
 */
export const loadBvvDefinitions = () => {
	proj4.defs('EPSG:25832', '+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +axis=neu');
	proj4.defs('EPSG:25833', '+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +axis=neu');
	proj4.defs('EPSG:31468', '+proj=tmerc +lat_0=0 +lon_0=12 +k=1 +x_0=4500000 +y_0=0 +ellps=bessel +datum=potsdam +units=m +no_defs');
	register(proj4);
	return [25832, 25833, 31468];
};
