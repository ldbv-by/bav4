/**
 * @module domain/coordinateTypeDef
 */
/**
 * An array of numbers representing an XY coordinate. Ordering is [easting, northing] or [lon, lat]. Example: `[16, 48]`.
 * @typedef {Array<number>} Coordinate
 * @implements {module:domain/coordinateTypeDef~CoordinateLike}
 */

/**
 * An array of numbers or other types. The first two entries must be a number and represent an xy coordinate. Ordering is [easting, northing] or [lon, lat]. Example: `[16, 48]`.
 * @typedef {Array<number|object>} CoordinateLike
 */

/**
 * An array of numbers representing an XYZ coordinate. Ordering is [easting, northing, elevation] or [lon, lat, elevation]. Example: `[16, 48, 1000]`.
 * @typedef {Array<number>} CoordinateXYZ
 * @implements {module:domain/coordinateTypeDef~CoordinateLike}
 */
