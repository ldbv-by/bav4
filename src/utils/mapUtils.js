/**
 * @module utils/mapUtils
 */

import { round } from './numberUtils';
const earthRadius = 6378137;
const minLatitude = -85.05112878;
const maxLatitude = 85.05112878;
/**
 * Clips a number to the specified minimum and maximum values.
 */
const clip = (n, minValue, maxValue) => Math.min(Math.max(n, minValue), maxValue);

/**
 * Calculates the resolution at a specific degree of latitude in meters per pixel based on the 3857 projection.
 * @function
 * @param {number} latitude Degree of latitude to calculate resolution at
 * @param {number} zoom Zoom level to calculate resolution at
 * @param {number} tileSize The size of the tiles in the tile pyramid.
 * @returns resolution in meters per pixels
 */
export const calc3857MapResolution = (latitude, zoom, tileSize) => {
	/**
	 * Calculates width and height of the map in pixels at a specific zoom level from -180 degrees to 180 degrees.
	 */
	const mapSize = (zoom, tileSize) => Math.ceil(tileSize * Math.pow(2, zoom));

	latitude = clip(latitude, minLatitude, maxLatitude);
	return (Math.cos((latitude * Math.PI) / 180) * 2 * Math.PI * earthRadius) / mapSize(zoom, tileSize);
};

/**
 * Calculates the exact zoom level for EPSG:3857 based on resolution and latitude.
 * @param {number} resolution Meters per pixel
 * @param {number} latitude Latitude in degrees
 * @param {number} tileSize Tile size in pixels (usually 256)
 * @returns {number} Exact zoom level
 */
export const calc3857MapZoom = (resolution, latitude, tileSize) => {
	latitude = clip(latitude, minLatitude, maxLatitude);
	const latitudeRad = (latitude * Math.PI) / 180;

	// Back-calculate the resolution at the equator for this latitude.
	const equatorResolution = resolution / Math.cos(latitudeRad);

	// Determine the zoom level using the binary logarithm.
	const zoom = Math.log2((2 * Math.PI * earthRadius) / (equatorResolution * tileSize));

	return zoom;
};

/**
 * Rounds a number with sufficient accuracy to be taken as the zoom level of the map.
 * @function
 * @param {number} zoom
 * @returns the rounded zoom value
 */
export const roundZoomLevel = (zoom) => {
	return round(zoom, 3);
};

/**
 * Rounds a number with sufficient accuracy to be taken as the rotation value of the map.
 * @function
 * @param {number} rotation
 * @returns the rounded rotation value
 */
export const roundRotation = (rotation) => {
	return round(rotation, 5);
};

/**
 * Rounds a coordinate with sufficient accuracy to be taken as the center coordinate of the map.
 * @function
 * @param {module:domain/coordinateTypeDef~Coordinate} center
 * @returns the rounded center coordinate
 */
export const roundCenter = (center) => {
	return center.map((v) => round(v, 7));
};
