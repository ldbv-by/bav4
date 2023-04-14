/**
 * Defines the (target) representation for a coordinate.
 * @typedef {Object} CoordinateRepresentation
 * @property {string} label label
 * @property {number} code the SRID or `null`
 * @property {number} digits decimal places for rounding
 * @property {boolean} global suitable for global usage
 * @property {string} type type of this CoordinateRepresentation. CoordinateRepresentation of the same type are interchangeable (e.g. global and local CoordinateRepresentation)
 */

/**
 * Predefined global coordinate representations.
 * @enum
 */
export const GlobalCoordinateRepresentations = Object.freeze({
	WGS84: { label: 'WGS84', code: 4326, digits: 5, global: true, type: 'wgs84' },
	UTM: { label: 'UTM', code: null, digits: 0, global: true, type: 'utm' },
	MGRS: { label: 'MGRS', code: null, digits: 0, global: true, type: 'mgrs' }
});
